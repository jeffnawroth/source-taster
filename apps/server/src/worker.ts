// SPDX-License-Identifier: AGPL-3.0-or-later
// The worker process: runs Reference jobs from the queue.

import { runMain } from "./config.ts";

await runMain(() => {
  console.log("worker started");
  const keepAlive = setInterval(() => {}, 1 << 30);
  const shutdown = () => {
    clearInterval(keepAlive);
    process.exit(0);
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
});
