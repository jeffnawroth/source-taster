// SPDX-License-Identifier: AGPL-3.0-or-later
// Entitlement port (ADR-0015): who acts, for which Owner, with which
// permissions and Quota. This program owns its hosted transport/guard adapter;
// current Guest policy and signing authority belong to the private service.

import type { QuotaSlot } from "@source-taster/contract-common";
import type { QuotaPort } from "./quota/port.ts";

export type Permission =
  | "structuring:create"
  | "check:create"
  | "check:read"
  | "check:cancel"
  | "check:renew";

export interface Principal {
  guestId?: string;
  guestContextId?: string;
  sessionId?: string;
  expiresAt?: number;
  ownerId: string;
  actorId: string;
  can(permission: Permission): boolean;
  /** `null` when no Quota applies. */
  quota: QuotaSlot;
}

export interface Entitlements {
  /** Online decision followed by a durable Owner fence. No service cycle runs under that fence. */
  guard?<T>(
    principal: Principal,
    permission: Permission,
    operation: () => Promise<T>,
  ): Promise<T>;
  /** Hosted only: reserve/commit/release against the Owner's Quota. Standalone has none and never reserves. */
  quota?: QuotaPort;
  /** Resolves the acting Principal, or `null` when the request is not authenticated. */
  resolve(request: Request): Promise<Principal | null>;
}

/** The single local Owner of a standalone installation. */
export const LOCAL_OWNER: Principal = Object.freeze({
  ownerId: "local",
  actorId: "local",
  can: () => true,
  quota: null,
});

export const standaloneEntitlements: Entitlements = {
  resolve: () => Promise.resolve(LOCAL_OWNER),
};
