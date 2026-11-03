// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e-rights",
  workers: 1,
  timeout: 60000,
  use: { trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
