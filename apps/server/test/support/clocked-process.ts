import { readFile } from "node:fs/promises";
import { ActiveConfiguration } from "@source-taster/contract-internal";
// SPDX-License-Identifier: AGPL-3.0-or-later
// Test composition only: a real process with an IPC-controlled domain clock.
import { once } from "node:events";
import { serve } from "@hono/node-server";
import { createParser } from "@source-taster/core";
import { createQueue } from "../../src/checks/queue.ts";
import { createCheckStore } from "../../src/checks/store.ts";
import { startWorkerRuntime } from "../../src/checks/worker-runtime.ts";
import { generateReport } from "../../src/reports/generate.ts";
import { setTimeout } from "node:timers/promises";
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
  // Controlled source-only pointer adapter; these values never qualify a build.
  ...(process.env.TEST_CONFIGURATION_POINTER
    ? {
        configuration: {
          current: async () => ({
            ...ActiveConfiguration.parse(
              JSON.parse(
                await readFile(process.env.TEST_CONFIGURATION_POINTER!, "utf8"),
              ),
            ),
            rulesVersion: "controlled-state-machine-only",
          }),
        },
      }
    : {}),
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
  const runtime = await startWorkerRuntime(config, db, boss, {
    clock: options.clock,
    settings: options.settings,
    ...(process.env.TEST_REPORT_RENDER_DELAY_MS
      ? {
          generateReport: async (input) => {
            await setTimeout(Number(process.env.TEST_REPORT_RENDER_DELAY_MS));
            return generateReport(input);
          },
        }
      : {}),
  });
  stop = () => runtime.stop();
} else {
  const events = await listenForEvents(config.databaseUrl);
  // Test composition: a Quota that grants the reports feature to every Owner.
  const quota = (remaining: number) => ({
    consumed: 0,
    remaining,
    granted: 1000,
    reserved: 1000 - remaining,
    warning: "none" as const,
    grants: [],
    features: ["verification-report"],
  });
  const app = createApp({
    structuring: createParser({ referenceLimit: config.referenceLimit }),
    checks,
    events,
    heartbeatMs: 50,
    referenceLimit: config.referenceLimit,
    entitlements: {
      ...(process.env.TEST_REPORT_FEATURE
        ? {
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
          }
        : {}),
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
