// PROTOTYPE (#191): throwaway. Palettes are authored in OKLCH [L, C, H]; the same
// numbers feed the CSS variables, the swatches and the contrast badges.
export type Variant = "A" | "B" | "C";
export type Theme = "light" | "dark";
export type Lch = readonly [number, number, number];

export const variantNames: Record<Variant, string> = {
  A: "Ink",
  B: "Signal",
  C: "Clarity",
};

export const oklchCss = ([l, c, h]: Lch) => `oklch(${l} ${c} ${h})`;

function toSrgb([L, C, H]: Lch): [number, number, number] {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((v) => Math.min(1, Math.max(0, v))) as [number, number, number];
}
const luminance = (rgbLin: number[]) =>
  0.2126 * rgbLin[0] + 0.7152 * rgbLin[1] + 0.0722 * rgbLin[2];
function hexToLin(hex: string) {
  return [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
}
export type Colour = Lch | string; // OKLCH triple or #rrggbb
const lum = (c: Colour) =>
  luminance(typeof c === "string" ? hexToLin(c) : toSrgb(c));
export function contrast(a: Colour, b: Colour) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
export const css = (c: Colour) => (typeof c === "string" ? c : oklchCss(c));

export interface Surface {
  bg: Lch;
  surface: Lch;
  sunken: Lch;
  text: Lch;
  muted: Lch;
  rule: Lch;
  primary: Lch; // brand primary (also used for filled actions)
  primaryFg: Lch;
  accent: Lch; // second brand colour (decorative / focus / mark)
  soft: Lch; // selected-row tint
}

export const surfaces: Record<Variant, Record<Theme, Surface>> = {
  A: {
    light: {
      bg: [0.972, 0.008, 85],
      surface: [0.992, 0.004, 85],
      sunken: [0.952, 0.01, 85],
      text: [0.21, 0.02, 260],
      muted: [0.47, 0.015, 260],
      rule: [0.86, 0.012, 85],
      primary: [0.4, 0.115, 250],
      primaryFg: [0.99, 0.004, 85],
      accent: [0.5, 0.09, 195],
      soft: [0.93, 0.03, 250],
    },
    dark: {
      bg: [0.18, 0.012, 255],
      surface: [0.215, 0.013, 255],
      sunken: [0.155, 0.012, 255],
      text: [0.94, 0.008, 85],
      muted: [0.73, 0.012, 255],
      rule: [0.32, 0.015, 255],
      primary: [0.78, 0.09, 245],
      primaryFg: [0.18, 0.012, 255],
      accent: [0.78, 0.08, 195],
      soft: [0.28, 0.05, 250],
    },
  },
  B: {
    light: {
      bg: [0.985, 0.002, 80],
      surface: [0.998, 0.001, 80],
      sunken: [0.962, 0.003, 80],
      text: [0.2, 0.005, 80],
      muted: [0.48, 0.006, 80],
      rule: [0.91, 0.004, 80],
      primary: [0.2, 0.005, 80],
      primaryFg: [0.99, 0.002, 80],
      accent: [0.5, 0.17, 272],
      soft: [0.95, 0.022, 272],
    },
    dark: {
      bg: [0.155, 0.004, 80],
      surface: [0.19, 0.005, 80],
      sunken: [0.135, 0.004, 80],
      text: [0.95, 0.003, 80],
      muted: [0.7, 0.006, 80],
      rule: [0.28, 0.006, 80],
      primary: [0.95, 0.003, 80],
      primaryFg: [0.15, 0.004, 80],
      accent: [0.75, 0.12, 272],
      soft: [0.26, 0.05, 272],
    },
  },
  C: {
    light: {
      bg: [0.978, 0.014, 85],
      surface: [0.996, 0.006, 85],
      sunken: [0.955, 0.02, 85],
      text: [0.26, 0.02, 60],
      muted: [0.46, 0.025, 65],
      rule: [0.875, 0.02, 80],
      primary: [0.45, 0.09, 62],
      primaryFg: [0.99, 0.006, 85],
      accent: [0.8, 0.15, 70],
      soft: [0.935, 0.016, 85],
    },
    dark: {
      bg: [0.2, 0.015, 60],
      surface: [0.24, 0.017, 60],
      sunken: [0.175, 0.014, 60],
      text: [0.95, 0.01, 85],
      muted: [0.75, 0.02, 75],
      rule: [0.34, 0.02, 65],
      primary: [0.82, 0.13, 70],
      primaryFg: [0.2, 0.015, 60],
      accent: [0.82, 0.13, 70],
      soft: [0.3, 0.012, 60],
    },
  },
};

export type VerdictKey =
  | "correct"
  | "exists"
  | "mixed"
  | "doi"
  | "notfound"
  | "unverifiable";
export const verdictOrder: VerdictKey[] = [
  "correct",
  "exists",
  "mixed",
  "doi",
  "notfound",
  "unverifiable",
];
type Family = "green" | "amber" | "red" | "grey";
export const family: Record<VerdictKey, Family> = {
  correct: "green",
  exists: "amber",
  mixed: "red",
  doi: "red",
  notfound: "red",
  unverifiable: "grey",
};
// Values from the colour research (#185, section 5): deliberate lightness ladder.
// bg = tinted badge background, fg = text (>=7:1 on bg), icon = glyph (>=3:1).
export const verdictColours: Record<
  Theme,
  Record<Family, { bg: string; fg: string; icon: string }>
> = {
  light: {
    green: { bg: "#dffae3", fg: "#2f5c3a", icon: "#005e28" },
    amber: { bg: "#fff0d7", fg: "#664d20", icon: "#9a6c00" },
    red: { bg: "#ffedeb", fg: "#813d37", icon: "#be2323" },
    grey: { bg: "#eff2f6", fg: "#4f5255", icon: "#80868c" },
  },
  dark: {
    green: { bg: "#122a18", fg: "#97b79c", icon: "#2fa857" },
    amber: { bg: "#2f220a", fg: "#bfab8c", icon: "#fac053" },
    red: { bg: "#391a17", fg: "#d6a099", icon: "#ff7469" },
    grey: { bg: "#212429", fg: "#acaeb1", icon: "#acb2b9" },
  },
};

export function cssVars(v: Variant, t: Theme): Record<string, string> {
  const s = surfaces[v][t];
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(s)) out[`--${k}`] = oklchCss(val);
  for (const [fam, c] of Object.entries(verdictColours[t])) {
    out[`--${fam}-bg`] = c.bg;
    out[`--${fam}-fg`] = c.fg;
    out[`--${fam}-icon`] = c.icon;
  }
  return out;
}

/** Contract checks used by check-contrast.ts and printed in the brand sheet. */
export function checks(v: Variant, t: Theme) {
  const s = surfaces[v][t];
  const rows: { name: string; ratio: number; min: number }[] = [
    { name: "text on bg", ratio: contrast(s.text, s.bg), min: 4.5 },
    { name: "text on surface", ratio: contrast(s.text, s.surface), min: 4.5 },
    { name: "muted on bg", ratio: contrast(s.muted, s.bg), min: 4.5 },
    { name: "muted on sunken", ratio: contrast(s.muted, s.sunken), min: 4.5 },
    { name: "muted on soft", ratio: contrast(s.muted, s.soft), min: 4.5 },
    { name: "primary-fg on primary", ratio: contrast(s.primaryFg, s.primary), min: 4.5 },
    { name: "primary on surface (text/link)", ratio: contrast(s.primary, s.surface), min: 4.5 },
    { name: "rule/border on bg (info only)", ratio: contrast(s.rule, s.bg), min: 1 },
  ];
  for (const [fam, c] of Object.entries(verdictColours[t])) {
    rows.push(
      { name: `${fam} fg on badge bg`, ratio: contrast(c.fg, c.bg), min: 4.5 },
      { name: `${fam} icon on badge bg`, ratio: contrast(c.icon, c.bg), min: 3 },
      { name: `${fam} icon on page bg`, ratio: contrast(c.icon, s.bg), min: 3 },
      { name: `${fam} icon on surface`, ratio: contrast(c.icon, s.surface), min: 3 },
      { name: `${fam} icon on soft (selected row)`, ratio: contrast(c.icon, s.soft), min: 3 },
    );
  }
  return rows;
}
