// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { finalCaptureGate, requiredCommit } from "../src/gate.ts";

await test("the final capture requires the #212 review fix b588c9c", () => {
  assert.equal(requiredCommit, "b588c9c");
});

await test("final output is refused unless the required commit is an ancestor of HEAD", async () => {
  const asked: string[] = [];
  const refused = await finalCaptureGate((commit) => {
    asked.push(commit);
    return Promise.resolve(false);
  });
  assert.equal(refused.ok, false);
  assert.match(refused.reason, /b588c9c/);
  assert.deepEqual(asked, ["b588c9c"]);
  assert.deepEqual(await finalCaptureGate(() => Promise.resolve(true)), {
    ok: true,
    reason: "b588c9c is an ancestor of HEAD",
  });
});

await test("a failing git check closes the gate instead of opening it", async () => {
  const result = await finalCaptureGate(() =>
    Promise.reject(new Error("git unavailable")),
  );
  assert.equal(result.ok, false);
  assert.match(result.reason, /git unavailable/);
});
