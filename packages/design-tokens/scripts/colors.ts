// SPDX-License-Identifier: AGPL-3.0-or-later
// Development-only colour math. Nothing in scripts/ is exported or packed.
import { converter, displayable, formatHex, parse } from "culori";
import type { Oklch as CuloriOklch, Rgb } from "culori";
import {
  feedback,
  primitives,
  roles,
  shadows,
  tintWeight,
} from "../src/tokens.ts";
import type { Mode, Oklch, Role, RoleValue } from "../src/tokens.ts";

export const modes = ["light", "dark"] as const;
export const toRgb = converter("rgb");
export type Palette = Record<Mode, Record<Role, CuloriOklch>>;
export function assertGamut(color: CuloriOklch | Rgb): void {
  if (!displayable(color))
    throw new Error(`Outside sRGB: ${JSON.stringify(color)}`);
  const rgb = toRgb(color);
  if (
    ![rgb.r, rgb.g, rgb.b, color.alpha ?? 1].every(Number.isFinite) ||
    (color.alpha ?? 1) < 0 ||
    (color.alpha ?? 1) > 1
  )
    throw new Error("Invalid colour or alpha");
}
export function color(tuple: Oklch, alpha = 1): CuloriOklch {
  const [l, c, h] = tuple;
  if (
    ![l, c, h].every(Number.isFinite) ||
    l < 0 ||
    l > 1 ||
    c < 0 ||
    h < 0 ||
    h > 360
  )
    throw new Error("Invalid OKLCH coordinates");
  const result: CuloriOklch = { mode: "oklch", l, c, h, alpha };
  assertGamut(result);
  return result;
}
export function resolve(): Palette {
  // The accepted primitive table already records chroma mapping. A new
  // out-of-gamut value fails instead of silently changing the contract.
  for (const value of Object.values(primitives)) color(value);
  const palette = {} as Palette;
  for (const mode of modes) {
    const entries = Object.entries(roles[mode]) as [Role, RoleValue][];
    const result = Object.fromEntries(
      entries.map(([name, [primitive, alpha]]) => [
        name,
        color(primitives[primitive], alpha),
      ]),
    ) as Palette[Mode];
    for (const name of feedback) {
      const mark = result[`feedback-${name}`];
      const surface = result.surface;
      const l =
        Math.round(
          (mark.l * tintWeight + surface.l * (1 - tintWeight)) * 1000,
        ) / 1000;
      const c =
        Math.floor(
          (mark.c * tintWeight + surface.c * (1 - tintWeight)) * 1000,
        ) / 1000;
      result[`feedback-${name}-tint`] = color([l, c, mark.h ?? 0]);
    }
    palette[mode] = result;
    for (const shadow of Object.values(shadows[mode])) {
      for (const match of shadow.matchAll(/oklch\([^)]+\)/g)) {
        const parsed = parse(match[0]);
        if (!parsed || parsed.mode !== "oklch")
          throw new Error("Invalid shadow colour");
        assertGamut(parsed);
      }
    }
  }
  return palette;
}
export function hex(value: CuloriOklch | Rgb): string {
  assertGamut(value);
  return formatHex(value);
}
export function css(value: CuloriOklch): string {
  return `oklch(${value.l} ${value.c} ${value.h ?? 0}${value.alpha === 1 ? "" : ` / ${value.alpha}`})`;
}
// Source-over on encoded sRGB channels, with an opaque bottom layer.
export function over(top: CuloriOklch | Rgb, bottom: CuloriOklch | Rgb): Rgb {
  if ((bottom.alpha ?? 1) !== 1) throw new Error("Backdrop must be opaque");
  const t = toRgb(top),
    b = toRgb(bottom),
    alpha = top.alpha ?? 1;
  const result: Rgb = {
    mode: "rgb",
    r: t.r * alpha + b.r * (1 - alpha),
    g: t.g * alpha + b.g * (1 - alpha),
    b: t.b * alpha + b.b * (1 - alpha),
    alpha: 1,
  };
  assertGamut(result);
  return result;
}
