// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["test/quota.contract.ts"],
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 90000,
  },
});
