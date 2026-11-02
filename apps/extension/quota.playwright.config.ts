// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e-private",
  testMatch: "quota.spec.ts",
  outputDir: "test-results-private",
  workers: 1,
  timeout: 90000,
});
