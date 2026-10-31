// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
// Public phase only: the private session service is replaced at its HTTP edge.
export default defineConfig({
  testDir: "./e2e-account",
  outputDir: "test-results-account",
  timeout: 60000,
  workers: 1,
});
