// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e-ai",
  outputDir: "./test-results-ai",
  timeout: 60000,
  workers: 1,
});
