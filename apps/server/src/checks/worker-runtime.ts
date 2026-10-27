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
  type WorkSubject,
  type LifecycleClock,
  type LifecycleSettings,
} from "./store.ts";
import { systemSourceClock } from "../sources/doi.ts";
export interface WorkAuthority {
  run<T>(
    attempt: WorkSubject,
    boundary: "dispatch" | "source" | "commit",
    operation: () => Promise<T>,
  ): Promise<T>;
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
  function guard<T>(
    attempt: WorkSubject,
    boundary: "dispatch" | "source" | "commit",
    operation: () => Promise<T>,
  ) {
    return options.authority
      ? options.authority.run(attempt, boundary, operation)
      : operation();
  }
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
      let attempt: ReferenceAttempt | null;
      if (options.authority) {
        const subject = await checks.peekWork();
        if (!subject) return;
        try {
          attempt = await guard(subject, "dispatch", () =>
            checks.claimNext(subject.checkId),
          );
        } catch {
          await checks.deferAdmission(subject.checkId);
          return;
        }
      } else attempt = await checks.claimNext();
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
        await guard(attempt, "dispatch", async () => {
          if (!(await checks.isCurrent(attempt))) {
            abort.abort();
            abort.signal.throwIfAborted();
          }
        });
        await setTimeout(config.placeholderDelayMs, undefined, {
          signal: abort.signal,
        });
        const verify = referenceExecution(config, db, {
          clock,
          signal: abort.signal,
          beforeSource: async (source) => {
            await guard(attempt, "source", async () => {
              if (!(await checks.progress(attempt, source))) {
                abort.abort();
                abort.signal.throwIfAborted();
              }
            });
          },
          dispatchSource: async (send) => {
            try {
              // Invocation is guarded, response I/O is outside the lock. A late
              // response cannot commit across invalidation and cannot deadlock it.
              const dispatched = await guard(attempt, "source", async () => {
                if (!(await checks.isCurrent(attempt))) {
                  abort.abort();
                  abort.signal.throwIfAborted();
                }
                return { pending: send() };
              });
              return await dispatched.pending;
            } catch (error) {
              abort.abort();
              throw error;
            }
          },
        });
        const outcome =
          config.doiPreview && attempt.input
            ? await verify(attempt.input, { startedAt: attempt.startedAt })
            : { kind: "status" as const, status: "not-checked" as const };
        await guard(attempt, "commit", () =>
          checks.finishReference(
            attempt,
            outcome.kind === "verdict"
              ? {
                  ...outcome,
                  searchStrategyVersion: `${outcome.searchStrategyVersion}/lifecycle-1${options.authority ? "/guest-authority-1" : ""}`,
                  searchConfiguration: {
                    ...outcome.searchConfiguration,
                    ...(options.authority
                      ? {
                          authorityProtocol: "guest-authority-1",
                          authorityDecisionTimeoutMs: 2000,
                        }
                      : {}),
                    maxActiveReferencesPerCheck: 10,
                    scheduling: "round-robin-checks-1",
                    workerClaimMs: settings.claimMs,
                    clientLeaseMs: settings.clientLeaseMs,
                    maxWorkerAttempts: settings.maxAttempts,
                  },
                }
              : outcome,
          ),
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
          await guard(attempt, "commit", () =>
            checks.finishReference(attempt, {
              kind: "status",
              status: "failed",
            }),
          ).catch(() => {});
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
