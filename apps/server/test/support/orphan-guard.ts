// SPDX-License-Identifier: AGPL-3.0-or-later
// #326: a test child must not outlive the process that started it. When a
// runner dies without cleaning up (timeout, Ctrl-C, SIGKILL, an aborted
// agent), its web/worker/vite children are reparented and keep their Postgres
// connections for days. Every long-running node child of the test harness is
// therefore started through `withOrphanGuard`, which preloads
// `orphan-guard-preload.ts` into the child and tells it which processes to
// watch.
import { pathToFileURL } from "node:url";

/** Comma-separated PIDs of the processes the child must not outlive. */
export const WATCH_ENV = "SOURCE_TASTER_TEST_WATCH_PIDS";

const preload = pathToFileURL(
  new URL("./orphan-guard-preload.ts", import.meta.url).pathname,
).href;

/**
 * Returns `env` extended so that a node child started with it exits by itself
 * shortly after the calling process (or any process that guards the caller)
 * goes away. Pass the result as the child's `env`; every `process.execPath`
 * child gets the guard, including through `sh` and `pnpm` wrappers, because it
 * travels in the environment.
 *
 * A shell or package-manager wrapper between the runner and the child stays
 * alive when the runner is killed, so the child's parent PID does not change.
 * The watched PIDs close that gap: the child also exits once the runner itself
 * is gone. The list holds the caller followed by the caller's own watched
 * PIDs, so a guarded runner starting a guarded child keeps the whole chain.
 */
export function withOrphanGuard<T extends Record<string, string | undefined>>(
  env: T,
): T & { NODE_OPTIONS: string; [WATCH_ENV]: string } {
  const watched = [
    process.pid,
    ...(process.env[WATCH_ENV] ?? "")
      .split(",")
      .map(Number)
      .filter((pid) => Number.isInteger(pid) && pid > 0),
  ];
  const flag = `--import=${preload}`;
  const inherited = env.NODE_OPTIONS ?? "";
  return {
    ...env,
    NODE_OPTIONS: inherited.includes(flag)
      ? inherited
      : `${inherited} ${flag}`.trim(),
    [WATCH_ENV]: [...new Set(watched)].join(","),
  };
}
