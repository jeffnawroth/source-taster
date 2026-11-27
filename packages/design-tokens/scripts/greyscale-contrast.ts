// SPDX-License-Identifier: AGPL-3.0-or-later
// Development-only: re-runs the gated contrast matrix with every colour passed
// through CSS `filter: grayscale(1)` (Rec. 709 weights on encoded sRGB channels,
// the Filter Effects definition), the way a user with greyscale display or a
// monochrome colour filter sees it. WCAG contrast is luminance-based, so this
// measures how much the filter moves each pair, not a new requirement. Prints
// JSON; the Q08 assessment (#256) stores the output under docs/evidence/.
//
//   node scripts/greyscale-contrast.ts
import type { Oklch, Rgb } from "culori";
import { contrastPairs } from "./contrast.ts";
import { resolve, toRgb } from "./colors.ts";
import type { Palette } from "./colors.ts";

function grey(value: Oklch): Oklch {
  const { r, g, b } = toRgb(value);
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const result: Rgb = {
    mode: "rgb",
    r: y,
    g: y,
    b: y,
    alpha: value.alpha ?? 1,
  };
  // contrastPairs only converts through culori, which accepts any colour space.
  return result as unknown as Oklch;
}
const colour = resolve();
const palette = Object.fromEntries(
  Object.entries(colour).map(([mode, roles]) => [
    mode,
    Object.fromEntries(
      Object.entries(roles).map(([role, value]) => [role, grey(value)]),
    ),
  ]),
) as Palette;
const original = contrastPairs(colour);
const filtered = contrastPairs(palette);
const rows = filtered.map((pair, index) => ({
  mode: pair.mode,
  foreground: pair.foreground,
  background: pair.background,
  minimum: pair.minimum,
  colour: Number(original[index]!.ratio.toFixed(2)),
  greyscale: Number(pair.ratio.toFixed(2)),
  pass: pair.ratio >= pair.minimum,
}));
const failing = rows.filter((row) => !row.pass);
const tightest = [...rows]
  .sort((a, b) => a.greyscale - a.minimum - (b.greyscale - b.minimum))
  .slice(0, 10);
console.log(
  JSON.stringify(
    {
      filter: "grayscale(1): Y' = 0.2126 R' + 0.7152 G' + 0.0722 B'",
      pairs: rows.length,
      failing,
      tightest,
      rows,
    },
    null,
    2,
  ),
);
