// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  doiTracerLimits,
  articleSearchConfiguration,
  bookSearchConfiguration,
  type CatalogRates,
} from "@source-taster/core";
import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import type { Db } from "../db/prisma.ts";
import type { SourceBudget } from "./doi.ts";

// A reservation covers the remaining Reference execution, including authority
// waits. Its durable expiry is the hard deadline, not a timeout started before
// dispatch. A holder lost before dispatch recovers within at most 30 seconds;
// dispatch preparation narrows the lease to the request/body timeout plus its margin.
// A bounded dispatch window is durably prepared before HTTP. No provider lock
// is held at invocation or across response/body I/O. The Owner guard still fences
// invocation, but waits for neither headers nor the body.
export function sourceBudget(
  db: Db,
  signal?: AbortSignal,
  clock: { now(): number } = { now: Date.now },
  catalogRates: CatalogRates = {
    openlibrary: bookSearchConfiguration.openlibraryRequestsPerSecond,
    googlebooks: bookSearchConfiguration.googlebooksRequestsPerSecond,
  },
): SourceBudget {
  return {
    defer: async (source, delayMs) => {
      await db.$executeRaw`UPDATE verification.source_rates SET next_at=GREATEST(next_at,clock_timestamp()+${delayMs}*interval '1 millisecond') WHERE source=${source}`;
    },
    acquire: async (source, operation, deadline) => {
      const key = ["openalex", "openlibrary", "googlebooks"].includes(source)
        ? `${source}:all`
        : `${source}:${operation === "doi" ? "doi" : "combined"}`;
      const interval =
        source === "openlibrary"
          ? 1000 / catalogRates.openlibrary
          : source === "googlebooks"
            ? 1000 / catalogRates.googlebooks
            : source === "openalex"
              ? 1000 / articleSearchConfiguration.openalexRequestsPerSecond
              : source === "doi.org"
                ? 1000 / doiTracerLimits.doiRequestsPerSecond
                : operation === "doi"
                  ? 1000 / doiTracerLimits.crossrefSingleRequestsPerSecond
                  : doiTracerLimits.crossrefSearchIntervalMs;
      while (clock.now() < deadline) {
        signal?.throwIfAborted();
        const id = randomUUID();
        const acquired = await db.$transaction(async (tx) => {
          await tx.$executeRaw`INSERT INTO verification.source_rates(source) VALUES (${source}) ON CONFLICT DO NOTHING`;
          await tx.$queryRaw`SELECT source FROM verification.source_rates WHERE source=${source} FOR UPDATE`;
          await tx.$executeRaw`INSERT INTO verification.source_rates(source) VALUES (${key}) ON CONFLICT DO NOTHING`;
          const [timestamp] = await tx.$queryRaw<
            { now: Date }[]
          >`SELECT clock_timestamp() AS now`;
          const now = timestamp!.now;
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
            ((source === "crossref" || source === "openalex") &&
              (await tx.sourceRequest.count({ where: { source } })) >=
                (source === "openalex"
                  ? articleSearchConfiguration.openalexConcurrency
                  : doiTracerLimits.crossrefConcurrency))
          )
            return false;
          await tx.sourceRequest.create({
            data: {
              id,
              source,
              expiresAt: new Date(
                now.getTime() +
                  Math.min(
                    doiTracerLimits.referenceDeadlineMs,
                    Math.max(0, deadline - clock.now()),
                  ),
              ),
            },
          });
          return true;
        });
        if (acquired)
          return {
            release: async () => {
              await db.sourceRequest.deleteMany({ where: { id } });
            },
            dispatch: async (send) => {
              // Budget 100 ms for DB preparation/commit and synchronous send.
              // Failure to fit this window consumes no HTTP attempt. The extra
              // spacing ensures actual sends cannot compress the provider cap.
              const began = performance.now();
              const prepared = await db.$transaction(async (tx) => {
                await tx.$queryRaw`SELECT source FROM verification.source_rates WHERE source=${source} FOR UPDATE`;
                const [timestamp] = await tx.$queryRaw<
                  { now: Date }[]
                >`SELECT clock_timestamp() AS now`;
                const now = timestamp!.now;
                const reservation = await tx.sourceRequest.findUnique({
                  where: { id },
                });
                const rate = await tx.sourceRate.findUniqueOrThrow({
                  where: { source: key },
                });
                const cooldown = await tx.sourceRate.findUniqueOrThrow({
                  where: { source },
                });
                // Leave a bounded dispatch margin inside the durable lease. Timeout
                // includes the complete body, and begins only inside send(). Expired
                // reservations cannot dispatch even after a paused process resumes.
                const remaining = Math.min(
                  deadline - clock.now(),
                  (reservation?.expiresAt.getTime() ?? 0) - now.getTime() - 100,
                );
                if (
                  remaining <= 0 ||
                  rate.nextAt > now ||
                  cooldown.nextAt > now
                )
                  return null;
                signal?.throwIfAborted();
                const timeoutMs = Math.min(
                  doiTracerLimits.requestTimeoutMs,
                  remaining,
                );
                await tx.sourceRequest.update({
                  where: { id },
                  data: {
                    expiresAt: new Date(now.getTime() + timeoutMs + 100),
                  },
                });
                await tx.sourceRate.update({
                  where: { source: key },
                  data: {
                    nextAt: new Date(now.getTime() + interval + 100),
                  },
                });
                return timeoutMs;
              });
              if (
                prepared === null ||
                performance.now() - began >= 100 ||
                clock.now() >= deadline
              )
                return null;
              signal?.throwIfAborted();
              return {
                pending: send(Math.min(prepared, deadline - clock.now())),
              };
            },
          };
        await setTimeout(
          Math.min(25, Math.max(1, deadline - clock.now())),
          undefined,
          { signal },
        );
      }
      return null;
    },
  };
}
