import { z } from "zod";
export * from "../../contract-common/src/index.ts";
/** No verification content, recipient, code or arbitrary message crosses this boundary.
 * Diagnostic only: explicitly enabled loopback rehearsal with a fixed .invalid SMTP sink.
 * Hosted entitlement/Quota routes remain unavailable until their signed-token implementation.
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
/** Operator settings, not qualification evidence. Public and combined budgets are distinct.
 * Every entrance attempt counts, including denied attempts; no Quota is consumed. */
export declare const AbuseBudget: z.ZodObject<{
    limit: z.ZodNumber;
    windowMs: z.ZodNumber;
}, z.core.$strict>;
export declare const AbuseBudgets: z.ZodObject<{
    principal: z.ZodRecord<z.ZodString, z.ZodObject<{
        limit: z.ZodNumber;
        windowMs: z.ZodNumber;
    }, z.core.$strict>>;
    guest: z.ZodObject<{
        limit: z.ZodNumber;
        windowMs: z.ZodNumber;
    }, z.core.$strict>;
    allGuests: z.ZodObject<{
        limit: z.ZodNumber;
        windowMs: z.ZodNumber;
    }, z.core.$strict>;
    origin: z.ZodObject<{
        limit: z.ZodNumber;
        windowMs: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const AbusePolicy: z.ZodObject<{
    version: z.ZodString;
    cacheMs: z.ZodNumber;
    public: z.ZodObject<{
        principal: z.ZodRecord<z.ZodString, z.ZodObject<{
            limit: z.ZodNumber;
            windowMs: z.ZodNumber;
        }, z.core.$strict>>;
        guest: z.ZodObject<{
            limit: z.ZodNumber;
            windowMs: z.ZodNumber;
        }, z.core.$strict>;
        allGuests: z.ZodObject<{
            limit: z.ZodNumber;
            windowMs: z.ZodNumber;
        }, z.core.$strict>;
        origin: z.ZodObject<{
            limit: z.ZodNumber;
            windowMs: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
    shared: z.ZodObject<{
        principal: z.ZodRecord<z.ZodString, z.ZodObject<{
            limit: z.ZodNumber;
            windowMs: z.ZodNumber;
        }, z.core.$strict>>;
        guest: z.ZodObject<{
            limit: z.ZodNumber;
            windowMs: z.ZodNumber;
        }, z.core.$strict>;
        allGuests: z.ZodObject<{
            limit: z.ZodNumber;
            windowMs: z.ZodNumber;
        }, z.core.$strict>;
        origin: z.ZodObject<{
            limit: z.ZodNumber;
            windowMs: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type AbusePolicy = z.infer<typeof AbusePolicy>;
/** Trusted ingress already truncated and keyed-hashed. Never HTTP Origin or a raw IP.
 * One hash per distinct origin budget window; signer authenticates the ingress context. */
export declare const AbuseOrigin: z.ZodObject<{
    windowMs: z.ZodNumber;
    windowStart: z.ZodNumber;
    keyId: z.ZodString;
    hash: z.ZodString;
}, z.core.$strict>;
export declare const AbuseEntrance: z.ZodObject<{
    requestId: z.ZodUUID;
    program: z.ZodLiteral<"verification">;
    policyVersion: z.ZodString;
    principal: z.ZodNullable<z.ZodObject<{
        ownerId: z.ZodUUID;
        actorId: z.ZodUUID;
        guestId: z.ZodOptional<z.ZodUUID>;
        guestContextId: z.ZodOptional<z.ZodUUID>;
        sessionId: z.ZodOptional<z.ZodUUID>;
    }, z.core.$strict>>;
    origins: z.ZodArray<z.ZodObject<{
        windowMs: z.ZodNumber;
        windowStart: z.ZodNumber;
        keyId: z.ZodString;
        hash: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AbuseEntrance = z.infer<typeof AbuseEntrance>;
/** Service resolves current Plan, never accepts a client Plan/allowance. It atomically
 * counts ALL shared dimensions across BOTH entrances, durably deduplicating requestId
 * for at most 24h. An inaccessible/unknown identity never reveals Account existence.
 * Policy mismatch/outage is 503; it is never an allow. No cached decisions/retries. */
export declare const AbuseDecision: z.ZodDiscriminatedUnion<[z.ZodObject<{
    allowed: z.ZodLiteral<true>;
    policyVersion: z.ZodString;
    planId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    allowed: z.ZodLiteral<false>;
    planId: z.ZodString;
    policyVersion: z.ZodString;
    retryAt: z.ZodISODateTime;
}, z.core.$strict>], "allowed">;
export type AbuseDecision = z.infer<typeof AbuseDecision>;
