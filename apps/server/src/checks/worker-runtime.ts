import { configurationSelection } from "../quality/protocol.ts";
import { measuredConfigurations } from "../quality/activation.ts";
// SPDX-License-Identifier: AGPL-3.0-or-later
// Injectable composition root, also used by real-PG HTTP/SSE lifecycle tests.
import { setTimeout } from "node:timers/promises";
import { referenceDeadlineMs } from "@source-taster/core";
import type { PgBoss } from "pg-boss";
import type { ReportFailure } from "@source-taster/contract-verification/report";
import type { Config } from "../config.ts";
import type { Db } from "../db/prisma.ts";
import {
  REFERENCE_QUEUE,
  REPORT_QUEUE,
  type ReferenceJob,
  type ReportJob,
} from "./queue.ts";
import { generateReport, ReportFailed } from "../reports/generate.ts";
import { reportFeature } from "../entitlements.ts";
import { referenceExecution } from "./verification-runtime.ts";
import {
  createCheckStore,
  type ReferenceAttempt,
  type WorkSubject,
  type LifecycleClock,
  type LifecycleSettings,
} from "./store.ts";
import { systemSourceClock } from "../sources/doi.ts";
import type { QuotaPort } from "../quota/port.ts";
import { settlementDrain } from "../quota/settlement.ts";
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
    /** Hosted only: settlement intents are delivered here. */
    quota?: QuotaPort;
    configuration?: ReturnType<typeof configurationSelection>;
    /** Report adapter; the runtime retains dispatch/publication authority fences. */
    generateReport?: typeof generateReport;
  } = {},
) {
  const registry = measuredConfigurations(
    process.env.SOURCE_TASTER_MEASURED_CONFIGURATIONS,
    options.clock,
  );
  const selection =
    options.configuration ??
    (config.mode === "hosted" && config.hosted
      ? configurationSelection(config.hosted, registry, options.clock, db)
      : undefined);
  const settings = {
    contentRetentionMs: config.contentRetentionMs,
    clientLeaseMs: config.clientLeaseMs,
    claimMs: config.workerClaimMs,
    maxAttempts: 3,
    activeReferencesPerCheck: config.searchSettings.activeReferencesPerCheck,
    ...options.settings,
  };
  const checks = createCheckStore(db, boss, { ...options, settings });
  const clock = {
    ...systemSourceClock,
    now: () => (options.clock ? options.clock.now() : Date.now()),
  };
  async function guard<T>(
    attempt: WorkSubject,
    boundary: "dispatch" | "source" | "commit",
    operation: () => Promise<T>,
  ) {
    if (selection) {
      const snapshot = await checks.configurationFor(attempt.checkId);
      if (!snapshot) throw new Error("configuration-snapshot-missing");
      await selection.available();
      await selection.validate(snapshot);
    }
    return options.authority
      ? options.authority.run(attempt, boundary, operation)
      : operation();
  }
  const active = new Set<AbortController>();
  let stopped = false;
  let timer: ReturnType<typeof globalThis.setTimeout>;
  const drain = options.quota
    ? settlementDrain(checks, options.quota)
    : undefined;
  let draining = false;
  async function sweep() {
    try {
      await checks.maintain();
    } catch {
      console.error(JSON.stringify({ code: "lifecycle-maintenance-failed" }));
    }
    if (drain && !draining) {
      draining = true;
      void drain()
        .catch(() =>
          console.error(JSON.stringify({ code: "settlement-drain-failed" })),
        )
        .finally(() => {
          draining = false;
        });
    }
    if (!stopped)
      timer = globalThis.setTimeout(() => {
        void sweep();
      }, 250);
  }
  // Startup recovery errors must prevent admission; periodic failures retry.
  await checks.maintain();
  await sweep();
  await boss.work<ReferenceJob>(
    REFERENCE_QUEUE,
    {
      batchSize: 1,
      localConcurrency: config.searchSettings.workerConcurrency,
      pollingIntervalSeconds: 0.5,
      notifyPollingIntervalSeconds: 0.5,
    },
    async () => {
      if (stopped) return;
      let attempt: ReferenceAttempt | null = null;
      if (options.authority) {
        while (!attempt && !stopped) {
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
        const execution = attempt.measuredConfiguration
          ? await registry.executable(
              attempt.measuredConfiguration.id,
              config,
              attempt.measuredConfiguration.evidenceDigest,
            )
          : undefined;
        if (selection && !execution)
          throw new Error("configuration-snapshot-missing");
        const verify = referenceExecution(execution?.config ?? config, db, {
          clock,
          apiVersion: attempt.apiVersion,
          signal: abort.signal,
          beforeSource: async (source) => {
            try {
              await guard(attempt, "source", async () => {
                if (!(await checks.progress(attempt, source))) {
                  abort.abort();
                  abort.signal.throwIfAborted();
                }
              });
            } catch (error) {
              abort.abort();
              throw error;
            }
          },
          dispatchSource: async (send) => {
            try {
              // Invocation is guarded, response I/O is outside the lock. A late
              // response cannot commit across invalidation and cannot deadlock it.
              return await guard(attempt, "source", async () => {
                if (!(await checks.isCurrent(attempt))) {
                  abort.abort();
                  abort.signal.throwIfAborted();
                }
                return send();
              });
            } catch (error) {
              abort.abort();
              throw error;
            }
          },
        });
        // Recovery after an interrupted worker/authority operation cannot
        // manufacture a billable source failure from an already expired run.
        const expiredRecovery =
          attempt.generation > 1 &&
          clock.now() >= attempt.startedAt + referenceDeadlineMs;
        const outcome = expiredRecovery
          ? { kind: "status" as const, status: "failed" as const }
          : config.doiPreview && attempt.input
            ? await verify(attempt.input, { startedAt: attempt.startedAt })
            : { kind: "status" as const, status: "not-checked" as const };
        if (options.quota && !attempt.guestContextId) {
          const quota = await options.quota.snapshot(attempt);
          await guard(attempt, "commit", () =>
            checks.syncHistory(
              attempt,
              quota.features.includes("extended-history")
                ? (quota.history?.extendedUntil ?? null)
                : null,
              quota.history?.authorityVersion ?? 0,
              quota.history,
            ),
          );
        }
        await guard(attempt, "commit", () =>
          checks.finishReference(
            attempt,
            outcome.kind === "verdict"
              ? {
                  ...outcome,
                  measuredConfigurationId: attempt.measuredConfiguration?.id,
                  searchStrategyVersion: `${outcome.searchStrategyVersion}/lifecycle-2${options.authority ? "/guest-authority-1" : ""}`,
                  searchConfiguration: {
                    ...outcome.searchConfiguration,
                    ...(options.authority
                      ? {
                          authorityProtocol: "guest-authority-1",
                          authorityDecisionTimeoutMs: 2000,
                        }
                      : {}),
                    maxActiveReferencesPerCheck:
                      settings.activeReferencesPerCheck,
                    // The one scheduling mode: Owners alternate first, then
                    // their Checks (store dispatch order, #78).
                    scheduling: "owner-then-check-round-robin-3",
                    sourceReservation: "deadline-then-request-1",
                    sourceDispatchMarginMs: 100,
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
  // ADR-0017: reports are a separate job class, one at a time per worker
  // process, each in its own resource-limited thread.
  await boss.work<ReportJob>(
    REPORT_QUEUE,
    {
      batchSize: 1,
      localConcurrency: 1,
      pollingIntervalSeconds: 0.5,
      notifyPollingIntervalSeconds: 0.5,
    },
    async ([job]) => {
      if (!job || stopped) return;
      const { reportId } = job.data;
      const work = await checks.reports.claim(reportId);
      if (!work) return;
      try {
        // The Owner's authority and Quota scope are rechecked before any work
        // and again, under the Owner fence, before the file is published.
        await guard(work.subject, "dispatch", async () => {});
        if (options.quota) {
          const quota = await options.quota.snapshot({
            ownerId: work.subject.ownerId,
            actorId: work.subject.actorId,
          });
          if (!quota.features.includes(reportFeature))
            return void (await checks.reports.discard(reportId));
        }
      } catch {
        return void (await checks.reports.discard(reportId));
      }
      let result: { pdf: Uint8Array } | { failure: ReportFailure };
      try {
        result = {
          pdf: await (options.generateReport ?? generateReport)(work.input),
        };
      } catch (error) {
        result = {
          failure:
            error instanceof ReportFailed ? error.failure : "unavailable",
        };
        if (!(error instanceof ReportFailed))
          console.error(JSON.stringify({ code: "report-failed", reportId }));
      }
      try {
        await guard(work.subject, "commit", async () => {
          // Rendering may outlast a Plan/feature change. Read the current
          // external scope again before publishing, outside the store's
          // transaction, while the current-authority fence is held.
          if (options.quota) {
            const quota = await options.quota.snapshot({
              ownerId: work.subject.ownerId,
              actorId: work.subject.actorId,
            });
            if (!quota.features.includes(reportFeature))
              return void (await checks.reports.discard(reportId));
          }
          await checks.reports.finish(reportId, result);
        });
      } catch {
        await checks.reports.discard(reportId);
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
