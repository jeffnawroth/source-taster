// SPDX-License-Identifier: AGPL-3.0-or-later
// Reserve -> guarded operation -> release-on-failure around billable requests.
// Every service call here runs OUTSIDE the Owner guard and any store
// transaction. The 2 h reservation cap at the service is the crash backstop.

import { randomUUID } from "node:crypto";
import { fail } from "../http/problems.ts";
import {
  QuotaInsufficient,
  QuotaStale,
  type OwnerBinding,
  type QuotaPort,
  type SlotRef,
} from "./port.ts";

function insufficient(error: unknown): never {
  if (error instanceof QuotaInsufficient)
    fail("quota-insufficient", undefined, undefined, {
      available: error.available,
      required: error.required,
    });
  throw error;
}

/** `slots` of a new Check are always 1..count at generation 0. */
export function firstSlots(count: number): SlotRef[] {
  return Array.from({ length: count }, (_, i) => ({
    position: i + 1,
    generation: 0,
  }));
}

/** Reserves the slots for a new Check; the run releases them if it fails. */
export async function billedCreate<T>(
  quota: QuotaPort | undefined,
  owner: OwnerBinding,
  checkId: string,
  count: number,
  run: () => Promise<T>,
): Promise<T> {
  if (!quota) return run();
  const key = `create:${checkId}`;
  await quota
    .reserve(owner, checkId, key, firstSlots(count))
    .catch(insufficient);
  try {
    return await run();
  } catch (error) {
    await quota.release(owner, checkId, key).catch(() => {});
    throw error;
  }
}

/**
 * Billable changes to an existing Check. `plan` (read-only) names the slot runs
 * that need Quota; `run` receives exactly that set and must verify it inside its
 * transaction (QuotaStale -> release and re-plan once). Free work never reserves.
 */
export async function billedChange<T>(
  quota: QuotaPort | undefined,
  owner: OwnerBinding,
  checkId: string,
  plan: () => Promise<SlotRef[] | null>,
  run: (reserved: SlotRef[] | undefined) => Promise<T | null>,
  attempt = 0,
): Promise<T | null> {
  if (!quota) return run(undefined);
  const slots = (await plan()) ?? [];
  if (!slots.length) return run([]);
  const key = `change:${checkId}:${randomUUID()}`;
  await quota.reserve(owner, checkId, key, slots).catch(insufficient);
  try {
    const result = await run(slots);
    if (result === null)
      await quota.release(owner, checkId, key).catch(() => {});
    return result;
  } catch (error) {
    await quota.release(owner, checkId, key).catch(() => {});
    if (error instanceof QuotaStale && attempt < 1)
      return billedChange(quota, owner, checkId, plan, run, attempt + 1);
    if (error instanceof QuotaStale) fail("reference-conflict");
    throw error;
  }
}
