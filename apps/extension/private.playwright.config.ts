// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
// Both real programs and native extension contexts; external adapters only.
export default defineConfig({
  testDir: "./e2e-private",
  outputDir: "test-results-private",
  workers: 1,
  timeout: 90000,
});
