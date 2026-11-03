// SPDX-License-Identifier: AGPL-3.0-or-later
// The Check lock serializes lifecycle, immutable evidence and ordered events.
import { randomBytes, randomUUID } from "node:crypto";
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
import { REFERENCE_QUEUE, REPORT_QUEUE } from "./queue.ts";
import type { Db } from "../db/prisma.ts";
import type {
  Report,
  ReportFailure,
  ReportLanguage,
} from "@source-taster/contract-verification/report";
import type { CitationStyle } from "@source-taster/contract-common";
import type { Principal } from "../entitlements.ts";
import type { ReportInput } from "../reports/model.ts";
import { QuotaStale, type SlotRef } from "../quota/port.ts";

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
          provenance: r.provenance as "parser" | "user" | "ai",
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
type Reader = Pick<Db, "settlementIntent">;
async function hasVerdict(db: Reader, checkId: string, position: number) {
  // The content-free journal intent survives encryption and records the first
  // Verdict independently of later failed/cancelled Re-check results.
  return (
    (await db.settlementIntent.count({
      where: { checkId, position, outcome: "verdict" },
    })) > 0
  );
}

function addedSlots(last: number, count: number): SlotRef[] {
  return Array.from({ length: count }, (_, i) => ({
    position: last + i + 1,
    generation: 0,
  }));
}
/** The billable work inside the guarded operation must equal what was reserved. */
function assertReserved(expected: SlotRef[] | undefined, actual: SlotRef[]) {
  if (!expected) return;
  const key = (list: SlotRef[]) =>
    list
      .map((s) => `${s.position}:${s.generation}`)
      .sort()
      .join(",");
  if (key(expected) !== key(actual)) throw new QuotaStale();
}

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
  const rawTransactions = new WeakMap<Tx, Tx>();
  const transaction = <T>(operation: (tx: Tx) => Promise<T>) =>
    db.$transaction(async (raw) => {
      await raw.$queryRaw`SELECT pg_advisory_xact_lock_shared(910012)::text`;
      const tx = contentTransaction(raw, () => clock.now());
      rawTransactions.set(tx, raw);
      return operation(tx);
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
    if (
      current.state !== "ended" &&
      current.apiVersion === 2 &&
      !current.guestContextId
    ) {
      const policy = await historyPolicy(tx, current.ownerId, now);
      if (policy.enabled) {
        const days = policy.paid
          ? policy.paidHistoryDays
          : policy.freeHistoryDays;
        const sequence = await tx.$queryRaw<
          { value: bigint }[]
        >`SELECT nextval('verification.history_storage_order') AS value`;
        await tx.check.update({
          where: { id: checkId },
          data: {
            historyOrder: sequence[0]!.value,
            historyStoredAt: new Date(now),
            historyDays: days,
            historyPaid: policy.paid,
            contentExpiresAt: new Date(now + days * 86_400_000),
          },
        });
        const raw = rawTransactions.get(tx) ?? tx;
        await raw.$executeRaw`INSERT INTO verification.history_keys(check_id,key) VALUES (${checkId}::uuid,${randomBytes(32)}) ON CONFLICT DO NOTHING`;
        await rewrap(
          tx,
          contentTransaction(raw, () => clock.now(), undefined, checkId),
          checkId,
        );
        await historyRules(tx, current.ownerId, !policy.paid);
      }
    }
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
    historyLocked?: boolean;
  };
  /** The instant the Check's content is deleted; Infinity while its lease holds it. */
  function deletionDeadline(row: ContentRow) {
    const now = clock.now();
    // Once work has started, creation is no longer the retention origin. Before
    // the first end, only an expired lease can establish the eventual deadline.
    return row.startedAt && !row.endedAt
      ? row.leaseExpiresAt.getTime() <= now
        ? row.leaseExpiresAt.getTime() + settings.contentRetentionMs
        : Infinity
      : row.contentExpiresAt.getTime();
  }
  function contentAlive(row: ContentRow) {
    return !row.deletedAt && clock.now() < deletionDeadline(row);
  }
  function assertContentAlive(row: ContentRow) {
    if (!contentAlive(row)) throw new CheckExpired();
    if (row.historyLocked) throw new HistoryLocked();
  }
  async function assertAccessible(
    tx: Tx,
    row: ContentRow & {
      id: string;
      ownerId: string;
      historyStoredAt?: Date | null;
    },
  ) {
    if (row.historyStoredAt) {
      await historyRules(tx, row.ownerId);
      const current = await tx.check.findUniqueOrThrow({
        where: { id: row.id },
        select: { historyLocked: true, deletedAt: true },
      });
      assertContentAlive({ ...row, ...current });
    } else assertContentAlive(row);
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
    await tx.$executeRaw`DELETE FROM verification.history_keys WHERE check_id=${check.id}::uuid`;
    await tx.checkEvent.deleteMany({ where: { checkId: check.id } });
    await tx.referenceSlot.deleteMany({ where: { checkId: check.id } });
    // The Check row stays as the tombstone, so its reports do not cascade.
    await tx.report.deleteMany({ where: { checkId: check.id } });
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
  async function rewrap(tx: Tx, writer: Tx, id: string) {
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
  const retentionMetadata = {
    id: true,
    ownerId: true,
    contentExpiresAt: true,
    deletedAt: true,
    startedAt: true,
    endedAt: true,
    leaseExpiresAt: true,
    historyStoredAt: true,
    historyOrder: true,
    historyDays: true,
    historyPaid: true,
    historyLocked: true,
  } as const;
  const DAY = 86_400_000;
  async function historyPolicy(tx: Tx, ownerId: string, at: number) {
    const consent = await tx.historyConsent.findUnique({ where: { ownerId } });
    const enabled = consent?.enabled ?? false;
    const initial = {
      freeHistoryChecks: consent?.freeHistoryChecks ?? 5,
      freeHistoryDays: consent?.freeHistoryDays ?? 30,
      paidHistoryDays: consent?.paidHistoryDays ?? 90,
    };
    if (!consent?.extendedUntil || consent.extendedUntil.getTime() <= at)
      return { enabled, paid: false, ...initial };
    const fence = await tx.authorityFence.findUnique({ where: { ownerId } });
    return {
      enabled,
      paid: consent.authorityVersion >= (fence?.version ?? 1),
      ...initial,
    };
  }
  async function historyRules(tx: Tx, ownerId: string, storingFree = false) {
    // Publication uses the durable invalidation fence even without a fresh
    // Quota reply, including an already-open stream or a held response.
    const { enabled, paid, freeHistoryDays, freeHistoryChecks } =
      await historyPolicy(tx, ownerId, clock.now());
    const entries = await tx.check.findMany({
      where: { ownerId, historyStoredAt: { not: null }, deletedAt: null },
      select: retentionMetadata,
      orderBy: [
        { historyStoredAt: "desc" },
        { historyOrder: "desc" },
        { id: "desc" },
      ],
    });
    // Only storing a NEW Free entry may evict the oldest previously usable
    // entry. A downgrade itself locks all overflow, including Free-stored rows.
    const displaced =
      storingFree && !paid
        ? entries.filter(
            (e) =>
              contentAlive(e) &&
              e.historyStoredAt!.getTime() + freeHistoryDays * DAY >
                clock.now(),
          )[freeHistoryChecks]
        : undefined;
    if (displaced && !displaced.historyPaid) await purgeLocked(tx, displaced);
    let usable = 0;
    for (const entry of entries) {
      if (entry.id === displaced?.id && !entry.historyPaid) continue;
      if (!contentAlive(entry)) continue;
      const young =
        entry.historyStoredAt!.getTime() + freeHistoryDays * DAY > clock.now();
      const locked = !paid && (!young || usable >= freeHistoryChecks);
      if (!locked) usable++;
      if (entry.historyLocked !== locked)
        await tx.check.update({
          where: { id: entry.id },
          data: { historyLocked: locked },
        });
    }
    return { enabled, paid };
  }
  async function historySnapshot(
    tx: Tx,
    principal: Principal,
    metadataOnly = false,
  ) {
    const rules = await historyRules(tx, principal.ownerId);
    const entries = await tx.check.findMany({
      where: {
        ownerId: principal.ownerId,
        historyStoredAt: { not: null },
        deletedAt: null,
        contentExpiresAt: { gt: new Date(clock.now()) },
      },
      orderBy: [
        { historyStoredAt: "desc" },
        { historyOrder: "desc" },
        { id: "desc" },
      ],
      select: {
        ...retentionMetadata,
        _count: { select: { references: { where: { removed: false } } } },
      },
    });
    return {
      enabled: rules.enabled,
      entries: await Promise.all(
        entries.filter(contentAlive).map(async (e) => {
          const first =
            !metadataOnly && !e.historyLocked
              ? await tx.referenceSlot.findFirst({
                  where: { checkId: e.id, removed: false },
                  orderBy: { position: "asc" },
                  select: { originalText: true, structured: true },
                })
              : null;
          return {
            id: e.id,
            storedAt: e.historyStoredAt!.toISOString(),
            expiresAt: e.contentExpiresAt.toISOString(),
            locked: e.historyLocked,
            referenceCount: e._count.references,
            ...(first
              ? {
                  label: String(
                    (first.structured as unknown as StructuredReference | null)
                      ?.csl.title ?? first.originalText,
                  ).slice(0, 120),
                }
              : {}),
          };
        }),
      ),
    };
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
        // ADR-0017: a report file lives at most 15 minutes, whatever its state.
        await raw.$executeRaw`DELETE FROM verification.reports WHERE expires_at<=${new Date(now)}`;
        const due = await raw.$queryRaw<{ id: string }[]>`
        SELECT c.id FROM verification.checks c WHERE c.deleted_at IS NULL AND
        (EXISTS (SELECT 1 FROM verification.owner_tombstones t WHERE t.owner_id::text=lower(c.owner_id))
        OR ((c.started_at IS NULL OR c.ended_at IS NOT NULL) AND c.content_expires_at<=${new Date(now)})
        OR (c.started_at IS NOT NULL AND c.ended_at IS NULL AND c.lease_expires_at + (${settings.contentRetentionMs} * interval '1 millisecond')<=${new Date(now)}) OR (c.history_stored_at IS NOT NULL AND NOT EXISTS (SELECT 1 FROM verification.history_keys h WHERE h.check_id=c.id))
        OR (c.history_stored_at IS NULL AND c.document IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM verification.transient_keys k
          WHERE k.day=(c.document->>'day')::integer AND k.day>=${day}
        )) OR EXISTS (
          SELECT 1 FROM verification.reference_slots r
          LEFT JOIN verification.transient_keys k ON k.day=(r.original_text::jsonb->>'day')::integer
          WHERE c.history_stored_at IS NULL AND r.check_id=c.id AND (k.day IS NULL OR k.day<${day})
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
          WHERE c.deleted_at IS NULL AND c.history_stored_at IS NULL AND ((c.document->>'day')::integer<=${day}
          OR EXISTS (SELECT 1 FROM verification.reference_slots r
          WHERE r.check_id=c.id AND (r.original_text::jsonb->>'day')::integer<=${day})) ORDER BY c.id`;
          for (const { id } of checks) {
            await rewrap(tx, writer, id);
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
      if (apiVersion === 2) await assertAccessible(tx, row);
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
  // ADR-0017 reports. A report is a separate short-lived record of a Check: it
  // consumes no Quota, never changes the Check and is deleted with it.
  const reportLifetimeMs = 15 * 60_000;
  const publicReport = {
    id: true,
    checkId: true,
    language: true,
    state: true,
    failure: true,
    intermediate: true,
    expiresAt: true,
  } as const;
  type ReportRow = {
    id: string;
    checkId: string;
    language: string;
    state: string;
    failure: string | null;
    intermediate: boolean | null;
    expiresAt: Date;
  };
  const toReport = (row: ReportRow): Report => ({
    id: row.id,
    checkId: row.checkId,
    language: row.language as ReportLanguage,
    state: row.state as Report["state"],
    ...(row.failure ? { failure: row.failure as ReportFailure } : {}),
    ...(row.intermediate === null ? {} : { intermediate: row.intermediate }),
    expiresAt: row.expiresAt.toISOString(),
  });
  /** Expires 15 minutes after `from`, and never after the Check's content. */
  const reportExpiry = (row: ContentRow, from: number) =>
    new Date(Math.min(from + reportLifetimeMs, deletionDeadline(row)));
  async function ownedReport(
    tx: Tx,
    principal: Principal,
    checkId: string,
    reportId: string,
  ) {
    const row = await lock(tx, checkId);
    if (!row || row.ownerId !== principal.ownerId) return null;
    assertContentAlive(row);
    const report = await tx.report.findFirst({
      where: { id: reportId, checkId },
      select: publicReport,
    });
    return report ? { row, report } : null;
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
    async syncHistory(
      principal: Pick<Principal, "ownerId" | "actorId" | "guestContextId">,
      extendedUntil: string | null,
      authorityVersion = 0,
      initial?: {
        settingsVersion?: number;
        freeHistoryChecks?: number;
        freeHistoryDays?: number;
        paidHistoryDays?: number;
      },
    ) {
      if (principal.guestContextId) return;
      await transaction(async (tx) => {
        const previous = await tx.historyConsent.findUnique({
          where: { ownerId: principal.ownerId },
        });
        const fence = await tx.authorityFence.findUnique({
          where: { ownerId: principal.ownerId },
        });
        const minimum = Math.max(
          previous?.authorityVersion ?? 0,
          fence?.version ?? 1,
        );
        // Quota replies can arrive out of order. A stale paid snapshot cannot
        // restore an entitlement removed by a newer grant or invalidation.
        if (
          authorityVersion > 0 &&
          authorityVersion < minimum &&
          (previous?.authorityVersion ?? 0) >= (fence?.version ?? 1)
        )
          return;
        const currentInitial =
          initial &&
          initial.settingsVersion !== undefined &&
          initial.settingsVersion >= (previous?.settingsVersion ?? 0)
            ? initial
            : undefined;
        const until = authorityVersion >= minimum ? extendedUntil : null;
        const version = Math.max(minimum, authorityVersion);
        await tx.historyConsent.upsert({
          where: { ownerId: principal.ownerId },
          create: {
            ownerId: principal.ownerId,
            accountId: principal.actorId,
            extendedUntil: until ? new Date(until) : null,
            authorityVersion: version,
            ...currentInitial,
          },
          update: {
            extendedUntil: until ? new Date(until) : null,
            authorityVersion: version,
            ...currentInitial,
          },
        });
        await historyRules(tx, principal.ownerId);
      });
    },
    async history(
      principal: Principal,
      enabled?: boolean,
      deleteId?: string,
      metadataOnly = false,
    ) {
      return transaction(async (tx) => {
        if (enabled !== undefined) {
          await tx.historyConsent.upsert({
            where: { ownerId: principal.ownerId },
            create: {
              ownerId: principal.ownerId,
              accountId: principal.actorId,
              enabled,
            },
            update: { enabled },
          });
          if (!enabled) {
            const entries = await tx.check.findMany({
              where: {
                ownerId: principal.ownerId,
                historyStoredAt: { not: null },
                deletedAt: null,
              },
              select: retentionMetadata,
            });
            for (const entry of entries) await purgeLocked(tx, entry);
          }
        }
        if (deleteId) {
          const entry = await lock(rawTransactions.get(tx) ?? tx, deleteId);
          if (
            !entry ||
            entry.ownerId !== principal.ownerId ||
            !entry.historyStoredAt
          )
            return null;
          await purgeLocked(tx, entry);
        }
        return historySnapshot(tx, principal, metadataOnly);
      });
    },
    async restartInput(principal: Principal, id: string) {
      return transaction(async (tx) => {
        const row = await lock(tx, id);
        if (!row || row.ownerId !== principal.ownerId || !row.historyStoredAt)
          return null;
        await assertAccessible(tx, row);
        const slots = await tx.referenceSlot.findMany({
          where: { checkId: id, removed: false },
          orderBy: { position: "asc" },
        });
        return {
          references: slots.map(
            (slot) => slot.structured as unknown as StructuredReference,
          ),
          document: (row.document as BibliographyDocument | null) ?? undefined,
        };
      });
    },
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
        await assertAccessible(tx, row);
        return send();
      });
    },
    exportSnapshot: (principal: Principal, id: string) =>
      ownerSnapshot(principal, id, "read", 2),
    reports: {
      /** Null when the Check is not this Owner's. */
      async create(
        principal: Principal,
        checkId: string,
        request: {
          language: ReportLanguage;
          style: CitationStyle;
          documentName?: string;
        },
      ): Promise<Report | null> {
        return transaction(async (tx) => {
          const row = await lock(tx, checkId);
          if (!row || row.ownerId !== principal.ownerId) return null;
          assertContentAlive(row);
          const now = clock.now();
          // One generating report per Owner bounds memory and worker time.
          if (
            (await tx.report.count({
              where: {
                state: { in: ["queued", "generating"] },
                expiresAt: { gt: new Date(now) },
                check: { ownerId: principal.ownerId },
              },
            })) > 0
          )
            throw new ReportBusy();
          // A new report replaces this Check's earlier ones and their files.
          await tx.report.deleteMany({ where: { checkId } });
          const created = await tx.report.create({
            data: {
              id: randomUUID(),
              checkId,
              language: request.language,
              options: {
                style: request.style,
                ...(request.documentName
                  ? { documentName: request.documentName }
                  : {}),
              },
              state: "queued",
              expiresAt: reportExpiry(row, now),
            },
            select: publicReport,
          });
          await boss.send(
            REPORT_QUEUE,
            { reportId: created.id },
            {
              db: {
                executeSql: async (sql, values) => ({
                  rows: await tx.$queryRawUnsafe<unknown[]>(
                    sql,
                    ...(values ?? []),
                  ),
                }),
              },
            },
          );
          return toReport(created);
        });
      },
      async get(principal: Principal, checkId: string, reportId: string) {
        return transaction(async (tx) => {
          const found = await ownedReport(tx, principal, checkId, reportId);
          return found ? toReport(found.report) : null;
        });
      },
      /** The finished bytes; null when no such report. Rechecked on every download. */
      async file(principal: Principal, checkId: string, reportId: string) {
        return transaction(async (tx) => {
          const found = await ownedReport(tx, principal, checkId, reportId);
          if (!found) return null;
          if (found.report.expiresAt.getTime() <= clock.now())
            throw new ReportExpired();
          if (found.report.state !== "ready") throw new ReportNotReady();
          try {
            const sealed = await tx.report.findUniqueOrThrow({
              where: { id: reportId },
              select: { file: true },
            });
            return Buffer.from((sealed.file as { pdf: string }).pdf, "base64");
          } catch (error) {
            if (error instanceof ContentUnavailable) throw new ReportExpired();
            throw error;
          }
        });
      },
      /** Cancels a job or discards a file. Never touches the Check or Quota. */
      async cancel(principal: Principal, checkId: string, reportId: string) {
        return transaction(async (tx) => {
          const found = await ownedReport(tx, principal, checkId, reportId);
          if (!found) return null;
          if (
            found.report.state === "failed" ||
            found.report.state === "cancelled"
          )
            return toReport(found.report);
          return toReport(
            await tx.report.update({
              where: { id: reportId },
              data: { state: "cancelled", file: Prisma.DbNull },
              select: publicReport,
            }),
          );
        });
      },
      /**
       * Worker side. Freezes the snapshot: everything the file will say is read
       * here, in one locked cut, when generation begins (ADR-0017).
       */
      async claim(reportId: string): Promise<ReportWork | null> {
        const found = await db.report.findUnique({
          where: { id: reportId },
          select: { checkId: true },
        });
        if (!found) return null;
        return transaction(async (tx) => {
          const row = await lock(tx, found.checkId);
          const report = await tx.report.findUnique({
            where: { id: reportId },
            select: { ...publicReport },
          });
          if (!row || !report || report.state !== "queued") return null;
          const now = clock.now();
          if (!contentAlive(row) || report.expiresAt.getTime() <= now) {
            await tx.report.delete({ where: { id: reportId } });
            return null;
          }
          let options: { style: CitationStyle; documentName?: string };
          try {
            options = (
              await tx.report.findUniqueOrThrow({
                where: { id: reportId },
                select: { options: true },
              })
            ).options as typeof options;
          } catch (error) {
            if (!(error instanceof ContentUnavailable)) throw error;
            await tx.report.delete({ where: { id: reportId } });
            return null;
          }
          await expireLocked(tx, row, now);
          const snapshot = toCheck(
            await tx.check.findUniqueOrThrow({
              where: { id: found.checkId },
              include: withSlots,
            }),
            renewalInterval,
          );
          await tx.report.update({
            where: { id: reportId },
            data: {
              state: "generating",
              intermediate: snapshot.state !== "ended",
            },
          });
          return {
            reportId,
            subject: {
              checkId: found.checkId,
              ownerId: row.ownerId,
              actorId: row.actorId,
              ...(row.guestContextId
                ? { guestContextId: row.guestContextId }
                : {}),
            },
            input: {
              check: snapshot,
              language: report.language as ReportLanguage,
              style: options.style,
              ...(options.documentName
                ? { documentName: options.documentName }
                : {}),
              capturedAt: new Date(now).toISOString(),
            },
          };
        });
      },
      /**
       * Worker side. Publishes only while the Check is alive and the job was not
       * cancelled; the caller holds current authority. False: nothing was kept.
       */
      async finish(
        reportId: string,
        result: { pdf: Uint8Array } | { failure: ReportFailure },
      ): Promise<boolean> {
        const found = await db.report.findUnique({
          where: { id: reportId },
          select: { checkId: true },
        });
        if (!found) return false;
        return transaction(async (tx) => {
          const row = await lock(tx, found.checkId);
          const report = await tx.report.findUnique({
            where: { id: reportId },
            select: publicReport,
          });
          if (!report || report.state !== "generating") return false;
          const now = clock.now();
          if (!row || !contentAlive(row) || report.expiresAt.getTime() <= now) {
            await tx.report.delete({ where: { id: reportId } });
            return false;
          }
          const data: Prisma.ReportUpdateInput =
            "failure" in result
              ? { state: "failed", failure: result.failure }
              : {
                  state: "ready",
                  // The file lives 15 minutes from publication.
                  expiresAt: reportExpiry(row, now),
                  file: { pdf: Buffer.from(result.pdf).toString("base64") },
                };
          await tx.report.update({ where: { id: reportId }, data });
          return true;
        });
      },
      /** Worker side, no current authority or entitlement: drop without a file. */
      async discard(reportId: string) {
        await db.report.deleteMany({ where: { id: reportId } });
      },
    },
    async create(
      principal: Principal,
      references: StructuredReference[],
      apiVersion = 1,
      document?: BibliographyDocument,
      start: { id?: string; maxReferences?: number } = {},
    ): Promise<Check> {
      // Quota's first-N rule: slots beyond the cap are kept but never started.
      const started = (position: number) =>
        position <= (start.maxReferences ?? Infinity);
      return transaction(async (tx) => {
        const row = await tx.check.create({
          data: {
            id: start.id ?? randomUUID(),
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
                status: started(index + 1) ? "running" : "not-checked",
                progress: started(index + 1) ? "queued" : "ended",
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
          if (started(slot.position)) await wake(tx, row.id, slot.position);
        return toCheck({ ...row, lastSeq: 1 }, renewalInterval);
      });
    },
    /**
     * Read-only preview of the slot runs a change would bill: a Re-check of a
     * slot that never reached a Verdict, or the added slots. No service call here.
     */
    async plan(
      principal: Principal,
      checkId: string,
      change:
        { kind: "recheck"; position: number } | { kind: "add"; count: number },
    ): Promise<SlotRef[] | null> {
      const check = await db.check.findUnique({
        where: { id: checkId },
        select: { ownerId: true, apiVersion: true },
      });
      if (
        !check ||
        check.ownerId !== principal.ownerId ||
        check.apiVersion !== 2
      )
        return null;
      if (change.kind === "recheck") {
        const slot = await db.referenceSlot.findUnique({
          where: { checkId_position: { checkId, position: change.position } },
        });
        if (!slot || slot.removed) return null;
        return (await hasVerdict(db, checkId, slot.position))
          ? []
          : [{ position: slot.position, generation: slot.generation + 1 }];
      }
      const last = await db.referenceSlot.aggregate({
        where: { checkId },
        _max: { position: true },
      });
      return addedSlots(last._max.position ?? 0, change.count);
    },
    /** Undelivered settlement intents with their Owner binding (kept on tombstones). */
    async pendingSettlements(limit: number) {
      const intents = await db.settlementIntent.findMany({
        where: { deliveredAt: null },
        orderBy: { createdAt: "asc" },
        take: limit,
      });
      const owners = new Map(
        (
          await db.check.findMany({
            where: { id: { in: [...new Set(intents.map((i) => i.checkId))] } },
            select: { id: true, ownerId: true, actorId: true },
          })
        ).map((c) => [c.id, c]),
      );
      return intents.flatMap((intent) => {
        const owner = owners.get(intent.checkId);
        return owner
          ? [
              {
                checkId: intent.checkId,
                slot: {
                  position: intent.position,
                  generation: intent.generation,
                },
                outcome: intent.outcome as "verdict" | "release",
                ownerId: owner.ownerId,
                actorId: owner.actorId,
              },
            ]
          : [];
      });
    },
    async markSettled(checkId: string, slot: SlotRef) {
      await db.settlementIntent.updateMany({
        where: {
          checkId,
          position: slot.position,
          generation: slot.generation,
          deliveredAt: null,
        },
        data: { deliveredAt: new Date(clock.now()) },
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
        await assertAccessible(tx, check);
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
      reserved?: SlotRef[],
    ) {
      return transaction(async (tx) => {
        const check = await lock(tx, checkId);
        if (
          !check ||
          check.ownerId !== principal.ownerId ||
          check.apiVersion !== 2
        )
          return null;
        await assertAccessible(tx, check);
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
        assertReserved(
          reserved,
          request.recheck && !(await hasVerdict(tx, checkId, position))
            ? [{ position, generation: slot.generation + 1 }]
            : [],
        );
        const previous = slot.structured as unknown as StructuredReference;
        const reference: StructuredReference = {
          ...previous,
          originalText: slot.originalText,
          csl: request.fields,
          ...(previous.ai
            ? {
                ai: {
                  ...previous.ai,
                  proposals: previous.ai.proposals.filter(
                    (p) =>
                      JSON.stringify(
                        request.fields[p.field as keyof typeof request.fields],
                      ) !== JSON.stringify(p.value),
                  ),
                },
              }
            : {}),
          authorsTruncated: request.authorsTruncated ?? false,
          fieldSources: Object.fromEntries(
            Object.entries(request.fields).map(([key, value]) => [
              key,
              {
                provenance: "user",
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
      reserved?: SlotRef[],
    ) {
      return transaction(async (tx) => {
        const check = await lock(tx, checkId);
        if (
          !check ||
          check.ownerId !== principal.ownerId ||
          check.apiVersion !== 2
        )
          return null;
        await assertAccessible(tx, check);
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
        assertReserved(
          reserved,
          (await hasVerdict(tx, checkId, position))
            ? []
            : [{ position, generation: slot.generation + 1 }],
        );
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
      reserved?: SlotRef[],
    ) {
      return transaction(async (tx) => {
        const check = await lock(tx, checkId);
        if (
          !check ||
          check.ownerId !== principal.ownerId ||
          check.apiVersion !== 2
        )
          return null;
        await assertAccessible(tx, check);
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
        assertReserved(
          reserved,
          addedSlots(slots.at(-1)?.position ?? 0, request.add.length),
        );
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
    /** ADR-0003: write the Owner tombstone and purge all of the Owner's content in
     * ONE transaction. The caller holds the Owner guard. Idempotent: a repeat
     * purges whatever a restore or a racing create left behind. IDs only. */
    async deleteOwner(ownerId: string) {
      await db.$transaction(
        async (raw) => {
          await raw.$queryRaw`SELECT pg_advisory_xact_lock(910012)::text`;
          await raw.$executeRaw`INSERT INTO verification.owner_tombstones(owner_id) VALUES (${ownerId}::uuid) ON CONFLICT (owner_id) DO NOTHING`;
          const tx = contentTransaction(raw, () => clock.now());
          await tx.historyConsent.deleteMany({ where: { ownerId } });
          const owned = await raw.$queryRaw<{ id: string }[]>`
            SELECT id FROM verification.checks
            WHERE lower(owner_id)=lower(${ownerId}) AND deleted_at IS NULL ORDER BY id`;
          for (const { id } of owned) {
            const check = await lock(raw, id);
            if (check) await purgeLocked(tx, check);
          }
        },
        { timeout: 30000 },
      );
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

export class HistoryLocked extends Error {}
export class CheckExpired extends ContentUnavailable {}
/** ADR-0017: one report job per Owner at a time. */
export class ReportBusy extends Error {}
export class ReportNotReady extends Error {}
export class ReportExpired extends Error {}
/** Everything the worker needs, frozen when generation begins. */
export interface ReportWork {
  reportId: string;
  subject: WorkSubject;
  input: ReportInput;
}
