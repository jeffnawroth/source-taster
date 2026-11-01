// SPDX-License-Identifier: AGPL-3.0-or-later
import { randomUUID } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const serverDir = fileURLToPath(new URL("../..", import.meta.url));

/** Test database connections; override in CI via environment. */
export function testDatabase() {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const app = new URL(
    process.env.DATABASE_TEST_URL ??
      "postgres://verification_test:verification_test@localhost:5433/source_taster_test",
  );
  app.username = `verification_test_${suffix}`;
  app.pathname = `/source_taster_test_${suffix}`;
  return {
    adminUrl:
      process.env.DATABASE_ADMIN_URL ??
      "postgres://postgres:postgres@localhost:5433/postgres",
    appUrl: app.toString(),
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
  options: { inheritEnv?: boolean; script?: string } = {},
): RunningProcess {
  // Provisioning credentials must not reach the application runtime. Full
  // environment inheritance is an explicit opt-in, never the fixture default.
  const baseEnv: Record<string, string | undefined> =
    options.inheritEnv === true
      ? { ...process.env }
      : { PATH: process.env.PATH };
  const child = spawn(process.execPath, [options.script ?? `src/${entry}.ts`], {
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
