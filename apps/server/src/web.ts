// SPDX-License-Identifier: AGPL-3.0-or-later
// The web process: serves the /v1 HTTP API and the Check event streams.

import { activeExtraction } from "./ai/activation.ts";
import { isolatedExtractor } from "./documents/supervisor.ts";
import { createParser } from "@source-taster/core";
import { openWebsite } from "@source-taster/website/hosting";
import { serve } from "@hono/node-server";
import { hostedAuthority } from "./authority/hosted.ts";
import { createQueue } from "./checks/queue.ts";
import { listenForEvents } from "./checks/events.ts";
import { createCheckStore } from "./checks/store.ts";
import { runMain } from "./config.ts";
import { createPrisma } from "./db/prisma.ts";
import { standaloneEntitlements } from "./entitlements.ts";
import { createApp } from "./http/app.ts";

await runMain(async (config) => {
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
  const authority =
    config.mode === "hosted" && config.hosted
      ? hostedAuthority(config.hosted, config.databaseUrl, checks)
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
  if (authority)
    app.post("/internal/guest-authority/invalidate", async (c) =>
      c.json(await authority.invalidate(c.req.raw)),
    );
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
      authority?.close(),
    ]).finally(() => process.exit(0));
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
});
