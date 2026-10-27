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
} from "@source-taster/contract-verification";
import type { StructuredReference } from "@source-taster/core";
import type { PgBoss } from "pg-boss";
import type { Prisma } from "../generated/prisma/client.ts";
import { EVENT_CHANNEL } from "./events.ts";
import { REFERENCE_QUEUE } from "./queue.ts";
import type { Db } from "../db/prisma.ts";
import type { Principal } from "../entitlements.ts";

const withSlots = {
  references: {
    orderBy: { position: "asc" },
    include: { results: { orderBy: { createdAt: "desc" }, take: 1 } },
  },
} as const;
type CheckRow = {
  id: string;
  state: string;
  lastSeq: number;
  endReason: string | null;
  references: {
    position: number;
    originalText: string;
    status: string;
    progress: string;
    results?: { content: unknown }[];
  }[];
};
function toCheck(row: CheckRow, leaseRenewAfterMs: number): Check {
  return {
    id: row.id,
    state: row.state as Check["state"],
    lastEventSeq: row.lastSeq,
    lastEventCursor: `${row.id}:${row.lastSeq}`,
    leaseRenewAfterMs,
    endReason: row.endReason as CheckEndReason | null,
    references: row.references.map((slot) => ({
      slot: slot.position,
      originalText: slot.originalText,
      progress: slot.progress as ReferenceProgress,
      outcome: slot.results?.[0]
        ? ReferenceOutcome.parse(slot.results[0].content)
        : { kind: "status", status: slot.status as ReferenceStatus },
    })),
  };
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
  clientLeaseMs: number;
  claimMs: number;
  maxAttempts: number;
}
export const defaultLifecycleSettings: LifecycleSettings = {
  clientLeaseMs: 75_000,
  claimMs: 45_000,
  maxAttempts: 3,
};
export interface ReferenceAttempt {
  checkId: string;
  slot: number;
  generation: number;
  revision: number;
  ownerId: string;
  actorId: string;
  startedAt: number;
  input: StructuredReference | null;
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
  async function wake(tx: Tx, checkId: string, slot = 0) {
    await boss.send(
      REFERENCE_QUEUE,
      { checkId, slot },
      {
        db: {
          executeSql: async (sql, values) => ({
            rows: await tx.$queryRawUnsafe(sql, ...(values ?? [])),
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
    await tx.check.update({
      where: { id: checkId },
      data: { state: "ended", endReason: reason, endedAt: new Date(now) },
    });
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
    if (row.state === "running" && row.leaseExpiresAt.getTime() <= now) {
      await cancelLocked(tx, row.id, "lease-expired", now);
      return true;
    }
    return false;
  }
  async function ownerOperation(
    principal: Principal,
    checkId: string,
    action: "read" | "cancel" | "renew",
  ) {
    return db.$transaction(async (tx) => {
      const row = await lock(tx, checkId);
      if (!row || row.ownerId !== principal.ownerId) return null;
      const now = clock.now();
      const expired = await expireLocked(tx, row, now);
      if (!expired && row.state === "running") {
        if (action === "cancel")
          await cancelLocked(tx, checkId, "cancelled", now);
        if (action === "renew")
          await tx.check.update({
            where: { id: checkId },
            data: { leaseExpiresAt: new Date(now + settings.clientLeaseMs) },
          });
      }
      // This lock also covers relation reads: snapshot and cursor are one cut.
      return toCheck(
        await tx.check.findUniqueOrThrow({
          where: { id: checkId },
          include: withSlots,
        }),
        renewalInterval,
      );
    });
  }
  return {
    async create(
      principal: Principal,
      references: StructuredReference[],
    ): Promise<Check> {
      return db.$transaction(async (tx) => {
        const row = await tx.check.create({
          data: {
            id: randomUUID(),
            ownerId: principal.ownerId,
            actorId: principal.actorId,
            state: "running",
            leaseExpiresAt: new Date(clock.now() + settings.clientLeaseMs),
            references: {
              create: references.map((reference, index) => ({
                position: index + 1,
                originalText: reference.originalText,
                structured: JSON.parse(
                  JSON.stringify(reference),
                ) as Prisma.InputJsonValue,
                status: "running",
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
    get: (principal: Principal, id: string) =>
      ownerOperation(principal, id, "read"),
    cancel: (principal: Principal, id: string) =>
      ownerOperation(principal, id, "cancel"),
    renew: (principal: Principal, id: string) =>
      ownerOperation(principal, id, "renew"),
    async events(checkId: string, after: number): Promise<CheckEvent[]> {
      const rows = await db.checkEvent.findMany({
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
    },
    async claimNext(): Promise<ReferenceAttempt | null> {
      return db.$transaction(async (tx) => {
        // One durable round-robin order across all processes. Admission and the
        // ten-per-Check cap commit together; queue delivery is only a wake-up.
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(810070)::text`;
        const now = clock.now();
        const rows = await tx.$queryRaw<
          { id: string }[]
        >`SELECT c.id FROM verification.checks c
          WHERE c.state='running' AND c.lease_expires_at>${new Date(now)}
          AND EXISTS (SELECT 1 FROM verification.reference_slots r WHERE r.check_id=c.id AND r.status='running' AND r.claim_until IS NULL)
          AND (SELECT count(*) FROM verification.reference_slots r WHERE r.check_id=c.id AND r.status='running' AND r.claim_until IS NOT NULL)<10
          ORDER BY c.dispatch_order,c.created_at,c.id LIMIT 1`;
        if (!rows[0]) return null;
        const check = await lock(tx, rows[0].id);
        if (
          !check ||
          check.state !== "running" ||
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
        await tx.$executeRaw`UPDATE verification.checks SET dispatch_order=nextval('verification.dispatch_order') WHERE id=${check.id}::uuid`;
        await appendEvent(tx, check.id, {
          type: "reference.updated",
          reference: {
            slot: slot.position,
            outcome: { kind: "status", status: "running" },
            progress: "checking",
          },
        });
        return {
          checkId: check.id,
          slot: slot.position,
          ownerId: check.ownerId,
          actorId: check.actorId,
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
      return db.$transaction(async (tx) => {
        const check = await lock(tx, attempt.checkId);
        if (
          !check ||
          check.state !== "running" ||
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
        if (
          !slot ||
          slot.status !== "running" ||
          slot.generation !== attempt.generation ||
          slot.revision !== attempt.revision ||
          !slot.claimUntil ||
          slot.claimUntil.getTime() <= clock.now()
        )
          return false;
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
        include: { check: true },
      });
      return (
        !!row &&
        row.status === "running" &&
        row.generation === attempt.generation &&
        row.revision === attempt.revision &&
        !!row.claimUntil &&
        row.claimUntil.getTime() > clock.now() &&
        row.check.state === "running" &&
        row.check.leaseExpiresAt.getTime() > clock.now()
      );
    },
    async finishReference(
      attempt: ReferenceAttempt,
      outcome: ReferenceOutcome,
    ) {
      return db.$transaction(async (tx) => {
        const check = await lock(tx, attempt.checkId);
        if (
          !check ||
          check.state !== "running" ||
          (await expireLocked(tx, check, clock.now()))
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
        if (
          !slot ||
          slot.status !== "running" ||
          slot.generation !== attempt.generation ||
          slot.revision !== attempt.revision ||
          !slot.claimUntil ||
          slot.claimUntil.getTime() <= clock.now()
        )
          return;
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
    async maintain() {
      const running = await db.check.findMany({
        where: { state: "running" },
        select: { id: true },
      });
      for (const { id } of running)
        await db.$transaction(async (tx) => {
          const check = await lock(tx, id);
          if (
            !check ||
            check.state !== "running" ||
            (await expireLocked(tx, check, clock.now()))
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
        where: {
          status: "running",
          claimUntil: null,
          check: {
            state: "running",
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
