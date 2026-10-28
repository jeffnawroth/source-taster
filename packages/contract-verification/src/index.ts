// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Public transport schemas of the verification API (/v1).

import { envelope } from "../../contract-common/src/index.ts";
import { z } from "zod";
import { VerdictResult } from "./verification.ts";
import { StructuredCsl } from "./structuring.ts";
export * from "./verification.ts";

export * from "../../contract-common/src/index.ts";

/**
 * Shown instead of a Verdict (GLOSSARY "Status", ADR-0005). A Status is never
 * a Verdict.
 */
export const ReferenceStatus = z
  .enum(["running", "cancelled", "failed", "not-checked"])
  .meta({ id: "ReferenceStatus" });
export type ReferenceStatus = z.infer<typeof ReferenceStatus>;

/**
 * Exactly one Status or one immutable Verdict result per Reference slot.
 */
export const ReferenceOutcome = z
  .discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("status"), status: ReferenceStatus }),
    VerdictResult.strict(),
  ])
  .meta({ id: "ReferenceOutcome" });
export type ReferenceOutcome = z.infer<typeof ReferenceOutcome>;

export const ReferenceProgress = z.enum([
  "queued",
  "checking",
  "doi.org",
  "crossref",
  "ended",
]);
export type ReferenceProgress = z.infer<typeof ReferenceProgress>;
export const CheckEndReason = z.enum([
  "completed",
  "cancelled",
  "lease-expired",
]);
export type CheckEndReason = z.infer<typeof CheckEndReason>;

export const ReferenceSlot = z
  .object({
    /** 1-based, stable position of the Reference within its Check. */
    slot: z.number().int().positive(),
    originalText: z.string(),
    outcome: ReferenceOutcome,
    progress: ReferenceProgress,
  })
  .meta({ id: "ReferenceSlot" });
export type ReferenceSlot = z.infer<typeof ReferenceSlot>;

/** Pre-start states (Structuring, awaiting start) join when they exist. */
export const CheckState = z
  .enum(["running", "ended"])
  .meta({ id: "CheckState" });
export type CheckState = z.infer<typeof CheckState>;

export const CheckId = z.uuid();

export const Check = z
  .object({
    id: CheckId,
    state: CheckState,
    /** Sequence number of the newest event; attach to the stream from here. */
    lastEventSeq: z.number().int().nonnegative(),
    /** Opaque, Check-bound replay cursor. */
    lastEventCursor: z.string(),
    /** Client acknowledgement interval. Server output alone never renews a lease. */
    leaseRenewAfterMs: z.number().int().positive(),
    endReason: CheckEndReason.nullable(),
    references: z.array(ReferenceSlot),
  })
  .meta({ id: "Check" });
export type Check = z.infer<typeof Check>;

export const CheckResponse = envelope(Check).meta({ id: "CheckResponse" });
export type CheckResponse = z.infer<typeof CheckResponse>;

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
  .meta({ id: "CreateCheckRequest" });
export type CreateCheckRequest = z.input<typeof CreateCheckRequest>;

const eventBase = {
  /** Strictly increasing per Check, starting at 1; the SSE event id. */
  seq: z.number().int().positive(),
  checkId: CheckId,
};

export const CheckUpdatedEvent = z
  .object({
    ...eventBase,
    type: z.literal("check.updated"),
    state: CheckState,
    endReason: CheckEndReason.nullable(),
  })
  .meta({ id: "CheckUpdatedEvent" });

export const ReferenceUpdatedEvent = z
  .object({
    ...eventBase,
    type: z.literal("reference.updated"),
    reference: ReferenceSlot.pick({
      slot: true,
      outcome: true,
      progress: true,
    }),
  })
  .meta({ id: "ReferenceUpdatedEvent" });

/** The `data` of every SSE event on `GET /v1/checks/{id}/events`. */
export const CheckEvent = z
  .discriminatedUnion("type", [CheckUpdatedEvent, ReferenceUpdatedEvent])
  .meta({ id: "CheckEvent" });
export type CheckEvent = z.infer<typeof CheckEvent>;

/** The stream closes after the event that moves the Check into this state. */
export function isFinalEvent(event: CheckEvent): boolean {
  return event.type === "check.updated" && event.state === "ended";
}

export * from "./structuring.ts";
