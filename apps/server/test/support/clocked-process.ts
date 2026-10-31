// SPDX-License-Identifier: AGPL-3.0-or-later
// Test composition only: a real process with an IPC-controlled domain clock.
import { once } from "node:events";
import { serve } from "@hono/node-server";
import { createParser } from "@source-taster/core";
import { createQueue } from "../../src/checks/queue.ts";
import { createCheckStore } from "../../src/checks/store.ts";
import { startWorkerRuntime } from "../../src/checks/worker-runtime.ts";
import { listenForEvents } from "../../src/checks/events.ts";
import { createPrisma } from "../../src/db/prisma.ts";
import { loadConfig } from "../../src/config.ts";
import { createApp } from "../../src/http/app.ts";
import { LOCAL_OWNER } from "../../src/entitlements.ts";
if (process.env.NODE_ENV !== "test" || !process.send)
  throw new Error("test-only");
const config = loadConfig();
let now = Number(process.env.TEST_CLOCK);
const options = {
  clock: { now: () => now },
  settings: {
    clientLeaseMs: Number(process.env.TEST_CLIENT_LEASE_MS ?? 10_000),
    claimMs: Number(process.env.TEST_WORKER_CLAIM_MS ?? 2_000),
    maxAttempts: 3,
  },
};
const db = createPrisma(config.databaseUrl);
const boss = await createQueue(config.databaseUrl);
const checks = createCheckStore(db, boss, options);
await checks.maintain();
let stop: () => void | Promise<void>;
if (process.argv[2] === "worker") {
  const runtime = await startWorkerRuntime(config, db, boss, options);
  stop = () => runtime.stop();
} else {
  const events = await listenForEvents(config.databaseUrl);
  const app = createApp({
    structuring: createParser({ referenceLimit: config.referenceLimit }),
    checks,
    events,
    heartbeatMs: 50,
    referenceLimit: config.referenceLimit,
    entitlements: {
      resolve: (request) =>
        Promise.resolve({
          ...LOCAL_OWNER,
          ownerId: request.headers.get("Test-Owner") ?? "local",
          can: (permission) => request.headers.get("Test-Deny") !== permission,
        }),
    },
  });
  const server = serve({
    fetch: app.fetch,
    hostname: "127.0.0.1",
    port: config.port,
  });
  await once(server, "listening");
  stop = async () => {
    server.close();
    await events.close();
  };
}
process.on("message", (message: { now: number; id: number }) => {
  now = message.now;
  void checks
    .maintain()
    .then(() => process.send!({ id: message.id }))
    .catch(() => process.send!({ id: message.id, error: true }));
});
process.send({ ready: true });
process.once("SIGTERM", () => {
  void Promise.resolve(stop())
    .then(() => boss.stop())
    .then(() => db.$disconnect())
    .finally(() => process.exit(0));
});
