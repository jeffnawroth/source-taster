// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["test/rights.contract.ts"],
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 60000,
    // Real API/worker transitions must tolerate shared CI runner latency, as in
    // vitest.config.ts (#235).
    expect: { poll: { timeout: 15_000 } },
  },
});
