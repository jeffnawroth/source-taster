// SPDX-License-Identifier: AGPL-3.0-or-later
// Signed HTTP adapter of the Quota port. No call runs under the Owner fence or
// inside a store transaction; callers invoke it before and after them.

import {
  QuotaReleaseResponse,
  QuotaReserveResponse,
  QuotaSettleResponse,
  QuotaSnapshotResponse,
} from "@source-taster/contract-internal";
import type { Quota } from "@source-taster/contract-common";
import { fail } from "../http/problems.ts";
import { requestAssertion, type HostedSettings } from "../authority/crypto.ts";
import {
  QuotaInsufficient,
  type OwnerBinding,
  type QuotaPort,
  type SettleOutcome,
  type SlotRef,
} from "./port.ts";

export class QuotaTransportError extends Error {}

export function quotaClient(
  settings: HostedSettings,
  clock = { now: Date.now },
): QuotaPort {
  async function call(path: string, payload: unknown, limit = 4096) {
    const body = JSON.stringify(payload);
    let text: string;
    try {
      const response = await fetch(`${settings.serviceOrigin}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${requestAssertion(settings, body, clock.now(), path)}`,
        },
        body,
        redirect: "error",
        signal: AbortSignal.timeout(3000),
        cache: "no-store",
      });
      text = await response.text();
      if (response.status === 403 || response.status === 409)
        return { status: response.status, json: undefined as unknown };
      if (!response.ok || text.length > limit) throw new QuotaTransportError();
    } catch {
      throw new QuotaTransportError();
    }
    try {
      return { status: 200, json: JSON.parse(text) as unknown };
    } catch {
      throw new QuotaTransportError();
    }
  }
  /** Reserve and snapshot fail closed; they surface a Problem to the caller. */
  async function gated<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof QuotaTransportError) fail("authority-unavailable");
      throw error;
    }
  }
  return {
    snapshot: (owner: OwnerBinding) =>
      gated(async () => {
        const r = await call("/internal/quota/snapshot", owner);
        if (r.status !== 200) fail("forbidden");
        const view = QuotaSnapshotResponse.parse(r.json);
        if (view.outcome === "denied") fail("forbidden");
        return view.quota as Quota;
      }),
    reserve: (owner, checkId, key, slots) =>
      gated(async () => {
        const r = await call(
          "/internal/quota/reserve",
          {
            ...owner,
            checkId,
            key,
            slots,
          },
          65536,
        );
        if (r.status !== 200) fail("forbidden");
        const view = QuotaReserveResponse.parse(r.json);
        if (view.outcome === "denied") fail("forbidden");
        if (view.outcome === "insufficient")
          throw new QuotaInsufficient(view.available, view.required);
        return {
          free: view.free,
          reserved: view.reserved,
          quota: view.quota as Quota,
        };
      }),
    async release(owner, checkId, key) {
      const r = await call("/internal/quota/release", {
        ...owner,
        checkId,
        key,
      });
      if (r.status === 200) QuotaReleaseResponse.parse(r.json);
    },
    async settle(
      owner: OwnerBinding,
      checkId: string,
      slot: SlotRef,
      outcome: SettleOutcome,
    ) {
      const r = await call("/internal/quota/settle", {
        ...owner,
        checkId,
        position: slot.position,
        generation: slot.generation,
        outcome,
      });
      if (r.status !== 200) throw new QuotaTransportError();
      QuotaSettleResponse.parse(r.json);
    },
  };
}
