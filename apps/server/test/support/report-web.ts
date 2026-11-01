// SPDX-License-Identifier: AGPL-3.0-or-later
// Test composition only: the web process with a fake Quota. The private
// service owns the real report feature grant; browser tests cannot reach it, so
// this stands in for it and nothing else. TEST_REPORT_FEATURE=none withholds
// the grant.
import { once } from "node:events";
import { serve } from "@hono/node-server";
import { createParser } from "@source-taster/core";
import { createQueue } from "../../src/checks/queue.ts";
import { createCheckStore } from "../../src/checks/store.ts";
import { listenForEvents } from "../../src/checks/events.ts";
import { createPrisma } from "../../src/db/prisma.ts";
import { loadConfig } from "../../src/config.ts";
import { createApp } from "../../src/http/app.ts";
import {
  reportFeature,
  standaloneEntitlements,
} from "../../src/entitlements.ts";
if (process.env.NODE_ENV !== "test") throw new Error("test-only");
const config = loadConfig();
const db = createPrisma(config.databaseUrl);
const boss = await createQueue(config.databaseUrl);
const events = await listenForEvents(config.databaseUrl);
const checks = createCheckStore(db, boss, {
  settings: {
    clientLeaseMs: config.clientLeaseMs,
    claimMs: config.workerClaimMs,
  },
});
await checks.maintain();
const features =
  process.env.TEST_REPORT_FEATURE === "none" ? [] : [reportFeature];
const quota = (remaining: number) => ({
  consumed: 0,
  remaining,
  granted: 1000,
  reserved: 1000 - remaining,
  warning: "none" as const,
  grants: [],
  features,
});
const app = createApp({
  structuring: createParser({ referenceLimit: config.referenceLimit }),
  events,
  heartbeatMs: config.sseHeartbeatMs,
  referenceLimit: config.referenceLimit,
  checks,
  entitlements: {
    ...standaloneEntitlements,
    quota: {
      snapshot: () => Promise.resolve(quota(1000)),
      reserve: (_owner, _checkId, _key, slots) =>
        Promise.resolve({
          free: [],
          reserved: slots.length,
          quota: quota(1000 - slots.length),
        }),
      release: async () => {},
      settle: async () => {},
    },
  },
});
const server = serve({
  fetch: app.fetch,
  hostname: "127.0.0.1",
  port: config.port,
});
await once(server, "listening");
const maintenance = setInterval(
  () => void checks.maintain().catch(() => {}),
  1000,
);
process.once("SIGTERM", () => {
  clearInterval(maintenance);
  server.close();
  void Promise.all([boss.stop(), events.close(), db.$disconnect()]).finally(
    () => process.exit(0),
  );
});
