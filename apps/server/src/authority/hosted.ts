// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Context } from "hono";
import pg from "pg";
import {
  AuthorityResponse,
  AuthorityInvalidation,
  AuthorityInvalidationAck,
  OwnerDeletionAck,
  type GuestBinding,
  type AccountAuthorityRequest,
} from "@source-taster/contract-internal";
import type { CheckStore, WorkSubject } from "../checks/store.ts";
import type { Entitlements, Permission } from "../entitlements.ts";
import { fail } from "../http/problems.ts";
import { quotaClient } from "../quota/client.ts";
import type { QuotaPort } from "../quota/port.ts";
import {
  guestAccessTokens,
  requestAssertion,
  verifyInvalidation,
  verifyOwnerDeletion,
  type HostedSettings,
} from "./crypto.ts";
/** The one place the hosted-only internal mutations are mounted, so the deployed
 * web process and the source test process cannot drift apart. */
export function mountInternalRoutes(
  app: {
    post(path: string, handler: (c: Context) => Promise<Response>): unknown;
    delete(path: string, handler: (c: Context) => Promise<Response>): unknown;
  },
  authority: Pick<
    ReturnType<typeof hostedAuthority>,
    "invalidate" | "deleteOwner"
  >,
) {
  app.post("/internal/guest-authority/invalidate", async (c) =>
    c.json(await authority.invalidate(c.req.raw)),
  );
  app.delete("/internal/owners/:ownerId", async (c) =>
    c.json(
      await authority.deleteOwner(c.req.raw, c.req.param("ownerId") ?? ""),
    ),
  );
}
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
      // ADR-0003: a tombstoned Owner is refused even while the service, which may
      // not yet know, still answers allowed. Same lock as the deletion itself.
      const tombstone = await connection.query(
        "SELECT 1 FROM verification.owner_tombstones WHERE owner_id=$1::uuid",
        [binding.ownerId],
      );
      if (tombstone.rowCount) fail("forbidden");
      return operation();
    });
  }
  const quota = quotaClient(settings, clock);
  /** Hosted composition always carries the Quota port; standalone has none. */
  const entitlements: Entitlements & { quota: QuotaPort } = {
    quota,
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
    quota,
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
    async deleteOwner(request: Request, ownerId: string) {
      const token = request.headers
        .get("authorization")
        ?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
      if (!token) fail("unauthenticated");
      verifyOwnerDeletion(settings, token, ownerId, clock.now());
      if (!OwnerDeletionAck.shape.ownerId.safeParse(ownerId).success)
        fail("invalid-request");
      const id = ownerId.toLowerCase();
      // Tombstone and purge share one transaction (store); the Owner guard keeps
      // concurrent protected operations from interleaving with it. The ack is
      // returned only after both are durable.
      await locked(id, () => checks.deleteOwner(id));
      return OwnerDeletionAck.parse({ ownerId: id, tombstoned: true });
    },
    close: () => pool.end(),
  };
}
