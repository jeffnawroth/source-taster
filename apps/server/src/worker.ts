// SPDX-License-Identifier: AGPL-3.0-or-later
import { setTimeout } from "node:timers/promises";
import {
  createQueue,
  REFERENCE_QUEUE,
  type ReferenceJob,
} from "./checks/queue.ts";
import { createCheckStore } from "./checks/store.ts";
import { runMain } from "./config.ts";
import { createPrisma } from "./db/prisma.ts";

await runMain(async (config) => {
  const db = createPrisma(config.databaseUrl);
  const boss = await createQueue(config.databaseUrl);
  const checks = createCheckStore(db, boss);
  await boss.work<ReferenceJob>(
    REFERENCE_QUEUE,
    {
      batchSize: 1,
      pollingIntervalSeconds: 0.5,
      notifyPollingIntervalSeconds: 0.5,
    },
    async (jobs) => {
      for (const { data } of jobs) {
        await setTimeout(config.placeholderDelayMs);
        // This skeleton performs no search: Not checked is a Status, never a Verdict.
        await checks.finishReference(data.checkId, data.slot);
      }
    },
  );
  console.log(JSON.stringify({ code: "worker-started" }));
  const shutdown = () => {
    void boss
      .stop()
      .then(() => db.$disconnect())
      .finally(() => process.exit(0));
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
});
