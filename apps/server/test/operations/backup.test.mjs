// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
const cli = new URL("../../ops/backup.mjs", import.meta.url);
test("backup CLI refuses absent configuration without exposing credentials", async () => {
  const child = spawn(process.execPath, [cli.pathname, "export"], {
    env: { PATH: process.env.PATH },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (b) => (output += b));
  const code = await new Promise((resolve) => child.on("exit", resolve));
  assert.equal(code, 78);
  assert.deepEqual(JSON.parse(output), {
    version: 1,
    complete: false,
    code: "backup-refused",
  });
});
