// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Version 2 transport only. Version 1 stays frozen; old stored results remain readable.
import { z } from "zod";
import * as v1 from "./index.js";
export * from "./index.js";
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
export const StructuredReference = v1.StructuredReference.extend({
    csl: StructuredCsl,
    /** Library import provenance; `fields` is the immutable import projection. */
    imported: z
        .object({
        format: z.enum(["bibtex", "ris"]),
        unsupported: z.array(z.object({ name: z.string(), value: z.string() })),
        fields: StructuredCsl,
    })
        .optional(),
}).meta({ id: "StructuredReferenceV2" });
/** A BibTeX or RIS library file's text, decoded as UTF-8 without dropping a BOM. */
export const LibraryInput = z
    .strictObject({
    format: z.enum(["bibtex", "ris"]),
    text: z
        .string()
        .min(1)
        .max(20 * 1024 * 1024),
})
    .meta({ id: "LibraryInputV2" });
export const CreateCheckRequest = z
    .union([
    z.object({ library: LibraryInput }),
    z.object({ text: z.string().trim().min(1) }),
    z.object({
        references: z
            .array(z.object({
            originalText: z.string().min(1),
            fields: StructuredCsl,
            authorsTruncated: z.boolean().optional(),
        }))
            .min(1),
    }),
])
    .meta({ id: "CreateCheckRequestV2" });
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
        attestations: z.array(z.object({
            source: z.enum(["nlm", "crossref", "europepmc", "semanticscholar"]),
            role: z.enum(["candidate", "reference"]),
            journalTitle: z.string(),
            abbreviation: z.string(),
            nlmId: z.string().optional(),
            snapshotDate: z.string().optional(),
        })),
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
    reasons: z.array(z.enum([
        ...v1.VerdictResult.shape.reasons.element.options,
        "mixed-components",
        "search-completed",
        "ambiguous-identity",
        "insufficient-search",
        "sources-unavailable",
    ])),
    failedSources: z.array(SourceName),
    retraction: z.enum(["unknown", "retracted"]),
    retractionEvidence: z.array(RetractionEvidence).optional(),
}).meta({ id: "VerdictResultV2" });
export const ReferenceOutcome = z
    .discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("status"), status: v1.ReferenceStatus }),
    VerdictResult.strict(),
])
    .meta({ id: "ReferenceOutcomeV2" });
export const ReferenceProgress = z.enum([
    ...v1.ReferenceProgress.options,
    "openalex",
    "europepmc",
    "semanticscholar",
    "arxiv",
    "openlibrary",
    "googlebooks",
]);
export const ReferenceSlot = v1.ReferenceSlot.extend({
    outcome: ReferenceOutcome,
    progress: ReferenceProgress,
}).meta({ id: "ReferenceSlotV2" });
export const Check = v1.Check.extend({
    references: z.array(ReferenceSlot),
}).meta({ id: "CheckV2" });
export const CheckResponse = v1.CheckResponse.extend({ data: Check }).meta({
    id: "CheckResponseV2",
});
export const ReferenceUpdatedEvent = v1.ReferenceUpdatedEvent.extend({
    reference: ReferenceSlot.pick({ slot: true, outcome: true, progress: true }),
}).meta({ id: "ReferenceUpdatedEventV2" });
export const CheckEvent = z
    .discriminatedUnion("type", [v1.CheckUpdatedEvent, ReferenceUpdatedEvent])
    .meta({ id: "CheckEventV2" });
export function isFinalEvent(event) {
    return event.type === "check.updated" && event.state === "ended";
}
