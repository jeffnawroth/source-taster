// SPDX-License-Identifier: AGPL-3.0-or-later
// Generator code for the accepted #199 two-drop mark. The code is AGPL; the
// artwork it produces is brand artwork outside the code licences (NOTICE.md).

import { colors } from "@source-taster/design-tokens";

type Oklch = readonly [l: number, c: number, h: number];

/** The accepted mark's gradient stops, in their #191/#194 OKLCH source form. */
const stops = {
  gradientStart: [0.66, 0.17, 252],
  gradientMiddle: [0.52, 0.21, 263],
  gradientEnd: [0.42, 0.2, 274],
  highlight: [0.93, 0.035, 262],
} as const satisfies Record<string, Oklch>;

/** OKLab → linear sRGB (Björn Ottosson's published matrices). */
function linearSrgb([l, c, h]: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const lms = [
    (l + 0.3963377774 * a + 0.2158037573 * b) ** 3,
    (l - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    (l - 0.0894841775 * a - 1.291485548 * b) ** 3,
  ] as const;
  return [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ];
}

const inGamut = (color: Oklch) =>
  linearSrgb(color).every((channel) => channel >= 0 && channel <= 1);

export interface ColourMapping {
  stop: keyof typeof stops;
  source: number[];
  mapped: number[];
  hex: string;
  chromaReduced: boolean;
  linearSrgb: number[];
}

/** Fixed L/H; reduce chroma only when a channel leaves [0, 1], never clip. */
function mapToSrgb(stop: keyof typeof stops): ColourMapping {
  const source: Oklch = stops[stop];
  const [l, , h] = source;
  let c = source[1];
  if (!inGamut(source)) {
    let low = 0;
    let high = c;
    for (let i = 0; i < 40; i++) {
      const middle = (low + high) / 2;
      if (inGamut([l, middle, h])) low = middle;
      else high = middle;
    }
    c = Math.floor(low * 1000) / 1000;
  }
  const mapped: Oklch = [l, c, h];
  const linear = linearSrgb(mapped);
  const hex = `#${linear
    .map((v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055))
    .map((v) =>
      Math.round(Math.max(0, Math.min(1, v)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
  return {
    stop,
    source: [...source],
    mapped: [...mapped],
    hex,
    chromaReduced: c !== source[1],
    linearSrgb: linear,
  };
}

export function gamutMapping(): ColourMapping[] {
  return (Object.keys(stops) as (keyof typeof stops)[]).map(mapToSrgb);
}

export function gamutRecord() {
  return {
    method:
      "Reduce chroma at fixed OKLCH lightness and hue until every linear-sRGB channel is in [0, 1], floor chroma to 0.001, then encode 8-bit sRGB. No channel is clipped to fit an out-of-gamut colour.",
    source:
      "Accepted #199 two-drop mark (geometry from the #194 sprite, identity from #191); docs/design/brand-assets.md.",
    mappings: gamutMapping(),
  };
}

// ---- Geometry -------------------------------------------------------------
// One drop of the closing quotation mark, centred on its bowl.
const drop =
  "M4.6 0C4.6 6.3 1.7 10.3-3.5 11.7C-4.5 12-5.1 10.8-4.3 10.2C-1.8 8.6-.4 6.8-.1 4.6A4.6 4.6 0 1 1 4.6 0Z";
const white = "#ffffff";
const colour = Object.fromEntries(
  gamutMapping().map(({ stop, hex }) => [stop, hex]),
) as Record<ColourMapping["stop"], string>;
/**
 * Flat ink for the monochrome toolbar cuts and the maskable field. These are
 * the design tokens' text (light, dark) and accent colours (ADR-0027), so the
 * mark's flat cuts follow the product palette. The tokens package is value-only
 * and AGPL-3.0-or-later OR MIT, which this AGPL generator may use; the artwork
 * it produces keeps the separate brand scope (NOTICE.md). A token change that
 * alters these values changes the exports and their manifest hashes, which the
 * exports test reports.
 */
export const ink = {
  onLight: colors.light.text.color,
  onDark: colors.dark.text.color,
  maskableField: colors.light.accent.color,
} as const;

const gradients = {
  body: `<linearGradient id="mk-g" x1="2" y1="1" x2="30" y2="31" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${colour.gradientStart}"/><stop offset=".55" stop-color="${colour.gradientMiddle}"/><stop offset="1" stop-color="${colour.gradientEnd}"/></linearGradient>`,
  rim: `<linearGradient id="mk-rim" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${white}" stop-opacity=".85"/><stop offset=".35" stop-color="${white}" stop-opacity=".12"/><stop offset=".7" stop-color="${white}" stop-opacity=".04"/><stop offset="1" stop-color="${white}" stop-opacity=".38"/></linearGradient>`,
  sheen: `<linearGradient id="mk-sheen" x1="0" y1="1" x2="0" y2="18" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${white}" stop-opacity=".32"/><stop offset="1" stop-color="${white}" stop-opacity="0"/></linearGradient>`,
  drop: `<linearGradient id="mk-drop" x1="0" y1="-5" x2="0" y2="12" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${white}"/><stop offset="1" stop-color="${colour.highlight}"/></linearGradient>`,
};

/** The two drops of the full artwork: a solid reference, a glass sample. */
const fullDrops = `<g transform="translate(16 16) scale(.9) translate(-16 -16)"><g transform="translate(20.9 12.4)"><path d="${drop}" fill="${white}" fill-opacity=".34"/><path d="${drop}" fill="none" stroke="${white}" stroke-opacity=".85" stroke-width=".95"/><path d="M-3.1-1.6A3.3 3.3 0 0 1-.9-3.2" fill="none" stroke="${white}" stroke-width="1.1" stroke-linecap="round"/></g><g transform="translate(10.7 12.4)"><path d="${drop}" fill="url(#mk-drop)"/></g></g>`;
const fullTile = `<rect x=".5" y=".5" width="31" height="31" rx="9.6" fill="url(#mk-g)"/><rect x=".5" y=".5" width="31" height="31" rx="9.6" fill="url(#mk-sheen)"/><rect x="1" y="1" width="30" height="30" rx="9.1" fill="none" stroke="url(#mk-rim)" stroke-width="1"/>${fullDrops}`;
const fullDefs = Object.values(gradients).join("");

/** 16–32 px optical cut: no rim or sheen, larger simplified drops. */
const opticalTile = `<rect width="32" height="32" rx="8.4" fill="url(#mk-g)"/><g transform="translate(21.3 12.2) scale(1.12)"><path d="${drop}" fill="${white}" fill-opacity=".55"/></g><g transform="translate(10.2 12.2) scale(1.12)"><path d="${drop}" fill="${white}"/></g>`;

/** Monochrome: filled first drop, outlined second; stronger outline when small. */
const mono = (ink: string, strokeWidth: number) =>
  `<g transform="translate(10.4 10.6) scale(1.18)"><path d="${drop}" fill="${ink}"/></g><g transform="translate(22.6 10.6) scale(1.18)"><path d="${drop}" fill="none" stroke="${ink}" stroke-width="${strokeWidth}" stroke-linejoin="round"/></g>`;

const svg = (body: string, defs = "", viewBox = 32) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${viewBox}" height="${viewBox}" viewBox="0 0 ${viewBox} ${viewBox}">${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>\n`;

/** Full artwork scaled so its 31-unit tile paints size − 2·inset pixels. */
const inset = (size: number, margin: number) =>
  svg(
    `<g transform="translate(${(32 * margin) / size} ${(32 * margin) / size}) scale(${(((size - 2 * margin) / size) * 32) / 31}) translate(-.5 -.5)">${fullTile}</g>`,
    fullDefs,
  );

/** Every SVG master, keyed by its file name in masters/. */
export function brandMasters(): Record<string, string> {
  return {
    "mark.svg": svg(fullTile, fullDefs),
    "mark-optical.svg": svg(opticalTile, gradients.body),
    "mark-mono-on-light.svg": svg(mono(ink.onLight, 1.55)),
    "mark-mono-on-dark.svg": svg(mono(ink.onDark, 1.55)),
    "mark-mono-optical-on-light.svg": svg(mono(ink.onLight, 2)),
    "mark-mono-optical-on-dark.svg": svg(mono(ink.onDark, 2)),
    // Chrome Web Store: 96 px painted artwork plus 16 px transparent margins.
    "mark-cws-128.svg": inset(128, 16),
    // AMO listing candidate with a chosen 8 px inset; optional Edge logo.
    "mark-amo-128.svg": inset(128, 8),
    "mark-edge-300.svg": inset(300, 20),
    // Opaque square: the gradient field without rounded corners, rim or sheen.
    "apple-touch-icon.svg": svg(
      `<rect width="32" height="32" fill="url(#mk-g)"/>${fullDrops}`,
      gradients.body + gradients.drop,
    ),
    // Opaque field; the monochrome mark stays well inside the W3C safe circle.
    "maskable.svg": svg(
      `<rect width="32" height="32" fill="${ink.maskableField}"/><g transform="translate(16 16) scale(.55) translate(-16 -16)">${mono(white, 1.55)}</g>`,
    ),
    // Archived Safari pinned-tab convention: one layer of black paths, 16×16.
    "safari-pinned-tab.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g transform="scale(.5)">${mono("#000000", 1.55)}</g></svg>\n`,
  };
}
