// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./test",
  testMatch: "*.spec.ts",
  timeout: 30_000,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:5199", trace: "retain-on-failure" },
  webServer: {
    command: "pnpm examples",
    url: "http://127.0.0.1:5199",
    reuseExistingServer: false,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
