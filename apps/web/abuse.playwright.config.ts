// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e-abuse",
  outputDir: "../../.tmp/100/browser-artifacts",
  workers: 1,
  timeout: 45000,
  use: { trace: "off" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
