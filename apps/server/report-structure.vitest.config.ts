// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vitest/config";
// Report structure suites that need neither PostgreSQL nor the web/worker
// processes, so no global fixture is started.
export default defineConfig({
  test: {
    include: ["test/report-structure.test.ts", "test/report-pdfua.test.ts"],
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
