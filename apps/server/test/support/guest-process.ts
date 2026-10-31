// SPDX-License-Identifier: AGPL-3.0-or-later
// SOURCE-ONLY loopback integration. Never imported by src, scripts or build.
// Real uncalibrated DOI/core + lifecycle + service authority. No gate receipt.
import { serve } from "@hono/node-server";
import { once } from "node:events";
import { createParser } from "@source-taster/core";
import { createQueue } from "../../src/checks/queue.ts";
import { createCheckStore } from "../../src/checks/store.ts";
import { startWorkerRuntime } from "../../src/checks/worker-runtime.ts";
import { listenForEvents } from "../../src/checks/events.ts";
import { createPrisma } from "../../src/db/prisma.ts";
import { loadConfig } from "../../src/config.ts";
import { createApp } from "../../src/http/app.ts";
import { loadHostedSettings } from "../../src/authority/crypto.ts";
import { hostedAuthority } from "../../src/authority/hosted.ts";
if (process.env.NODE_ENV !== "test" || !process.send)
  throw new Error("source-test-only");
// The deployment loader keeps refusing hosted unmeasured execution. Only this
// source fixture composes development execution with the actual hosted adapter.
const config = loadConfig({ ...process.env, SOURCE_TASTER_MODE: "standalone" });
let now = Number(process.env.TEST_CLOCK);
const clock = { now: () => now };
const db = createPrisma(config.databaseUrl);
const boss = await createQueue(config.databaseUrl);
const checks = createCheckStore(db, boss, {
  clock,
  settings: {
    clientLeaseMs: config.clientLeaseMs,
    claimMs: config.workerClaimMs,
  },
});
const authority = hostedAuthority(
  loadHostedSettings(process.env.SOURCE_TASTER_AUTH_CONFIG),
  config.databaseUrl,
  checks,
  clock,
);
let stop: () => Promise<void>;
if (process.argv[2] === "worker") {
  const runtime = await startWorkerRuntime(config, db, boss, {
    clock,
    authority: authority.work,
    quota: authority.quota,
  });
  stop = () => {
    runtime.stop();
    return Promise.resolve();
  };
} else {
  const events = await listenForEvents(config.databaseUrl);
  const app = createApp({
    structuring: createParser({ referenceLimit: config.referenceLimit }),
    checks,
    events,
    heartbeatMs: 100,
    clock,
    referenceLimit: config.referenceLimit,
    entitlements: authority.entitlements,
  });
  app.post("/internal/guest-authority/invalidate", async (c) =>
    c.json(await authority.invalidate(c.req.raw)),
  );
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
  process.send!({ id: message.id });
});
process.send({ ready: true });
process.once("SIGTERM", () => {
  void stop()
    .then(() => authority.close())
    .then(() => boss.stop())
    .then(() => db.$disconnect())
    .finally(() => process.exit(0));
});
