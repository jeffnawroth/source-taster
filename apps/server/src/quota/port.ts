// SPDX-License-Identifier: AGPL-3.0-or-later
// Quota port (ADR-0003/0004): the verification program asks the private service
// to reserve, commit and release per-Reference-slot Quota. Only opaque IDs,
// counts and slot positions cross this seam: never verification payloads.

import type { Quota } from "@source-taster/contract-common";

export interface SlotRef {
  position: number;
  generation: number;
}
export interface OwnerBinding {
  ownerId: string;
  actorId: string;
}
export interface Reservation {
  /** Slots that were already billed (free Re-checks). */
  free: number[];
  reserved: number;
  quota: Quota;
}
export type SettleOutcome = "verdict" | "release";

export interface QuotaPort {
  /** Fails closed: unavailable authority or a denied Owner throws a Problem. */
  snapshot(owner: OwnerBinding): Promise<Quota>;
  /** All-or-nothing. Throws {@link QuotaInsufficient} when the balance cannot cover the slots. */
  reserve(
    owner: OwnerBinding,
    checkId: string,
    key: string,
    slots: SlotRef[],
  ): Promise<Reservation>;
  /** Releases by reservation key. Never blocks on current authority. */
  release(owner: OwnerBinding, checkId: string, key: string): Promise<void>;
  /** Idempotent commit/release of one slot run; honored for any Owner state. */
  settle(
    owner: OwnerBinding,
    checkId: string,
    slot: SlotRef,
    outcome: SettleOutcome,
  ): Promise<void>;
}

export class QuotaInsufficient extends Error {
  readonly available: number;
  readonly required: number;
  constructor(available: number, required: number) {
    super("quota-insufficient");
    this.available = available;
    this.required = required;
  }
}
/** The billable slots changed between planning and the guarded operation. */
export class QuotaStale extends Error {}
