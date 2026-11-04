// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only. Algorithms, adapters and activation policy live in AGPL code.
import { z } from "zod";
import { StructuredCsl, StructuredReference } from "./structuring.ts";
export const Verdict = z
  .enum([
    "correct",
    "exists-with-deviations",
    "mixed-citation",
    "doi-conflict",
    "not-found",
    "not-verifiable",
  ])
  .meta({ id: "Verdict" });
export const Score = z
  .object({
    value: z.number().int().min(0).max(100000000),
    fullAgreement: z.boolean(),
  })
  .meta({ id: "Score" });
export type Score = z.infer<typeof Score>;
export const FieldComparison = z
  .object({
    field: z.string(),
    reference: z.unknown(),
    candidate: z.unknown(),
    score: Score.nullable(),
    reason: z.enum([
      "compared",
      "missing-reference",
      "missing-candidate",
      "not-determinable",
      "unweighted",
      "resource-limit",
    ]),
  })
  .meta({ id: "FieldComparison" });
export const Candidate = z
  .object({
    id: z.string(),
    source: z.literal("crossref"),
    origin: z.enum(["doi", "combined", "title", "authors-year"]),
    slot: z.number().int().min(1).max(5),
    retrievedAt: z.string(),
    csl: StructuredCsl,
    raw: z.unknown(),
    fields: z.array(FieldComparison),
    score: Score.nullable(),
  })
  .meta({ id: "Candidate" });
export const SourceEvidence = z
  .object({
    source: z.enum(["doi.org", "crossref"]),
    operation: z.enum(["doi", "combined", "title", "authors-year"]),
    outcome: z.enum([
      "exists",
      "nonexistent",
      "candidate",
      "no-record",
      "unavailable",
    ]),
    reason: z.string().optional(),
    status: z.number().int().optional(),
    durationMs: z.number().int().nonnegative(),
    attempts: z.number().int().min(0).max(2),
    observedAt: z.string(),
    raw: z.unknown().optional(),
  })
  .meta({ id: "SourceEvidence" });
export const VerdictResult = z
  .object({
    kind: z.literal("verdict"),
    measuredConfigurationId: z.string().optional(),
    verdict: Verdict,
    reference: StructuredReference,
    scoringRules: z.object({
      version: z.string(),
      calibration: z.literal("uncalibrated"),
      unicode: z.string(),
      icu: z.string(),
      profile: z.record(z.string(), z.number().int()),
    }),
    searchStrategyVersion: z.string(),
    searchConfiguration: z.record(
      z.string(),
      z.union([z.string(), z.number().int()]),
    ),
    identity: z.object({
      kind: z.enum(["supplied-doi", "independent-bibliography", "unresolved"]),
      candidateId: z.string().optional(),
    }),
    bestMatchId: z.string().nullable(),
    candidates: z.array(Candidate).max(5),
    evidence: z.array(SourceEvidence),
    reasons: z.array(
      z.enum([
        "outside-coverage",
        "doi-nonexistent",
        "foreign-doi",
        "mandatory-resolution-incomplete",
        "metadata-unavailable",
        "url-verification-incomplete",
        "identity-unresolved",
        "development-route-incomplete",
        "identified",
        "fields-differ",
      ]),
    ),
    failedSources: z.array(z.enum(["doi.org", "crossref"])),
    retraction: z.literal("unknown"),
  })
  .meta({ id: "VerdictResult" });
export type VerdictResult = z.infer<typeof VerdictResult>;
export type Candidate = z.infer<typeof Candidate>;
export type Verdict = z.infer<typeof Verdict>;
export type SourceEvidence = z.infer<typeof SourceEvidence>;
