import {
  deliveryBody,
  deliveryCursor,
  jsonTokens,
  partLimit,
} from "@source-taster/contract-internal/delivery";
import { createHash, randomUUID } from "node:crypto";
// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  downloadDataSubject,
  acknowledgeDataSubject,
} from "@source-taster/contract-verification/data-subject-routes";
import type { Context } from "hono";
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
  app.openAPIRegistry.registerPath(downloadDataSubject);
  app.openAPIRegistry.registerPath(acknowledgeDataSubject);
  const path = "/internal/data-subject-authority";
  app.use("/v1/data-subject/*", async (c, next) => {
    const origin = c.req.header("origin");
    if (origin === new URL(settings.serviceIssuer).origin) {
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Vary", "Origin");
      c.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
      c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    }
    if (c.req.method === "OPTIONS") c.res = c.body(null, 204);
    else await next();
    c.header("Cache-Control", "no-store");
    c.header("Referrer-Policy", "no-referrer");
    c.header("X-Content-Type-Options", "nosniff");
  });
  async function authority(
    c: Context,
    phase: "authorize" | "served" | "delivered",
    completion?: { completionVerifier?: string; completionToken?: string },
  ) {
    const accessToken = c.req
      .header("authorization")
      ?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
    if (!accessToken) fail("unauthenticated");
    const requestId = z.uuid().safeParse(c.req.param("id"));
    if (!requestId.success) fail("invalid-request");

    const body = JSON.stringify({
      requestId: requestId.success ? requestId.data : "",
      accessToken,
      phase,
      ...completion,
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
  app.get("/v1/data-subject/:id/download", async (c) => {
    const allowed = await authority(c, "authorize");
    const credential = c.req.header("authorization")!;
    const exported = await checks.dataSubjectStream(
      allowed.requestId,
      allowed.accountId,
      allowed.ownerId,
      credential,
      allowed.expiresAt,
      c.req.query("restart") ??
        (c.req.query("parts") === "1" ? undefined : randomUUID()),
    );
    const context = {
      records: exported.records,
      snapshotId: exported.snapshot.id,
      requestId: allowed.requestId,
      program: "verification" as const,
      generatedAt: exported.snapshot.createdAt.toISOString(),
      expiresAt: allowed.expiresAt,
      credentialHash: createHash("sha256").update(credential).digest("hex"),
    };
    const cursor = c.req.query("cursor");
    try {
      deliveryCursor(settings.internalKey.pem, context, cursor);
    } catch {
      fail("forbidden");
    }
    const validate = async () => {
      const current = await authority(c, "authorize");
      if (
        current.accountId !== allowed.accountId ||
        current.ownerId !== allowed.ownerId
      )
        fail("forbidden");
      await exported.validate();
    };
    await validate();
    const multipart = c.req.query("parts") === "1";
    const bytes = deliveryBody({
      source: jsonTokens(exported.document),
      context,
      secret: settings.internalKey.pem,
      partBytes: partLimit(process.env.SOURCE_TASTER_EXPORT_PART_BYTES),
      multipart,
      cursor,
      validate,
      completed: async (completionVerifier) => {
        if (multipart) await authority(c, "served", { completionVerifier });
      },
    });
    c.header(
      "Content-Disposition",
      'attachment; filename="verification-data.json"',
    );
    return new Response(bytes, {
      status: 200,
      headers: {
        ...Object.fromEntries(c.res.headers),
        "Content-Type": multipart ? "application/x-ndjson" : "application/json",
      },
    });
  });
  app.post("/v1/data-subject/:id/received", async (c) => {
    const input = z
      .object({ completionToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/) })
      .safeParse(await c.req.json().catch(() => null));
    if (!input.success) fail("forbidden");
    const received = await authority(c, "delivered", input.data);
    return c.json({
      requestId: received.requestId,
      part: "verification",
      received: true,
    });
  });
}
