// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { z } from "zod";
import {
  envelope,
  GuestBinding,
  Permission,
  Quota,
} from "../../contract-common/src/index.ts";
export * from "../../contract-common/src/index.ts";
/** No verification content, recipient, code or arbitrary message crosses this boundary.
 * Diagnostic only: explicitly enabled loopback rehearsal with a fixed .invalid SMTP sink.
 */
export const MailRehearsalRequest = z
  .strictObject({ language: z.enum(["de", "en"]) })
  .meta({ id: "MailRehearsalRequest" });
export const MailRehearsalResponse = envelope(
  z.object({
    id: z.uuid(),
    language: z.enum(["de", "en"]),
    status: z.enum(["queued", "sent"]),
  }),
).meta({ id: "MailRehearsalResponse" });
export const MailRehearsalParams = z.object({ id: z.uuid() });

/** Each call requires a distinct, request-bound program assertion, never a client token. */
export const AuthorityRequest = z.strictObject({
  ...GuestBinding.shape,
  permission: Permission,
  kind: z.enum(["request", "work"]),
});
export type AuthorityRequest = z.infer<typeof AuthorityRequest>;
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
export type AuthorityResponse = z.infer<typeof AuthorityResponse>;
/** Monotonic, durable, idempotent Owner fence. Completion drains guarded operations. */
export const AuthorityInvalidation = z.strictObject({
  guestContextId: z.uuid().optional(),
  ownerId: z.uuid(),
  actorId: z.uuid(),
  version: z.number().int().positive().safe(),
  cancelWork: z.boolean(),
});
export type AuthorityInvalidation = z.infer<typeof AuthorityInvalidation>;
export const AuthorityInvalidationAck = z.strictObject({
  ownerId: z.uuid(),
  version: z.number().int().positive().safe(),
});

/** ADR-0003: the Owner tombstone is durable and all of the Owner's content is
 * purged. The acknowledgement carries identifiers only and claims nothing about
 * History, which this program does not implement. */
export const OwnerDeletionParams = z.strictObject({ ownerId: z.uuid() });
export const OwnerDeletionAck = z.strictObject({
  ownerId: z.uuid(),
  tombstoned: z.literal(true),
});
export type OwnerDeletionAck = z.infer<typeof OwnerDeletionAck>;

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
export type AccountAuthorityRequest = z.infer<typeof AccountAuthorityRequest>;

/**
 * Quota protocol (ADR-0003, ADR-0004, ADR-0005). Only opaque identifiers, slot
 * positions and counts cross the boundary; never a verification payload. Every
 * call carries a distinct, request-bound program assertion.
 */
const QuotaOwner = {
  ownerId: z.uuid(),
  actorId: z.uuid(),
};
export const QuotaSnapshotRequest = z
  .strictObject(QuotaOwner)
  .meta({ id: "QuotaSnapshotRequest" });
export type QuotaSnapshotRequest = z.infer<typeof QuotaSnapshotRequest>;
export const QuotaSlotRef = z.strictObject({
  position: z.number().int().positive().safe(),
  /** Execution generation the reservation is taken for; stale releases are ignored. */
  generation: z.number().int().nonnegative().safe(),
});
export type QuotaSlotRef = z.infer<typeof QuotaSlotRef>;
export const QuotaReserveRequest = z
  .strictObject({
    ...QuotaOwner,
    checkId: z.uuid(),
    /** Idempotency key of this reservation; the same key replays the same result. */
    key: z.string().min(1).max(128),
    slots: z.array(QuotaSlotRef).min(1).max(2000),
  })
  .meta({ id: "QuotaReserveRequest" });
export type QuotaReserveRequest = z.infer<typeof QuotaReserveRequest>;
export const QuotaSettleRequest = z
  .strictObject({
    ...QuotaOwner,
    checkId: z.uuid(),
    position: z.number().int().positive().safe(),
    generation: z.number().int().nonnegative().safe(),
    /** `verdict` bills the slot once; `release` returns an unsettled reservation. */
    outcome: z.enum(["verdict", "release"]),
  })
  .meta({ id: "QuotaSettleRequest" });
export type QuotaSettleRequest = z.infer<typeof QuotaSettleRequest>;
export const QuotaReleaseRequest = z
  .strictObject({
    ...QuotaOwner,
    checkId: z.uuid(),
    /** Releases what the reservation with this key still holds. */
    key: z.string().min(1).max(128),
  })
  .meta({ id: "QuotaReleaseRequest" });
export type QuotaReleaseRequest = z.infer<typeof QuotaReleaseRequest>;
const quotaDenied = z.strictObject({
  outcome: z.literal("denied"),
  reason: z.enum(["revoked", "forbidden", "unknown"]),
});
export const QuotaSnapshotResponse = z
  .discriminatedUnion("outcome", [
    z.strictObject({ outcome: z.literal("granted"), quota: Quota }),
    quotaDenied,
  ])
  .meta({ id: "QuotaSnapshotResponse" });
export type QuotaSnapshotResponse = z.infer<typeof QuotaSnapshotResponse>;
export const QuotaReserveResponse = z
  .discriminatedUnion("outcome", [
    z.strictObject({
      outcome: z.literal("reserved"),
      /** Slot positions already billed: free, nothing reserved for them. */
      free: z.array(z.number().int().positive().safe()).max(2000),
      reserved: z.number().int().nonnegative().safe(),
      quota: Quota,
    }),
    z.strictObject({
      outcome: z.literal("insufficient"),
      available: z.number().int().nonnegative().safe(),
      required: z.number().int().positive().safe(),
      quota: Quota,
    }),
    quotaDenied,
  ])
  .meta({ id: "QuotaReserveResponse" });
export type QuotaReserveResponse = z.infer<typeof QuotaReserveResponse>;
export const QuotaSettleResponse = z
  .strictObject({
    outcome: z.enum(["debited", "released", "free", "forgiven", "ignored"]),
  })
  .meta({ id: "QuotaSettleResponse" });
export type QuotaSettleResponse = z.infer<typeof QuotaSettleResponse>;
export const QuotaReleaseResponse = z
  .strictObject({ released: z.number().int().nonnegative().safe() })
  .meta({ id: "QuotaReleaseResponse" });
export type QuotaReleaseResponse = z.infer<typeof QuotaReleaseResponse>;
