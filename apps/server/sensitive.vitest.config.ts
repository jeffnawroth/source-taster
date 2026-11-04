// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["test/sensitive.contract.ts"],
    testTimeout: 90000,
    fileParallelism: false,
  },
});
