// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
test("deployment guard refuses missing exact configuration and never starts deployment", () => {
  const r = spawnSync(process.execPath, ["apps/server/ops/deployment.mjs"], {
    env: { PATH: process.env.PATH },
    encoding: "utf8",
  });
  assert.equal(r.status, 78);
  assert.deepEqual(JSON.parse(r.stderr), { code: "deployment-refused" });
});
