// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
const port = process.env.SOURCE_TASTER_WEBSITE_E2E_PORT ?? "53115";
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    // Turbo owns the single build dependency. A second build here races the
    // app's website dependency and destroys shared source-delivery staging.
    command: `pnpm preview --port ${port}`,
    url: `${baseURL}/en/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  // Firefox and WebKit are an opt-in local run, not part of CI.
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    ...(process.env.SOURCE_TASTER_E2E_CROSS_BROWSER === "true"
      ? ([
          { name: "firefox", use: { browserName: "firefox" } },
          { name: "webkit", use: { browserName: "webkit" } },
        ] as const)
      : []),
  ],
});
