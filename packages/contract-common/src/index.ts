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
    code: z.string(),
    i18nKey: z.string(),
  })
  .meta({ id: "ProblemDetails" });
export type ProblemDetails = z.infer<typeof ProblemDetails>;

/**
 * Consumption and remaining Quota of the acting Owner (FA-ORG-15).
 * `null` means no Quota applies, as in standalone mode.
 */
export const Quota = z
  .object({
    consumed: z.number().int().nonnegative(),
    remaining: z.number().int().nonnegative(),
  })
  .meta({ id: "Quota" });
export type Quota = z.infer<typeof Quota>;

/** Hosted authority is not a Quota grant. #99 owns its journal. */
export const QuotaSlot = z.union([
  Quota,
  z.strictObject({ status: z.literal("not-implemented") }),
  z.null(),
]);
export type QuotaSlot = z.infer<typeof QuotaSlot>;

/** Every successful response wraps its payload with the Quota slot. */
export function envelope<T extends z.ZodType>(data: T) {
  return z.object({ data, quota: QuotaSlot });
}

/** Opaque transport binding; Owner and actor are deliberately separate. */
export const GuestBinding = z.strictObject({
  guestContextId: z.uuid(),
  ownerId: z.uuid(),
  actorId: z.uuid(),
});
export type GuestBinding = z.infer<typeof GuestBinding>;
export const Permission = z.enum([
  "structuring:create",
  "check:create",
  "check:read",
  "check:cancel",
  "check:renew",
]);
export type Permission = z.infer<typeof Permission>;
/** Public Ed25519 verification material only. Private keys never cross programs. */
export const PublicJwks = z.strictObject({
  keys: z
    .array(
      z.strictObject({
        kty: z.literal("OKP"),
        crv: z.literal("Ed25519"),
        x: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
        kid: z.string().min(1).max(80),
        alg: z.literal("EdDSA"),
        use: z.literal("sig"),
      }),
    )
    .max(5),
});
export type PublicJwks = z.infer<typeof PublicJwks>;
