// SPDX-License-Identifier: AGPL-3.0-or-later
// Starts the service the way it runs in production: a fresh database provisioned
// by db:setup, then separate `web` and `worker` processes.

import type { TestProject } from "vitest/node";
import pg from "pg";
import { setupDatabase } from "../scripts/db-setup.ts";
import {
  startProcess,
  testDatabase,
  waitForHealth,
} from "./support/processes.ts";

declare module "vitest" {
  export interface ProvidedContext {
    apiUrl: string;
  }
}

const PORT = 3101;

export default async function setup(project: TestProject) {
  const { adminUrl, appUrl } = testDatabase();
  await dropDatabase(adminUrl, new URL(appUrl).pathname.slice(1));
  await setupDatabase(adminUrl, appUrl);

  const env = {
    SOURCE_TASTER_MODE: "standalone",
    DATABASE_URL: appUrl,
    SOURCE_TASTER_PORT: String(PORT),
    SOURCE_TASTER_PLACEHOLDER_DELAY_MS: "50",
  };
  const web = startProcess("web", env);
  const worker = startProcess("worker", env);
  const apiUrl = `http://localhost:${PORT}`;
  const crashed = (name: string, p: typeof web) =>
    p.exited.then((code) => {
      throw new Error(
        `${name} exited with ${code} during startup:\n${p.output()}`,
      );
    });
  try {
    await Promise.race([
      waitForHealth(apiUrl),
      crashed("web", web),
      crashed("worker", worker),
    ]);
  } catch (error) {
    await Promise.all([web.stop(), worker.stop()]);
    // Vitest cannot source-map errors thrown from global setup; print plainly.
    console.error(String(error));
    throw error;
  }
  project.provide("apiUrl", apiUrl);

  return async () => {
    await Promise.all([web.stop(), worker.stop()]);
  };
}

async function dropDatabase(adminUrl: string, database: string) {
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    await admin.query(
      `DROP DATABASE IF EXISTS ${admin.escapeIdentifier(database)} WITH (FORCE)`,
    );
  } finally {
    await admin.end();
  }
}
