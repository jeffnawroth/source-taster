// SPDX-License-Identifier: AGPL-3.0-or-later
import type { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import { RightsAuthorityResponse } from "@source-taster/contract-internal";
import type { HostedSettings } from "../authority/crypto.ts";
import { requestAssertion } from "../authority/crypto.ts";
import type { CheckStore } from "../checks/store.ts";
import { fail } from "../http/problems.ts";
/** Direct recipient delivery only. The service sees authority/status metadata;
 * neither it nor an Operator receives, proxies or persists this payload. */
export function mountDataSubjectDelivery(
  app: OpenAPIHono,
  settings: HostedSettings,
  checks: CheckStore,
  clock = { now: Date.now },
) {
  const path = "/internal/data-subject-authority";
  app.use("/v1/data-subject/*", async (c, next) => {
    const origin = c.req.header("origin");
    if (origin === new URL(settings.serviceIssuer).origin) {
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Vary", "Origin");
      c.header("Access-Control-Allow-Headers", "Authorization");
      c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    }
    if (c.req.method === "OPTIONS") c.res = c.body(null, 204);
    else await next();
    c.header("Cache-Control", "no-store");
    c.header("Referrer-Policy", "no-referrer");
    c.header("X-Content-Type-Options", "nosniff");
  });
  app.get("/v1/data-subject/:id/download", async (c) => {
    const accessToken = c.req
      .header("authorization")
      ?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
    if (!accessToken) fail("unauthenticated");
    const requestId = z.uuid().safeParse(c.req.param("id"));
    if (!requestId.success) fail("invalid-request");
    async function authority(phase: "authorize" | "delivered") {
      const body = JSON.stringify({
        requestId: requestId.success ? requestId.data : "",
        accessToken,
        phase,
      });
      let response: Response;
      try {
        response = await fetch(settings.serviceOrigin + path, {
          method: "POST",
          redirect: "error",
          cache: "no-store",
          signal: AbortSignal.timeout(2000),
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${requestAssertion(settings, body, clock.now(), path)}`,
          },
          body,
        });
      } catch {
        fail("authority-unavailable");
      }
      if (!response.ok) {
        if (response.status >= 500) fail("authority-unavailable");
        fail("forbidden");
      }
      const bytes = await response.text();
      if (bytes.length > 2048) fail("authority-unavailable");
      const result = RightsAuthorityResponse.safeParse(JSON.parse(bytes));
      if (
        !result.success ||
        result.data.requestId !== requestId.data ||
        Date.parse(result.data.expiresAt) <= clock.now()
      )
        fail("forbidden");
      return result.data;
    }
    const allowed = await authority("authorize");
    const bytes = await checks.dataSubjectSnapshot(
      allowed.accountId,
      allowed.ownerId,
      async () => {
        const current = await authority("delivered");
        if (
          current.accountId !== allowed.accountId ||
          current.ownerId !== allowed.ownerId
        )
          fail("forbidden");
      },
    );
    c.header(
      "Content-Disposition",
      'attachment; filename="verification-data.json"',
    );
    return c.body(bytes, 200, { "Content-Type": "application/json" });
  });
}
