// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
// Owned ports, distinct from the web suites' defaults. The same API and
// bibliographic fixtures serve the web client for parity comparisons.
const apiPort = process.env.SOURCE_TASTER_E2E_API_PORT ?? "3192";
const webPort = process.env.SOURCE_TASTER_E2E_WEB_PORT ?? "5192";
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  timeout: 90_000,
  workers: 1,
  use: { baseURL: `http://127.0.0.1:${webPort}`, trace: "retain-on-failure" },
  webServer: {
    command: "pnpm --filter @source-taster/server e2e:serve",
    env: {
      SOURCE_TASTER_E2E_API_PORT: apiPort,
      SOURCE_TASTER_E2E_WEB_PORT: webPort,
      SOURCE_TASTER_E2E_BIBLIOGRAPHIC: "true",
    },
    url: `http://127.0.0.1:${webPort}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
