// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
const baseURL = `http://127.0.0.1:${process.env.SOURCE_TASTER_E2E_WEB_PORT ?? "5174"}`;
export default defineConfig({
  testDir: "./e2e-bibliographic",
  outputDir: "./test-results-bibliographic",
  timeout: 30000,
  workers: 1,
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    command:
      "SOURCE_TASTER_E2E_BIBLIOGRAPHIC=true pnpm --filter @source-taster/server e2e:serve",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
