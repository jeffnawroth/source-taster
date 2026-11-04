import { operationalHealth } from "../ops/health.mjs";
import { assertRecoveryReleased } from "../ops/fence.mjs";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { hostedAuthority } from "./authority/hosted.ts";
import { createCheckStore } from "./checks/store.ts";
import { createQueue } from "./checks/queue.ts";
import { startWorkerRuntime } from "./checks/worker-runtime.ts";
import { runMain } from "./config.ts";
import { createPrisma } from "./db/prisma.ts";
await runMain(async (config) => {
  await assertRecoveryReleased(config.databaseUrl);
  const db = createPrisma(config.databaseUrl);
  const boss = await createQueue(config.databaseUrl);
  const authority =
    config.mode === "hosted" && config.hosted
      ? hostedAuthority(
          config.hosted,
          config.databaseUrl,
          createCheckStore(db, boss),
        )
      : undefined;
  const runtime = await startWorkerRuntime(config, db, boss, {
    authority: authority?.work,
    quota: authority?.quota,
  });
  const health = await operationalHealth(config.databaseUrl);
  const stopPulse = health.pulse();
  console.log(JSON.stringify({ code: "worker-started" }));
  const shutdown = () => {
    runtime.stop();
    stopPulse();
    void health.close();
    void boss
      .stop()
      .then(() => authority?.close())
      .then(() => db.$disconnect())
      .finally(() => process.exit(0));
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
});
