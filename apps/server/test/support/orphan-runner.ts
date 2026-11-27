// SPDX-License-Identifier: AGPL-3.0-or-later
// Test fixture for orphan-guard.test.ts: a runner-like parent that starts a
// guarded child sharing its stdout, then waits to be killed.
//   argv[2] "direct": the child is the runner's own child.
//   argv[2] "shell":  a `sh` wrapper sits between runner and child and stays
//                     alive after the runner dies, like `pnpm` under Playwright.
// argv[3] names the child behaviour: "graceful" or "stubborn".
import { spawn } from "node:child_process";
import { withOrphanGuard } from "./orphan-guard.ts";

const [, , mode, behaviour = "graceful"] = process.argv;
const child = new URL("./orphan-child.ts", import.meta.url).pathname;
const env = withOrphanGuard({ PATH: process.env.PATH, BEHAVIOUR: behaviour });
if (mode === "shell")
  spawn("sh", ["-c", 'node "$0"; exit 0', child], {
    env,
    stdio: ["ignore", "inherit", "inherit"],
  });
else
  spawn(process.execPath, [child], {
    env,
    stdio: ["ignore", "inherit", "inherit"],
  });
setInterval(() => {}, 1000);
