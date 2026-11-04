// SPDX-License-Identifier: AGPL-3.0-or-later
// Separate backup process. Never install/activate it as part of ordinary startup.
import { spawn } from "node:child_process";
const period = 6 * 3600000;
let child,
  timer,
  stopping = false;
function tick() {
  if (stopping) return;
  child = spawn(
    process.execPath,
    [new URL("./backup.mjs", import.meta.url).pathname, "export"],
    { env: process.env, stdio: ["ignore", "inherit", "inherit"] },
  );
  const next = () => {
    child = undefined;
    if (!stopping) timer = setTimeout(tick, period - (Date.now() % period));
  };
  child.once("error", () => {
    console.error(JSON.stringify({ code: "backup-scheduler-failed" }));
    process.exitCode = 1;
  });
  child.once("exit", next);
}
// UTC 00/06/12/18. Failures are visible in receipts and external monitoring;
// no hidden retries or overlapping exports.
timer = setTimeout(tick, period - (Date.now() % period));
for (const signal of ["SIGTERM", "SIGINT"])
  process.once(signal, () => {
    stopping = true;
    clearTimeout(timer);
    if (child) child.kill("SIGTERM");
  });
