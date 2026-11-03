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
  .refine(
    (value) => {
      const windows = Object.values(value.principal).map(
        (budget) => budget.windowMs,
      );
      return windows.length > 0 && new Set(windows).size === 1;
    },
    {
      message:
        "All Plans share a principal window; changing Plan must not restart accounting.",
    },
  );
export const AbusePolicy = z
  .strictObject({
    version: z.string().min(1).max(80),
    cacheMs: z.number().int().min(1).max(30_000),
    initial: z
      .strictObject({
        referenceLimit: z.number().int().min(1).max(1000),
        uploadBytes: z.number().int().min(1).max(20971520),
      })
      .optional(),
    public: AbuseBudgets,
    shared: AbuseBudgets,
  })
  .meta({ id: "AbusePolicy" });
export type AbusePolicy = z.infer<typeof AbusePolicy>;
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
      .refine(
        (v) =>
          !!v.guestContextId !== !!v.sessionId &&
          !!v.guestId === !!v.guestContextId,
      )
      .nullable(),
    origins: z.array(AbuseOrigin).min(1).max(2),
  })
  .meta({ id: "AbuseEntrance" });
export type AbuseEntrance = z.infer<typeof AbuseEntrance>;
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
export type AbuseDecision = z.infer<typeof AbuseDecision>;

/** #114 minimal configuration authority protocol. No corpus, recordings,
 * measurement outcomes, Check text or provider secrets cross this interface. */
export const ConfigurationId = z.string().regex(/^sha256:[a-f0-9]{64}$/);
export const MeasuredConfiguration = z.strictObject({
  provider: z
    .strictObject({
      path: z.string(),
      region: z.string(),
      countries: z.array(z.string()),
      zeroRetention: z.boolean(),
    })
    .nullable(),
  comparisonParameters: z.record(z.string(), z.number()),
  searchSettings: z.record(z.string(), z.unknown()),
  id: ConfigurationId,
  codeVersion: z.string().regex(/^[a-f0-9]{40}$/),
  configurationDigest: ConfigurationId,
  rulesVersion: z.string().min(1),
  model: z.string().nullable(),
  sources: z.array(z.string()),
  eligible: z.boolean(),
  reasons: z.array(z.string()),
  evidenceDigest: ConfigurationId,
  checkedAt: z.iso.datetime(),
});
export type MeasuredConfiguration = z.infer<typeof MeasuredConfiguration>;
export const ConfigurationInspection = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("list") }),
  z.strictObject({
    action: z.literal("validate"),
    id: ConfigurationId,
    evidenceDigest: ConfigurationId,
  }),
]);
export const ConfigurationInspectionResponse = z.strictObject({
  configurations: z.array(MeasuredConfiguration).max(100),
});
export const ActiveConfiguration = z.strictObject({
  id: ConfigurationId,
  evidenceDigest: ConfigurationId,
  operationId: z.uuid(),
  version: z.number().int().positive().safe(),
});
export type ActiveConfiguration = z.infer<typeof ActiveConfiguration>;
export const ActiveConfigurationResponse = z.strictObject({
  active: ActiveConfiguration.nullable(),
});

/** Recipient-only rights delivery. Opaque credential travels only from recipient to
 * verification and in a signed authority request; no content travels to service. */
export const RightsAuthorityRequest = z.strictObject({
  requestId: z.uuid(),
  accessToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  phase: z.enum(["authorize", "served", "delivered"]),
  completionVerifier: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  completionToken: z
    .string()
    .regex(/^[A-Za-z0-9_-]{43}$/)
    .optional(),
});
export const RightsAuthorityResponse = z.strictObject({
  requestId: z.uuid(),
  accountId: z.uuid(),
  ownerId: z.uuid(),
  expiresAt: z.iso.datetime(),
  purpose: z.literal("data-subject-delivery"),
});
