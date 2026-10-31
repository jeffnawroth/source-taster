// SPDX-License-Identifier: AGPL-3.0-or-later
import pg from "pg";
import {
  AuthorityResponse,
  AuthorityInvalidation,
  AuthorityInvalidationAck,
  type GuestBinding,
  type AccountAuthorityRequest,
} from "@source-taster/contract-internal";
import type { CheckStore, WorkSubject } from "../checks/store.ts";
import type { Entitlements, Permission } from "../entitlements.ts";
import { fail } from "../http/problems.ts";
import {
  guestAccessTokens,
  requestAssertion,
  verifyInvalidation,
  type HostedSettings,
} from "./crypto.ts";
export function hostedAuthority(
  settings: HostedSettings,
  databaseUrl: string,
  checks: CheckStore,
  clock = { now: Date.now },
) {
  // A separate bounded connection pool avoids nested Prisma transactions starving
  // one another. Lock order is always Owner guard -> Check, never the reverse.
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 25,
    connectionTimeoutMillis: 2000,
  });
  const tokens = guestAccessTokens(settings, clock);
  async function locked<T>(
    ownerId: string,
    operation: (connection: pg.PoolClient) => Promise<T>,
  ) {
    const connection = await pool.connect();
    try {
      await connection.query("BEGIN");
      await connection.query("SET LOCAL lock_timeout='3s'");
      await connection.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,96))",
        [ownerId],
      );
      const value = await operation(connection);
      await connection.query("COMMIT");
      return value;
    } catch (error) {
      await connection.query("ROLLBACK");
      throw error;
    } finally {
      connection.release();
    }
  }
  async function run<T>(
    binding:
      | GuestBinding
      | Pick<AccountAuthorityRequest, "ownerId" | "actorId" | "sessionId">,
    permission: Permission,
    kind: "request" | "work",
    expiresAt: number | undefined,
    operation: () => Promise<T>,
  ) {
    if (expiresAt !== undefined && expiresAt <= clock.now())
      fail("unauthenticated");
    const path =
      "guestContextId" in binding
        ? "/internal/guest-authority"
        : "/internal/account-authority";
    const body = JSON.stringify({ ...binding, permission, kind });
    let decision: AuthorityResponse;
    try {
      const response = await fetch(`${settings.serviceOrigin}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${requestAssertion(settings, body, clock.now(), path)}`,
        },
        body,
        redirect: "error",
        signal: AbortSignal.timeout(2000),
        cache: "no-store",
      });
      if (!response.ok) throw new Error();
      // Response is bounded and contains no verification content.
      const text = await response.text();
      if (text.length > 1024) throw new Error();
      decision = AuthorityResponse.parse(JSON.parse(text));
    } catch {
      fail("authority-unavailable");
    }
    if (!decision.allowed) fail("forbidden");
    const version = decision.version;
    return locked(binding.ownerId, async (connection) => {
      if (expiresAt !== undefined && expiresAt <= clock.now())
        fail("unauthenticated");
      const result = await connection.query<{ version: number }>(
        "SELECT version FROM verification.authority_fences WHERE owner_id=$1",
        [binding.ownerId],
      );
      if ((result.rows[0]?.version ?? 1) > version) fail("forbidden");
      return operation();
    });
  }
  const entitlements: Entitlements = {
    async resolve(request) {
      const token = request.headers
        .get("authorization")
        ?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
      if (!token) return null;
      const claims = await tokens.verify(token);
      return {
        ownerId: claims.ownerId,
        actorId: claims.sub,
        ...(claims.purpose === "guest-access"
          ? { guestContextId: claims.guestContextId }
          : { sessionId: claims.sessionId }),
        expiresAt: claims.exp * 1000,
        can: () => true,
        quota: { status: "not-implemented" },
      };
    },
    guard(principal, permission, operation) {
      if (!principal.guestContextId && !principal.sessionId)
        fail("unauthenticated");
      return run(
        {
          ownerId: principal.ownerId,
          actorId: principal.actorId,
          ...(principal.guestContextId
            ? { guestContextId: principal.guestContextId }
            : { sessionId: principal.sessionId }),
        },
        permission,
        "request",
        principal.expiresAt,
        operation,
      );
    },
  };
  return {
    entitlements,
    work: {
      async run<T>(
        attempt: WorkSubject,
        _boundary: string,
        operation: () => Promise<T>,
      ) {
        return run(
          {
            ownerId: attempt.ownerId,
            actorId: attempt.actorId,
            ...(attempt.guestContextId
              ? { guestContextId: attempt.guestContextId }
              : {}),
          },
          "check:create",
          "work",
          undefined,
          operation,
        );
      },
    },
    async invalidate(request: Request) {
      const body = await request.text();
      if (body.length > 2048) fail("invalid-request");
      const token = request.headers
        .get("authorization")
        ?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
      if (!token) fail("unauthenticated");
      verifyInvalidation(settings, token, body, clock.now());
      const input = AuthorityInvalidation.safeParse(JSON.parse(body));
      if (!input.success) fail("invalid-request");
      const value = input.data;
      return locked(value.ownerId, async (connection) => {
        const previous = await connection.query<{ version: number }>(
          "SELECT version FROM verification.authority_fences WHERE owner_id=$1",
          [value.ownerId],
        );
        const result = await connection.query<{ version: number }>(
          "INSERT INTO verification.authority_fences(owner_id,version) VALUES ($1,$2) ON CONFLICT(owner_id) DO UPDATE SET version=GREATEST(authority_fences.version,EXCLUDED.version) RETURNING version",
          [value.ownerId, value.version],
        );
        if (
          value.cancelWork &&
          value.version > (previous.rows[0]?.version ?? 0)
        )
          await checks.invalidateOwner(value.ownerId);
        return AuthorityInvalidationAck.parse({
          ownerId: value.ownerId,
          version: result.rows[0]!.version,
        });
      });
    },
    close: () => pool.end(),
  };
}
