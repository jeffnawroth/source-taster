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
    /** Absolute continuation time for entrance limits (also Retry-After in seconds). */
    retryAt: z.iso.datetime().optional(),
    code: z.string(),
    i18nKey: z.string(),
  })
  .meta({ id: "ProblemDetails" });
export type ProblemDetails = z.infer<typeof ProblemDetails>;

/** One valid grant of the acting Owner, shown with its expiry (ADR-0004). */
export const QuotaGrantView = z
  .object({
    kind: z.enum(["guest", "free", "credit", "check-pack"]),
    granted: z.number().int().positive(),
    remaining: z.number().int().nonnegative(),
    expiresAt: z.iso.datetime(),
  })
  .meta({ id: "QuotaGrantView" });
export type QuotaGrantView = z.infer<typeof QuotaGrantView>;
/** Warning level over the sum of all currently valid grants (FA-KTO-12). */
export const QuotaWarning = z
  .enum(["none", "eighty", "exhausted"])
  .meta({ id: "QuotaWarning" });
export type QuotaWarning = z.infer<typeof QuotaWarning>;
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
    /** Service-derived union of valid extended-History grants. Missing fails closed to Free. */
    history: z
      .object({
        extendedUntil: z.iso.datetime().nullable(),
        authorityVersion: z.number().int().positive(),
      })
      .optional(),
  })
  .meta({ id: "Quota" });
export type Quota = z.infer<typeof Quota>;

/**
 * `not-implemented`: this response has no Quota concept (for example the
 * sign-in routes). `unavailable`: a Quota applies but the service snapshot
 * failed for this response; it never stands for a balance. `null`: no Quota
 * applies, as in standalone mode.
 */
export const QuotaSlot = z.union([
  Quota,
  z.strictObject({ status: z.literal("not-implemented") }),
  z.strictObject({ status: z.literal("unavailable") }),
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

/** Mandatory shape of an entrance-limit refusal, including the continuation time. */
export const EntranceLimitProblem = ProblemDetails.extend({
  status: z.literal(429),
  code: z.literal("abuse-limit"),
  i18nKey: z.literal("problem_abuse_limit"),
  retryAt: z.iso.datetime(),
}).meta({ id: "EntranceLimitProblem" });
export type EntranceLimitProblem = z.infer<typeof EntranceLimitProblem>;
export const entranceLimitResponse = {
  description:
    "Entrance budget exhausted. Retry-After is whole seconds, rounded up; retryAt is the absolute continuation time. No Quota is consumed.",
  headers: z.object({ "Retry-After": z.string().regex(/^[0-9]+$/) }),
  content: { [PROBLEM_CONTENT_TYPE]: { schema: EntranceLimitProblem } },
};
/** Closed launch style/locale manifest (ADR-0011/0023); no renderer implementation. */
export const citationStyles = [
  { id: "apa", locale: "en-US" },
  { id: "mla", locale: "en-US" },
  { id: "chicago", locale: "en-US" },
  { id: "ieee", locale: "en-US" },
  { id: "vancouver", locale: "en-US" },
  { id: "harvard", locale: "en-GB" },
  { id: "acs", locale: "en-US" },
  { id: "ama", locale: "en-US" },
  { id: "oxford", locale: "en-GB" },
  { id: "springer", locale: "en-US" },
  { id: "din-iso-690", locale: "de-DE" },
] as const;
export const CitationStyle = z.enum(citationStyles.map((style) => style.id));
export type CitationStyle = z.infer<typeof CitationStyle>;
