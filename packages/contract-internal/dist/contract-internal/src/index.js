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
