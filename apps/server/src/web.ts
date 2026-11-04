import { serveStatic } from "@hono/node-server/serve-static";
import { resolve } from "node:path";
import { maintenanceNotice } from "../ops/maintenance.mjs";
import { operationalHealth } from "../ops/health.mjs";
import { assertRecoveryReleased } from "../ops/fence.mjs";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { mountDataSubjectDelivery } from "./exports/data-subject.ts";
// The web process: serves the /v1 HTTP API and the Check event streams.

import { createAbuseLimiter } from "./abuse/limiter.ts";
import { loadOriginSettings } from "./abuse/origin.ts";
import { ConfigError } from "./config.ts";
import { activeExtraction } from "./ai/activation.ts";
import { isolatedExtractor } from "./documents/supervisor.ts";
import { createParser } from "@source-taster/core";
import { openWebsite } from "@source-taster/website/hosting";
import { serve } from "@hono/node-server";
import { hostedAuthority, mountInternalRoutes } from "./authority/hosted.ts";
import { createQueue } from "./checks/queue.ts";
import { listenForEvents } from "./checks/events.ts";
import { createCheckStore } from "./checks/store.ts";
import { runMain } from "./config.ts";
import { createPrisma } from "./db/prisma.ts";
import { standaloneEntitlements } from "./entitlements.ts";
import { createApp } from "./http/app.ts";

await runMain(async (config) => {
  await assertRecoveryReleased(config.databaseUrl);
  const website = config.website
    ? await openWebsite(config.website.directory, config.website.mode)
    : undefined;
  const db = createPrisma(config.databaseUrl);
  const boss = await createQueue(config.databaseUrl);
  const events = await listenForEvents(config.databaseUrl);
  const checks = createCheckStore(db, boss, {
    settings: {
      contentRetentionMs: config.contentRetentionMs,
      clientLeaseMs: config.clientLeaseMs,
      claimMs: config.workerClaimMs,
    },
  });
  await checks.maintain();
  if (config.mode === "hosted" && !config.hosted)
    throw new ConfigError(
      "Hosted authority and abuse configuration are required.",
    );
  const authority =
    config.mode === "hosted" && config.hosted
      ? hostedAuthority(config.hosted, config.databaseUrl, checks)
      : undefined;
  // Deployable hosted activation remains gated in loadConfig (#94/#100).
  // Once qualified, it cannot silently omit either the service or ingress keys.
  const entrance =
    authority && config.hosted
      ? createAbuseLimiter(
          config.hosted,
          config.databaseUrl,
          loadOriginSettings(process.env.SOURCE_TASTER_ABUSE_ORIGIN_CONFIG),
        )
      : undefined;
  let maintaining = false;
  const maintenance = setInterval(() => {
    if (maintaining) return;
    maintaining = true;
    void checks
      .maintain()
      .catch(() =>
        console.error(JSON.stringify({ code: "lifecycle-maintenance-failed" })),
      )
      .finally(() => {
        maintaining = false;
      });
  }, 1000);
  const documentExtractor = isolatedExtractor(
    config.documentImage,
    config.documentLimits,
  );
  const app = createApp({
    entrance,
    structuring: createParser({ referenceLimit: config.referenceLimit }),
    extraction: await activeExtraction(),
    events,
    heartbeatMs: config.sseHeartbeatMs,
    referenceLimit: config.referenceLimit,
    entitlements: authority?.entitlements ?? standaloneEntitlements,
    checks,
    documentExtractor,
    documentConcurrency: config.documentLimits.concurrency,
    documentInputBytes: config.documentLimits.inputBytes,
  });
  const health = await operationalHealth(config.databaseUrl);
  app.get("/health/maintenance", async (c) => {
    c.header("Cache-Control", "no-store");
    try {
      return c.json(
        await maintenanceNotice(process.env.SOURCE_TASTER_MAINTENANCE_FILE),
      );
    } catch {
      return c.json({ state: "unknown" }, 503);
    }
  });
  app.get("/health/live", (c) => c.json({ status: "alive" }));
  app.get("/health/ready", async (c) => {
    const ready = await health.ready();
    return c.json(
      { status: ready ? "ready" : "unavailable" },
      ready ? 200 : 503,
    );
  });
  if (authority && config.hosted) {
    mountInternalRoutes(app, authority);
    mountDataSubjectDelivery(app, config.hosted, checks);
  }
  const webDirectory = process.env.SOURCE_TASTER_WEB_DIRECTORY;
  if (webDirectory) {
    const directory = resolve(webDirectory);
    app.get("/assets/*", serveStatic({ root: directory }));
    app.get("/", serveStatic({ path: resolve(directory, "index.html") }));
  }
  if (website) {
    // The website only answers what the API does not own (ADR-0020).
    const serveWebsite = website;
    app.get("*", async (c, next) => {
      if (/^\/(?:v\d+|health|internal)(?:\/|$)/.test(c.req.path)) return next();
      return serveWebsite(c.req.raw);
    });
  }
  const server = serve(
    {
      fetch: app.fetch,
      port: config.port,
      ...(config.doiPreview || config.website?.mode === "preview"
        ? { hostname: "127.0.0.1" }
        : {}),
    },
    ({ port }) => {
      console.log(`web listening on http://localhost:${port}`);
    },
  );

  const shutdown = () => {
    clearInterval(maintenance);
    server.close();
    void Promise.all([
      documentExtractor.close?.(),
      boss.stop(),
      events.close(),
      db.$disconnect(),
      health.close(),
      authority?.close(),
      entrance?.close(),
    ]).finally(() => process.exit(0));
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
});
