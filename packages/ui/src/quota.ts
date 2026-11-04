// SPDX-License-Identifier: AGPL-3.0-or-later
// Quota decisions shared by every client. Pure: the server stays the authority,
// this only decides what to show and which choice to offer before a start.
import type { QuotaSlot } from "@source-taster/contract-verification/v2";

/** A Quota the service reports; the other slot values mean "no Quota applies here". */
export type OwnerQuota = Exclude<QuotaSlot, null | { status: string }>;

export function ownerQuota(slot: QuotaSlot | undefined): OwnerQuota | null {
  return slot && "remaining" in slot ? slot : null;
}

/** What the user has to decide before References start. */
export type StartPlan =
  | { kind: "unmetered" }
  | { kind: "fits"; required: number; remainingAfter: number }
  | { kind: "partial"; required: number; available: number };

/**
 * `required` Reference slots against the balance. Billed re-checks never come
 * through here: a new Check only ever starts new slots.
 */
export function planStart(
  required: number,
  quota: OwnerQuota | null,
): StartPlan {
  if (!quota) return { kind: "unmetered" };
  return required <= quota.remaining
    ? {
        kind: "fits",
        required,
        remainingAfter: quota.remaining - required,
      }
    : { kind: "partial", required, available: quota.remaining };
}

/** The share of all currently valid grants that is used up (0–100, whole percent). */
export function usedPercent(quota: OwnerQuota): number {
  if (quota.granted <= 0) return 100;
  return Math.min(
    100,
    Math.round(((quota.consumed + quota.reserved) / quota.granted) * 100),
  );
}
