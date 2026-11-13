// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { finalCaptureGate, detailCommit } from "../src/gate.ts";

const full = "0a1c6ac5cd13abb3f8c9fe818ea8fa708e17cf44";

await test("the final capture requires the D Reference detail, named by its full SHA", () => {
  assert.equal(detailCommit, full);
  assert.match(detailCommit, /^[0-9a-f]{40}$/u);
});

await test("final output is refused unless the required commit is an ancestor of HEAD", async () => {
  const asked: string[] = [];
  const refused = await finalCaptureGate((commit) => {
    asked.push(commit);
    return Promise.resolve(false);
  });
  assert.equal(refused.ok, false);
  assert.match(refused.reason, /0a1c6ac5/);
  assert.deepEqual(asked, [full]);
  assert.deepEqual(await finalCaptureGate(() => Promise.resolve(true)), {
    ok: true,
    reason: `${full} is an ancestor of HEAD`,
  });
});

await test("a failing git check closes the gate instead of opening it", async () => {
  const result = await finalCaptureGate(() =>
    Promise.reject(new Error("git unavailable")),
  );
  assert.equal(result.ok, false);
  assert.match(result.reason, /git unavailable/);
});
