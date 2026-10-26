// SPDX-License-Identifier: AGPL-3.0-or-later
// Entitlement port (ADR-0015): who acts, for which Owner, with which
// permissions and Quota. The hosted adapter lives in the private service; this
// repository ships the standalone adapter only.

import type { QuotaSlot } from "@source-taster/contract-common";

export type Permission = "check:create" | "check:read";

export interface Principal {
  ownerId: string;
  actorId: string;
  can(permission: Permission): boolean;
  /** `null` when no Quota applies. */
  quota: QuotaSlot;
}

export interface Entitlements {
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
