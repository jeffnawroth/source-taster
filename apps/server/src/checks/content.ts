// SPDX-License-Identifier: AGPL-3.0-or-later
// The only persistence codec for Check content. No plaintext fallback.
// Transient daily AES-GCM keys use UNLOGGED storage (ADR-0012); consented
// History uses separate per-entry keys, erased with its content.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { Prisma } from "../generated/prisma/client.ts";

const DAY = 86_400_000;
export const keyDay = (now: number) => Math.floor(now / DAY);
export class ContentUnavailable extends Error {}
type Tx = Prisma.TransactionClient;
type Row = Record<string, unknown>;
const fields: Record<string, string[]> = {
  check: ["document"],
  referenceSlot: ["originalText", "structured"],
  fieldRevision: ["content"],
  referenceResult: ["content"],
  checkEvent: ["payload"],
  manualOverride: ["verdict"],
};
const relations: Record<string, Record<string, string>> = {
  check: { references: "referenceSlot", events: "checkEvent" },
  referenceSlot: {
    check: "check",
    revisions: "fieldRevision",
    results: "referenceResult",
  },
  referenceResult: {
    reference: "referenceSlot",
    manualOverride: "manualOverride",
  },
};
interface Envelope {
  sealed: 1;
  history?: string;
  day: number;
  iv: string;
  tag: string;
  body: string;
}
function seal(value: unknown, key: Buffer, day: number, aad: string): Envelope {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(aad));
  const body = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return {
    sealed: 1,
    day,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    body: body.toString("base64"),
  };
}
function open(value: Envelope, key: Buffer, aad: string): unknown {
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(value.iv, "base64"),
    );
    decipher.setAAD(Buffer.from(aad));
    decipher.setAuthTag(Buffer.from(value.tag, "base64"));
    return JSON.parse(
      Buffer.concat([
        decipher.update(Buffer.from(value.body, "base64")),
        decipher.final(),
      ]).toString("utf8"),
    );
  } catch {
    throw new ContentUnavailable();
  }
}
export async function dailyKey(tx: Tx, day: number) {
  await tx.$executeRaw`INSERT INTO verification.transient_keys(day, key) VALUES (${day}, ${randomBytes(32)}) ON CONFLICT DO NOTHING`;
}
/** A typed transaction facade: nested creates and relation reads use the same codec. */
export function contentTransaction(
  tx: Tx,
  now: () => number,
  writeDay?: number,
  historyCheck?: string,
): Tx {
  const keys = new Map<number, Buffer>();
  const writeKeysReady = new Set<number>();
  async function key(day: number, history?: string) {
    if (history) {
      const rows = await tx.$queryRaw<
        { key: Uint8Array }[]
      >`SELECT key FROM verification.history_keys WHERE check_id=${history}::uuid`;
      if (!rows[0]) throw new ContentUnavailable();
      return Buffer.from(rows[0].key);
    }
    if ((day + 1) * DAY <= now()) throw new ContentUnavailable();
    if (!keys.has(day)) {
      const rows = await tx.$queryRaw<
        { key: Uint8Array }[]
      >`SELECT key FROM verification.transient_keys WHERE day=${day}`;
      if (!rows[0]) throw new ContentUnavailable();
      keys.set(day, Buffer.from(rows[0].key));
    }
    return keys.get(day)!;
  }
  async function write(
    model: string,
    value: unknown,
    day: number,
    history?: string,
  ): Promise<unknown> {
    if (Array.isArray(value))
      return Promise.all(value.map((v) => write(model, v, day, history)));
    if (!value || typeof value !== "object") return value;
    const row = { ...value } as Row;
    for (const field of fields[model] ?? []) {
      if (
        row[field] === undefined ||
        row[field] === null ||
        row[field] === Prisma.DbNull
      )
        continue;
      const encrypted = seal(
        row[field],
        await key(day, history),
        day,
        `${model}.${field}`,
      );
      if (history) encrypted.history = history;
      row[field] =
        field === "originalText" || field === "verdict"
          ? JSON.stringify(encrypted)
          : encrypted;
    }
    for (const [field, child] of Object.entries(relations[model] ?? {})) {
      const nested = row[field] as Row | undefined;
      if (!nested) continue;
      row[field] = {
        ...nested,
        ...(nested.create
          ? { create: await write(child, nested.create, day, history) }
          : {}),
      };
    }
    return row;
  }
  async function read(model: string, value: unknown): Promise<unknown> {
    if (Array.isArray(value))
      return Promise.all(value.map((v) => read(model, v)));
    if (!value || typeof value !== "object") return value;
    const row = { ...value } as Row;
    for (const field of fields[model] ?? []) {
      if (row[field] === undefined || row[field] === null) continue;
      let envelope: Envelope;
      try {
        envelope = (
          typeof row[field] === "string" ? JSON.parse(row[field]) : row[field]
        ) as Envelope;
      } catch {
        throw new ContentUnavailable();
      }
      if (envelope.sealed !== 1) throw new ContentUnavailable();
      row[field] = open(
        envelope,
        await key(envelope.day, envelope.history),
        `${model}.${field}`,
      );
    }
    for (const [field, child] of Object.entries(relations[model] ?? {}))
      if (row[field]) row[field] = await read(child, row[field]);
    return row;
  }
  return new Proxy(tx, {
    get(target, property, receiver) {
      if (
        typeof property !== "string" ||
        !(property in fields || property in relations)
      )
        return Reflect.get(target, property, receiver) as unknown;
      const delegate = Reflect.get(target, property, receiver) as object;
      return new Proxy(delegate, {
        get(model, operation) {
          const method = Reflect.get(model, operation) as unknown;
          if (typeof method !== "function") return method;
          return async (args: Row = {}) => {
            const next = { ...args };
            if (["create", "update", "upsert"].includes(String(operation))) {
              // Resolve the entry at the persistence boundary, including slot-only
              // Re-checks and override/event writes after the first end.
              const where = (args.where ?? {}) as Row;
              const data = (args.data ?? args.create ?? {}) as Row;
              const composite = Object.values(where).find(
                (v) => v && typeof v === "object" && "checkId" in v,
              ) as Row | undefined;
              const identifier = (value: unknown) =>
                typeof value === "string" ? value : "";
              let id =
                property === "check"
                  ? identifier(where.id ?? data.id)
                  : identifier(
                      data.checkId ?? where.checkId ?? composite?.checkId,
                    );
              if (property === "manualOverride" && !id) {
                const result = await tx.referenceResult.findUnique({
                  where: { id: identifier(where.resultId ?? data.resultId) },
                  select: { checkId: true },
                });
                id = result?.checkId ?? "";
              }
              if (property === "referenceResult" && !id && where.id) {
                const result = await tx.referenceResult.findUnique({
                  where: { id: identifier(where.id) },
                  select: { checkId: true },
                });
                id = result?.checkId ?? "";
              }
              const stored = id
                ? await tx.check.findUnique({
                    where: { id },
                    select: { historyStoredAt: true },
                  })
                : null;
              const history =
                historyCheck ?? (stored?.historyStoredAt ? id : undefined);
              const day = writeDay ?? keyDay(now() + 60_000);
              if (!history && !writeKeysReady.has(day)) {
                await dailyKey(tx, day);
                writeKeysReady.add(day);
              }
              for (const part of ["data", "create", "update"])
                if (next[part])
                  next[part] = await write(property, next[part], day, history);
            }
            const run = method as (this: object, args: Row) => Promise<unknown>;
            return read(property, await run.call(model, next));
          };
        },
      });
    },
  });
}
