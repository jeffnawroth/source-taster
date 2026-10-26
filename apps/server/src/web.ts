// SPDX-License-Identifier: AGPL-3.0-or-later
// The web process: serves the /v1 HTTP API and the Check event streams.

import { serve } from "@hono/node-server";
import { createCheckStore } from "./checks/store.ts";
import { runMain } from "./config.ts";
import { createPrisma } from "./db/prisma.ts";
import { standaloneEntitlements } from "./entitlements.ts";
import { createApp } from "./http/app.ts";

await runMain((config) => {
  const db = createPrisma(config.databaseUrl);
  const app = createApp({
    entitlements: standaloneEntitlements,
    checks: createCheckStore(db),
  });
  const server = serve({ fetch: app.fetch, port: config.port }, ({ port }) => {
    console.log(`web listening on http://localhost:${port}`);
  });

  const shutdown = () => {
    server.close();
    void db.$disconnect().finally(() => process.exit(0));
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
});
