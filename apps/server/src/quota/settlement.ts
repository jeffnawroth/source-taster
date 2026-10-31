// SPDX-License-Identifier: AGPL-3.0-or-later
// Drains durable settlement intents to the Quota journal. Delivery is signed,
// retried and idempotent at the service (debit key = Check + slot); an intent is
// marked delivered only after the service acknowledged it. Runs in the worker,
// outside every transaction and Owner fence, and also for cancelled or expired
// Checks whose content is already purged (the tombstone keeps the Owner binding).

import type { CheckStore } from "../checks/store.ts";
import type { QuotaPort } from "./port.ts";

export function settlementDrain(
  checks: CheckStore,
  quota: QuotaPort,
  options: { batch?: number; backoffMs?: number } = {},
) {
  let retryAt = 0;
  return async function drain(): Promise<number> {
    if (Date.now() < retryAt) return 0;
    let delivered = 0;
    for (const item of await checks.pendingSettlements(options.batch ?? 50)) {
      try {
        await quota.settle(
          { ownerId: item.ownerId, actorId: item.actorId },
          item.checkId,
          item.slot,
          item.outcome,
        );
        await checks.markSettled(item.checkId, item.slot);
        delivered++;
      } catch {
        // Keep order and stop hammering an unavailable service.
        retryAt = Date.now() + (options.backoffMs ?? 1000);
        break;
      }
    }
    return delivered;
  };
}
