// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
// Ticket-owned ports. The server runs with a fake Quota that grants the
// report feature, because the real grant belongs to the private service.
const apiPort = process.env.SOURCE_TASTER_E2E_API_PORT ?? "5101";
const webPort = process.env.SOURCE_TASTER_E2E_WEB_PORT ?? "5102";
export default defineConfig({
  testDir: "./e2e-report",
  outputDir: "test-results-report",
  timeout: 90_000,
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm --filter @source-taster/server e2e:serve",
    env: {
      SOURCE_TASTER_E2E_API_PORT: apiPort,
      SOURCE_TASTER_E2E_WEB_PORT: webPort,
      SOURCE_TASTER_E2E_REPORTS: "granted",
    },
    url: `http://127.0.0.1:${webPort}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
