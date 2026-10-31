// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport conventions shared by every Source Taster API (ADR-0003 "API conventions").
import { z } from "zod";
export const PROBLEM_CONTENT_TYPE = "application/problem+json";
/**
 * RFC 9457 Problem Details with a stable machine `code` and the catalog key
 * (`i18nKey`) under which clients find the user-facing message.
 */
export const ProblemDetails = z
    .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    detail: z.string().optional(),
    /** The applicable configured limit, when the request exceeds one. */
    limit: z.number().int().positive().optional(),
    /** `quota-insufficient`: References the Owner can still start (may be 0). */
    available: z.number().int().nonnegative().optional(),
    /** `quota-insufficient`: References the request would have consumed. */
    required: z.number().int().positive().optional(),
    code: z.string(),
    i18nKey: z.string(),
})
    .meta({ id: "ProblemDetails" });
/** One valid grant of the acting Owner, shown with its expiry (ADR-0004). */
export const QuotaGrantView = z
    .object({
    kind: z.enum(["guest", "free", "credit"]),
    granted: z.number().int().positive(),
    remaining: z.number().int().nonnegative(),
    expiresAt: z.iso.datetime(),
})
    .meta({ id: "QuotaGrantView" });
/** Warning level over the sum of all currently valid grants (FA-KTO-12). */
export const QuotaWarning = z
    .enum(["none", "eighty", "exhausted"])
    .meta({ id: "QuotaWarning" });
/**
 * Consumption and remaining Quota of the acting Owner (FA-ORG-15).
 * `consumed` counts debits of the valid grants, `remaining` the balance that is
 * neither consumed nor reserved by a running Check. `null` means no Quota
 * applies, as in standalone mode.
 */
export const Quota = z
    .object({
    consumed: z.number().int().nonnegative(),
    remaining: z.number().int().nonnegative(),
    /** Sum of all currently valid grants. */
    granted: z.number().int().nonnegative(),
    /** Held by running Checks; settled when the first Verdict arrives. */
    reserved: z.number().int().nonnegative(),
    warning: QuotaWarning,
    grants: z.array(QuotaGrantView).max(50),
    /** Union of the features of all currently valid grants. */
    features: z.array(z.string().min(1).max(40)).max(20),
})
    .meta({ id: "Quota" });
/** Hosted authority is not a Quota grant. #99 owns its journal. */
export const QuotaSlot = z.union([
    Quota,
    z.strictObject({ status: z.literal("not-implemented") }),
    z.null(),
]);
/** Every successful response wraps its payload with the Quota slot. */
export function envelope(data) {
    return z.object({ data, quota: QuotaSlot });
}
/** Opaque transport binding; Owner and actor are deliberately separate. */
export const GuestBinding = z.strictObject({
    guestContextId: z.uuid(),
    ownerId: z.uuid(),
    actorId: z.uuid(),
});
export const Permission = z.enum([
    "structuring:create",
    "check:create",
    "check:read",
    "check:cancel",
    "check:renew",
]);
/** Public Ed25519 verification material only. Private keys never cross programs. */
export const PublicJwks = z.strictObject({
    keys: z
        .array(z.strictObject({
        kty: z.literal("OKP"),
        crv: z.literal("Ed25519"),
        x: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
        kid: z.string().min(1).max(80),
        alg: z.literal("EdDSA"),
        use: z.literal("sig"),
    }))
        .max(5),
});
