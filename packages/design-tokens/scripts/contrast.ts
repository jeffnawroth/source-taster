// SPDX-License-Identifier: AGPL-3.0-or-later
import { wcagContrast } from "culori";
import type { Oklch, Rgb } from "culori";
import { feedback, verdicts } from "../src/tokens.ts";
import type { Mode, Role } from "../src/tokens.ts";
import { modes, over } from "./colors.ts";
import type { Palette } from "./colors.ts";

type Color = Oklch | Rgb;
export interface Pair {
  mode: Mode;
  foreground: string;
  background: string;
  minimum: number;
  ratio: number;
}
// Mirrors the accepted 158-pair matrix, including the worst backdrop per glass
// variant. Disallowed secondary/muted glass text is not granted by this gate.
export function contrastPairs(palette: Palette): Pair[] {
  const pairs: Pair[] = [];
  for (const mode of modes) {
    const t = palette[mode];
    function check(
      name: string,
      foreground: Color,
      background: string,
      bottom: Color,
      minimum: number,
    ) {
      pairs.push({
        mode,
        foreground: name,
        background,
        minimum,
        ratio: wcagContrast(foreground, bottom),
      });
    }
    function role(fg: Role, name: string, bg: Color, min: number) {
      check(fg, t[fg], name, bg, min);
    }
    const flat = {
      bg: t.bg,
      surface: t.surface,
      "surface-sunken": t["surface-sunken"],
      "glass-base over bg (no blur)": over(t["glass-base"], t.bg),
    };
    for (const fg of ["text", "text-secondary", "text-muted"] as const)
      for (const [name, bg] of Object.entries(flat)) role(fg, name, bg, 4.5);
    role("accent-text", "surface", t.surface, 4.5);
    role(
      "accent-text",
      "accent-tint (over surface)",
      over(t["accent-tint"], t.surface),
      4.5,
    );
    role("on-accent", "accent", t.accent, 4.5);
    for (const f of feedback) {
      role(`feedback-${f}`, "surface", t.surface, 4.5);
      role(`feedback-${f}`, `feedback-${f}-tint`, t[`feedback-${f}-tint`], 4.5);
    }
    const insertion = over(t["correction-insert-bg"], t.surface);
    role("text", "correction-insert-bg (over surface)", insertion, 4.5);
    role(
      "correction-delete-text",
      "correction-delete-bg (over surface)",
      over(t["correction-delete-bg"], t.surface),
      4.5,
    );
    const glass = {
      glass: Object.entries({
        bg: t.bg,
        surface: t.surface,
        "surface-sunken": t["surface-sunken"],
      }).map(([name, bg]) => ({ name, bg: over(t["glass-base"], bg) })),
      "glass-overlay": Object.entries({
        "scrim over bg": over(t.scrim, t.bg),
        "scrim over surface": over(t.scrim, t.surface),
      }).map(([name, bg]) => ({ name, bg: over(t["glass-base-overlay"], bg) })),
    };
    for (const [variant, backdrops] of Object.entries(glass)) {
      const worst = (fg: Color, composite = false) =>
        backdrops
          .map(({ name, bg }) => ({
            name,
            bg,
            fg: composite ? over(fg, bg) : fg,
            ratio: wcagContrast(composite ? over(fg, bg) : fg, bg),
          }))
          .reduce((a, b) => (a.ratio < b.ratio ? a : b));
      const textRoles: Role[] = ["text", "text-on-glass-secondary"];
      const marks: Role[] = verdicts.map((v) => `verdict-${v}-mark` as const);
      const nonText: Role[] = [
        "accent",
        ...feedback.map((f) => `feedback-${f}` as const),
        "focus-ring",
      ];
      for (const fg of [...textRoles, ...marks, ...nonText]) {
        const w = worst(t[fg]);
        role(
          fg,
          `${variant} worst case (${w.name})`,
          w.bg,
          textRoles.includes(fg) ? 4.5 : 3,
        );
      }
      const w = worst(t["border-emphasis"], true);
      check(
        `border-emphasis (over ${variant})`,
        w.fg,
        `${variant} worst case (${w.name})`,
        w.bg,
        3,
      );
    }
    for (const v of verdicts) {
      role(`verdict-${v}-mark`, "surface", t.surface, 3);
      role(`verdict-${v}-mark`, "bg", t.bg, 3);
      role("on-verdict-mark", `verdict-${v}-mark`, t[`verdict-${v}-mark`], 3);
    }
    for (const [name, bg] of Object.entries({
      bg: t.bg,
      surface: t.surface,
      "surface-sunken": t["surface-sunken"],
      "accent-tint (over surface)": over(t["accent-tint"], t.surface),
    }))
      role("focus-ring", name, bg, 3);
    check(
      "border-emphasis (over surface)",
      over(t["border-emphasis"], t.surface),
      "surface",
      t.surface,
      3,
    );
    check(
      "correction-insert-line (composited)",
      over(t["correction-insert-line"], insertion),
      "correction-insert-bg (over surface)",
      insertion,
      3,
    );
  }
  return pairs;
}
export function assertContrast(palette: Palette): Pair[] {
  const pairs = contrastPairs(palette);
  if (pairs.length !== 158)
    throw new Error(`Contrast coverage changed: ${pairs.length}, expected 158`);
  const failures = pairs.filter(
    (p) => !Number.isFinite(p.ratio) || p.ratio < p.minimum,
  );
  if (failures.length)
    throw new Error(`WCAG failures: ${JSON.stringify(failures)}`);
  return pairs;
}
