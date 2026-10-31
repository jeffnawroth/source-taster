// SPDX-License-Identifier: AGPL-3.0-or-later
// The Check lock serializes lifecycle, immutable evidence and ordered events.
import { randomUUID } from "node:crypto";
import {
  CheckEvent,
  ReferenceOutcome,
  type Check,
  type CheckEndReason,
  type ReferenceProgress,
  type ReferenceStatus,
  type Verdict,
  type SetManualOverrideRequest,
  type SaveFieldsRequest,
  type RecheckRequest,
  type EditReferenceListRequest,
  type EditSelectionRequest,
  type BibliographyDocument,
} from "@source-taster/contract-verification/v2";
import {
  ReferenceLimitExceeded,
  type StructuredReference,
  type Structuring,
  type Span,
} from "@source-taster/core";
import { selectionDifference } from "./selection.ts";
import type { PgBoss } from "pg-boss";
import { Prisma } from "../generated/prisma/client.ts";
import {
  contentTransaction,
  dailyKey,
  keyDay,
  ContentUnavailable,
} from "./content.ts";
import { EVENT_CHANNEL } from "./events.ts";
import { REFERENCE_QUEUE } from "./queue.ts";
import type { Db } from "../db/prisma.ts";
import type { Principal } from "../entitlements.ts";

const withSlots = {
  references: {
    orderBy: { position: "asc" },
    where: { removed: false },
    include: {
      results: {
        orderBy: { generation: "desc" },
        include: { manualOverride: true },
      },
      revisions: { orderBy: { revision: "asc" } },
    },
  },
} as const;
type CheckRow = {
  id: string;
  state: string;
  lastSeq: number;
  endReason: string | null;
  document?: unknown;
  references: {
    position: number;
    originalText: string;
    status: string;
    progress: string;
    revision: number;
    generation: number;
    structured: unknown;
    revisions: {
      revision: number;
      content: unknown;
      provenance: string;
      createdAt: Date;
    }[];
    results?: {
      id: string;
      revision: number;
      generation: number;
      createdAt: Date;
      content: unknown;
      manualOverride: {
        id: string;
        resultId: string;
        verdict: string;
        createdAt: Date;
      } | null;
    }[];
  }[];
};
function toCheck(row: CheckRow, leaseRenewAfterMs: number): Check {
  return {
    id: row.id,
    document: (row.document ?? null) as BibliographyDocument | null,
    state: row.state as Check["state"],
    lastEventSeq: row.lastSeq,
    lastEventCursor: `${row.id}:${row.lastSeq}`,
    leaseRenewAfterMs,
    endReason: row.endReason as CheckEndReason | null,
    references: row.references.map((slot) => {
      const input = slot.structured as StructuredReference | null;
      const latest = slot.results?.[0];
      const manual = (
        result: NonNullable<typeof slot.results>[number] | undefined,
      ) =>
        result?.manualOverride
          ? {
              ...result.manualOverride,
              verdict: result.manualOverride.verdict as Verdict,
              createdAt: result.manualOverride.createdAt.toISOString(),
            }
          : null;
      const currentManual =
        slot.status !== "running" &&
        latest?.revision === slot.revision &&
        latest.generation === slot.generation
          ? manual(latest)
          : null;
      return {
        manualOverride: currentManual,
        // Only the run that replaced an overridden result announces its reset.
        manualOverrideReset:
          !currentManual &&
          !!slot.results?.find((r) => r.generation < slot.generation)
            ?.manualOverride,
        slot: slot.position,
        originalText: slot.originalText,
        revision: slot.revision,
        fields: input?.csl ?? {},
        authorsTruncated: input?.authorsTruncated,
        revisions: slot.revisions.map((r) => ({
          revision: r.revision,
          reference: r.content as StructuredReference,
          provenance: r.provenance as "parser" | "user",
          createdAt: r.createdAt.toISOString(),
        })),
        results: (slot.results ?? []).map((r) => ({
          id: r.id,
          revision: r.revision,
          generation: r.generation,
          createdAt: r.createdAt.toISOString(),
          outcome: ReferenceOutcome.parse(r.content),
          manualOverride: manual(r),
        })),
        quotaEffect: slot.results?.some(
          (r) => ReferenceOutcome.parse(r.content).kind === "verdict",
        )
          ? ("free-recheck" as const)
          : ("new-work" as const),
        progress: slot.progress as ReferenceProgress,
        outcome:
          slot.status !== "running" && latest?.revision === slot.revision
            ? ReferenceOutcome.parse(latest.content)
            : {
                kind: "status" as const,
                status: slot.status as ReferenceStatus,
              },
      };
    }),
  };
}
// Shared attempt eligibility only. Callers retain their Check lock/lease and
// cancellation checks; the read-only abort probe remains an optimization.
function eligibleAttempt<
  T extends {
    status: string;
    generation: number;
    revision: number;
    claimUntil: Date | null;
  },
>(slot: T | null, attempt: ReferenceAttempt, now: number): slot is T {
  return (
    !!slot &&
    slot.status === "running" &&
    slot.generation === attempt.generation &&
    slot.revision === attempt.revision &&
    !!slot.claimUntil &&
    slot.claimUntil.getTime() > now
  );
}
type Tx = Prisma.TransactionClient;
type EventPayload =
  | Omit<Extract<CheckEvent, { type: "check.updated" }>, "seq" | "checkId">
  | Omit<Extract<CheckEvent, { type: "reference.updated" }>, "seq" | "checkId">;
async function appendEvent(tx: Tx, checkId: string, event: EventPayload) {
  const row = await tx.check.update({
    where: { id: checkId },
    data: { lastSeq: { increment: 1 } },
  });
  if (event.type === "reference.updated" && row.apiVersion === 2) {
    const snapshot = toCheck(
      await tx.check.findUniqueOrThrow({
        where: { id: checkId },
        include: withSlots,
      }),
      1,
    );
    const position = event.reference.slot;
    const reference = snapshot.references.find((r) => r.slot === position);
    if (reference) event = { ...event, reference };
  }
  const { type, ...payload } = event;
  await tx.checkEvent.create({
    data: {
      checkId,
      seq: row.lastSeq,
      type,
      payload: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue,
    },
  });
  await tx.$queryRaw`SELECT pg_notify(${EVENT_CHANNEL}, ${checkId})::text`;
}
async function lock(tx: Tx, id: string) {
  await tx.$queryRaw`SELECT id FROM verification.checks WHERE id=${id}::uuid FOR UPDATE`;
  return tx.check.findUnique({ where: { id } });
}
export interface LifecycleClock {
  now(): number;
}
export interface LifecycleSettings {
  contentRetentionMs: number;
  clientLeaseMs: number;
  claimMs: number;
  maxAttempts: number;
  /** ADR-0007 search operating setting: running References per Check. */
  activeReferencesPerCheck: number;
}
export const defaultLifecycleSettings: LifecycleSettings = {
  contentRetentionMs: 24 * 60 * 60 * 1000,
  clientLeaseMs: 75_000,
  claimMs: 45_000,
  maxAttempts: 3,
  activeReferencesPerCheck: 10,
};
export interface ReferenceAttempt {
  guestContextId?: string;
  checkId: string;
  slot: number;
  generation: number;
  revision: number;
  ownerId: string;
  actorId: string;
  startedAt: number;
  apiVersion?: number;
  input: StructuredReference | null;
}
export type WorkSubject = Pick<
  ReferenceAttempt,
  "checkId" | "ownerId" | "actorId" | "guestContextId"
>;
export function createCheckStore(
  db: Db,
  boss: PgBoss,
  options: {
    clock?: LifecycleClock;
    settings?: Partial<LifecycleSettings>;
  } = {},
) {
  const clock = options.clock ?? { now: Date.now };
  const settings = { ...defaultLifecycleSettings, ...options.settings };
  const renewalInterval = Math.max(1, Math.floor(settings.clientLeaseMs / 3));
  const transaction = <T>(operation: (tx: Tx) => Promise<T>) =>
    db.$transaction(async (raw) => {
      await raw.$queryRaw`SELECT pg_advisory_xact_lock_shared(910012)::text`;
      return operation(contentTransaction(raw, () => clock.now()));
    });
  async function wake(tx: Tx, checkId: string, slot = 0) {
    await boss.send(
      REFERENCE_QUEUE,
      { checkId, slot },
      {
        db: {
          executeSql: async (sql, values) => ({
            rows: await tx.$queryRawUnsafe<unknown[]>(sql, ...(values ?? [])),
          }),
        },
      },
    );
  }
  async function record(
    tx: Tx,
    checkId: string,
    slot: number,
    generation: number,
    revision: number,
    outcome: ReferenceOutcome,
  ) {
    await tx.referenceSlot.update({
      where: { checkId_position: { checkId, position: slot } },
      data: {
        status: outcome.kind === "status" ? outcome.status : "finished",
        progress: "ended",
        claimUntil: null,
      },
    });
    await tx.referenceResult.create({
      data: {
        id: randomUUID(),
        checkId,
        position: slot,
        generation,
        revision,
        content: JSON.parse(JSON.stringify(outcome)) as Prisma.InputJsonValue,
      },
    });
    // #99 consumes this durable, once-per-run settlement intent. Status is free;
    // release is not a refund, and a Verdict is not a fabricated debit/balance.
    await tx.settlementIntent.create({
      data: {
        checkId,
        position: slot,
        generation,
        outcome: outcome.kind === "verdict" ? "verdict" : "release",
      },
    });
    await appendEvent(tx, checkId, {
      type: "reference.updated",
      reference: { slot, outcome, progress: "ended" },
    });
  }
  async function end(
    tx: Tx,
    checkId: string,
    reason: CheckEndReason,
    now: number,
  ) {
    const current = await tx.check.findUniqueOrThrow({
      where: { id: checkId },
    });
    if (current.state !== "ended")
      await tx.check.update({
        where: { id: checkId },
        data: {
          state: "ended",
          endReason: reason,
          endedAt: new Date(now),
          // ADR-0005: a Check that never started keeps its creation deadline.
          ...(current.startedAt
            ? { contentExpiresAt: new Date(now + settings.contentRetentionMs) }
            : {}),
        },
      });
    else reason = current.endReason as CheckEndReason;
    await appendEvent(tx, checkId, {
      type: "check.updated",
      state: "ended",
      endReason: reason,
    });
  }
  async function cancelLocked(
    tx: Tx,
    checkId: string,
    reason: "cancelled" | "lease-expired",
    now: number,
  ) {
    const unfinished = await tx.referenceSlot.findMany({
      where: { checkId, status: "running" },
      orderBy: { position: "asc" },
    });
    for (const slot of unfinished) {
      await record(tx, checkId, slot.position, slot.generation, slot.revision, {
        kind: "status",
        status: "cancelled",
      });
      await tx.referenceSlot.update({
        where: { checkId_position: { checkId, position: slot.position } },
        data: { generation: { increment: 1 } },
      });
    }
    await end(tx, checkId, reason, now);
  }
  async function expireLocked(
    tx: Tx,
    row: { id: string; state: string; leaseExpiresAt: Date },
    now: number,
  ) {
    if (
      row.leaseExpiresAt.getTime() <= now &&
      (await tx.referenceSlot.count({
        where: { checkId: row.id, status: "running" },
      })) > 0
    ) {
      // The Check ended when its lease ran out, not when that was noticed.
      await cancelLocked(
        tx,
        row.id,
        "lease-expired",
        Math.min(now, row.leaseExpiresAt.getTime()),
      );
      return true;
    }
    return false;
  }
  type ContentRow = {
    contentExpiresAt: Date;
    deletedAt: Date | null;
    startedAt: Date | null;
    endedAt: Date | null;
    leaseExpiresAt: Date;
  };
  function contentAlive(row: ContentRow) {
    const now = clock.now();
    // Once work has started, creation is no longer the retention origin. Before
    // the first end, only an expired lease can establish the eventual deadline.
    const deadline =
      row.startedAt && !row.endedAt
        ? row.leaseExpiresAt.getTime() <= now
          ? row.leaseExpiresAt.getTime() + settings.contentRetentionMs
          : Infinity
        : row.contentExpiresAt.getTime();
    return !row.deletedAt && now < deadline;
  }
  function assertContentAlive(row: ContentRow) {
    if (!contentAlive(row)) throw new CheckExpired();
  }
  // ADR-0005 deletion. Preserve unfinished release intents without decrypting
  // lost content for #99; then all content, events and queued work go. The
  // content-free Check row remains as the tombstone.
  async function purgeLocked(tx: Tx, check: { id: string } & ContentRow) {
    if (check.deletedAt) return;
    const now = clock.now();
    const unfinished = await tx.referenceSlot.findMany({
      where: { checkId: check.id, status: "running" },
      select: { position: true, generation: true },
    });
    for (const slot of unfinished)
      await tx.settlementIntent.upsert({
        where: {
          checkId_position_generation: {
            checkId: check.id,
            position: slot.position,
            generation: slot.generation,
          },
        },
        create: {
          checkId: check.id,
          position: slot.position,
          generation: slot.generation,
          outcome: "release",
        },
        update: {},
      });
    await tx.checkEvent.deleteMany({ where: { checkId: check.id } });
    await tx.referenceSlot.deleteMany({ where: { checkId: check.id } });
    await tx.check.update({
      where: { id: check.id },
      data: {
        document: Prisma.DbNull,
        deletedAt: new Date(now),
        state: "ended",
        endedAt:
          check.endedAt ??
          (check.startedAt && check.leaseExpiresAt.getTime() <= now
            ? check.leaseExpiresAt
            : new Date(now)),
      },
    });
    const db = {
      executeSql: async (sql: string, values?: unknown[]) => ({
        rows: await tx.$queryRawUnsafe<unknown[]>(sql, ...(values ?? [])),
      }),
    };
    const queued = await boss.findJobs(REFERENCE_QUEUE, {
      data: { checkId: check.id },
      queued: true,
      db,
    });
    if (queued.length)
      await boss.deleteJob(
        REFERENCE_QUEUE,
        queued.map((job) => job.id),
        { db },
      );
  }
  async function sweep() {
    // Exclusive against all content operations: rollover, key destruction and
    // loss recovery finish before any process can read or publish content.
    await db.$transaction(
      async (raw) => {
        await raw.$queryRaw`SELECT pg_advisory_xact_lock(910012)::text`;
        const now = clock.now();
        const day = keyDay(now);
        const tx = contentTransaction(raw, () => clock.now());
        const due = await raw.$queryRaw<{ id: string }[]>`
        SELECT c.id FROM verification.checks c WHERE c.deleted_at IS NULL AND
        (((c.started_at IS NULL OR c.ended_at IS NOT NULL) AND c.content_expires_at<=${new Date(now)})
        OR (c.started_at IS NOT NULL AND c.ended_at IS NULL AND c.lease_expires_at + (${settings.contentRetentionMs} * interval '1 millisecond')<=${new Date(now)}) OR (c.document IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM verification.transient_keys k
          WHERE k.day=(c.document->>'day')::integer AND k.day>=${day}
        )) OR EXISTS (
          SELECT 1 FROM verification.reference_slots r
          LEFT JOIN verification.transient_keys k ON k.day=(r.original_text::jsonb->>'day')::integer
          WHERE r.check_id=c.id AND (k.day IS NULL OR k.day<${day})
        )) ORDER BY c.id`;
        for (const { id } of due) {
          const check = await lock(raw, id);
          if (check) await purgeLocked(tx, check);
        }
        // Rewrap live content during the minute before a daily key's destruction.
        // If the process misses that window (crash/suspension), fail closed above.
        // The next key's 24-hour window ends at the following UTC midnight.
        if ((day + 1) * 86_400_000 - now <= 60_000) {
          await dailyKey(raw, day + 1);
          const writer = contentTransaction(raw, () => clock.now(), day + 1);
          const checks = await raw.$queryRaw<
            { id: string }[]
          >`SELECT c.id FROM verification.checks c
          WHERE c.deleted_at IS NULL AND ((c.document->>'day')::integer<=${day}
          OR EXISTS (SELECT 1 FROM verification.reference_slots r
          WHERE r.check_id=c.id AND (r.original_text::jsonb->>'day')::integer<=${day})) ORDER BY c.id`;
          for (const { id } of checks) {
            const check = await lock(tx, id);
            if (check?.document)
              await writer.check.update({
                where: { id },
                data: { document: check.document },
              });
            for (const slot of await tx.referenceSlot.findMany({
              where: { checkId: id },
            }))
              await writer.referenceSlot.update({
                where: {
                  checkId_position: { checkId: id, position: slot.position },
                },
                data: {
                  originalText: slot.originalText,
                  structured: slot.structured as Prisma.InputJsonValue,
                },
              });
            for (const revision of await tx.fieldRevision.findMany({
              where: { checkId: id },
            }))
              await writer.fieldRevision.update({
                where: {
                  checkId_position_revision: {
                    checkId: id,
                    position: revision.position,
                    revision: revision.revision,
                  },
                },
                data: { content: revision.content as Prisma.InputJsonValue },
              });
            for (const result of await tx.referenceResult.findMany({
              where: { checkId: id },
              include: { manualOverride: true },
            })) {
              await writer.referenceResult.update({
                where: { id: result.id },
                data: { content: result.content as Prisma.InputJsonValue },
              });
              if (result.manualOverride)
                await writer.manualOverride.update({
                  where: { resultId: result.id },
                  data: { verdict: result.manualOverride.verdict },
                });
            }
            for (const event of await tx.checkEvent.findMany({
              where: { checkId: id },
            }))
              await writer.checkEvent.update({
                where: { checkId_seq: { checkId: id, seq: event.seq } },
                data: { payload: event.payload as Prisma.InputJsonValue },
              });
          }
        }
        await raw.$executeRaw`DELETE FROM verification.transient_keys WHERE day<${day}`;
      },
      { timeout: 30_000 },
    );
  }
  async function ownerSnapshot(
    principal: Principal,
    checkId: string,
    action: "read" | "cancel" | "renew",
    apiVersion = 1,
  ) {
    return transaction(async (tx) => {
      const row = await lock(tx, checkId);
      if (
        !row ||
        row.ownerId !== principal.ownerId ||
        (apiVersion === 1 && row.apiVersion !== 1)
      )
        return null;
      // Frozen v1 has no 410: expired content is simply no longer there.
      if (apiVersion === 2) assertContentAlive(row);
      else if (!contentAlive(row)) return null;
      const now = clock.now();
      const expired = await expireLocked(tx, row, now);
      if (
        !expired &&
        (await tx.referenceSlot.count({
          where: { checkId, status: "running" },
        })) > 0
      ) {
        if (action === "cancel")
          await cancelLocked(tx, checkId, "cancelled", now);
        if (action === "renew")
          await tx.check.update({
            where: { id: checkId },
            data: { leaseExpiresAt: new Date(now + settings.clientLeaseMs) },
          });
      }
      // This lock also covers relation reads: snapshot and cursor are one cut.
      const snapshot = await tx.check.findUniqueOrThrow({
        where: { id: checkId },
        include: withSlots,
      });
      // withSlots already omits removed slots.
      return {
        check: toCheck(snapshot, renewalInterval),
        references: snapshot.references.map((slot) => ({
          id: `${checkId}:${slot.position}`,
          slot: slot.position,
          resultId: slot.results[0]?.id,
          resultIsCurrent:
            slot.results[0]?.generation === slot.generation &&
            slot.results[0]?.revision === slot.revision &&
            slot.status === "finished",
          originalText: slot.originalText,
          imported: (slot.structured as unknown as StructuredReference | null)
            ?.imported,
          authorsTruncated: (
            slot.structured as unknown as StructuredReference | null
          )?.authorsTruncated,
          fields:
            (slot.structured as unknown as StructuredReference | null)?.csl ??
            {},
        })),
      };
    });
  }
  async function ownerOperation(
    principal: Principal,
    id: string,
    action: "read" | "cancel" | "renew",
    version: number,
  ) {
    return (await ownerSnapshot(principal, id, action, version))?.check ?? null;
  }
  return {
    async publish<T>(
      principal: Principal,
      id: string,
      version: number,
      send: () => Promise<T>,
    ): Promise<T> {
      return transaction(async (tx) => {
        const row = await lock(tx, id);
        if (
          !row ||
          row.ownerId !== principal.ownerId ||
          (version === 1 && row.apiVersion !== 1)
        )
          throw new CheckExpired();
        assertContentAlive(row);
        return send();
      });
    },
    exportSnapshot: (principal: Principal, id: string) =>
      ownerSnapshot(principal, id, "read", 2),
    async create(
      principal: Principal,
      references: StructuredReference[],
      apiVersion = 1,
      document?: BibliographyDocument,
    ): Promise<Check> {
      return transaction(async (tx) => {
        const row = await tx.check.create({
          data: {
            id: randomUUID(),
            apiVersion,
            document: document
              ? (JSON.parse(JSON.stringify(document)) as Prisma.InputJsonValue)
              : undefined,
            ownerId: principal.ownerId,
            actorId: principal.actorId,
            guestContextId: principal.guestContextId,
            state: "running",
            createdAt: new Date(clock.now()),
            contentExpiresAt: new Date(
              clock.now() + settings.contentRetentionMs,
            ),
            leaseExpiresAt: new Date(clock.now() + settings.clientLeaseMs),
            references: {
              create: references.map((reference, index) => ({
                position: index + 1,
                originalText: reference.originalText,
                structured: JSON.parse(
                  JSON.stringify(reference),
                ) as Prisma.InputJsonValue,
                status: "running",
                revisions: {
                  create: {
                    revision: 1,
                    content: JSON.parse(
                      JSON.stringify(reference),
                    ) as Prisma.InputJsonValue,
                    provenance: reference.structuring.path,
                  },
                },
              })),
            },
          },
          include: withSlots,
        });
        await appendEvent(tx, row.id, {
          type: "check.updated",
          state: "running",
          endReason: null,
        });
        for (const slot of row.references)
          await wake(tx, row.id, slot.position);
        return toCheck({ ...row, lastSeq: 1 }, renewalInterval);
      });
    },
    get: (principal: Principal, id: string, version = 1) =>
      ownerOperation(principal, id, "read", version),
    cancel: (principal: Principal, id: string, version = 1) =>
      ownerOperation(principal, id, "cancel", version),
    renew: (principal: Principal, id: string, version = 1) =>
      ownerOperation(principal, id, "renew", version),
    async setManualOverride(
      principal: Principal,
      checkId: string,
      position: number,
      request: SetManualOverrideRequest,
    ) {
      return transaction(async (tx) => {
        const check = await lock(tx, checkId);
        if (
          !check ||
          check.ownerId !== principal.ownerId ||
          check.apiVersion !== 2
        )
          return null;
        assertContentAlive(check);
        await expireLocked(tx, check, clock.now());
        const slot = await tx.referenceSlot.findUnique({
          where: { checkId_position: { checkId, position } },
          include: {
            results: {
              orderBy: { generation: "desc" },
              include: { manualOverride: true },
              take: 1,
            },
          },
        });
        if (!slot || slot.removed) return null;
        const result = slot.results[0];
        if (
          slot.status === "running" ||
          slot.revision !== request.expectedRevision ||
          !result ||
          result.id !== request.resultId ||
          result.revision !== slot.revision ||
          result.generation !== slot.generation ||
          ReferenceOutcome.parse(result.content).kind !== "verdict" ||
          (result.manualOverride?.id ?? null) !== request.expectedOverrideId
        )
          throw new ReferenceConflict();
        const data = {
          id: randomUUID(),
          verdict: request.verdict,
          createdAt: new Date(clock.now()),
        };
        await tx.manualOverride.upsert({
          where: { resultId: result.id },
          create: { resultId: result.id, ...data },
          update: data,
        });
        await appendEvent(tx, checkId, {
          type: "reference.updated",
          reference: {
            slot: position,
            outcome: ReferenceOutcome.parse(result.content),
            progress: slot.progress as ReferenceProgress,
          },
        });
        return toCheck(
          await tx.check.findUniqueOrThrow({
            where: { id: checkId },
            include: withSlots,
          }),
          renewalInterval,
        );
      });
    },
    async saveFields(
      principal: Principal,
      checkId: string,
      position: number,
      request: SaveFieldsRequest,
    ) {
      return transaction(async (tx) => {
        const check = await lock(tx, checkId);
        if (
          !check ||
          check.ownerId !== principal.ownerId ||
          check.apiVersion !== 2
        )
          return null;
        assertContentAlive(check);
        await expireLocked(tx, check, clock.now());
        const slot = await tx.referenceSlot.findUnique({
          where: { checkId_position: { checkId, position } },
        });
        if (!slot || slot.removed) return null;
        if (
          slot.status === "running" ||
          slot.revision !== request.expectedRevision
        )
          throw new ReferenceConflict();
        const previous = slot.structured as unknown as StructuredReference;
        const reference: StructuredReference = {
          ...previous,
          originalText: slot.originalText,
          csl: request.fields,
          authorsTruncated: request.authorsTruncated ?? false,
          fieldSources: Object.fromEntries(
            Object.entries(request.fields).map(([key, value]) => [
              key,
              {
                raw: typeof value === "string" ? value : JSON.stringify(value),
              },
            ]),
          ),
          structuring: { path: "user", version: "user-fields-1" },
        };
        const content = JSON.parse(
          JSON.stringify(reference),
        ) as Prisma.InputJsonValue;
        await tx.fieldRevision.create({
          data: {
            checkId,
            position,
            revision: slot.revision + 1,
            content,
            provenance: "user",
          },
        });
        await tx.referenceSlot.update({
          where: { checkId_position: { checkId, position } },
          data: {
            revision: { increment: 1 },
            structured: content,
            generation: request.recheck ? { increment: 1 } : undefined,
            status: request.recheck ? "running" : "not-checked",
            progress: request.recheck ? "queued" : "ended",
            startedAt: null,
            attempts: 0,
            claimUntil: null,
          },
        });
        if (request.recheck) {
          await tx.check.update({
            where: { id: checkId },
            data: {
              leaseExpiresAt: new Date(clock.now() + settings.clientLeaseMs),
            },
          });
          await wake(tx, checkId, position);
        }
        const snapshot = toCheck(
          await tx.check.findUniqueOrThrow({
            where: { id: checkId },
            include: withSlots,
          }),
          renewalInterval,
        );
        await appendEvent(tx, checkId, {
          type: "reference.updated",
          reference: snapshot.references.find((r) => r.slot === position)!,
        });
        return toCheck(
          await tx.check.findUniqueOrThrow({
            where: { id: checkId },
            include: withSlots,
          }),
          renewalInterval,
        );
      });
    },
    async recheck(
      principal: Principal,
      checkId: string,
      position: number,
      request: RecheckRequest,
    ) {
      return transaction(async (tx) => {
        const check = await lock(tx, checkId);
        if (
          !check ||
          check.ownerId !== principal.ownerId ||
          check.apiVersion !== 2
        )
          return null;
        assertContentAlive(check);
        await expireLocked(tx, check, clock.now());
        const slot = await tx.referenceSlot.findUnique({
          where: { checkId_position: { checkId, position } },
        });
        if (!slot || slot.removed) return null;
        if (
          slot.status === "running" ||
          slot.revision !== request.expectedRevision
        )
          throw new ReferenceConflict();
        await tx.referenceSlot.update({
          where: { checkId_position: { checkId, position } },
          data: {
            generation: { increment: 1 },
            status: "running",
            progress: "queued",
            startedAt: null,
            attempts: 0,
            claimUntil: null,
          },
        });
        await tx.check.update({
          where: { id: checkId },
          data: {
            leaseExpiresAt: new Date(clock.now() + settings.clientLeaseMs),
          },
        });
        await appendEvent(tx, checkId, {
          type: "reference.updated",
          reference: {
            slot: position,
            outcome: { kind: "status", status: "running" },
            progress: "queued",
          },
        });
        await wake(tx, checkId, position);
        return toCheck(
          await tx.check.findUniqueOrThrow({
            where: { id: checkId },
            include: withSlots,
          }),
          renewalInterval,
        );
      });
    },
    async previewSelection(
      principal: Principal,
      checkId: string,
      request: EditSelectionRequest,
      parser: Structuring,
      referenceLimit: number,
    ) {
      const snapshot = await ownerSnapshot(principal, checkId, "read", 2);
      if (!snapshot) return null;
      const check = snapshot.check;
      if (
        !check.document ||
        check.lastEventSeq !== request.expectedEventSeq ||
        check.references.some(
          (r) => r.outcome.kind === "status" && r.outcome.status === "running",
        )
      )
        throw new ReferenceConflict();
      const difference = selectionDifference(
        check,
        request.regions,
        parser,
        referenceLimit,
      );
      if (difference.preview.total > referenceLimit)
        throw new ReferenceLimitExceeded(referenceLimit);
      return difference.preview;
    },
    async editList(
      principal: Principal,
      checkId: string,
      request: EditReferenceListRequest,
      referenceLimit: number,
      selection?: { regions: Span[]; parser: Structuring },
    ) {
      return transaction(async (tx) => {
        const check = await lock(tx, checkId);
        if (
          !check ||
          check.ownerId !== principal.ownerId ||
          check.apiVersion !== 2
        )
          return null;
        assertContentAlive(check);
        await expireLocked(tx, check, clock.now());
        const slots = await tx.referenceSlot.findMany({
          where: { checkId },
          orderBy: { position: "asc" },
        });
        if (
          check.lastSeq !== request.expectedEventSeq ||
          slots.some((s) => s.status === "running")
        )
          throw new ReferenceConflict();
        let additions: StructuredReference[] | undefined;
        if (selection) {
          const snapshot = toCheck(
            await tx.check.findUniqueOrThrow({
              where: { id: checkId },
              include: withSlots,
            }),
            renewalInterval,
          );
          if (!snapshot.document) throw new ReferenceConflict();
          const difference = selectionDifference(
            snapshot,
            selection.regions,
            selection.parser,
            referenceLimit,
          );
          request = {
            ...request,
            remove: difference.preview.removed,
            add: difference.references.map((r) => ({
              originalText: r.originalText,
              fields: r.csl,
              authorsTruncated: r.authorsTruncated,
            })),
          };
          additions = difference.references;
          await tx.check.update({
            where: { id: checkId },
            data: {
              document: JSON.parse(
                JSON.stringify(difference.document),
              ) as Prisma.InputJsonValue,
            },
          });
        }
        const removed = new Set(request.remove);
        if (
          removed.size !== request.remove.length ||
          request.remove.some(
            (position) =>
              !slots.some((s) => s.position === position && !s.removed),
          )
        )
          throw new ReferenceConflict();
        if (
          slots.filter((s) => !s.removed && !removed.has(s.position)).length +
            request.add.length >
          referenceLimit
        )
          throw new ReferenceLimitExceeded(referenceLimit);
        for (const position of removed) {
          await tx.referenceSlot.update({
            where: { checkId_position: { checkId, position } },
            data: { removed: true },
          });
          await appendEvent(tx, checkId, {
            type: "reference.updated",
            reference: {
              slot: position,
              outcome: { kind: "status", status: "not-checked" },
              progress: "ended",
              removed: true,
            },
          });
        }
        let position = slots.at(-1)?.position ?? 0;
        for (const [index, added] of request.add.entries()) {
          position++;
          const reference: StructuredReference = additions?.[index] ?? {
            originalText: added.originalText,
            span: { start: 0, end: added.originalText.length },
            csl: added.fields,
            fieldSources: Object.fromEntries(
              Object.entries(added.fields).map(([key, value]) => [
                key,
                {
                  raw:
                    typeof value === "string" ? value : JSON.stringify(value),
                },
              ]),
            ),
            authorsTruncated: added.authorsTruncated,
            structuring: { path: "user", version: "user-fields-1" },
          };
          const content = JSON.parse(
            JSON.stringify(reference),
          ) as Prisma.InputJsonValue;
          await tx.referenceSlot.create({
            data: {
              checkId,
              position,
              originalText: added.originalText,
              structured: content,
              status: "running",
              revisions: {
                create: {
                  revision: 1,
                  content,
                  provenance: reference.structuring.path,
                },
              },
            },
          });
          await appendEvent(tx, checkId, {
            type: "reference.updated",
            reference: {
              slot: position,
              outcome: { kind: "status", status: "running" },
              progress: "queued",
            },
          });
          await wake(tx, checkId, position);
        }
        if (selection)
          await appendEvent(tx, checkId, {
            type: "check.updated",
            state: check.state as Check["state"],
            endReason: check.endReason as CheckEndReason | null,
          });
        if (request.add.length)
          await tx.check.update({
            where: { id: checkId },
            data: {
              leaseExpiresAt: new Date(clock.now() + settings.clientLeaseMs),
            },
          });
        return toCheck(
          await tx.check.findUniqueOrThrow({
            where: { id: checkId },
            include: withSlots,
          }),
          renewalInterval,
        );
      });
    },
    async events(checkId: string, after: number): Promise<CheckEvent[]> {
      return transaction(async (tx) => {
        const check = await lock(tx, checkId);
        if (!check || !contentAlive(check)) return [];
        const rows = await tx.checkEvent.findMany({
          where: { checkId, seq: { gt: after } },
          orderBy: { seq: "asc" },
          take: 100,
        });
        return rows.map((row) =>
          CheckEvent.parse({
            ...(row.payload as object),
            checkId,
            seq: row.seq,
            type: row.type,
          }),
        );
      });
    },
    async peekWork(): Promise<WorkSubject | null> {
      const rows = await db.$queryRaw<
        {
          checkId: string;
          ownerId: string;
          actorId: string;
          guestContextId: string | null;
        }[]
      >`SELECT c.id AS "checkId",c.owner_id AS "ownerId",c.actor_id AS "actorId",c.guest_context_id AS "guestContextId" FROM verification.checks c
        WHERE c.lease_expires_at>${new Date(clock.now())}
        AND c.deleted_at IS NULL AND (c.content_expires_at>${new Date(clock.now())} OR (c.started_at IS NOT NULL AND c.ended_at IS NULL))
        AND EXISTS (SELECT 1 FROM verification.reference_slots r WHERE r.check_id=c.id AND r.status='running' AND r.claim_until IS NULL)
        AND (SELECT count(*) FROM verification.reference_slots r WHERE r.check_id=c.id AND r.status='running' AND r.claim_until IS NOT NULL)<${settings.activeReferencesPerCheck}
        ORDER BY (SELECT max(o.dispatch_order) FROM verification.checks o WHERE o.owner_id=c.owner_id AND EXISTS (SELECT 1 FROM verification.reference_slots t WHERE t.check_id=o.id AND t.status='running')),c.dispatch_order,c.created_at,c.id LIMIT 1`;
      const row = rows[0];
      return row
        ? { ...row, guestContextId: row.guestContextId ?? undefined }
        : null;
    },
    async deferAdmission(id: string) {
      await db.$executeRaw`UPDATE verification.checks SET dispatch_order=nextval('verification.dispatch_order') WHERE id=${id}::uuid`;
    },
    async claimNext(candidateId?: string): Promise<ReferenceAttempt | null> {
      return transaction(async (tx) => {
        // One durable round-robin order across all processes: Owners first (the
        // Owner whose latest dispatch is oldest), then that Owner's Checks.
        // Admission and the per-Check cap commit together; queue delivery is
        // only a wake-up.
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(810070)::text`;
        const now = clock.now();
        const rows = await tx.$queryRaw<
          { id: string }[]
        >`SELECT c.id FROM verification.checks c
          WHERE c.lease_expires_at>${new Date(now)}
          AND c.deleted_at IS NULL AND (c.content_expires_at>${new Date(now)} OR (c.started_at IS NOT NULL AND c.ended_at IS NULL))
          AND EXISTS (SELECT 1 FROM verification.reference_slots r WHERE r.check_id=c.id AND r.status='running' AND r.claim_until IS NULL)
          AND (SELECT count(*) FROM verification.reference_slots r WHERE r.check_id=c.id AND r.status='running' AND r.claim_until IS NOT NULL)<${settings.activeReferencesPerCheck}
          ORDER BY (SELECT max(o.dispatch_order) FROM verification.checks o WHERE o.owner_id=c.owner_id AND EXISTS (SELECT 1 FROM verification.reference_slots t WHERE t.check_id=o.id AND t.status='running')),c.dispatch_order,c.created_at,c.id LIMIT 1`;
        if (
          !rows[0] ||
          (candidateId !== undefined && rows[0].id !== candidateId)
        )
          return null;
        const check = await lock(tx, rows[0].id);
        if (
          !check ||
          !contentAlive(check) ||
          (await expireLocked(tx, check, clock.now()))
        )
          return null;
        const slot = await tx.referenceSlot.findFirst({
          where: { checkId: check.id, status: "running", claimUntil: null },
          orderBy: { position: "asc" },
        });
        if (!slot) return null;
        const claimed = await tx.referenceSlot.update({
          where: {
            checkId_position: { checkId: check.id, position: slot.position },
          },
          data: {
            generation: { increment: 1 },
            attempts: { increment: 1 },
            claimUntil: new Date(now + settings.claimMs),
            startedAt: slot.startedAt ?? new Date(now),
            progress: "checking",
          },
        });
        await tx.$executeRaw`UPDATE verification.checks SET dispatch_order=nextval('verification.dispatch_order'),started_at=COALESCE(started_at,${new Date(now)}) WHERE id=${check.id}::uuid`;
        await appendEvent(tx, check.id, {
          type: "reference.updated",
          reference: {
            slot: slot.position,
            outcome: { kind: "status", status: "running" },
            progress: "checking",
          },
        });
        return {
          apiVersion: check.apiVersion,
          checkId: check.id,
          slot: slot.position,
          ownerId: check.ownerId,
          actorId: check.actorId,
          ...(check.guestContextId
            ? { guestContextId: check.guestContextId }
            : {}),
          generation: claimed.generation,
          revision: claimed.revision,
          startedAt: claimed.startedAt!.getTime(),
          input: claimed.structured as unknown as StructuredReference | null,
        };
      });
    },
    async progress(
      attempt: ReferenceAttempt,
      progress: ReferenceProgress,
    ): Promise<boolean> {
      return transaction(async (tx) => {
        const check = await lock(tx, attempt.checkId);
        if (
          !check ||
          !contentAlive(check) ||
          (await expireLocked(tx, check, clock.now()))
        )
          return false;
        const slot = await tx.referenceSlot.findUnique({
          where: {
            checkId_position: {
              checkId: attempt.checkId,
              position: attempt.slot,
            },
          },
        });
        if (!eligibleAttempt(slot, attempt, clock.now())) return false;
        if (slot.progress !== progress) {
          await tx.referenceSlot.update({
            where: {
              checkId_position: {
                checkId: attempt.checkId,
                position: attempt.slot,
              },
            },
            data: { progress },
          });
          await appendEvent(tx, check.id, {
            type: "reference.updated",
            reference: {
              slot: attempt.slot,
              outcome: { kind: "status", status: "running" },
              progress,
            },
          });
        }
        return true;
      });
    },
    async isCurrent(attempt: ReferenceAttempt): Promise<boolean> {
      const row = await db.referenceSlot.findUnique({
        where: {
          checkId_position: {
            checkId: attempt.checkId,
            position: attempt.slot,
          },
        },
        select: {
          status: true,
          generation: true,
          revision: true,
          claimUntil: true,
          check: true,
        },
      });
      return (
        eligibleAttempt(row, attempt, clock.now()) &&
        contentAlive(row.check) &&
        row.check.leaseExpiresAt.getTime() > clock.now()
      );
    },
    async finishReference(
      attempt: ReferenceAttempt,
      outcome: ReferenceOutcome,
    ) {
      return transaction(async (tx) => {
        const check = await lock(tx, attempt.checkId);
        if (
          !check ||
          !contentAlive(check) ||
          (await expireLocked(tx, check, clock.now())) ||
          (await tx.referenceSlot.count({
            where: { checkId: check.id, status: "running" },
          })) === 0
        )
          return;
        const slot = await tx.referenceSlot.findUnique({
          where: {
            checkId_position: {
              checkId: attempt.checkId,
              position: attempt.slot,
            },
          },
        });
        if (!eligibleAttempt(slot, attempt, clock.now())) return;
        await record(
          tx,
          check.id,
          slot.position,
          slot.generation,
          slot.revision,
          ReferenceOutcome.parse(outcome),
        );
        if (
          (await tx.referenceSlot.count({
            where: { checkId: check.id, status: "running" },
          })) === 0
        )
          await end(tx, check.id, "completed", clock.now());
        else await wake(tx, check.id);
      });
    },
    async invalidateOwner(ownerId: string) {
      // Caller holds the Owner fence; all result/response guards drain before ack.
      const running = await db.check.findMany({
        where: { ownerId, references: { some: { status: "running" } } },
        select: { id: true },
      });
      for (const { id } of running)
        await transaction(async (tx) => {
          const row = await lock(tx, id);
          if (
            row &&
            (await tx.referenceSlot.count({
              where: { checkId: id, status: "running" },
            })) > 0
          )
            await cancelLocked(tx, id, "cancelled", clock.now());
        });
    },
    /** Expiry work; runs before a process serves or works (ADR-0005 restore). */
    sweep,
    async maintain() {
      await sweep();
      const running = await db.check.findMany({
        where: { references: { some: { status: "running" } } },
        select: { id: true },
      });
      for (const { id } of running)
        await transaction(async (tx) => {
          const check = await lock(tx, id);
          if (
            !check ||
            (await expireLocked(tx, check, clock.now())) ||
            (await tx.referenceSlot.count({
              where: { checkId: check.id, status: "running" },
            })) === 0
          )
            return;
          const expired = await tx.referenceSlot.findMany({
            where: {
              checkId: id,
              status: "running",
              claimUntil: { lte: new Date(clock.now()) },
            },
          });
          for (const slot of expired) {
            if (slot.attempts >= settings.maxAttempts)
              await record(
                tx,
                id,
                slot.position,
                slot.generation,
                slot.revision,
                { kind: "status", status: "failed" },
              );
            else {
              await tx.referenceSlot.update({
                where: {
                  checkId_position: { checkId: id, position: slot.position },
                },
                data: {
                  generation: { increment: 1 },
                  claimUntil: null,
                  progress: "queued",
                },
              });
              await appendEvent(tx, id, {
                type: "reference.updated",
                reference: {
                  slot: slot.position,
                  outcome: { kind: "status", status: "running" },
                  progress: "queued",
                },
              });
            }
          }
          if (
            (await tx.referenceSlot.count({
              where: { checkId: id, status: "running" },
            })) === 0
          )
            await end(tx, id, "completed", clock.now());
          // A bounded, deduplicated wake repairs lost/exhausted queue deliveries.
          // Correctness is in the attempt fence, never pg-boss job expiry.
        });
      const pending = await db.referenceSlot.findFirst({
        select: { checkId: true, position: true },
        where: {
          status: "running",
          claimUntil: null,
          check: {
            leaseExpiresAt: { gt: new Date(clock.now()) },
          },
        },
      });
      if (pending)
        await boss.send(
          REFERENCE_QUEUE,
          { checkId: pending.checkId, slot: pending.position },
          { singletonKey: "lifecycle-recovery", singletonSeconds: 1 },
        );
    },
  };
}
export type CheckStore = ReturnType<typeof createCheckStore>;

export class ReferenceConflict extends Error {}

export class CheckExpired extends ContentUnavailable {}
