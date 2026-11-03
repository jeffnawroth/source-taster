import { AsyncLocalStorage } from "node:async_hooks";
import type { ExtractionPort } from "../ai/port.ts";
// SPDX-License-Identifier: AGPL-3.0-or-later
import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  ConfigurationInspection,
  ConfigurationInspectionResponse,
  ActiveConfigurationResponse,
  type ActiveConfiguration,
} from "@source-taster/contract-internal";
import type { Db } from "../db/prisma.ts";
import {
  requestAssertion,
  serviceAssertion,
  type HostedSettings,
} from "../authority/crypto.ts";
import { fail } from "../http/problems.ts";
import { measuredConfigurations } from "./activation.ts";
const path = "/internal/configuration/inspect";
const verify = serviceAssertion({
  purpose: "configuration-authority",
  method: "POST",
  path,
});
export function mountConfigurations(
  app: OpenAPIHono,
  db: Db,
  settings: HostedSettings,
  registry = measuredConfigurations(),
  clock = { now: Date.now },
) {
  app.post(path, async (c) => {
    const body = await c.req.text();
    if (body.length > 2048) fail("invalid-request");
    const token = c.req
      .header("authorization")
      ?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
    if (!token) fail("unauthenticated");
    const claims = verify(settings, token, body, clock.now());
    const parsed = ConfigurationInspection.safeParse(
      await c.req.json().catch(() => null),
    );
    if (!parsed.success) fail("invalid-request");
    // Atomic durable replay prevention spans restarts and all web processes.
    const consumed =
      await db.$executeRaw`INSERT INTO verification.configuration_assertions (id,expires_at) VALUES (${claims.jti}::uuid,${new Date(claims.exp * 1000)}) ON CONFLICT DO NOTHING`;
    if (!consumed) fail("unauthenticated");
    await db.$executeRaw`DELETE FROM verification.configuration_assertions WHERE expires_at<=${new Date(clock.now())}`;
    c.header("Cache-Control", "no-store");
    try {
      const configurations =
        parsed.data.action === "list"
          ? await registry.list()
          : [(await registry.resolve(parsed.data.id)).summary];
      return c.json(ConfigurationInspectionResponse.parse({ configurations }));
    } catch {
      return c.json({ code: "configuration-unavailable" }, 503);
    }
  });
}
export function configurationSelection(
  settings: HostedSettings,
  registry = measuredConfigurations(),
  clock = { now: Date.now },
) {
  const context = new AsyncLocalStorage<{
    active: ActiveConfiguration;
    port?: ExtractionPort;
  }>();
  async function available(): Promise<ActiveConfiguration> {
    const path = "/internal/configuration/active",
      body = "{}";
    try {
      const response = await fetch(`${settings.serviceOrigin}${path}`, {
        method: "POST",
        body,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${requestAssertion(settings, body, clock.now(), path)}`,
        },
        signal: AbortSignal.timeout(2000),
        redirect: "error",
        cache: "no-store",
      });
      if (!response.ok) throw new Error();
      const text = await response.text();
      if (text.length > 4096) throw new Error();
      const active = ActiveConfigurationResponse.parse(JSON.parse(text)).active;
      if (!active) throw new Error();
      return active;
    } catch {
      return fail("authority-unavailable");
    }
  }
  async function validate(active: ActiveConfiguration) {
    const found = await registry.resolve(active.id);
    if (
      !found.summary.eligible ||
      found.summary.evidenceDigest !== active.evidenceDigest
    )
      fail("authority-unavailable");
    return found;
  }
  async function current() {
    const active = context.getStore()?.active ?? (await available());
    const found = await validate(active);
    return { ...active, rulesVersion: found.summary.rulesVersion };
  }
  return {
    current,
    validate,
    available,
    identity: () => context.getStore()?.active.id ?? "unselected",
    extraction: () => context.getStore()?.port,
    async scope<T>(
      request: Request,
      operation: () => Promise<T>,
      stored?: ActiveConfiguration | null,
    ) {
      if (
        request.method !== "POST" ||
        !/^\/v[12]\/(?:checks$|structurings$|document-structurings$|checks\/[^/]+\/selection$)/.test(
          new URL(request.url).pathname,
        )
      )
        return operation();
      const active = stored ?? (await available());
      const found = await validate(active);
      return context.run({ active, port: found.port }, operation);
    },
  };
}
