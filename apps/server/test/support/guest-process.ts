import { mountDataSubjectDelivery } from "../../src/exports/data-subject.ts";
// SPDX-License-Identifier: AGPL-3.0-or-later
// SOURCE-ONLY loopback integration. Never imported by src, scripts or build.
// Real uncalibrated DOI/core + lifecycle + service authority. No gate receipt.
import { createAbuseLimiter } from "../../src/abuse/limiter.ts";
import { loadOriginSettings } from "../../src/abuse/origin.ts";
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
import {
  hostedAuthority,
  mountInternalRoutes,
} from "../../src/authority/hosted.ts";
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
// Restore rehearsal (ADR-0005): expiry and tombstone sweeps finish before serving.
if (process.env.SOURCE_TASTER_TEST_MAINTAIN_ON_START === "1")
  await checks.maintain();
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
  const entrance = process.env.SOURCE_TASTER_ABUSE_ORIGIN_CONFIG
    ? createAbuseLimiter(
        loadHostedSettings(process.env.SOURCE_TASTER_AUTH_CONFIG),
        config.databaseUrl,
        loadOriginSettings(process.env.SOURCE_TASTER_ABUSE_ORIGIN_CONFIG),
        clock,
      )
    : undefined;
  const app = createApp({
    entrance,
    structuring: createParser({ referenceLimit: config.referenceLimit }),
    checks,
    events,
    heartbeatMs: 100,
    clock,
    referenceLimit: config.referenceLimit,
    entitlements: authority.entitlements,
  });
  mountInternalRoutes(app, authority);
  mountDataSubjectDelivery(
    app,
    loadHostedSettings(process.env.SOURCE_TASTER_AUTH_CONFIG),
    checks,
    clock,
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
    await entrance?.close();
  };
}
process.on(
  "message",
  (message: { now: number; id: number; maintain?: boolean }) => {
    now = message.now;
    if (message.maintain)
      void checks
        .maintain()
        .then(() => process.send!({ id: message.id }))
        .catch(() => process.send!({ id: message.id, error: true }));
    else process.send!({ id: message.id });
  },
);
process.send({ ready: true });
process.once("SIGTERM", () => {
  void stop()
    .then(() => authority.close())
    .then(() => boss.stop())
    .then(() => db.$disconnect())
    .finally(() => process.exit(0));
});
