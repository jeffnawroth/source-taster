// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { z } from "zod";
import { envelope, GuestBinding, Permission, } from "../../contract-common/src/index.js";
export * from "../../contract-common/src/index.js";
/** No verification content, recipient, code or arbitrary message crosses this boundary.
 * Diagnostic only: explicitly enabled loopback rehearsal with a fixed .invalid SMTP sink.
 * Hosted entitlement/Quota routes remain unavailable until their signed-token implementation.
 */
export const MailRehearsalRequest = z
    .strictObject({ language: z.enum(["de", "en"]) })
    .meta({ id: "MailRehearsalRequest" });
export const MailRehearsalResponse = envelope(z.object({
    id: z.uuid(),
    language: z.enum(["de", "en"]),
    status: z.enum(["queued", "sent"]),
})).meta({ id: "MailRehearsalResponse" });
export const MailRehearsalParams = z.object({ id: z.uuid() });
/** Each call requires a distinct, request-bound program assertion, never a client token. */
export const AuthorityRequest = z.strictObject({
    ...GuestBinding.shape,
    permission: Permission,
    kind: z.enum(["request", "work"]),
});
export const AuthorityResponse = z
    .discriminatedUnion("allowed", [
    z.strictObject({
        allowed: z.literal(true),
        version: z.number().int().positive().safe(),
    }),
    z.strictObject({
        allowed: z.literal(false),
        reason: z.enum(["revoked", "forbidden", "unknown"]),
    }),
])
    .meta({ id: "AuthorityResponse" });
/** Monotonic, durable, idempotent Owner fence. Completion drains guarded operations. */
export const AuthorityInvalidation = z.strictObject({
    guestContextId: z.uuid().optional(),
    ownerId: z.uuid(),
    actorId: z.uuid(),
    version: z.number().int().positive().safe(),
    cancelWork: z.boolean(),
});
export const AuthorityInvalidationAck = z.strictObject({
    ownerId: z.uuid(),
    version: z.number().int().positive().safe(),
});
/** Stable Account binding; workers deliberately carry no client session secret. */
export const AccountAuthorityRequest = z
    .strictObject({
    actorId: z.uuid(),
    ownerId: z.uuid(),
    sessionId: z.uuid().optional(),
    permission: Permission,
    kind: z.enum(["request", "work"]),
})
    .refine((v) => v.kind !== "request" || !!v.sessionId);
/** Operator settings, not qualification evidence. Public and combined budgets are distinct.
 * Every entrance attempt counts, including denied attempts; no Quota is consumed. */
export const AbuseBudget = z.strictObject({
    limit: z.number().int().positive().max(1_000_000_000),
    windowMs: z.number().int().min(1000).max(86_400_000),
});
export const AbuseBudgets = z
    .strictObject({
    principal: z.record(z.string().min(1).max(80), AbuseBudget),
    guest: AbuseBudget,
    allGuests: AbuseBudget,
    origin: AbuseBudget,
})
    .refine((value) => {
    const windows = Object.values(value.principal).map((budget) => budget.windowMs);
    return windows.length > 0 && new Set(windows).size === 1;
}, {
    message: "All Plans share a principal window; changing Plan must not restart accounting.",
});
export const AbusePolicy = z
    .strictObject({
    version: z.string().min(1).max(80),
    cacheMs: z.number().int().min(1).max(30_000),
    public: AbuseBudgets,
    shared: AbuseBudgets,
})
    .meta({ id: "AbusePolicy" });
/** Trusted ingress already truncated and keyed-hashed. Never HTTP Origin or a raw IP.
 * One hash per distinct origin budget window; signer authenticates the ingress context. */
export const AbuseOrigin = z.strictObject({
    windowMs: AbuseBudget.shape.windowMs,
    windowStart: z.number().int().nonnegative().safe(),
    keyId: z.string().min(1).max(80),
    hash: z.string().regex(/^[a-f0-9]{64}$/),
});
export const AbuseEntrance = z
    .strictObject({
    requestId: z.uuid(),
    program: z.literal("verification"),
    policyVersion: z.string().min(1).max(80),
    principal: z
        .strictObject({
        ownerId: z.uuid(),
        actorId: z.uuid(),
        guestId: z.uuid().optional(),
        guestContextId: z.uuid().optional(),
        sessionId: z.uuid().optional(),
    })
        .refine((v) => !!v.guestContextId !== !!v.sessionId &&
        !!v.guestId === !!v.guestContextId)
        .nullable(),
    origins: z.array(AbuseOrigin).min(1).max(2),
})
    .meta({ id: "AbuseEntrance" });
/** Service resolves current Plan, never accepts a client Plan/allowance. It atomically
 * counts ALL shared dimensions across BOTH entrances, durably deduplicating requestId
 * for at most 24h. An inaccessible/unknown identity never reveals Account existence.
 * Policy mismatch/outage is 503; it is never an allow. No cached decisions/retries. */
export const AbuseDecision = z
    .discriminatedUnion("allowed", [
    z.strictObject({
        allowed: z.literal(true),
        policyVersion: z.string(),
        planId: z.string().min(1).max(80),
    }),
    z.strictObject({
        allowed: z.literal(false),
        planId: z.string().min(1).max(80),
        policyVersion: z.string(),
        retryAt: z.iso.datetime(),
    }),
])
    .meta({ id: "AbuseDecision" });
