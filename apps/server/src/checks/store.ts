// SPDX-License-Identifier: AGPL-3.0-or-later
// Persistence of Checks, their Reference slots and their ordered events.

import { randomUUID } from "node:crypto";
import {
  CheckEvent,
  type Check,
  ReferenceOutcome,
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
  references: {
    position: number;
    originalText: string;
    status: string;
    results?: { content: unknown }[];
  }[];
};

function toCheck(row: CheckRow): Check {
  return {
    id: row.id,
    state: row.state as Check["state"],
    lastEventSeq: row.lastSeq,
    references: row.references.map((slot) => ({
      slot: slot.position,
      originalText: slot.originalText,
      outcome: slot.results?.[0]
        ? ReferenceOutcome.parse(slot.results[0].content)
        : { kind: "status", status: slot.status as ReferenceStatus },
    })),
  };
}

type Tx = Prisma.TransactionClient;

async function appendEvent(
  tx: Tx,
  checkId: string,
  event:
    | { type: "check.updated"; state: Check["state"] }
    | {
        type: "reference.updated";
        reference: {
          slot: number;
          outcome: ReferenceOutcome;
        };
      },
) {
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

export function createCheckStore(db: Db, boss: PgBoss) {
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
        });
        for (const slot of row.references) {
          // Queue insertion shares the Check transaction: neither can commit alone.
          await boss.send(
            REFERENCE_QUEUE,
            { checkId: row.id, slot: slot.position },
            {
              db: {
                executeSql: async (sql, values) => ({
                  rows: await tx.$queryRawUnsafe(sql, ...(values ?? [])),
                }),
              },
            },
          );
        }
        return toCheck({ ...row, lastSeq: 1 });
      });
    },
    async get(principal: Principal, checkId: string) {
      const row = await db.check.findFirst({
        where: { id: checkId, ownerId: principal.ownerId },
        include: withSlots,
      });
      return row ? toCheck(row) : null;
    },
    async events(checkId: string, after: number): Promise<CheckEvent[]> {
      const rows = await db.checkEvent.findMany({
        where: { checkId, seq: { gt: after } },
        orderBy: { seq: "asc" },
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
    async input(
      checkId: string,
      slot: number,
    ): Promise<StructuredReference | null> {
      const row = await db.referenceSlot.findUnique({
        where: { checkId_position: { checkId, position: slot } },
      });
      return row?.structured as unknown as StructuredReference | null;
    },
    async finishReference(
      checkId: string,
      slot: number,
      outcome: ReferenceOutcome,
    ) {
      await db.$transaction(async (tx) => {
        // Serialize writers per Check, including parallel workers and retries.
        await tx.$queryRaw`SELECT id FROM verification.checks WHERE id = ${checkId}::uuid FOR UPDATE`;
        const check = await tx.check.findUnique({ where: { id: checkId } });
        if (!check || check.state !== "running") return;
        const updated = await tx.referenceSlot.updateMany({
          where: { checkId, position: slot, status: "running" },
          data: {
            status: outcome.kind === "status" ? outcome.status : "finished",
          },
        });
        if (!updated.count) return;
        await tx.referenceResult.create({
          data: {
            id: randomUUID(),
            checkId,
            position: slot,
            content: JSON.parse(
              JSON.stringify(outcome),
            ) as Prisma.InputJsonValue,
          },
        });
        await appendEvent(tx, checkId, {
          type: "reference.updated",
          reference: {
            slot,
            outcome,
          },
        });
        if (
          (await tx.referenceSlot.count({
            where: { checkId, status: "running" },
          })) === 0
        ) {
          await tx.check.update({
            where: { id: checkId },
            data: { state: "ended" },
          });
          await appendEvent(tx, checkId, {
            type: "check.updated",
            state: "ended",
          });
        }
      });
    },
  };
}

export type CheckStore = ReturnType<typeof createCheckStore>;
