// SPDX-License-Identifier: AGPL-3.0-or-later
// Persistence of Checks, their Reference slots and their ordered events.

import { randomUUID } from "node:crypto";
import {
  CheckEvent,
  type Check,
  type ReferenceStatus,
} from "@source-taster/contract-verification";
import type { PgBoss } from "pg-boss";
import type { Prisma } from "../generated/prisma/client.ts";
import { EVENT_CHANNEL } from "./events.ts";
import { REFERENCE_QUEUE } from "./queue.ts";
import type { Db } from "../db/prisma.ts";
import type { Principal } from "../entitlements.ts";

const withSlots = { references: { orderBy: { position: "asc" } } } as const;

type CheckRow = {
  id: string;
  state: string;
  lastSeq: number;
  references: { position: number; originalText: string; status: string }[];
};

function toCheck(row: CheckRow): Check {
  return {
    id: row.id,
    state: row.state as Check["state"],
    lastEventSeq: row.lastSeq,
    references: row.references.map((slot) => ({
      slot: slot.position,
      originalText: slot.originalText,
      outcome: { kind: "status", status: slot.status as ReferenceStatus },
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
          outcome: { kind: "status"; status: ReferenceStatus };
        };
      },
) {
  const row = await tx.check.update({
    where: { id: checkId },
    data: { lastSeq: { increment: 1 } },
  });
  const { type, ...payload } = event;
  await tx.checkEvent.create({
    data: { checkId, seq: row.lastSeq, type, payload },
  });
  await tx.$queryRaw`SELECT pg_notify(${EVENT_CHANNEL}, ${checkId})::text`;
}

export function createCheckStore(db: Db, boss: PgBoss) {
  return {
    async create(principal: Principal, references: string[]): Promise<Check> {
      return db.$transaction(async (tx) => {
        const row = await tx.check.create({
          data: {
            id: randomUUID(),
            ownerId: principal.ownerId,
            actorId: principal.actorId,
            state: "running",
            references: {
              create: references.map((originalText, index) => ({
                position: index + 1,
                originalText,
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
    async finishReference(checkId: string, slot: number) {
      await db.$transaction(async (tx) => {
        // Serialize writers per Check, including parallel workers and retries.
        await tx.$queryRaw`SELECT id FROM verification.checks WHERE id = ${checkId}::uuid FOR UPDATE`;
        const check = await tx.check.findUnique({ where: { id: checkId } });
        if (!check || check.state !== "running") return;
        const updated = await tx.referenceSlot.updateMany({
          where: { checkId, position: slot, status: "running" },
          data: { status: "not-checked" },
        });
        if (!updated.count) return;
        await appendEvent(tx, checkId, {
          type: "reference.updated",
          reference: {
            slot,
            outcome: { kind: "status", status: "not-checked" },
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
