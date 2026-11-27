// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
import { withOrphanGuard } from "../server/test/support/orphan-guard.ts";
export default defineConfig({
  testDir: "./e2e-preferences",
  outputDir: "test-results-account",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT ?? 5381}`,
  },
  webServer: {
    env: withOrphanGuard({ NODE_OPTIONS: process.env.NODE_OPTIONS }),
    command: "pnpm exec vite --config preferences-web.vite.config.ts",
    url: `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT ?? 5381}`,
    reuseExistingServer: false,
  },
});
