// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e-preferences",
  outputDir: "test-results-account",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT ?? 5381}`,
  },
  webServer: {
    command: "pnpm exec vite --config preferences-web.vite.config.ts",
    url: `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT ?? 5381}`,
    reuseExistingServer: false,
  },
});
