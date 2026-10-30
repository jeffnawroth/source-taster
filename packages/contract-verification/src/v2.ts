// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Version 2 transport only. Version 1 stays frozen; old stored results remain readable.
import { z } from "zod";
import * as v1 from "./index.ts";
export * from "./index.ts";
const CandidateDataSource = z.enum([
  "crossref",
  "openalex",
  "europepmc",
  "semanticscholar",
  "arxiv",
  "openlibrary",
  "googlebooks",
]);
const SourceName = z.enum(["doi.org", ...CandidateDataSource.options]);
const Operation = z.enum([
  "doi",
  "pmid",
  "pmcid",
  "arxiv",
  "isbn",
  "combined",
  "title",
  "authors-year",
]);
/** Version 2 accepts a native arXiv identifier; Version 1 stays unchanged. */
export const StructuredCsl = v1.StructuredCsl.extend({
  arXiv: z.string().optional(),
}).meta({ id: "StructuredCslV2" });
export type StructuredCsl = z.infer<typeof StructuredCsl>;
export const StructuredReference = v1.StructuredReference.extend({
  csl: StructuredCsl,
}).meta({ id: "StructuredReferenceV2" });
export const CreateCheckRequest = z
  .union([
    z.object({ text: z.string().trim().min(1) }),
    z.object({
      references: z
        .array(
          z.object({
            originalText: z.string().min(1),
            fields: StructuredCsl,
            authorsTruncated: z.boolean().optional(),
          }),
        )
        .min(1),
    }),
  ])
  .meta({ id: "CreateCheckRequestV2" });
export type CreateCheckRequest = z.input<typeof CreateCheckRequest>;
export const RetractionEvidence = z
  .object({
    source: z.enum(["crossref", "openalex", "europepmc"]),
    candidateId: z.string(),
    observedAt: z.string(),
  })
  .meta({ id: "RetractionEvidenceV2" });
export const FieldComparison = v1.FieldComparison.extend({
  agreement: z.boolean().optional(),
  journalAbbreviation: z
    .object({
      outcome: z.enum(["match", "different", "not-determinable"]),
      reason: z.enum([
        "attested-match",
        "attested-other-journal",
        "no-attestation",
      ]),
      attestations: z.array(
        z.object({
          source: z.enum(["nlm", "crossref", "europepmc", "semanticscholar"]),
          role: z.enum(["candidate", "reference"]),
          journalTitle: z.string(),
          abbreviation: z.string(),
          nlmId: z.string().optional(),
          snapshotDate: z.string().optional(),
        }),
      ),
    })
    .optional(),
}).meta({ id: "FieldComparisonV2" });
export const Candidate = v1.Candidate.extend({
  csl: StructuredCsl,
  fields: z.array(FieldComparison),
  source: CandidateDataSource,
  origin: Operation,
  identifiers: z.array(z.string()).optional(),
  identityAmbiguous: z.boolean().optional(),
  retractionEvidence: RetractionEvidence.optional(),
}).meta({ id: "CandidateV2" });
export const SourceEvidence = v1.SourceEvidence.extend({
  source: SourceName,
  operation: Operation,
  outcome: z.enum([
    "exists",
    "nonexistent",
    "candidate",
    "no-record",
    "unavailable",
    "disabled",
    "skipped",
    "unsupported",
  ]),
  skippedDuplicates: z.array(z.string()).optional(),
  unusedSlots: z.number().int().nonnegative().optional(),
  identifierAmbiguity: z.array(z.string()).optional(),
}).meta({ id: "SourceEvidenceV2" });
export const VerdictResult = v1.VerdictResult.extend({
  reference: StructuredReference,
  identity: v1.VerdictResult.shape.identity.extend({
    kind: z.enum([
      "supplied-doi",
      "supplied-identifier",
      "independent-bibliography",
      "unresolved",
    ]),
  }),
  // Five Candidate slots for each Data source of the widest route (article:
  // OpenAlex, Crossref, Europe PMC, Semantic Scholar, arXiv).
  candidates: z.array(Candidate).max(25),
  evidence: z.array(SourceEvidence),
  reasons: z.array(
    z.enum([
      ...v1.VerdictResult.shape.reasons.element.options,
      "mixed-components",
      "search-completed",
      "ambiguous-identity",
      "insufficient-search",
      "sources-unavailable",
    ]),
  ),
  failedSources: z.array(SourceName),
  retraction: z.enum(["unknown", "retracted"]),
  retractionEvidence: z.array(RetractionEvidence).optional(),
}).meta({ id: "VerdictResultV2" });
export type VerdictResult = z.infer<typeof VerdictResult>;
export type Candidate = z.infer<typeof Candidate>;
export type SourceEvidence = z.infer<typeof SourceEvidence>;
export const ReferenceOutcome = z
  .discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("status"), status: v1.ReferenceStatus }),
    VerdictResult.strict(),
  ])
  .meta({ id: "ReferenceOutcomeV2" });
export type ReferenceOutcome = z.infer<typeof ReferenceOutcome>;
export const ReferenceProgress = z.enum([
  ...v1.ReferenceProgress.options,
  "openalex",
  "europepmc",
  "semanticscholar",
  "arxiv",
  "openlibrary",
  "googlebooks",
]);
export type ReferenceProgress = z.infer<typeof ReferenceProgress>;
export const FieldRevision = z.object({
  revision: z.number().int().positive(),
  reference: StructuredReference,
  provenance: z.enum(["parser", "user"]),
  createdAt: z.string(),
});
export const HistoricalResult = z.object({
  id: z.uuid(),
  revision: z.number().int().positive(),
  generation: z.number().int().nonnegative(),
  createdAt: z.string(),
  outcome: ReferenceOutcome,
});
export const ReferenceSlot = v1.ReferenceSlot.extend({
  revision: z.number().int().positive(),
  fields: StructuredCsl,
  authorsTruncated: z.boolean().optional(),
  revisions: z.array(FieldRevision),
  results: z.array(HistoricalResult),
  quotaEffect: z.enum(["free-recheck", "new-work"]),
  outcome: ReferenceOutcome,
  progress: ReferenceProgress,
}).meta({ id: "ReferenceSlotV2" });
export type ReferenceSlot = z.infer<typeof ReferenceSlot>;
export const Check = v1.Check.extend({
  references: z.array(ReferenceSlot),
}).meta({ id: "CheckV2" });
export type Check = z.infer<typeof Check>;
export const CheckResponse = v1.CheckResponse.extend({ data: Check }).meta({
  id: "CheckResponseV2",
});
export type CheckResponse = z.infer<typeof CheckResponse>;
export const ReferenceUpdatedEvent = v1.ReferenceUpdatedEvent.extend({
  reference: ReferenceSlot.partial()
    .required({ slot: true, outcome: true, progress: true })
    .extend({ removed: z.literal(true).optional() }),
}).meta({ id: "ReferenceUpdatedEventV2" });
export const CheckEvent = z
  .discriminatedUnion("type", [v1.CheckUpdatedEvent, ReferenceUpdatedEvent])
  .meta({ id: "CheckEventV2" });
export type CheckEvent = z.infer<typeof CheckEvent>;
export function isFinalEvent(event: CheckEvent): boolean {
  return event.type === "check.updated" && event.state === "ended";
}

export const SaveFieldsRequest = z.strictObject({
  expectedRevision: z.number().int().positive(),
  fields: StructuredCsl.strict(),
  authorsTruncated: z.boolean().optional(),
  recheck: z.boolean(),
});
export type SaveFieldsRequest = z.infer<typeof SaveFieldsRequest>;

export const RecheckRequest = z.strictObject({
  expectedRevision: z.number().int().positive(),
});
export type RecheckRequest = z.infer<typeof RecheckRequest>;
export const EditReferenceListRequest = z.strictObject({
  expectedEventSeq: z.number().int().nonnegative(),
  add: z
    .array(
      z.strictObject({
        originalText: z.string().trim().min(1),
        fields: StructuredCsl.strict(),
        authorsTruncated: z.boolean().optional(),
      }),
    )
    .max(1000),
  remove: z.array(z.number().int().positive()).max(1000),
});
export type EditReferenceListRequest = z.infer<typeof EditReferenceListRequest>;
