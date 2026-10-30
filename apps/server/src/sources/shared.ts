// SPDX-License-Identifier: AGPL-3.0-or-later
// Response handling shared by the article Data source adapters. A completed
// response that cannot be read is a data finding (invalid-metadata); any other
// unavailable evidence keeps its transport reason.
import type { Evidence, RetrievedCandidate } from "@source-taster/core";
import type { BatchResponse } from "./batch.ts";
import type { SourceTarget } from "./doi.ts";
export type SourceRequest = (
  source: Evidence["source"],
  url: URL,
  deadline: number,
  operation?: Evidence["operation"],
  format?: "json" | "atom",
) => Promise<{ body?: unknown; evidence: Evidence }>;
/** An identifier lookup sent in a shared batch (sources/batch.ts). */
export type SourceBatch = (
  source: Evidence["source"],
  operation: Evidence["operation"],
  value: string,
  deadline: number,
  untilSend: boolean,
  target: (ids: string[]) => SourceTarget,
  format?: "json" | "atom",
) => Promise<BatchResponse>;
/**
 * A syntactically valid version-free arXiv identifier. An invalid identifier
 * makes arXiv answer the whole request with an error, so it is never batched.
 */
export const batchableArxiv = (value: string) =>
  /^(?:(?:0[7-9]|1[0-4])(?:0[1-9]|1[0-2])\.\d{4}|(?:1[5-9]|[2-9]\d)(?:0[1-9]|1[0-2])\.\d{5})$/u.test(
    value,
  ) || /^[a-z]+(?:-[a-z]+)*(?:\.[a-z]{2})?\/\d{7}$/iu.test(value);
/** The request completed with HTTP 200, so its body can supply records. */
export const answered = (evidence: Evidence) =>
  evidence.reason === "response" && evidence.status === 200;
export const unreadable = (evidence: Evidence): Evidence => ({
  ...evidence,
  reason: evidence.reason === "response" ? "invalid-metadata" : evidence.reason,
});
const completed = (
  evidence: Evidence,
  outcome: "candidate" | "no-record",
): Evidence => ({ ...evidence, outcome, reason: undefined });
/** A record carrying a different identifier is never a match. */
export const mismatch = (evidence: Evidence) => ({
  evidence: {
    ...evidence,
    outcome: "unavailable" as const,
    reason: "identifier-mismatch",
  },
});
/** A completed lookup without a record, such as a 404. */
export const noRecord = (evidence: Evidence) => ({
  evidence: completed(evidence, "no-record"),
});
/**
 * A search page: every listed record must project, and an empty page is a
 * completed empty result.
 */
export function searchResult(
  evidence: Evidence,
  records: unknown[] | undefined,
  project: (record: unknown) => RetrievedCandidate | null | undefined,
): { candidates: RetrievedCandidate[]; evidence: Evidence } {
  const candidates = records?.map(project) ?? [];
  if (!answered(evidence) || !records || candidates.some((c) => !c))
    return { candidates: [], evidence: unreadable(evidence) };
  return {
    candidates: candidates as RetrievedCandidate[],
    evidence: completed(
      evidence,
      candidates.length ? "candidate" : "no-record",
    ),
  };
}
/** An identifier lookup's record from a completed response. */
export function lookupResult(
  evidence: Evidence,
  candidate: RetrievedCandidate | null | undefined,
  identifies: (candidate: RetrievedCandidate) => boolean,
): { candidate?: RetrievedCandidate; evidence: Evidence } {
  if (!answered(evidence) || !candidate)
    return { evidence: unreadable(evidence) };
  if (!identifies(candidate)) return mismatch(evidence);
  return { candidate, evidence: completed(evidence, "candidate") };
}
/** Query text without any provider's query operators, quotes or filters. */
export const queryTerms = (text: string) =>
  text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
/**
 * A display name split at its last token into family and given names
 * (OpenAlex, Semantic Scholar and arXiv supply no structured names).
 */
export function displayName(name: string) {
  const parts = name.trim().split(/\s+/u);
  return {
    family: parts.pop()!,
    ...(parts.length ? { given: parts.join(" ") } : {}),
  };
}
