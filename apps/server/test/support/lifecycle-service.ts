// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import pg from "pg";
import { setupDatabase } from "../../scripts/db-setup.ts";
import { testDatabase } from "./processes.ts";
export async function lifecycleService(env: Record<string, string>) {
  const { adminUrl, appUrl } = testDatabase();
  const port = process.env.SOURCE_TASTER_TEST_LIFECYCLE_PORT ?? "54182";
  await setupDatabase(adminUrl, appUrl);
  let now = Date.now(),
    sequence = 0;
  interface Process {
    child: ChildProcess;
    ready: Promise<void>;
    output(): string;
    clock(value: number): Promise<void>;
    kill(): Promise<void>;
  }
  const children: Process[] = [];
  function launch(kind: "web" | "worker"): Process {
    const child = spawn(
      process.execPath,
      ["test/support/clocked-process.ts", kind],
      {
        cwd: new URL("../..", import.meta.url),
        env: {
          PATH: process.env.PATH,
          ...env,
          NODE_ENV: "test",
          SOURCE_TASTER_MODE: "standalone",
          DATABASE_URL: appUrl,
          SOURCE_TASTER_PORT: port,
          SOURCE_TASTER_PLACEHOLDER_DELAY_MS: "0",
          TEST_CLOCK: String(now),
        },
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      },
    );
    let output = "";
    child.stdout!.on("data", (chunk) => {
      output += String(chunk);
    });
    child.stderr!.on("data", (chunk) => {
      output += String(chunk);
    });
    const ready = new Promise<void>((resolve, reject) => {
      child.on("message", (message: { ready?: boolean }) => {
        if (message.ready) resolve();
      });
      child.once("exit", () => reject(new Error(output)));
    });
    const result = {
      child,
      ready,
      output: () => output,
      clock: async (value: number) => {
        if (child.exitCode !== null || child.signalCode !== null) return;
        const id = ++sequence;
        await new Promise<void>((resolve) => {
          const receive = (message: { id: number }) => {
            if (message.id === id) {
              child.off("message", receive);
              resolve();
            }
          };
          child.on("message", receive);
          child.send({ now: value, id });
        });
      },
      kill: async () => {
        if (child.exitCode === null && child.signalCode === null) {
          const exited = once(child, "exit");
          child.kill("SIGKILL");
          await exited;
        }
      },
    };
    children.push(result);
    return result;
  }
  const web = launch("web");
  await web.ready;
  return {
    apiUrl: `http://127.0.0.1:${port}`,
    worker: () => launch("worker"),
    web,
    advance: async (ms: number, except: (typeof web)[] = []) => {
      now += ms;
      await Promise.all(
        children
          .filter((child) => !except.includes(child))
          .map((child) => child.clock(now)),
      );
    },
    stop: async () => {
      await Promise.all(children.map((child) => child.kill()));
      const admin = new pg.Client({ connectionString: adminUrl });
      await admin.connect();
      try {
        const owned = new URL(appUrl);
        await admin.query(
          `DROP DATABASE ${admin.escapeIdentifier(owned.pathname.slice(1))} WITH (FORCE)`,
        );
        await admin.query(
          `DROP ROLE ${admin.escapeIdentifier(owned.username)}`,
        );
      } finally {
        await admin.end();
      }
    },
  };
}
