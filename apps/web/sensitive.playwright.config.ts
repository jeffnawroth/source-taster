// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
// #102 public phase: public web + public verification program on owned
// PostgreSQL; the private Account service exists only as an HTTP-edge fixture.
export default defineConfig({
  testDir: "./e2e-sensitive",
  outputDir: "test-results-sensitive",
  timeout: 90000,
  workers: 1,
  use: { trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
