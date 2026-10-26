// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const serverDir = fileURLToPath(new URL("../..", import.meta.url));

/** Test database connections; override in CI via environment. */
export function testDatabase() {
  return {
    adminUrl:
      process.env.DATABASE_ADMIN_URL ??
      "postgres://postgres:postgres@localhost:5433/postgres",
    appUrl:
      process.env.DATABASE_TEST_URL ??
      "postgres://verification_app:verification_app@localhost:5433/source_taster_test",
  };
}

export interface RunningProcess {
  child: ChildProcess;
  /** Resolves with the exit code once the process has exited. */
  exited: Promise<number | null>;
  output: () => string;
  stop: () => Promise<void>;
}

/** Runs `src/<entry>.ts` like `pnpm web` / `pnpm worker` does. */
export function startProcess(
  entry: "web" | "worker",
  env: Record<string, string | undefined>,
  options: { inheritEnv?: boolean } = {},
): RunningProcess {
  const baseEnv: Record<string, string | undefined> =
    options.inheritEnv === false
      ? { PATH: process.env.PATH }
      : { ...process.env };
  const child = spawn(process.execPath, [`src/${entry}.ts`], {
    cwd: serverDir,
    env: { ...baseEnv, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk: Buffer) => (output += chunk.toString()));
  child.stderr.on("data", (chunk: Buffer) => (output += chunk.toString()));
  const exited = once(child, "exit").then(([code]) => code as number | null);
  return {
    child,
    exited,
    output: () => output,
    stop: async () => {
      if (child.exitCode !== null || child.signalCode !== null) return;
      child.kill("SIGTERM");
      await exited;
    },
  };
}

export async function waitForHealth(apiUrl: string, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`${apiUrl} did not become healthy within ${timeoutMs} ms`);
}
