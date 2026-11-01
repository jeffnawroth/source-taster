// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e-history",
  outputDir: "./test-results-history",
  timeout: 90000,
  workers: 1,
});
