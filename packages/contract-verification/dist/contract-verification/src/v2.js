// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Version 2 transport only. Version 1 stays frozen; old stored results remain readable.
import { z } from "zod";
import * as v1 from "./index.js";
export * from "./index.js";
export const Candidate = v1.Candidate.extend({
    source: z.enum(["crossref", "openalex"]),
    origin: z.enum(["doi", "pmid", "pmcid", "combined", "title", "authors-year"]),
    identifiers: z.array(z.string()).optional(),
}).meta({ id: "CandidateV2" });
export const SourceEvidence = v1.SourceEvidence.extend({
    source: z.enum(["doi.org", "crossref", "openalex"]),
    operation: z.enum([
        "doi",
        "pmid",
        "pmcid",
        "combined",
        "title",
        "authors-year",
    ]),
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
}).meta({ id: "SourceEvidenceV2" });
export const VerdictResult = v1.VerdictResult.extend({
    identity: v1.VerdictResult.shape.identity.extend({
        kind: z.enum([
            "supplied-doi",
            "supplied-identifier",
            "independent-bibliography",
            "unresolved",
        ]),
    }),
    candidates: z.array(Candidate).max(10),
    evidence: z.array(SourceEvidence),
    reasons: z.array(z.enum([
        ...v1.VerdictResult.shape.reasons.element.options,
        "mixed-components",
        "search-completed",
        "ambiguous-identity",
        "insufficient-search",
    ])),
    failedSources: z.array(z.enum(["doi.org", "crossref", "openalex"])),
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
