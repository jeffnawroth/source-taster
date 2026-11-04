// SPDX-License-Identifier: AGPL-3.0-or-later
import { randomUUID } from "node:crypto";
import pg from "pg";
import {
  AbusePolicy,
  AbuseDecision,
  type AbuseEntrance,
} from "@source-taster/contract-internal";
import { requestAssertion, type HostedSettings } from "../authority/crypto.ts";
import type { Entitlements, Principal } from "../entitlements.ts";
import { fail, problemResponse } from "../http/problems.ts";
import { HTTPException } from "hono/http-exception";
import { OriginSettings, originForWindow } from "./origin.ts";
export interface EntranceLimiter {
  initial?(): Promise<AbusePolicy["initial"]>;
  enter(
    request: Request,
    peer: string | undefined,
    entitlements: Entitlements,
  ): Promise<void>;
}
/** Verification-only counters; combined counters are exclusively service-owned. */
export function createAbuseLimiter(
  settings: HostedSettings,
  databaseUrl: string,
  originInput: OriginSettings,
  clock = { now: Date.now },
) {
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 4,
    connectionTimeoutMillis: 2000,
  });
  let cached: { policy: AbusePolicy; until: number } | undefined;
  let pending: Promise<AbusePolicy> | undefined;
  async function post(path: string, value: unknown) {
    const body = JSON.stringify(value);
    const response = await fetch(`${settings.serviceOrigin}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${requestAssertion(settings, body, clock.now(), path)}`,
      },
      body,
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) throw new Error();
    // Bound the stream before parsing; never log the response or assertion.
    const reader = response.body?.getReader();
    if (!reader) throw new Error();
    const parts: Uint8Array[] = [];
    let bytes = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > 65536) throw new Error();
        parts.push(value);
      }
    } finally {
      await reader.cancel();
    }
    return JSON.parse(Buffer.concat(parts).toString()) as unknown;
  }
  async function policy() {
    if (cached && clock.now() < cached.until) return cached.policy;
    if (!pending)
      pending = (async () => {
        cached = undefined;
        const value = AbusePolicy.parse(
          await post("/internal/abuse/policy", {}),
        );
        cached = { policy: value, until: clock.now() + value.cacheMs };
        return value;
      })().finally(() => {
        pending = undefined;
      });
    return pending;
  }
  function deny(retry: number) {
    const response = problemResponse("abuse-limit");
    const headers = new Headers(response.headers);
    headers.set(
      "retry-after",
      String(Math.max(1, Math.ceil((retry - clock.now()) / 1000))),
    );
    headers.set("cache-control", "no-store");
    throw new HTTPException(429, {
      res: new Response(
        JSON.stringify({
          type: "urn:source-taster:problem:abuse-limit",
          title: "Too many requests.",
          status: 429,
          code: "abuse-limit",
          i18nKey: "problem_abuse_limit",
          retryAt: new Date(retry).toISOString(),
        }),
        { status: 429, headers },
      ),
    });
  }
  async function maintain() {
    const now = new Date(clock.now());
    await pool.query(
      "DELETE FROM verification.abuse_counters WHERE expires_at <= $1",
      [now],
    );
    await pool.query(
      "DELETE FROM verification.abuse_origin_windows WHERE expires_at <= $1",
      [now],
    );
  }
  let retentionHealthy = true;
  const ready = maintain().catch(() => {
    retentionHealthy = false;
  });
  const timer = setInterval(() => {
    void maintain()
      .then(() => {
        retentionHealthy = true;
      })
      .catch(() => {
        retentionHealthy = false;
        console.error(JSON.stringify({ code: "abuse-retention-unavailable" }));
      });
  }, 1000);
  timer.unref();
  return {
    async initial() {
      return (await policy()).initial;
    },
    async enter(
      request: Request,
      peer: string | undefined,
      entitlements: Entitlements,
    ) {
      let retryAt = 0;
      try {
        await ready;
        if (!retentionHealthy) throw new Error();
        const value = await policy();
        const now = clock.now();
        const originSettings = OriginSettings.parse(originInput);
        const origins = [
          ...new Set([
            value.public.origin.windowMs,
            value.shared.origin.windowMs,
          ]),
        ].map((w) => originForWindow(peer, originSettings, now, w));
        // This local resolution verifies signed binding only. Existing online authority
        // guards still run unchanged before every protected effect/output.
        let principal: Principal | null;
        try {
          principal = await entitlements.resolve(request);
        } catch (error) {
          if (!(error instanceof HTTPException) || error.status !== 401)
            throw error;
          principal = null;
        }
        const input: AbuseEntrance = {
          requestId: randomUUID(),
          program: "verification",
          policyVersion: value.version,
          principal: principal
            ? {
                ownerId: principal.ownerId,
                actorId: principal.actorId,
                ...(principal.guestContextId
                  ? {
                      guestContextId: principal.guestContextId,
                      guestId: principal.guestId,
                    }
                  : { sessionId: principal.sessionId }),
              }
            : null,
          origins: origins.map(
            ({ configuration: _configuration, ...origin }) => origin,
          ),
        };
        const shared = AbuseDecision.parse(
          await post("/internal/abuse/entrances", input),
        );
        if (shared.policyVersion !== value.version) throw new Error();
        if (!shared.allowed) {
          retryAt = Date.parse(shared.retryAt);
          if (retryAt <= now || retryAt > now + 86400000) throw new Error();
        }
        {
          const budgets = value.public;
          const plan = budgets.principal[shared.planId];
          if (!plan) throw new Error();
          const entries: { key: string; limit: number; end: number }[] = [];
          const add = (
            kind: string,
            subject: string,
            budget: { windowMs: number; limit: number },
          ) => {
            const start = Math.floor(now / budget.windowMs) * budget.windowMs;
            entries.push({
              key: JSON.stringify([kind, subject, budget.windowMs, start]),
              limit: budget.limit,
              end: start + budget.windowMs,
            });
          };
          if (principal) add("principal", principal.actorId, plan);
          if (principal?.guestContextId) {
            if (!principal.guestId) throw new Error();
            add("guest", principal.guestId, budgets.guest);
          }
          if (!principal || principal.guestContextId)
            add("all-guests", "all", budgets.allGuests);
          add(
            "origin",
            origins.find((o) => o.windowMs === budgets.origin.windowMs)!.hash,
            budgets.origin,
          );
          entries.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
          const connection = await pool.connect();
          try {
            await connection.query("BEGIN");
            await connection.query("SET LOCAL lock_timeout='2s'");
            // All origin window pins precede counters, in stable order on every instance.
            for (const origin of origins.sort(
              (a, b) => a.windowMs - b.windowMs,
            )) {
              const key = `${origin.windowMs}/${origin.windowStart}`;
              let result = await connection.query<{ configuration: string }>(
                "SELECT configuration FROM verification.abuse_origin_windows WHERE key=$1",
                [key],
              );
              if (!result.rows.length) {
                await connection.query(
                  "INSERT INTO verification.abuse_origin_windows(key,configuration,expires_at) VALUES($1,$2,$3) ON CONFLICT(key) DO NOTHING",
                  [
                    key,
                    origin.configuration,
                    new Date(origin.windowStart + origin.windowMs),
                  ],
                );
                result = await connection.query<{ configuration: string }>(
                  "SELECT configuration FROM verification.abuse_origin_windows WHERE key=$1",
                  [key],
                );
              }
              if (result.rows[0]?.configuration !== origin.configuration)
                throw new Error();
            }
            for (const entry of entries) {
              // PostgreSQL upsert serializes every increment, including across pools/processes.
              const result = await connection.query<{ count: string }>(
                "INSERT INTO verification.abuse_counters(key,count,expires_at) VALUES($1,1,$2) ON CONFLICT(key) DO UPDATE SET count=LEAST(abuse_counters.count+1,1000000001) RETURNING count",
                [entry.key, new Date(entry.end)],
              );
              if (Number(result.rows[0]!.count) > entry.limit)
                retryAt = Math.max(retryAt, entry.end);
            }
            await connection.query("COMMIT");
          } catch (error) {
            await connection.query("ROLLBACK");
            throw error;
          } finally {
            connection.release();
          }
        }
      } catch (error) {
        if (error instanceof HTTPException) throw error;
        fail("abuse-unavailable");
      }
      if (retryAt) deny(retryAt);
    },
    maintain,
    async close() {
      clearInterval(timer);
      await pool.end();
    },
  };
}
