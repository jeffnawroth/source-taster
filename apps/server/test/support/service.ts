// SPDX-License-Identifier: AGPL-3.0-or-later
import pg from "pg";
import { setupDatabase } from "../../scripts/db-setup.ts";
import { startProcess, testDatabase, waitForHealth } from "./processes.ts";

/** Each run owns a fresh database and role; existing installations are untouched. */
export async function startTestService(
  port: number,
  delayMs = 50,
  extraEnv: Record<string, string> = {},
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
    SOURCE_TASTER_MODE: "standalone",
    DATABASE_URL: appUrl,
    SOURCE_TASTER_PORT: String(port),
    SOURCE_TASTER_PLACEHOLDER_DELAY_MS: String(delayMs),
    SOURCE_TASTER_SSE_HEARTBEAT_MS: "1000",
    ...extraEnv,
  };
  const web = startProcess("web", env);
  const worker = startProcess("worker", env);
  const stop = async () => {
    await Promise.all([web.stop(), worker.stop()]);
    await cleanDatabase();
  };
  const apiUrl = `http://127.0.0.1:${port}`;
  try {
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
  } catch (error) {
    await stop();
    console.error(String(error));
    throw error;
  }
  return { apiUrl, stop };
}
