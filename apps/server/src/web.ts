// SPDX-License-Identifier: AGPL-3.0-or-later
// The web process: serves the /v1 HTTP API and the Check event streams.

import { createParser } from "@source-taster/core";
import { openWebsite } from "@source-taster/website/hosting";
import { serve } from "@hono/node-server";
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
  const app = createApp({
    structuring: createParser({ referenceLimit: config.referenceLimit }),
    events,
    heartbeatMs: config.sseHeartbeatMs,
    referenceLimit: config.referenceLimit,
    entitlements: standaloneEntitlements,
    checks: createCheckStore(db, boss),
  });
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
      ...(config.website?.mode === "preview" ? { hostname: "127.0.0.1" } : {}),
    },
    ({ port }) => {
      console.log(`web listening on http://localhost:${port}`);
    },
  );

  const shutdown = () => {
    server.close();
    void Promise.all([boss.stop(), events.close(), db.$disconnect()]).finally(
      () => process.exit(0),
    );
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
});
