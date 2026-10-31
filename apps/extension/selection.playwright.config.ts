// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";

// Client-only intake owns its HTTP fixture; it needs no database or API server.
export default defineConfig({
  testDir: "./e2e-selection",
  outputDir: "./test-results-selection",
  timeout: 60_000,
  workers: 1,
});
