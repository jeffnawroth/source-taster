// SPDX-License-Identifier: AGPL-3.0-or-later
// Injectable composition root, also used by real-PG HTTP/SSE lifecycle tests.
import { setTimeout } from "node:timers/promises";
import type { PgBoss } from "pg-boss";
import type { Config } from "../config.ts";
import type { Db } from "../db/prisma.ts";
import { REFERENCE_QUEUE, type ReferenceJob } from "./queue.ts";
import { referenceExecution } from "./verification-runtime.ts";
import {
  createCheckStore,
  type ReferenceAttempt,
  type LifecycleClock,
  type LifecycleSettings,
} from "./store.ts";
import { systemSourceClock } from "../sources/doi.ts";
export interface WorkAuthority {
  // #96 supplies current hosted authority at dispatch and commit. No credentials
  // in jobs; standalone allows its one local Owner. This is not hosted auth.
  allowed(
    attempt: ReferenceAttempt,
    boundary: "dispatch" | "source" | "commit",
  ): Promise<boolean>;
}
export async function startWorkerRuntime(
  config: Config,
  db: Db,
  boss: PgBoss,
  options: {
    clock?: LifecycleClock;
    settings?: Partial<LifecycleSettings>;
    authority?: WorkAuthority;
  } = {},
) {
  const settings = {
    clientLeaseMs: config.clientLeaseMs,
    claimMs: config.workerClaimMs,
    maxAttempts: 3,
    ...options.settings,
  };
  const checks = createCheckStore(db, boss, { ...options, settings });
  const clock = {
    ...systemSourceClock,
    now: () => (options.clock ? options.clock.now() : Date.now()),
  };
  const active = new Set<AbortController>();
  let stopped = false;
  let timer: ReturnType<typeof globalThis.setTimeout>;
  async function sweep() {
    try {
      await checks.maintain();
    } catch {
      console.error(JSON.stringify({ code: "lifecycle-maintenance-failed" }));
    }
    if (!stopped)
      timer = globalThis.setTimeout(() => {
        void sweep();
      }, 250);
  }
  await sweep();
  await boss.work<ReferenceJob>(
    REFERENCE_QUEUE,
    {
      batchSize: 1,
      localConcurrency: 20,
      pollingIntervalSeconds: 0.5,
      notifyPollingIntervalSeconds: 0.5,
    },
    async () => {
      if (stopped) return;
      const attempt = await checks.claimNext();
      if (!attempt) return;
      const abort = new AbortController();
      active.add(abort);
      // Aborting saves I/O. Transactions/generation/claim expiry remain authoritative.
      let probing = false;
      const probe = globalThis.setInterval(() => {
        if (probing) return;
        probing = true;
        void checks
          .isCurrent(attempt)
          .then((current) => {
            if (!current) abort.abort();
          })
          .catch(() => abort.abort())
          .finally(() => {
            probing = false;
          });
      }, 100);
      try {
        if (
          options.authority &&
          !(await options.authority.allowed(attempt, "dispatch"))
        )
          return;
        await setTimeout(config.placeholderDelayMs, undefined, {
          signal: abort.signal,
        });
        const verify = referenceExecution(config, db, {
          clock,
          signal: abort.signal,
          beforeSource: async (source) => {
            if (
              options.authority &&
              !(await options.authority.allowed(attempt, "source"))
            ) {
              abort.abort();
              abort.signal.throwIfAborted();
            }
            if (!(await checks.progress(attempt, source))) {
              abort.abort();
              abort.signal.throwIfAborted();
            }
          },
        });
        const outcome =
          config.doiPreview && attempt.input
            ? await verify(attempt.input, { startedAt: attempt.startedAt })
            : { kind: "status" as const, status: "not-checked" as const };
        if (
          options.authority &&
          !(await options.authority.allowed(attempt, "commit"))
        )
          return;
        await checks.finishReference(
          attempt,
          outcome.kind === "verdict"
            ? {
                ...outcome,
                searchStrategyVersion: `${outcome.searchStrategyVersion}/lifecycle-1`,
                searchConfiguration: {
                  ...outcome.searchConfiguration,
                  maxActiveReferencesPerCheck: 10,
                  scheduling: "round-robin-checks-1",
                  workerClaimMs: settings.claimMs,
                  clientLeaseMs: settings.clientLeaseMs,
                  maxWorkerAttempts: settings.maxAttempts,
                },
              }
            : outcome,
        );
      } catch {
        if (!abort.signal.aborted) {
          console.error(
            JSON.stringify({
              code: "reference-failed",
              checkId: attempt.checkId,
              slot: attempt.slot,
            }),
          );
          await checks.finishReference(attempt, {
            kind: "status",
            status: "failed",
          });
        }
      } finally {
        clearInterval(probe);
        active.delete(abort);
      }
    },
  );
  return {
    stop() {
      stopped = true;
      clearTimeout(timer);
      for (const abort of active) abort.abort();
    },
  };
}
