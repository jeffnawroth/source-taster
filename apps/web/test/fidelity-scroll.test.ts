// SPDX-License-Identifier: AGPL-3.0-or-later
import test from "node:test";
import assert from "node:assert/strict";
import type { Browser } from "@playwright/test";
import {
  captureScrollCoverage,
  compareScrollCoverage,
  scrollOffsets,
  type ScrollRequest,
} from "../scripts/design-fidelity/scroll-coverage.ts";

await test("scroll coverage leaves no middle gap and reaches the exact end at native size", () => {
  for (const [height, viewport] of [
    [5000, 806],
    [5000, 860],
    [2000, 220],
    [809, 806],
  ]) {
    const offsets = scrollOffsets(height!, viewport!);
    assert.equal(offsets[0], 0);
    assert.equal(offsets.at(-1), height! - viewport!);
    for (let index = 1; index < offsets.length; index++) {
      assert.ok(offsets[index]! > offsets[index - 1]!);
      // At least half a viewport overlaps, protecting sticky detail headers.
      assert.ok(offsets[index]! - offsets[index - 1]! <= viewport! / 2);
    }
  }
  assert.deepEqual(scrollOffsets(400, 806), []);
  assert.throws(() => scrollOffsets(100, 0), /Invalid scroll geometry/);
});

await test("the capture driver visits every planned offset and restores its actual scroll position", async () => {
  let position = 93;
  const captured: number[] = [];
  const evaluate = (request: ScrollRequest) => {
    if (request.action === "move") position = request.offset!;
    if (request.action === "restore") position = request.positions![0]!.offset;
    return Promise.resolve([
      {
        key: "detail",
        scrollHeight: 5000,
        clientHeight: 806,
        initial: position,
      },
    ]);
  };
  const result = await captureScrollCoverage(
    evaluate,
    () => {
      captured.push(position);
      return Promise.resolve();
    },
    "/tmp",
    "fixture",
    false,
  );
  assert.deepEqual(captured, scrollOffsets(5000, 806));
  assert.equal(position, 93);
  assert.equal(result.complete, true);
  // Endpoint-only evidence would skip nine interior views of this detail.
  assert.ok(result.slices.length > 10);
});

await test("missing middle evidence fails instead of inheriting endpoint success", async () => {
  const source = {
    complete: true,
    roots: [],
    slices: [{ key: "detail-1", offset: 384, path: "/unused" }],
  };
  const built = { complete: true, roots: [], slices: [] };
  const result = await compareScrollCoverage(
    {} as Browser,
    source,
    built,
    "/tmp",
    "fixture",
  );
  assert.deepEqual(result.failures, [
    "Scroll coverage detail-1: missing built slice",
  ]);
  assert.deepEqual(result.comparisons, []);
});

await test("a browser that clamps a requested interior scroll cannot claim complete coverage", async () => {
  await assert.rejects(
    captureScrollCoverage(
      (request) =>
        Promise.resolve([
          {
            key: "detail",
            scrollHeight: 5000,
            clientHeight: 806,
            initial: request.action === "move" ? 0 : 93,
          },
        ]),
      async () => {},
      "/tmp",
      "fixture",
      false,
    ),
    /did not reach 384px/,
  );
});
