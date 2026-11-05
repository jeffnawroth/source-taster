// SPDX-License-Identifier: AGPL-3.0-or-later
import { createServer } from "node:net";
import pg from "pg";
import { setupDatabase } from "../../scripts/db-setup.ts";
import {
  startProcess,
  testDatabase,
  waitForHealth,
  type RunningProcess,
} from "./processes.ts";

const maxPortAttempts = 4;

/** Asks the OS for a currently free port (bind 0, read it back, release). */
async function freePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, resolve);
  });
  const address = server.address();
  await new Promise((resolve) => server.close(resolve));
  if (address === null || typeof address === "string")
    throw new Error("Expected a TCP address for the free port");
  return address.port;
}

function isAddressInUse(error: unknown) {
  return error instanceof Error && error.message.includes("EADDRINUSE");
}

async function startupHealthy(
  apiUrl: string,
  web: RunningProcess,
  worker: RunningProcess,
) {
  await Promise.race([
    waitForHealth(apiUrl),
    ...[web, worker].map((p) =>
      p.exited.then((code) => {
        throw new Error(
          `Service exited with ${code} during startup:\n${p.output()}`,
        );
      }),
    ),
  ]);
  // A port held by another run is never accepted as this service's health.
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (web.child.exitCode !== null || worker.child.exitCode !== null)
    throw new Error("Test service failed to start");
}

/** Each run owns a fresh database and role; existing installations are untouched. */
export async function startTestService(
  port: number,
  delayMs = 50,
  extraEnv: Record<string, string> = {},
  /** Test-only composition replacing `src/web.ts`, e.g. one with a fake Quota. */
  options: { webScript?: string } = {},
) {
  const { adminUrl, appUrl } = testDatabase();
  const owned = new URL(appUrl);
  const cleanDatabase = async () => {
    const admin = new pg.Client({ connectionString: adminUrl });
    await admin.connect();
    try {
      await admin.query(
        `DROP DATABASE IF EXISTS ${admin.escapeIdentifier(owned.pathname.slice(1))} WITH (FORCE)`,
      );
      await admin.query(
        `DROP ROLE IF EXISTS ${admin.escapeIdentifier(owned.username)}`,
      );
    } finally {
      await admin.end();
    }
  };
  try {
    await setupDatabase(adminUrl, appUrl);
  } catch (error) {
    await cleanDatabase();
    throw error;
  }
  const env = {
    NODE_ENV: "test",
    SOURCE_TASTER_DOCUMENT_IMAGE:
      process.env.SOURCE_TASTER_DOCUMENT_IMAGE ?? "",
    SOURCE_TASTER_MODE: "standalone",
    DATABASE_URL: appUrl,
    SOURCE_TASTER_PORT: String(port),
    SOURCE_TASTER_PLACEHOLDER_DELAY_MS: String(delayMs),
    SOURCE_TASTER_SSE_HEARTBEAT_MS: "1000",
    ...extraEnv,
  };
  const launchWeb = () =>
    startProcess("web", env, { script: options.webScript });
  let web = launchWeb();
  let worker = startProcess("worker", env);
  const stopProcesses = () => Promise.all([web.stop(), worker.stop()]);
  const stop = async () => {
    await stopProcesses();
    await cleanDatabase();
  };
  let apiUrl = `http://127.0.0.1:${port}`;
  try {
    // The requested ports sit inside the OS ephemeral range, so any outgoing
    // socket of the test run may hold one. EADDRINUSE moves the service to a
    // freshly allocated free port instead of failing the run.
    for (let attempt = 1; ; attempt++) {
      try {
        await startupHealthy(apiUrl, web, worker);
        break;
      } catch (error) {
        if (attempt >= maxPortAttempts || !isAddressInUse(error)) throw error;
        await stopProcesses();
        env.SOURCE_TASTER_PORT = String(await freePort());
        apiUrl = `http://127.0.0.1:${env.SOURCE_TASTER_PORT}`;
        web = startProcess("web", env);
        worker = startProcess("worker", env);
      }
    }
  } catch (error) {
    await stop();
    console.error(String(error));
    throw error;
  }
  return {
    apiUrl,
    /** The fixture's owned database, for tests that inspect durable state. */
    adminUrl,
    appUrl,
    stop,
    // Actual process restart, retaining only this fixture's owned database.
    restart: async (changes: Record<string, string> = {}) => {
      await Promise.all([web.stop(), worker.stop()]);
      Object.assign(env, changes);
      web = launchWeb();
      worker = startProcess("worker", env);
      await waitForHealth(apiUrl);
    },
  };
}
