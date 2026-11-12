// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { imageSpecs } from "../src/specs.ts";

await test("the image set is the accepted #199/#215 outputs with exact dimensions", () => {
  // Expected values come from docs/design/brand-assets.md, the #215 issue and
  // docs/research/brand-asset-requirements.md, not from the specs module.
  const expected: Record<string, [number, number]> = {
    "cws-en-1-workspace.png": [1280, 800],
    "cws-en-2-overview.png": [1280, 800],
    "cws-en-3-evidence.png": [1280, 800],
    "cws-de-1-workspace.png": [1280, 800],
    "cws-de-2-overview.png": [1280, 800],
    "cws-de-3-evidence.png": [1280, 800],
    "amo-en-1-workspace.png": [1280, 960],
    "amo-en-2-overview.png": [1280, 960],
    "amo-en-3-evidence.png": [1280, 960],
    "amo-de-1-workspace.png": [1280, 960],
    "amo-de-2-overview.png": [1280, 960],
    "amo-de-3-evidence.png": [1280, 960],
    "promo-small-440x280.png": [440, 280],
    "promo-marquee-1400x560.png": [1400, 560],
    "social-en-1200x630.png": [1200, 630],
    "social-de-1200x630.png": [1200, 630],
  };
  assert.deepEqual(
    Object.fromEntries(imageSpecs.map((s) => [s.file, [s.width, s.height]])),
    expected,
  );
});

await test("AMO screenshots are 4:3 and promo tiles carry no locale", () => {
  for (const spec of imageSpecs.filter((s) => s.role === "store-amo"))
    assert.equal(spec.width * 3, spec.height * 4);
  for (const spec of imageSpecs.filter((s) => s.role.startsWith("promo")))
    assert.equal(spec.locale, undefined);
});
