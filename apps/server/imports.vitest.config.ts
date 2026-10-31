// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vitest/config";
// These suites own their service/database; do not start the unused global fixture.
export default defineConfig({
  test: {
    include: [
      "test/imports.test.ts",
      "test/exports.test.ts",
      "test/corrections.test.ts",
    ],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
