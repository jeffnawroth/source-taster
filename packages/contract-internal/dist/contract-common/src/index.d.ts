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
    code: z.ZodString;
    i18nKey: z.ZodString;
}, z.core.$strip>;
export type ProblemDetails = z.infer<typeof ProblemDetails>;
/**
 * Consumption and remaining Quota of the acting Owner (FA-ORG-15).
 * `null` means no Quota applies, as in standalone mode.
 */
export declare const Quota: z.ZodObject<{
    consumed: z.ZodNumber;
    remaining: z.ZodNumber;
}, z.core.$strip>;
export type Quota = z.infer<typeof Quota>;
/** Hosted authority is not a Quota grant. #99 owns its journal. */
export declare const QuotaSlot: z.ZodUnion<readonly [z.ZodObject<{
    consumed: z.ZodNumber;
    remaining: z.ZodNumber;
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
