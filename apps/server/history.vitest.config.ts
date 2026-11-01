// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["test/history.contract.ts"],
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
