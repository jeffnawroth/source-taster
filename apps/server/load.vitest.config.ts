// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vitest/config";

// #117 load harness: pure measurement tests plus focused serial runs against
// real web/worker processes. No shared service: each run owns its database.
export default defineConfig({
  test: {
    include: ["test/load-*.test.ts", "test/load-*.load.ts"],
    fileParallelism: false,
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
