// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
await rm(new URL("../dist", import.meta.url), { recursive: true, force: true });
const result = spawnSync("tsc", ["-p", "tsconfig.build.json"], {
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);
await import("./openapi.ts");
