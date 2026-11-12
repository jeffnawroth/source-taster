// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { colors } from "@source-taster/design-tokens";
import {
  brandMasters,
  gamutMapping,
  gamutRecord,
  ink,
} from "../src/masters.ts";

await test("the accepted OKLCH stops map to sRGB, reducing only the highlight's chroma", () => {
  // Expected values come from the accepted #199 brand record, not this code.
  assert.deepEqual(
    gamutMapping().map(({ source, mapped, hex, chromaReduced }) => ({
      source,
      mapped,
      hex,
      chromaReduced,
    })),
    [
      {
        source: [0.66, 0.17, 252],
        mapped: [0.66, 0.17, 252],
        hex: "#3295f6",
        chromaReduced: false,
      },
      {
        source: [0.52, 0.21, 263],
        mapped: [0.52, 0.21, 263],
        hex: "#205bdf",
        chromaReduced: false,
      },
      {
        source: [0.42, 0.2, 274],
        mapped: [0.42, 0.2, 274],
        hex: "#3433b7",
        chromaReduced: false,
      },
      {
        source: [0.93, 0.035, 262],
        mapped: [0.93, 0.033, 262],
        hex: "#dce9ff",
        chromaReduced: true,
      },
    ],
  );
  for (const { linearSrgb } of gamutMapping())
    for (const channel of linearSrgb)
      assert.ok(channel >= 0 && channel <= 1, `${channel} is outside sRGB`);
});

await test("the committed SVG masters are the generator's output, in explicit sRGB only", async () => {
  const masters = brandMasters();
  const directory = new URL("../masters/", import.meta.url);
  assert.deepEqual(Object.keys(masters).sort(), [
    "apple-touch-icon.svg",
    "mark-amo-128.svg",
    "mark-cws-128.svg",
    "mark-edge-300.svg",
    "mark-mono-on-dark.svg",
    "mark-mono-on-light.svg",
    "mark-mono-optical-on-dark.svg",
    "mark-mono-optical-on-light.svg",
    "mark-optical.svg",
    "mark.svg",
    "maskable.svg",
    "safari-pinned-tab.svg",
  ]);
  assert.deepEqual(
    (await readdir(directory)).sort(),
    [...Object.keys(masters), "gamut-mapping.json"].sort(),
  );
  for (const [name, svg] of Object.entries(masters)) {
    assert.equal(await readFile(new URL(name, directory), "utf8"), svg, name);
    assert.doesNotMatch(svg, /oklch|currentColor|style=/, name);
    for (const [, colour] of svg.matchAll(
      /(?:fill|stroke|stop-color)="([^"]+)"/g,
    ))
      assert.match(colour!, /^(#[0-9a-f]{6}|none|url\(#[a-z-]+\))$/, name);
  }
  // The full artwork carries all four mapped stops, including the highlight.
  for (const hex of ["#3295f6", "#205bdf", "#3433b7", "#dce9ff"])
    assert.ok(masters["mark.svg"]!.includes(`stop-color="${hex}"`), hex);
  assert.deepEqual(
    JSON.parse(
      await readFile(new URL("gamut-mapping.json", directory), "utf8"),
    ),
    JSON.parse(JSON.stringify(gamutRecord())),
  );
});

await test("the flat ink and the maskable field are the design tokens' text and accent colours", () => {
  assert.equal(ink.onLight, colors.light.text.color);
  assert.equal(ink.onDark, colors.dark.text.color);
  assert.equal(ink.maskableField, colors.light.accent.color);
  // The values the committed exports were built from (brand manifest hashes).
  assert.deepEqual(ink, {
    onLight: "#0e1626",
    onDark: "#f4f5f8",
    maskableField: "#2456d3",
  });
});
