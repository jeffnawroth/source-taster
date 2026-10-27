// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vitest/config";

// Contract tests: real PostgreSQL, real `web` and `worker` processes, and only
// the published HTTP + SSE contract between the tests and the service.
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    globalSetup: ["test/global-setup.ts"],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
