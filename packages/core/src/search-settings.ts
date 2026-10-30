// SPDX-License-Identifier: AGPL-3.0-or-later
// Operator-changeable search operating settings (spec #70, ADR-0007). Every
// value can change retrieved evidence, so the exact settings are recorded with
// each article and book result and their hash enters its Search strategy version.
// These settings are the single source of truth for what runs; the Version 1
// DOI tracer limits are derived from the defaults below.
import type { SourceName } from "./verification.ts";
/** ADR-0007 hard deadline per running Reference; not an Operator setting. */
export const referenceDeadlineMs = 30000;
export interface SourceSettings {
  /** Bound of one request, including its complete body (ADR-0007: 3 s). */
  requestTimeoutMs: number;
  /** Minimum spacing between actual sends, shared by all workers. */
  intervalMs: number;
  /** Crossref keeps a separate, slower spacing for bibliographic queries. */
  searchIntervalMs?: number;
  /** Concurrent in-flight requests across all workers; absent is unbounded. */
  concurrency?: number;
  /**
   * Longest wait for a permit before this source is unavailable
   * (rate-budget). The wait always ends at the Reference deadline as well.
   */
  maxWaitMs: number;
  /** Identifier batching (ADR-0007): most distinct identifiers per request. */
  batchSize?: number;
  /** Collection time before a batch asks for its permit. */
  batchWindowMs?: number;
}
export interface SearchSettings {
  maxRetries: number;
  /** A 429/5xx Retry-After above this bound is not retried. */
  retryAfterMaxMs: number;
  /** ADR-0007: at most this many running References per Check. */
  activeReferencesPerCheck: number;
  /** Concurrent References one worker process executes. */
  workerConcurrency: number;
  sources: Record<SourceName, SourceSettings>;
}
// Initial operating values. Europe PMC, Semantic Scholar, arXiv and Open
// Library use the ADR-0007 initial caps (10/s self-imposed, 1/s, one per 3 s
// on a single connection, 3/s). doi.org (20/s) matches ADR-0007 as well.
// Crossref (5/s single records, 1/s searches, one connection) and OpenAlex
// (1/s, one connection) deliberately keep the slower #74/#77 development
// values rather than ADR-0007's 8/s, 2.5/s, three connections and 25/s: the
// development preview runs in Crossref's public pool and without OpenAlex
// prepaid usage, which ADR-0007's caps assume.
export const defaultSearchSettings: SearchSettings = Object.freeze({
  maxRetries: 1,
  retryAfterMaxMs: 2000,
  activeReferencesPerCheck: 10,
  workerConcurrency: 20,
  sources: Object.freeze({
    "doi.org": { requestTimeoutMs: 3000, intervalMs: 50, maxWaitMs: 10000 },
    crossref: {
      requestTimeoutMs: 3000,
      intervalMs: 200,
      searchIntervalMs: 1000,
      concurrency: 1,
      maxWaitMs: 10000,
    },
    openalex: {
      requestTimeoutMs: 3000,
      intervalMs: 1000,
      concurrency: 1,
      maxWaitMs: 10000,
    },
    europepmc: {
      requestTimeoutMs: 3000,
      intervalMs: 100,
      concurrency: 1,
      maxWaitMs: 10000,
    },
    // ADR-0007: collect for at most 200 ms, at most 500 identifiers.
    semanticscholar: {
      requestTimeoutMs: 3000,
      intervalMs: 1000,
      concurrency: 1,
      maxWaitMs: 10000,
      batchSize: 500,
      batchWindowMs: 200,
    },
    // ADR-0007: one id_list request per three-second opportunity, collecting
    // until the permit is granted. The API returns at most 2000 results per
    // request; 100 identifiers keep the GET URL short.
    arxiv: {
      requestTimeoutMs: 3000,
      intervalMs: 3000,
      concurrency: 1,
      maxWaitMs: 10000,
      batchSize: 100,
      batchWindowMs: 0,
    },
    // ADR-0007: Open Library 3 requests/s (334 ms keeps actual sends at or
    // below it). Google Books has no ADR-0007 cap; one request per second is
    // a conservative development value pending a provider allowance (#79).
    // Neither catalog is bounded by a connection limit.
    openlibrary: { requestTimeoutMs: 3000, intervalMs: 334, maxWaitMs: 10000 },
    googlebooks: { requestTimeoutMs: 3000, intervalMs: 1000, maxWaitMs: 10000 },
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
