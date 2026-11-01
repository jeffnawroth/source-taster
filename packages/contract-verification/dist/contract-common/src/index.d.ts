import { z } from "zod";
export declare const PROBLEM_CONTENT_TYPE = "application/problem+json";
/**
 * RFC 9457 Problem Details with a stable machine `code` and the catalog key
 * (`i18nKey`) under which clients find the user-facing message.
 */
export declare const ProblemDetails: z.ZodObject<{
    type: z.ZodString;
    title: z.ZodString;
    status: z.ZodNumber;
    detail: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    available: z.ZodOptional<z.ZodNumber>;
    required: z.ZodOptional<z.ZodNumber>;
    retryAt: z.ZodOptional<z.ZodISODateTime>;
    code: z.ZodString;
    i18nKey: z.ZodString;
}, z.core.$strip>;
export type ProblemDetails = z.infer<typeof ProblemDetails>;
/** One valid grant of the acting Owner, shown with its expiry (ADR-0004). */
export declare const QuotaGrantView: z.ZodObject<{
    kind: z.ZodEnum<{
        "check-pack": "check-pack";
        credit: "credit";
        free: "free";
        guest: "guest";
    }>;
    granted: z.ZodNumber;
    remaining: z.ZodNumber;
    expiresAt: z.ZodISODateTime;
}, z.core.$strip>;
export type QuotaGrantView = z.infer<typeof QuotaGrantView>;
/** Warning level over the sum of all currently valid grants (FA-KTO-12). */
export declare const QuotaWarning: z.ZodEnum<{
    eighty: "eighty";
    exhausted: "exhausted";
    none: "none";
}>;
export type QuotaWarning = z.infer<typeof QuotaWarning>;
/**
 * Consumption and remaining Quota of the acting Owner (FA-ORG-15).
 * `consumed` counts debits of the valid grants, `remaining` the balance that is
 * neither consumed nor reserved by a running Check. `null` means no Quota
 * applies, as in standalone mode.
 */
export declare const Quota: z.ZodObject<{
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
            "check-pack": "check-pack";
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
export type Quota = z.infer<typeof Quota>;
/**
 * `not-implemented`: this response has no Quota concept (for example the
 * sign-in routes). `unavailable`: a Quota applies but the service snapshot
 * failed for this response; it never stands for a balance. `null`: no Quota
 * applies, as in standalone mode.
 */
export declare const QuotaSlot: z.ZodUnion<readonly [z.ZodObject<{
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
            "check-pack": "check-pack";
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
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"unavailable">;
}, z.core.$strict>, z.ZodNull]>;
export type QuotaSlot = z.infer<typeof QuotaSlot>;
/** Every successful response wraps its payload with the Quota slot. */
export declare function envelope<T extends z.ZodType>(data: T): z.ZodObject<{
    data: T;
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
                "check-pack": "check-pack";
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
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
/** Opaque transport binding; Owner and actor are deliberately separate. */
export declare const GuestBinding: z.ZodObject<{
    guestContextId: z.ZodUUID;
    ownerId: z.ZodUUID;
    actorId: z.ZodUUID;
}, z.core.$strict>;
export type GuestBinding = z.infer<typeof GuestBinding>;
export declare const Permission: z.ZodEnum<{
    "check:cancel": "check:cancel";
    "check:create": "check:create";
    "check:read": "check:read";
    "check:renew": "check:renew";
    "structuring:create": "structuring:create";
}>;
export type Permission = z.infer<typeof Permission>;
/** Public Ed25519 verification material only. Private keys never cross programs. */
export declare const PublicJwks: z.ZodObject<{
    keys: z.ZodArray<z.ZodObject<{
        kty: z.ZodLiteral<"OKP">;
        crv: z.ZodLiteral<"Ed25519">;
        x: z.ZodString;
        kid: z.ZodString;
        alg: z.ZodLiteral<"EdDSA">;
        use: z.ZodLiteral<"sig">;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type PublicJwks = z.infer<typeof PublicJwks>;
/** Mandatory shape of an entrance-limit refusal, including the continuation time. */
export declare const EntranceLimitProblem: z.ZodObject<{
    type: z.ZodString;
    title: z.ZodString;
    detail: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    available: z.ZodOptional<z.ZodNumber>;
    required: z.ZodOptional<z.ZodNumber>;
    status: z.ZodLiteral<429>;
    code: z.ZodLiteral<"abuse-limit">;
    i18nKey: z.ZodLiteral<"problem_abuse_limit">;
    retryAt: z.ZodISODateTime;
}, z.core.$strip>;
export type EntranceLimitProblem = z.infer<typeof EntranceLimitProblem>;
export declare const entranceLimitResponse: {
    description: string;
    headers: z.ZodObject<{
        "Retry-After": z.ZodString;
    }, z.core.$strip>;
    content: {
        "application/problem+json": {
            schema: z.ZodObject<{
                type: z.ZodString;
                title: z.ZodString;
                detail: z.ZodOptional<z.ZodString>;
                limit: z.ZodOptional<z.ZodNumber>;
                available: z.ZodOptional<z.ZodNumber>;
                required: z.ZodOptional<z.ZodNumber>;
                status: z.ZodLiteral<429>;
                code: z.ZodLiteral<"abuse-limit">;
                i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                retryAt: z.ZodISODateTime;
            }, z.core.$strip>;
        };
    };
};
/** Closed launch style/locale manifest (ADR-0011/0023); no renderer implementation. */
export declare const citationStyles: readonly [{
    readonly id: "apa";
    readonly locale: "en-US";
}, {
    readonly id: "mla";
    readonly locale: "en-US";
}, {
    readonly id: "chicago";
    readonly locale: "en-US";
}, {
    readonly id: "ieee";
    readonly locale: "en-US";
}, {
    readonly id: "vancouver";
    readonly locale: "en-US";
}, {
    readonly id: "harvard";
    readonly locale: "en-GB";
}, {
    readonly id: "acs";
    readonly locale: "en-US";
}, {
    readonly id: "ama";
    readonly locale: "en-US";
}, {
    readonly id: "oxford";
    readonly locale: "en-GB";
}, {
    readonly id: "springer";
    readonly locale: "en-US";
}, {
    readonly id: "din-iso-690";
    readonly locale: "de-DE";
}];
export declare const CitationStyle: z.ZodEnum<{
    acs: "acs";
    ama: "ama";
    apa: "apa";
    chicago: "chicago";
    "din-iso-690": "din-iso-690";
    harvard: "harvard";
    ieee: "ieee";
    mla: "mla";
    oxford: "oxford";
    springer: "springer";
    vancouver: "vancouver";
}>;
export type CitationStyle = z.infer<typeof CitationStyle>;
