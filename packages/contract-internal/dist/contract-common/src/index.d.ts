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
/** Hosted authority is not a Quota grant. #99 owns its journal. */
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
