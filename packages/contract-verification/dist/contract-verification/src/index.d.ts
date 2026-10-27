import { z } from "zod";
export * from "../../contract-common/src/index.ts";
/**
 * Shown instead of a Verdict (GLOSSARY "Status", ADR-0005). A Status is never
 * a Verdict.
 */
export declare const ReferenceStatus: z.ZodEnum<{
    cancelled: "cancelled";
    failed: "failed";
    "not-checked": "not-checked";
    running: "running";
}>;
export type ReferenceStatus = z.infer<typeof ReferenceStatus>;
/**
 * Exactly one Status or, once checking exists, one Verdict per Reference slot.
 * Verdicts will join this union as `{ kind: "verdict", ... }`.
 */
export declare const ReferenceOutcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"status">;
    status: z.ZodEnum<{
        cancelled: "cancelled";
        failed: "failed";
        "not-checked": "not-checked";
        running: "running";
    }>;
}, z.core.$strip>], "kind">;
export type ReferenceOutcome = z.infer<typeof ReferenceOutcome>;
export declare const ReferenceSlot: z.ZodObject<{
    slot: z.ZodNumber;
    originalText: z.ZodString;
    outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"status">;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            failed: "failed";
            "not-checked": "not-checked";
            running: "running";
        }>;
    }, z.core.$strip>], "kind">;
}, z.core.$strip>;
export type ReferenceSlot = z.infer<typeof ReferenceSlot>;
/** Pre-start states (Structuring, awaiting start) join when they exist. */
export declare const CheckState: z.ZodEnum<{
    ended: "ended";
    running: "running";
}>;
export type CheckState = z.infer<typeof CheckState>;
export declare const CheckId: z.ZodUUID;
export declare const Check: z.ZodObject<{
    id: z.ZodUUID;
    state: z.ZodEnum<{
        ended: "ended";
        running: "running";
    }>;
    lastEventSeq: z.ZodNumber;
    references: z.ZodArray<z.ZodObject<{
        slot: z.ZodNumber;
        originalText: z.ZodString;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"status">;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                failed: "failed";
                "not-checked": "not-checked";
                running: "running";
            }>;
        }, z.core.$strip>], "kind">;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type Check = z.infer<typeof Check>;
export declare const CheckResponse: z.ZodObject<{
    data: z.ZodObject<{
        id: z.ZodUUID;
        state: z.ZodEnum<{
            ended: "ended";
            running: "running";
        }>;
        lastEventSeq: z.ZodNumber;
        references: z.ZodArray<z.ZodObject<{
            slot: z.ZodNumber;
            originalText: z.ZodString;
            outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"status">;
                status: z.ZodEnum<{
                    cancelled: "cancelled";
                    failed: "failed";
                    "not-checked": "not-checked";
                    running: "running";
                }>;
            }, z.core.$strip>], "kind">;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    quota: z.ZodNullable<z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CheckResponse = z.infer<typeof CheckResponse>;
export declare const CreateCheckRequest: z.ZodObject<{
    text: z.ZodString;
}, z.core.$strip>;
export type CreateCheckRequest = z.input<typeof CreateCheckRequest>;
export declare const CheckUpdatedEvent: z.ZodObject<{
    seq: z.ZodNumber;
    checkId: z.ZodUUID;
    type: z.ZodLiteral<"check.updated">;
    state: z.ZodEnum<{
        ended: "ended";
        running: "running";
    }>;
}, z.core.$strip>;
export declare const ReferenceUpdatedEvent: z.ZodObject<{
    seq: z.ZodNumber;
    checkId: z.ZodUUID;
    type: z.ZodLiteral<"reference.updated">;
    reference: z.ZodObject<{
        slot: z.ZodNumber;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"status">;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                failed: "failed";
                "not-checked": "not-checked";
                running: "running";
            }>;
        }, z.core.$strip>], "kind">;
    }, z.core.$strip>;
}, z.core.$strip>;
/** The `data` of every SSE event on `GET /v1/checks/{id}/events`. */
export declare const CheckEvent: z.ZodDiscriminatedUnion<[z.ZodObject<{
    seq: z.ZodNumber;
    checkId: z.ZodUUID;
    type: z.ZodLiteral<"check.updated">;
    state: z.ZodEnum<{
        ended: "ended";
        running: "running";
    }>;
}, z.core.$strip>, z.ZodObject<{
    seq: z.ZodNumber;
    checkId: z.ZodUUID;
    type: z.ZodLiteral<"reference.updated">;
    reference: z.ZodObject<{
        slot: z.ZodNumber;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"status">;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                failed: "failed";
                "not-checked": "not-checked";
                running: "running";
            }>;
        }, z.core.$strip>], "kind">;
    }, z.core.$strip>;
}, z.core.$strip>], "type">;
export type CheckEvent = z.infer<typeof CheckEvent>;
/** The stream closes after the event that moves the Check into this state. */
export declare function isFinalEvent(event: CheckEvent): boolean;
export * from "./structuring.ts";
