// SPDX-License-Identifier: AGPL-3.0-or-later
// The web process: serves the /v1 HTTP API and the Check event streams.

import { createParser } from "@source-taster/core";
import { serve } from "@hono/node-server";
import { createQueue } from "./checks/queue.ts";
import { listenForEvents } from "./checks/events.ts";
import { createCheckStore } from "./checks/store.ts";
import { runMain } from "./config.ts";
import { createPrisma } from "./db/prisma.ts";
import { standaloneEntitlements } from "./entitlements.ts";
import { createApp } from "./http/app.ts";

await runMain(async (config) => {
  const db = createPrisma(config.databaseUrl);
  const boss = await createQueue(config.databaseUrl);
  const events = await listenForEvents(config.databaseUrl);
  const app = createApp({
    structuring: createParser({ referenceLimit: config.referenceLimit }),
    events,
    heartbeatMs: config.sseHeartbeatMs,
    entitlements: standaloneEntitlements,
    checks: createCheckStore(db, boss),
  });
  const server = serve({ fetch: app.fetch, port: config.port }, ({ port }) => {
    console.log(`web listening on http://localhost:${port}`);
  });

  const shutdown = () => {
    server.close();
    void Promise.all([boss.stop(), events.close(), db.$disconnect()]).finally(
      () => process.exit(0),
    );
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
});
