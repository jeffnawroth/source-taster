// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "../generated/prisma/client.ts";
import { contentTransaction } from "../checks/content.ts";
import type { createPrisma } from "../db/prisma.ts";
import { fail } from "../http/problems.ts";
type Db = ReturnType<typeof createPrisma>;
type Key = Record<string, string | number | boolean>;
const tables = {
  checks: [
    "checks",
    "jsonb_build_object('id',r.id,'retained',r.deleted_at IS NULL AND r.content_expires_at>$5)",
    "r.id::text",
    "r.id::text=k.key->>'id'",
  ],
  references: [
    "reference_slots",
    "jsonb_build_object('checkId',r.check_id,'position',r.position)",
    "r.check_id::text||':'||lpad(r.position::text,10,'0')",
    "r.check_id::text=k.key->>'checkId' AND r.position=(k.key->>'position')::int",
  ],
  revisions: [
    "field_revisions",
    "jsonb_build_object('checkId',r.check_id,'position',r.position,'revision',r.revision)",
    "r.check_id::text||':'||lpad(r.position::text,10,'0')||':'||lpad(r.revision::text,10,'0')",
    "r.check_id::text=k.key->>'checkId' AND r.position=(k.key->>'position')::int AND r.revision=(k.key->>'revision')::int",
  ],
  results: [
    "reference_results",
    "jsonb_build_object('id',r.id,'checkId',r.check_id,'position',r.position)",
    "r.id::text",
    "r.id::text=k.key->>'id'",
  ],
  overrides: [
    "manual_overrides",
    "jsonb_build_object('resultId',r.result_id)",
    "r.result_id::text",
    "r.result_id::text=k.key->>'resultId'",
  ],
  events: [
    "check_events",
    "jsonb_build_object('checkId',r.check_id,'seq',r.seq)",
    "r.check_id::text||':'||lpad(r.seq::text,10,'0')",
    "r.check_id::text=k.key->>'checkId' AND r.seq=(k.key->>'seq')::int",
  ],
  reports: [
    "reports",
    "jsonb_build_object('id',r.id)",
    "r.id::text",
    "r.id::text=k.key->>'id'",
  ],
  consent: [
    "history_consents",
    "jsonb_build_object('ownerId',r.owner_id)",
    "r.owner_id",
    "r.owner_id=k.key->>'ownerId'",
  ],
} as const;
export async function verificationSnapshot(
  db: Db,
  requestId: string,
  accountId: string,
  ownerId: string,
  credential: string,
  expiresAt: string,
  clock: { now(): number },
  restart?: string,
) {
  if (restart && !/^[a-f0-9-]{36}$/.test(restart)) fail("invalid-request");
  const binding = createHash("sha256")
    .update(credential + (restart ?? ""))
    .digest("hex");
  const snapshot = await db.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${ownerId},96))::text`;
      const existing = await tx.exportSnapshot.findFirst({
        where: { requestId, binding },
      });
      if (existing) return existing;
      const snapshot = await tx.exportSnapshot.create({
        data: {
          id: randomUUID(),
          requestId,
          binding,
          createdAt: new Date(clock.now()),
          expiresAt: new Date(expiresAt),
        },
      });
      for (const [collection, [table, key, sort]] of Object.entries(tables)) {
        const parent = ["references", "events"].includes(collection)
          ? "r.check_id::text"
          : ["results", "revisions"].includes(collection)
            ? "r.check_id::text||':'||r.position::text"
            : collection === "overrides"
              ? "r.result_id::text"
              : "''";
        let scope: string;
        if (collection === "consent")
          scope = "r.owner_id=$2 AND r.account_id=$3";
        else if (collection === "checks")
          scope =
            "r.owner_id=$2 AND r.actor_id=$3 AND r.guest_context_id IS NULL";
        else {
          const relation =
            collection === "overrides"
              ? "JOIN verification.reference_results rr ON rr.id=r.result_id JOIN verification.checks c ON c.id=rr.check_id"
              : "JOIN verification.checks c ON c.id=r.check_id";

          await tx.$executeRawUnsafe(
            `INSERT INTO verification.export_members(snapshot_id,collection,parent,sort,key,version) SELECT $1::uuid,$4,${parent},${sort},${key},r.xmin::text FROM verification.${table} r ${relation} WHERE c.owner_id=$2 AND c.actor_id=$3 AND c.guest_context_id IS NULL AND c.deleted_at IS NULL AND c.content_expires_at>$5 ${collection === "reports" ? "AND r.expires_at>$5" : ""}`,
            snapshot.id,
            ownerId,
            accountId,
            collection,
            new Date(clock.now()),
          );
          continue;
        }
        await tx.$executeRawUnsafe(
          `INSERT INTO verification.export_members(snapshot_id,collection,parent,sort,key,version) SELECT $1::uuid,$4,${parent},${sort},${key},r.xmin::text FROM verification.${table} r WHERE ${scope}`,
          snapshot.id,
          ownerId,
          accountId,
          collection,
          ...(collection === "checks" ? [new Date(clock.now())] : []),
        );
      }
      return snapshot;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      timeout: 15000,
    },
  );
  async function validate() {
    if (snapshot.expiresAt.getTime() <= clock.now()) fail("forbidden");
    for (const [collection, [table, , , join]] of Object.entries(tables)) {
      const rows = await db.$queryRawUnsafe<{ invalid: boolean }[]>(
        `SELECT EXISTS(SELECT 1 FROM verification.export_members k LEFT JOIN verification.${table} r ON ${join} WHERE k.snapshot_id=$1::uuid AND k.collection=$2 AND (r.xmin IS NULL OR r.xmin::text<>k.version ${collection === "reports" ? "OR r.expires_at<=$3" : collection === "checks" ? "OR (r.deleted_at IS NULL AND r.content_expires_at<=$3 AND (k.key->>'retained')::boolean)" : ""})) AS invalid`,
        snapshot.id,
        collection,
        ...(["reports", "checks"].includes(collection)
          ? [new Date(clock.now())]
          : []),
      );
      if (rows[0]?.invalid) fail("forbidden");
    }
  }
  async function* keys(collection: keyof typeof tables, parent?: Key) {
    let after = "";
    while (true) {
      const rows = await db.exportMember.findMany({
        where: {
          snapshotId: snapshot.id,
          collection,
          sort: { gt: after },
          parent: parent?.resultId
            ? String(parent.resultId)
            : parent?.checkId
              ? String(parent.checkId) +
                (parent.position === undefined
                  ? ""
                  : ":" + String(parent.position))
              : "",
        },
        orderBy: { sort: "asc" },
        take: 1,
      });
      const row = rows[0];
      if (!row) return;
      after = row.sort;
      yield row.key as Key;
    }
  }
  async function read<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return db.$transaction(async (raw) => {
      await raw.$queryRaw`SELECT pg_advisory_xact_lock_shared(910012)::text`;
      await raw.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${ownerId},96))::text`;
      return fn(contentTransaction(raw, () => clock.now()));
    });
  }
  async function* results(checkId: string, position: number) {
    for await (const key of keys("results", { checkId, position })) {
      const row = await read((tx) =>
        tx.referenceResult.findUniqueOrThrow({ where: { id: String(key.id) } }),
      );

      let manualOverride = null;
      for await (const override of keys("overrides", { resultId: row.id }))
        manualOverride = await read((tx) =>
          tx.manualOverride.findUniqueOrThrow({
            where: { resultId: String(override.resultId) },
          }),
        );
      yield { ...row, manualOverride };
    }
  }
  async function* revisions(checkId: string, position: number) {
    for await (const key of keys("revisions", { checkId, position }))
      yield await read((tx) =>
        tx.fieldRevision.findUniqueOrThrow({
          where: {
            checkId_position_revision: {
              checkId,
              position,
              revision: Number(key.revision),
            },
          },
        }),
      );
  }
  async function* references(checkId: string) {
    for await (const key of keys("references", { checkId })) {
      const { claimUntil: _claim, ...row } = await read((tx) =>
        tx.referenceSlot.findUniqueOrThrow({
          where: {
            checkId_position: { checkId, position: Number(key.position) },
          },
        }),
      );
      yield {
        ...row,
        revisions: revisions(checkId, row.position),
        results: results(checkId, row.position),
      };
    }
  }
  async function* events(checkId: string) {
    for await (const key of keys("events", { checkId }))
      yield await read((tx) =>
        tx.checkEvent.findUniqueOrThrow({
          where: { checkId_seq: { checkId, seq: Number(key.seq) } },
        }),
      );
  }
  async function* checks() {
    for await (const key of keys("checks")) {
      if (!key.retained) continue;
      const {
        leaseExpiresAt: _lease,
        dispatchOrder: _dispatch,
        ...row
      } = await read((tx) =>
        tx.check.findUniqueOrThrow({ where: { id: String(key.id) } }),
      );
      if (
        row.deletedAt ||
        row.contentExpiresAt.getTime() <= snapshot.createdAt.getTime()
      )
        continue;
      yield { ...row, references: references(row.id), events: events(row.id) };
    }
  }
  async function* metadata() {
    for await (const key of keys("checks"))
      yield await read((tx) =>
        tx.check.findUniqueOrThrow({
          where: { id: String(key.id) },
          select: {
            id: true,
            state: true,
            createdAt: true,
            startedAt: true,
            endedAt: true,
            contentExpiresAt: true,
            deletedAt: true,
            historyStoredAt: true,
            historyLocked: true,
          },
        }),
      );
  }
  async function* reports() {
    for await (const key of keys("reports"))
      yield await read((tx) =>
        tx.report.findUniqueOrThrow({ where: { id: String(key.id) } }),
      );
  }
  let consent = null;
  for await (const key of keys("consent"))
    consent = await read((tx) =>
      tx.historyConsent.findUnique({ where: { ownerId: String(key.ownerId) } }),
    );
  const counts = await db.$queryRaw<
    { collection: string; count: string }[]
  >`SELECT CASE WHEN collection='checks' THEN 'checkMetadata' ELSE collection END AS collection,count(*)::text AS count FROM verification.export_members WHERE snapshot_id=${snapshot.id}::uuid GROUP BY collection UNION ALL SELECT 'checks',count(*)::text FROM verification.export_members WHERE snapshot_id=${snapshot.id}::uuid AND collection='checks' AND (key->>'retained')::boolean ORDER BY collection`;
  const records = Object.fromEntries(
    counts.map((row) => [row.collection, row.count]),
  );
  return {
    snapshot,
    validate,
    records,
    document: {
      format: "source-taster-verification-data-subject-v1",
      accountId,
      ownerId,
      generatedAt: snapshot.createdAt.toISOString(),
      historyConsent: consent,
      checkMetadata: metadata(),
      checks: checks(),
      reports: reports(),
    },
  };
}
