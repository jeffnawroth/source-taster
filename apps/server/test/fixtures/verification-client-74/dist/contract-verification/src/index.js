// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Public transport schemas of the verification API (/v1).
import { envelope } from "../../contract-common/src/index.js";
import { z } from "zod";
import { VerdictResult } from "./verification.js";
import { StructuredCsl } from "./structuring.js";
export * from "./verification.js";
export * from "../../contract-common/src/index.js";
/**
 * Shown instead of a Verdict (GLOSSARY "Status", ADR-0005). A Status is never
 * a Verdict.
 */
export const ReferenceStatus = z
    .enum(["running", "cancelled", "failed", "not-checked"])
    .meta({ id: "ReferenceStatus" });
/**
 * Exactly one Status or one immutable Verdict result per Reference slot.
 */
export const ReferenceOutcome = z
    .discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("status"), status: ReferenceStatus }),
    VerdictResult.strict(),
])
    .meta({ id: "ReferenceOutcome" });
export const ReferenceSlot = z
    .object({
    /** 1-based, stable position of the Reference within its Check. */
    slot: z.number().int().positive(),
    originalText: z.string(),
    outcome: ReferenceOutcome,
})
    .meta({ id: "ReferenceSlot" });
/** Pre-start states (Structuring, awaiting start) join when they exist. */
export const CheckState = z
    .enum(["running", "ended"])
    .meta({ id: "CheckState" });
export const CheckId = z.uuid();
export const Check = z
    .object({
    id: CheckId,
    state: CheckState,
    /** Sequence number of the newest event; attach to the stream from here. */
    lastEventSeq: z.number().int().nonnegative(),
    references: z.array(ReferenceSlot),
})
    .meta({ id: "Check" });
export const CheckResponse = envelope(Check).meta({ id: "CheckResponse" });
export const CreateCheckRequest = z
    .union([
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
    .meta({ id: "CreateCheckRequest" });
const eventBase = {
    /** Strictly increasing per Check, starting at 1; the SSE event id. */
    seq: z.number().int().positive(),
    checkId: CheckId,
};
export const CheckUpdatedEvent = z
    .object({ ...eventBase, type: z.literal("check.updated"), state: CheckState })
    .meta({ id: "CheckUpdatedEvent" });
export const ReferenceUpdatedEvent = z
    .object({
    ...eventBase,
    type: z.literal("reference.updated"),
    reference: ReferenceSlot.pick({ slot: true, outcome: true }),
})
    .meta({ id: "ReferenceUpdatedEvent" });
/** The `data` of every SSE event on `GET /v1/checks/{id}/events`. */
export const CheckEvent = z
    .discriminatedUnion("type", [CheckUpdatedEvent, ReferenceUpdatedEvent])
    .meta({ id: "CheckEvent" });
/** The stream closes after the event that moves the Check into this state. */
export function isFinalEvent(event) {
    return event.type === "check.updated" && event.state === "ended";
}
export * from "./structuring.js";
