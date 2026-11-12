// SPDX-License-Identifier: AGPL-3.0-or-later
// The stylesheet of the release-image composition. Colours and the shadow come
// from the design tokens (packages/design-tokens/theme.css, ADR-0027): the
// token stylesheet is embedded as is and the composition only refers to its
// `--st-*` variables, so it holds no colour or shadow value of its own.
export function composeCss(themeCss: string, fontsUrl: string): string {
  return `${themeCss}
@font-face { font-family: "Atkinson Hyperlegible Next"; src: url("${fontsUrl}atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext[wght].ttf") format("truetype"); font-weight: 200 800; }
* { box-sizing: border-box; margin: 0; }
html, body { background: var(--st-bg); color: var(--st-text); font-family: "Atkinson Hyperlegible Next", system-ui, sans-serif; }
.canvas { position: relative; overflow: hidden; background: var(--st-bg); }
.brand { display: flex; align-items: center; gap: 14px; font-weight: 700; letter-spacing: -0.01em; }
.brand svg { flex: none; }
h1 { font-weight: 700; letter-spacing: -0.02em; line-height: 1.12; }
p { color: var(--st-text-secondary); line-height: 1.45; }
.panel { position: absolute; border: 1px solid var(--st-border-strong); border-radius: 14px; box-shadow: var(--st-shadow-raised); background: var(--st-surface); }
.panel img { display: block; width: 100%; height: 100%; border-radius: 13px; }
`;
}
