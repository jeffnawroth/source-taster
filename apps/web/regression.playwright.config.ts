// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "@playwright/test";
// #216: hosted web + real verification API/worker on owned PostgreSQL; the private
// service exists only as the established HTTP-edge fixture.
export default defineConfig({
  testDir: "./e2e-regression",
  outputDir: "test-results-regression",
  timeout: 90000,
  workers: 1,
  use: { trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
