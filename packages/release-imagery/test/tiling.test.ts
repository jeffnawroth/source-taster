// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { isTiledCapture, type Rgba } from "../src/tiling.ts";

const image = (paint: (x: number, y: number) => number): Rgba => {
  const width = 960;
  const height = 1800;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const v = paint(x, y);
      data.set([v, v, v, 255], (y * width + x) * 4);
    }
  return { width, height, data };
};

await test("a panel repeated as a grid of tiles is detected, a clean panel is not", () => {
  const unit = (x: number, y: number) => (x * 7 + y * 13) % 251;
  // The glitch repeats the top-left of the panel with a period of 360 px.
  assert.equal(isTiledCapture(image((x, y) => unit(x % 360, y % 600))), true);
  assert.equal(isTiledCapture(image(unit)), false);
});

await test("a mostly blank clean panel with one differing pixel is not reported as tiled", () => {
  const blank = image(() => 250);
  assert.equal(
    isTiledCapture(blank),
    true,
    "an all-blank image repeats itself",
  );
  const marked = image((x, y) => (x === 400 && y === 100 ? 0 : 250));
  assert.equal(isTiledCapture(marked), false);
});
