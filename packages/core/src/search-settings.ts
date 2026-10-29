// SPDX-License-Identifier: AGPL-3.0-or-later
// Operator-changeable search operating settings (spec #70, ADR-0007). Every
// value can change retrieved evidence, so the exact settings are recorded with
// each article result and their hash enters its Search strategy version.
import type { SourceName } from "./verification.ts";
export interface SourceSettings {
  /** Minimum spacing between actual sends, shared by all workers. */
  intervalMs: number;
  /** Crossref keeps a separate, slower spacing for bibliographic queries. */
  searchIntervalMs?: number;
  /** Concurrent in-flight requests across all workers; absent is unbounded. */
  concurrency?: number;
  /** Longest wait for a permit before this source is unavailable (rate-budget). */
  maxWaitMs: number;
}
export interface SearchSettings {
  requestTimeoutMs: number;
  maxRetries: number;
  /** A 429/5xx Retry-After above this bound is not retried. */
  retryAfterMaxMs: number;
  /** ADR-0007: at most this many running References per Check. */
  activeReferencesPerCheck: number;
  /** Concurrent References one worker process executes. */
  workerConcurrency: number;
  /** Dispatch alternates between Owners first, then between their Checks. */
  fairness: "owner-then-check-round-robin";
  sources: Record<SourceName, SourceSettings>;
}
// ADR-0007 initial values. doi.org, Crossref and OpenAlex keep the #74/#77
// development values; Europe PMC, Semantic Scholar and arXiv use the accepted
// initial caps (10/s self-imposed, 1/s, one per 3 s on a single connection).
export const defaultSearchSettings: SearchSettings = Object.freeze({
  requestTimeoutMs: 3000,
  maxRetries: 1,
  retryAfterMaxMs: 2000,
  activeReferencesPerCheck: 10,
  workerConcurrency: 20,
  fairness: "owner-then-check-round-robin",
  sources: Object.freeze({
    "doi.org": { intervalMs: 50, maxWaitMs: 10000 },
    crossref: {
      intervalMs: 200,
      searchIntervalMs: 1000,
      concurrency: 1,
      maxWaitMs: 10000,
    },
    openalex: { intervalMs: 1000, concurrency: 1, maxWaitMs: 10000 },
    europepmc: { intervalMs: 100, concurrency: 1, maxWaitMs: 10000 },
    semanticscholar: { intervalMs: 1000, concurrency: 1, maxWaitMs: 10000 },
    arxiv: { intervalMs: 3000, concurrency: 1, maxWaitMs: 10000 },
  }),
});
/** Flat record of the settings for the stored Search configuration. */
export function flattenSearchSettings(settings: SearchSettings) {
  const flat: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(settings))
    if (key !== "sources") flat[`settings.${key}`] = value as string | number;
  for (const [source, values] of Object.entries(settings.sources))
    for (const [key, value] of Object.entries(values))
      flat[`settings.${source}.${key}`] = value as number;
  return flat;
}
