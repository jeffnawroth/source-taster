// SPDX-License-Identifier: AGPL-3.0-or-later
import { referenceExecution } from "./checks/verification-runtime.ts";
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
  const verify = referenceExecution(config, db);
  await boss.work<ReferenceJob>(
    REFERENCE_QUEUE,
    {
      batchSize: 1,
      pollingIntervalSeconds: 0.5,
      notifyPollingIntervalSeconds: 0.5,
    },
    async (jobs) => {
      for (const { data } of jobs) {
        const startedAt = Date.now();
        await setTimeout(config.placeholderDelayMs);
        const input = await checks.input(data.checkId, data.slot);
        if (!input) {
          // Slots queued by the older skeleton have no structured input.
          // Preserve its honest Not checked outcome rather than stranding them.
          await checks.finishReference(data.checkId, data.slot, {
            kind: "status",
            status: "not-checked",
          });
          continue;
        }
        try {
          const outcome = config.doiPreview
            ? await verify(input, { startedAt })
            : { kind: "status" as const, status: "not-checked" as const };
          await checks.finishReference(data.checkId, data.slot, outcome);
        } catch {
          console.error(
            JSON.stringify({
              code: "reference-failed",
              checkId: data.checkId,
              slot: data.slot,
            }),
          );
          await checks.finishReference(data.checkId, data.slot, {
            kind: "status",
            status: "failed",
          });
        }
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
