// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
// Native #96 Guest acceptance against the actual both-program harness; each
// suite owns its API, peer authority, PostgreSQL databases and web origin.
export default defineConfig({
  testDir: "./e2e-guest",
  outputDir: "./test-results-guest",
  timeout: 180_000,
  workers: 1,
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
