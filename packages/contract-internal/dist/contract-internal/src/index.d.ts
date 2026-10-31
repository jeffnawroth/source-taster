import { z } from "zod";
export * from "../../contract-common/src/index.ts";
/** No verification content, recipient, code or arbitrary message crosses this boundary.
 * Diagnostic only: explicitly enabled loopback rehearsal with a fixed .invalid SMTP sink.
 */
export declare const MailRehearsalRequest: z.ZodObject<{
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
}, z.core.$strict>;
export declare const MailRehearsalResponse: z.ZodObject<{
    data: z.ZodObject<{
        id: z.ZodUUID;
        language: z.ZodEnum<{
            de: "de";
            en: "en";
        }>;
        status: z.ZodEnum<{
            queued: "queued";
            sent: "sent";
        }>;
    }, z.core.$strip>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const MailRehearsalParams: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
/** Each call requires a distinct, request-bound program assertion, never a client token. */
export declare const AuthorityRequest: z.ZodObject<{
    guestContextId: z.ZodUUID;
    ownerId: z.ZodUUID;
    actorId: z.ZodUUID;
    permission: z.ZodEnum<{
        "check:cancel": "check:cancel";
        "check:create": "check:create";
        "check:read": "check:read";
        "check:renew": "check:renew";
        "structuring:create": "structuring:create";
    }>;
    kind: z.ZodEnum<{
        request: "request";
        work: "work";
    }>;
}, z.core.$strict>;
export type AuthorityRequest = z.infer<typeof AuthorityRequest>;
export declare const AuthorityResponse: z.ZodDiscriminatedUnion<[z.ZodObject<{
    allowed: z.ZodLiteral<true>;
    version: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    allowed: z.ZodLiteral<false>;
    reason: z.ZodEnum<{
        forbidden: "forbidden";
        revoked: "revoked";
        unknown: "unknown";
    }>;
}, z.core.$strict>], "allowed">;
export type AuthorityResponse = z.infer<typeof AuthorityResponse>;
/** Monotonic, durable, idempotent Owner fence. Completion drains guarded operations. */
export declare const AuthorityInvalidation: z.ZodObject<{
    guestContextId: z.ZodOptional<z.ZodUUID>;
    ownerId: z.ZodUUID;
    actorId: z.ZodUUID;
    version: z.ZodNumber;
    cancelWork: z.ZodBoolean;
}, z.core.$strict>;
export type AuthorityInvalidation = z.infer<typeof AuthorityInvalidation>;
export declare const AuthorityInvalidationAck: z.ZodObject<{
    ownerId: z.ZodUUID;
    version: z.ZodNumber;
}, z.core.$strict>;
/** ADR-0003: the Owner tombstone is durable and all of the Owner's content is
 * purged. The acknowledgement carries identifiers only and claims nothing about
 * History, which this program does not implement. */
export declare const OwnerDeletionParams: z.ZodObject<{
    ownerId: z.ZodUUID;
}, z.core.$strict>;
export declare const OwnerDeletionAck: z.ZodObject<{
    ownerId: z.ZodUUID;
    tombstoned: z.ZodLiteral<true>;
}, z.core.$strict>;
export type OwnerDeletionAck = z.infer<typeof OwnerDeletionAck>;
/** Stable Account binding; workers deliberately carry no client session secret. */
export declare const AccountAuthorityRequest: z.ZodObject<{
    actorId: z.ZodUUID;
    ownerId: z.ZodUUID;
    sessionId: z.ZodOptional<z.ZodUUID>;
    permission: z.ZodEnum<{
        "check:cancel": "check:cancel";
        "check:create": "check:create";
        "check:read": "check:read";
        "check:renew": "check:renew";
        "structuring:create": "structuring:create";
    }>;
    kind: z.ZodEnum<{
        request: "request";
        work: "work";
    }>;
}, z.core.$strict>;
export type AccountAuthorityRequest = z.infer<typeof AccountAuthorityRequest>;
export declare const QuotaSnapshotRequest: z.ZodObject<{
    ownerId: z.ZodUUID;
    actorId: z.ZodUUID;
}, z.core.$strict>;
export type QuotaSnapshotRequest = z.infer<typeof QuotaSnapshotRequest>;
export declare const QuotaSlotRef: z.ZodObject<{
    position: z.ZodNumber;
    generation: z.ZodNumber;
}, z.core.$strict>;
export type QuotaSlotRef = z.infer<typeof QuotaSlotRef>;
export declare const QuotaReserveRequest: z.ZodObject<{
    ownerId: z.ZodUUID;
    actorId: z.ZodUUID;
    checkId: z.ZodUUID;
    key: z.ZodString;
    slots: z.ZodArray<z.ZodObject<{
        position: z.ZodNumber;
        generation: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type QuotaReserveRequest = z.infer<typeof QuotaReserveRequest>;
export declare const QuotaSettleRequest: z.ZodObject<{
    ownerId: z.ZodUUID;
    actorId: z.ZodUUID;
    checkId: z.ZodUUID;
    position: z.ZodNumber;
    generation: z.ZodNumber;
    outcome: z.ZodEnum<{
        release: "release";
        verdict: "verdict";
    }>;
}, z.core.$strict>;
export type QuotaSettleRequest = z.infer<typeof QuotaSettleRequest>;
export declare const QuotaReleaseRequest: z.ZodObject<{
    ownerId: z.ZodUUID;
    actorId: z.ZodUUID;
    checkId: z.ZodUUID;
    key: z.ZodString;
}, z.core.$strict>;
export type QuotaReleaseRequest = z.infer<typeof QuotaReleaseRequest>;
export declare const QuotaSnapshotResponse: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outcome: z.ZodLiteral<"granted">;
    quota: z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"denied">;
    reason: z.ZodEnum<{
        forbidden: "forbidden";
        revoked: "revoked";
        unknown: "unknown";
    }>;
}, z.core.$strict>], "outcome">;
export type QuotaSnapshotResponse = z.infer<typeof QuotaSnapshotResponse>;
export declare const QuotaReserveResponse: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outcome: z.ZodLiteral<"reserved">;
    free: z.ZodArray<z.ZodNumber>;
    reserved: z.ZodNumber;
    quota: z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"insufficient">;
    available: z.ZodNumber;
    required: z.ZodNumber;
    quota: z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"denied">;
    reason: z.ZodEnum<{
        forbidden: "forbidden";
        revoked: "revoked";
        unknown: "unknown";
    }>;
}, z.core.$strict>], "outcome">;
export type QuotaReserveResponse = z.infer<typeof QuotaReserveResponse>;
export declare const QuotaSettleResponse: z.ZodObject<{
    outcome: z.ZodEnum<{
        debited: "debited";
        forgiven: "forgiven";
        free: "free";
        ignored: "ignored";
        released: "released";
    }>;
}, z.core.$strict>;
export type QuotaSettleResponse = z.infer<typeof QuotaSettleResponse>;
export declare const QuotaReleaseResponse: z.ZodObject<{
    released: z.ZodNumber;
}, z.core.$strict>;
export type QuotaReleaseResponse = z.infer<typeof QuotaReleaseResponse>;
