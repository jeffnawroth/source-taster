// SPDX-License-Identifier: AGPL-3.0-or-later
// Loaded with `node --import` through NODE_OPTIONS by `withOrphanGuard`; see
// orphan-guard.ts for why. It never runs in the test runner itself.
import { isMainThread } from "node:worker_threads";
import { WATCH_ENV } from "./orphan-guard.ts";

const pollMs = 1000;
/** After SIGTERM, a child that has not exited by now is killed outright. */
const graceMs = 3000;

function alive(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM means the process exists but belongs to someone else.
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

const watched = (process.env[WATCH_ENV] ?? "")
  .split(",")
  .map(Number)
  .filter((pid) => Number.isInteger(pid) && pid > 0);

// Worker threads (vite, prisma, esbuild) inherit NODE_OPTIONS too; one guard
// per process is enough and a second would double the signals.
if (isMainThread && watched.length > 0) {
  // Compared with the value at startup, never with 1: init may be a
  // subreaper such as systemd or tini with another PID.
  const parent = process.ppid;
  const orphaned = () =>
    process.ppid !== parent || watched.some((pid) => !alive(pid));
  let leaving = false;
  const leave = () => {
    if (leaving) return;
    leaving = true;
    clearInterval(timer);
    // SIGTERM first so the child's own graceful shutdown runs, exactly as
    // when the runner stops it on purpose. The timers are unref'd so they
    // never keep a process alive that would otherwise exit by itself.
    process.kill(process.pid, "SIGTERM");
    setTimeout(() => process.kill(process.pid, "SIGKILL"), graceMs).unref();
  };
  const timer = setInterval(() => {
    if (orphaned()) leave();
  }, pollMs);
  timer.unref();
  if (orphaned()) leave();
}
