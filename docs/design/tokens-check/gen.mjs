// SPDX-License-Identifier: AGPL-3.0-or-later
import { converter, displayable, formatHex, wcagContrast } from 'culori';
import { roles, verdicts, tintSteps } from './tokens.mjs';

const toRgb = converter('rgb');
const toOklch = converter('oklch');
const r3 = (x) => Math.round(x * 1000) / 1000;

// Make every value displayable in sRGB: reduce chroma (CSS Color 4 gamut mapping), then round.
function fit([l, c, h, a = 1]) {
  let col = { mode: 'oklch', l, c, h };
  let changed = false;
  if (!displayable(col)) {
    // keep L and H, bisect the largest chroma that is still inside sRGB
    let lo = 0, hi = c;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; displayable({ mode: 'oklch', l, c: m, h }) ? (lo = m) : (hi = m); }
    col = { mode: 'oklch', l, c: lo, h }; changed = true;
  }
  let out = { mode: 'oklch', l: r3(col.l), c: Math.floor((col.c ?? 0) * 1000) / 1000, h };
  while (!displayable(out) && out.c > 0) { out.c = r3(out.c - 0.001); changed = true; }
  return { ...out, alpha: a, changed, orig: [l, c, h, a] };
}
const css = (o) => `oklch(${o.l} ${o.c} ${Math.round(o.h)}${o.alpha < 1 ? ` / ${o.alpha}` : ''})`;
const hex = (o) => formatHex({ ...toRgb(o), alpha: undefined }) + (o.alpha < 1 ? Math.round(o.alpha * 255).toString(16).padStart(2, '0') : '');

// Source-over in sRGB, which is what the browser does when it paints a translucent layer.
function over(top, bottom) {
  const t = toRgb(top), b = toRgb(bottom), a = top.alpha ?? 1;
  return { mode: 'rgb', r: t.r * a + b.r * (1 - a), g: t.g * a + b.g * (1 - a), b: t.b * a + b.b * (1 - a) };
}
const stack = (...layers) => layers.reduce((acc, l) => (acc ? over(l, acc) : toRgb(l)));
// color-mix(in oklch, mark p%, surface), surface's powerless hue takes the mark's hue
const mix = (mark, surf, p) => fit([mark.l * p + surf.l * (1 - p), mark.c * p + surf.c * (1 - p), mark.h]);

if (process.env.PATCH) { const p = JSON.parse(process.env.PATCH); for (const m in p) Object.assign(roles[m], p[m]); }
const out = {};
for (const mode of ['light', 'dark']) {
  const t = {};
  for (const [k, v] of Object.entries(roles[mode])) t[k] = fit(v);
  for (const f of ['danger', 'warning', 'success', 'info']) t[`feedback-${f}-tint`] = mix(t[`feedback-${f}`], t.surface, tintSteps.tint);
  out[mode] = t;
}

const gate = [];
const check = (mode, fg, bgName, bgColour, min, kind) => {
  const ratio = wcagContrast(out[mode][fg] ? out[mode][fg] : fg, bgColour);
  gate.push({ mode, fg, bg: bgName, ratio, min, kind, pass: kind === 'info' || ratio >= min });
};
for (const mode of ['light', 'dark']) {
  const t = out[mode];
  const flat = { bg: t.bg, surface: t.surface, 'surface-sunken': t['surface-sunken'], 'glass-base over bg (no blur)': stack(t.bg, t['glass-base']) };
  for (const fg of ['text', 'text-secondary', 'text-muted']) for (const [n, c] of Object.entries(flat)) check(mode, fg, n, c, 4.5, 'text');
  check(mode, 'accent-text', 'surface', t.surface, 4.5, 'text');
  check(mode, 'accent-text', 'accent-tint (over surface)', stack(t.surface, t['accent-tint']), 4.5, 'text');
  check(mode, 'on-accent', 'accent', t.accent, 4.5, 'text');
  for (const f of ['danger', 'warning', 'success', 'info']) {
    check(mode, `feedback-${f}`, 'surface', t.surface, 4.5, 'text');
    check(mode, `feedback-${f}`, `feedback-${f}-tint`, t[`feedback-${f}-tint`], 4.5, 'text');
  }
  check(mode, 'text', 'correction-insert-bg (over surface)', stack(t.surface, t['correction-insert-bg']), 4.5, 'text');
  check(mode, 'correction-delete-text', 'correction-delete-bg (over surface)', stack(t.surface, t['correction-delete-bg']), 4.5, 'text');
  // text on glass, per variant (#195: no light field, sheen or pointer light; blur is not modelled, so the
  // backdrop is the flat surface under the layer)
  const variants = {
    glass: { base: 'glass-base', backdrops: { bg: t.bg, surface: t.surface, 'surface-sunken': t['surface-sunken'] } },
    'glass-overlay': { base: 'glass-base-overlay', backdrops: { 'scrim over bg': stack(t.bg, t.scrim), 'scrim over surface': stack(t.surface, t.scrim) } },
  };
  t.__glass = {};
  for (const [vn, v] of Object.entries(variants)) {
    const combos = Object.entries(v.backdrops).map(([bn, b]) => ({ name: bn, c: stack(b, t[v.base]) }));
    t.__glass[vn] = combos;
    for (const fg of ['text', 'text-secondary', 'text-muted', 'text-on-glass-secondary']) {
      const worst = combos.map((g) => ({ ...g, r: wcagContrast(t[fg], g.c) })).sort((a, b) => a.r - b.r)[0];
      const gated = fg === 'text' || fg === 'text-on-glass-secondary';
      check(mode, fg, `${vn} worst case (${worst.name})`, worst.c, 4.5, gated ? 'text' : 'info');
    }
    for (const vd of verdicts) {
      const m = `verdict-${vd}-mark`;
      const worst = combos.map((g) => ({ ...g, r: wcagContrast(t[m], g.c) })).sort((a, b) => a.r - b.r)[0];
      check(mode, m, `${vn} worst case (${worst.name})`, worst.c, 3, 'non-text');
    }
    // non-text roles that components put on glass (#195): Running icon, strip progress fill and pressed counters
    // (accent), toast icons (feedback-*), the dashed Status contour and the command-bar field (border-emphasis)
    for (const r of ['accent', 'feedback-danger', 'feedback-warning', 'feedback-success', 'feedback-info']) {
      const worst = combos.map((g) => ({ ...g, r: wcagContrast(t[r], g.c) })).sort((a, b) => a.r - b.r)[0];
      check(mode, r, `${vn} worst case (${worst.name})`, worst.c, 3, 'non-text');
    }
    const be = combos.map((g) => ({ ...g, fg: stack(g.c, t['border-emphasis']) })).map((g) => ({ ...g, r: wcagContrast(g.fg, g.c) })).sort((a, b) => a.r - b.r)[0];
    check(mode, be.fg, `${vn} worst case (${be.name})`, be.c, 3, 'non-text');
    gate[gate.length - 1].fg = `border-emphasis (over ${vn})`;
  }
  for (const v of verdicts) {
    const m = `verdict-${v}-mark`;
    check(mode, m, 'surface', t.surface, 3, 'non-text');
    check(mode, m, 'bg', t.bg, 3, 'non-text');
  }
  for (const [n, c] of Object.entries({ bg: t.bg, surface: t.surface, 'surface-sunken': t['surface-sunken'], 'accent-tint (over surface)': stack(t.surface, t['accent-tint']) })) check(mode, 'focus-ring', n, c, 3, 'non-text');
  for (const [vn, combos] of Object.entries(t.__glass)) {
    const worst = combos.map((g) => ({ ...g, r: wcagContrast(t['focus-ring'], g.c) })).sort((a, b) => a.r - b.r)[0];
    check(mode, 'focus-ring', `${vn} worst case (${worst.name})`, worst.c, 3, 'non-text');
  }
  for (const v of verdicts) check(mode, 'on-verdict-mark', `verdict-${v}-mark`, t[`verdict-${v}-mark`], 3, 'non-text');
  check(mode, stack(t.surface, t['border-emphasis']), 'surface', t.surface, 3, 'non-text');
  gate[gate.length - 1].fg = 'border-emphasis (over surface)';
  const insertionBg = stack(t.surface, t['correction-insert-bg']);
  check(mode, stack(insertionBg, t['correction-insert-line']), 'correction-insert-bg (over surface)', insertionBg, 3, 'non-text');
  gate[gate.length - 1].fg = 'correction-insert-line (composited)';
}

const fmt = process.argv[2];
if (fmt === 'tables') {
  const keys = [...new Set([...Object.keys(out.light), ...Object.keys(out.dark)])].filter((k) => !k.startsWith('__'));
  console.log('| Role | Light | Light sRGB | Dark | Dark sRGB |\n|---|---|---|---|---|');
  for (const k of keys) {
    const l = out.light[k], d = out.dark[k];
    const cell = (o) => (o ? `\`${css(o)}\`${o.changed ? ' ¹' : ''}` : '–');
    console.log(`| \`${k}\` | ${cell(l)} | ${l ? `\`${hex(l)}\`` : '–'} | ${cell(d)} | ${d ? `\`${hex(d)}\`` : '–'} |`);
  }
  console.log('\nChanged by gamut mapping:');
  for (const m of ['light', 'dark']) for (const [k, o] of Object.entries(out[m])) if (o.changed && roles[m][k]) console.log(`- ${m} ${k}: oklch(${o.orig.slice(0, 3).join(' ')}) → ${css(o)}`);
} else if (fmt === 'gate') {
  console.log('| Mode | Foreground | Background | Min | Ratio | |\n|---|---|---|---|---|---|');
  for (const g of gate) console.log(`| ${g.mode} | \`${g.fg}\` | ${g.bg} | ${g.kind === 'info' ? '(not allowed)' : g.min} | ${g.ratio.toFixed(2)} | ${g.kind === 'info' ? 'info' : g.pass ? '✓' : '**✗**'} |`);
  const fails = gate.filter((g) => !g.pass);
  const gated = gate.filter((g) => g.kind !== 'info');
  console.log(`\n${gated.length} gated pairs, ${fails.length} failing; ${gate.length - gated.length} informational rows for roles that are not allowed on glass`);
  console.log('\nTightest gated pairs:');
  for (const g of gated.sort((a, b) => a.ratio / a.min - b.ratio / b.min).slice(0, 6)) console.log(`- ${g.mode} \`${g.fg}\` on ${g.bg}, ${g.ratio.toFixed(2)} (min ${g.min})`);
  if (fails.length) process.exitCode = 1;
} else if (fmt === 'json') {
  console.log(JSON.stringify(out, null, 1));
}

// Primitive layer: group every distinct opaque LCH used by a role into hue families, name stops by lightness.
export function primitives() {
  const fam = (o) => {
    if (o.c === 0 || (o.c <= 0.05 && o.h >= 258)) return 'neutral';
    const h = o.h;
    if (h >= 250 && h <= 270) return 'cobalt';
    if (h >= 285 && h <= 305) return 'violet';
    if (h >= 205 && h < 250) return 'sky';
    if (h >= 140 && h <= 160) return 'green';
    if (h >= 55 && h <= 95) return 'amber';
    if (h < 12) return 'rose';
    return 'red';
  };
  const prims = new Map(); const ref = { light: {}, dark: {} };
  for (const m of ['light', 'dark']) for (const [k, o] of Object.entries(out[m])) {
    if (!roles[m][k] || k.startsWith('__')) continue; // derived tints are mixes, not primitives
    const key = `${o.l} ${o.c} ${Math.round(o.h)}`;
    if (!prims.has(key)) {
      let name = `${fam(o)}-${Math.round(o.l * 1000)}`;
      let n = 2; const base = name;
      while ([...prims.values()].some((p) => p.name === name)) name = `${base}-${String.fromCharCode(95 + n++)}`;
      prims.set(key, { name, o });
    }
    ref[m][k] = prims.get(key).name + (o.alpha < 1 ? ` / ${o.alpha}` : '');
  }
  return { prims: [...prims.values()].sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true })), ref };
}
if (fmt === 'prims') {
  const { prims, ref } = primitives();
  console.log('| Primitive | Value | sRGB |\n|---|---|---|');
  for (const p of prims) console.log(`| \`${p.name}\` | \`${css({ ...p.o, alpha: 1 })}\` | \`${hex({ ...p.o, alpha: 1 })}\` |`);
  console.log('\n| Role | Light | Dark |\n|---|---|---|');
  const keys = [...new Set([...Object.keys(ref.light), ...Object.keys(ref.dark)])];
  for (const k of keys) console.log(`| \`${k}\` | ${ref.light[k] ? `\`${ref.light[k]}\`` : '–'} | ${ref.dark[k] ? `\`${ref.dark[k]}\`` : '–'} |`);
}
if (fmt === 'tints') {
  console.log('| Token | Light | Light sRGB | Dark | Dark sRGB |\n|---|---|---|---|---|');
  for (const k of Object.keys(out.light).filter((k) => !roles.light[k] && !k.startsWith('__'))) console.log(`| \`${k}\` | \`${css(out.light[k])}\` | \`${hex(out.light[k])}\` | \`${css(out.dark[k])}\` | \`${hex(out.dark[k])}\` |`);
}
