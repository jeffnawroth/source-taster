// SPDX-License-Identifier: AGPL-3.0-or-later
// Persistence of Checks, their Reference slots and their ordered events.

import { randomUUID } from "node:crypto";
import type {
  Check,
  ReferenceStatus,
} from "@source-taster/contract-verification";
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

export function createCheckStore(db: Db) {
  return {
    async create(principal: Principal, references: string[]): Promise<Check> {
      const row = await db.check.create({
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
      return toCheck(row);
    },
  };
}

export type CheckStore = ReturnType<typeof createCheckStore>;
