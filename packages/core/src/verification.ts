// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Csl, StructuredReference } from "./structuring.ts";
import {
  comparisonLimits,
  compare,
  developmentProfile,
  normalizeDoi,
  type FieldComparison,
  type Score,
  type ComparisonProfile,
} from "./comparison.ts";
import {
  defaultSearchSettings,
  referenceDeadlineMs,
} from "./search-settings.ts";
/** Data sources that return Candidates; doi.org only resolves existence. */
export type CandidateDataSource =
  | "crossref"
  | "openalex"
  | "europepmc"
  | "semanticscholar"
  | "arxiv"
  | "openlibrary"
  | "googlebooks"
  | "url"
  | "internetarchive";
export type SourceName = "doi.org" | CandidateDataSource;
/** Evidence reasons that make a Data source failed (ADR-0007). */
export type TransportFailure =
  | "timeout"
  | "rate-budget"
  | "http-error"
  | "request-unavailable"
  | "deadline"
  | "after-source-failure";
export interface WebObservation {
  originalUrl: string;
  finalUrl: string;
  status: number;
  title?: string;
  redirectTarget?: string;
  archiveUrl?: string;
  timestamp?: string;
}
export interface Evidence {
  source: SourceName;
  operation:
    | "doi"
    | "pmid"
    | "pmcid"
    | "arxiv"
    | "isbn"
    | "combined"
    | "title"
    | "authors-year"
    | "url"
    | "archive";
  outcome:
    | "exists"
    | "redirect"
    | "nonexistent"
    | "candidate"
    | "no-record"
    | "unavailable"
    | "disabled"
    | "skipped"
    | "unsupported";
  reason?: string;
  status?: number;
  durationMs: number;
  attempts: number;
  observedAt: string;
  raw?: unknown;
  web?: WebObservation;
  skippedDuplicates?: string[];
  unusedSlots?: number;
  identifierAmbiguity?: string[];
}
/** An affirmative report already received from a Data source, never a verified negative. */
export interface RetractionEvidence {
  source: "crossref" | "openalex" | "europepmc";
  candidateId: string;
  observedAt: string;
}
export interface RetrievedCandidate {
  id: string;
  source: CandidateDataSource;
  origin: Evidence["operation"];
  identifiers?: string[];
  identityAmbiguous?: boolean;
  retrievedAt: string;
  csl: Csl;
  raw: unknown;
  retractionEvidence?: RetractionEvidence;
}
export interface Candidate extends RetrievedCandidate {
  slot: number;
  fields: FieldComparison[];
  score: Score | null;
}
/** Agency-neutral existence evidence is deliberately separate from metadata. */
export interface DoiResolver {
  resolve(doi: string, deadline: number): Promise<Evidence>;
}
export interface DataSource {
  lookupDoi(
    doi: string,
    deadline: number,
  ): Promise<{ candidate?: RetrievedCandidate; evidence: Evidence }>;
  findIntended(
    reference: Csl,
    deadline: number,
  ): Promise<{ candidates: RetrievedCandidate[]; evidence: Evidence }>;
}
export interface ScoringRules {
  version: string;
  calibration: "uncalibrated";
  unicode: string;
  icu: string;
  profile: Record<string, number>;
}
const { "doi.org": doiOrg, crossref } = defaultSearchSettings.sources;
// Version 1 records these limits; they are derived from the search operating
// defaults that Version 1 actually runs, so both cannot drift apart.
export const doiTracerLimits = Object.freeze({
  requestTimeoutMs: doiOrg.requestTimeoutMs,
  referenceDeadlineMs,
  doiRequestsPerSecond: 1000 / doiOrg.intervalMs,
  crossrefSingleRequestsPerSecond: 1000 / crossref.intervalMs,
  crossrefSearchIntervalMs: crossref.searchIntervalMs!,
  crossrefConcurrency: crossref.concurrency!,
  maxResponseBytes: 5242880,
  maxRetries: defaultSearchSettings.maxRetries,
  pool: "public",
  candidateBudget: 5,
});
export interface VerdictResult {
  kind: "verdict";
  verdict:
    | "correct"
    | "exists-with-deviations"
    | "doi-conflict"
    | "not-verifiable"
    | "mixed-citation"
    | "not-found";
  reference: StructuredReference;
  scoringRules: ScoringRules;
  searchStrategyVersion: string;
  searchConfiguration: Record<string, string | number>;
  identity: {
    kind:
      | "supplied-doi"
      | "supplied-identifier"
      | "independent-bibliography"
      | "unresolved"
      | "web-url"
      | "web-archive";
    candidateId?: string;
  };
  bestMatchId: string | null;
  candidates: Candidate[];
  evidence: Evidence[];
  reasons: (
    | "outside-coverage"
    | "doi-nonexistent"
    | "foreign-doi"
    | "mandatory-resolution-incomplete"
    | "metadata-unavailable"
    | "url-verification-incomplete"
    | "identity-unresolved"
    | "development-route-incomplete"
    | "identified"
    | "fields-differ"
    | "mixed-components"
    | "search-completed"
    | "ambiguous-identity"
    | "insufficient-search"
    | "url-unavailable"
    | "web-original-unavailable"
    | "sources-unavailable"
  )[];
  failedSources: SourceName[];
  retraction: "unknown" | "retracted";
  retractionEvidence?: RetractionEvidence[];
}
export const outside = new Set([
  "legislation",
  "bill",
  "regulation",
  "treaty",
  "hearing",
  "legal_case",
  "standard",
  "patent",
  "manuscript",
  "collection",
  "personal_communication",
  "interview",
  "speech",
  "broadcast",
  "motion_picture",
  "song",
  "musical_score",
  "performance",
  "event",
  "graphic",
  "figure",
  "map",
]);
export function createDoiVerification(ports: {
  resolver: DoiResolver;
  source: DataSource;
  now: () => number;
  rules: ScoringRules;
  parameters?: ComparisonProfile;
}) {
  const profile = ports.parameters ?? developmentProfile;
  return async (
    reference: StructuredReference,
    execution?: { startedAt: number },
  ): Promise<VerdictResult | { kind: "status"; status: "not-checked" }> => {
    const result: VerdictResult = {
      kind: "verdict",
      verdict: "not-verifiable",
      reference,
      scoringRules: ports.rules,
      searchStrategyVersion: "doi-crossref-public-tracer-3-uncalibrated",
      searchConfiguration: { ...doiTracerLimits, ...comparisonLimits },
      identity: { kind: "unresolved" },
      bestMatchId: null,
      candidates: [],
      evidence: [],
      reasons: [],
      failedSources: [],
      retraction: "unknown",
    };
    if (outside.has(reference.csl.type ?? "")) {
      result.reasons = ["outside-coverage"];
      return result;
    }
    if (!reference.csl.DOI) return { kind: "status", status: "not-checked" };
    const deadline =
      (execution?.startedAt ?? ports.now()) +
      doiTracerLimits.referenceDeadlineMs;
    const doi = normalizeDoi(reference.csl.DOI);
    const resolution = await ports.resolver.resolve(doi, deadline);
    result.evidence.push(resolution);
    const metadata = await ports.source.lookupDoi(doi, deadline);
    result.evidence.push(metadata.evidence);
    result.failedSources = result.evidence
      .filter((e) => e.outcome === "unavailable")
      .map((e) => e.source);
    if (metadata.candidate) {
      const candidate: Candidate = {
        ...metadata.candidate,
        slot: 1,
        ...compare(
          reference,
          metadata.candidate.csl,
          profile,
          metadata.candidate,
        ),
      };
      result.candidates.push(candidate);
      result.bestMatchId = candidate.id;
    }
    if (resolution.outcome === "nonexistent") {
      result.verdict = "doi-conflict";
      result.reasons = ["doi-nonexistent"];
      return result;
    }
    if (resolution.outcome !== "exists") {
      result.reasons = ["mandatory-resolution-incomplete"];
      return result;
    }
    const candidate = result.candidates[0];
    if (!candidate) {
      result.reasons = ["metadata-unavailable"];
      return result;
    }
    if (
      ports.now() >= deadline ||
      candidate.fields.some((f) => f.reason === "resource-limit")
    ) {
      result.reasons = ["development-route-incomplete"];
      return result;
    }
    const contradiction = candidate.fields.some(
      (f) =>
        ["title", "author"].includes(f.field) &&
        f.score &&
        f.score.value < profile.counterevidence,
    );
    if (contradiction || normalizeDoi(candidate.csl.DOI ?? "") !== doi) {
      // A bounded combined probe is solely for independent foreign-DOI proof.
      // This tracer cannot conclude Not found or Mixed citation from its subset.
      if (reference.csl.title && reference.csl.author?.length) {
        const probe = await ports.source.findIntended(reference.csl, deadline);
        result.evidence.push(probe.evidence);
        if (
          probe.evidence.outcome === "unavailable" &&
          !result.failedSources.includes("crossref")
        )
          result.failedSources.push("crossref");
        const other = probe.candidates.find((c) => c.id !== candidate.id);
        if (other) {
          const scored: Candidate = {
            ...other,
            slot: 2,
            ...compare(reference, other.csl, profile, other),
          };
          result.candidates.push(scored);
          result.candidates.sort(
            (a, b) => (b.score?.value ?? -1) - (a.score?.value ?? -1),
          );
          const strong = ["title", "author"].every((field) =>
            scored.fields.some(
              (f) =>
                f.field === field &&
                f.score &&
                f.score.value >= profile.strongField,
            ),
          );
          const top =
            scored.score &&
            candidate.score &&
            scored.score.value > candidate.score.value;
          if (top) result.bestMatchId = scored.id;
          if (
            strong &&
            top &&
            ports.now() < deadline &&
            scored.score!.value - candidate.score!.value >= profile.lead &&
            normalizeDoi(scored.csl.DOI ?? "") !== doi
          ) {
            result.verdict = "doi-conflict";
            result.identity = {
              kind: "independent-bibliography",
              candidateId: scored.id,
            };
            result.reasons = ["foreign-doi"];
            return result;
          }
        }
      }
      result.reasons = ["identity-unresolved", "development-route-incomplete"];
      return result;
    }
    result.identity = { kind: "supplied-doi", candidateId: candidate.id };
    if (
      candidate.fields.some(
        (f) => f.field === "author" && f.reason === "not-determinable",
      )
    ) {
      result.reasons = ["development-route-incomplete"];
      return result;
    }
    if (reference.csl.URL && reference.csl.URL !== candidate.csl.URL) {
      result.reasons = ["url-verification-incomplete"];
      return result;
    }
    const differs = candidate.fields.some(
      (f) =>
        (f.score && !f.score.fullAgreement) ||
        (f.reason === "unweighted" &&
          f.reference !== null &&
          f.candidate !== null &&
          typeof f.reference === "string" &&
          typeof f.candidate === "string" &&
          f.reference !== f.candidate),
    );
    result.verdict = differs ? "exists-with-deviations" : "correct";
    result.reasons = [differs ? "fields-differ" : "identified"];
    return result;
  };
}
