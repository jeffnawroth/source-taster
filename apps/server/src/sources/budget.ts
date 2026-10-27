// SPDX-License-Identifier: AGPL-3.0-or-later
import { doiTracerLimits } from "@source-taster/core";
import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import type { Db } from "../db/prisma.ts";
import type { SourceBudget } from "./doi.ts";
// Shared across workers: separate Crossref single/search pacing and a common
// provider public-pool one-request ceiling (below ADR polite-pool maxima). No accumulated bursts. Retry-After blocks all workers.
export function sourceBudget(db: Db, signal?: AbortSignal): SourceBudget {
  return {
    defer: async (source, delayMs) => {
      await db.$executeRaw`UPDATE verification.source_rates SET next_at=GREATEST(next_at,clock_timestamp()+${delayMs}*interval '1 millisecond') WHERE source=${source}`;
    },
    acquire: async (source, operation, deadline) => {
      const key = `${source}:${operation}`;
      while (Date.now() < deadline) {
        signal?.throwIfAborted();
        const id = randomUUID();
        const acquired = await db.$transaction(async (tx) => {
          await tx.sourceRate.upsert({
            where: { source },
            create: { source },
            update: {},
          });
          await tx.$queryRaw`SELECT source FROM verification.source_rates WHERE source=${source} FOR UPDATE`;
          await tx.sourceRate.upsert({
            where: { source: key },
            create: { source: key },
            update: {},
          });
          const [clock] = await tx.$queryRaw<
            { now: Date }[]
          >`SELECT clock_timestamp() AS now`;
          const now = clock!.now;
          await tx.sourceRequest.deleteMany({
            where: { source, expiresAt: { lte: now } },
          });
          const rate = await tx.sourceRate.findUniqueOrThrow({
            where: { source: key },
          });
          const cooldown = await tx.sourceRate.findUniqueOrThrow({
            where: { source },
          });
          if (
            rate.nextAt > now ||
            cooldown.nextAt > now ||
            (source === "crossref" &&
              (await tx.sourceRequest.count({ where: { source } })) >=
                doiTracerLimits.crossrefConcurrency)
          )
            return false;
          const interval =
            source === "doi.org"
              ? 1000 / doiTracerLimits.doiRequestsPerSecond
              : operation === "doi"
                ? 1000 / doiTracerLimits.crossrefSingleRequestsPerSecond
                : doiTracerLimits.crossrefSearchIntervalMs;
          await tx.sourceRate.update({
            where: { source: key },
            data: { nextAt: new Date(now.getTime() + interval) },
          });
          await tx.sourceRequest.create({
            data: { id, source, expiresAt: new Date(now.getTime() + 3100) },
          });
          return true;
        });
        if (acquired)
          return async () => {
            await db.sourceRequest.deleteMany({ where: { id } });
          };
        await setTimeout(
          Math.min(25, Math.max(1, deadline - Date.now())),
          undefined,
          { signal },
        );
      }
      return null;
    },
  };
}
