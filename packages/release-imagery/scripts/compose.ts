// SPDX-License-Identifier: AGPL-3.0-or-later
// Manual composition: lays the real captures out on a calm canvas with the
// product's own fonts and the brand mark, and writes opaque 8-bit RGB PNGs at
// the exact store and social sizes. It adds copy next to a capture; it never
// edits the capture itself, so the product's notices stay as captured.
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { copy } from "../src/copy.ts";
import {
  imageSpecs,
  type ImageSpec,
  type Locale,
  type Story,
} from "../src/specs.ts";
import { panelViewport } from "./capture.ts";

const root = new URL("../../../", import.meta.url).pathname;
const fonts = pathToFileURL(join(root, "packages/ui/public/fonts/")).href;

const css = `
@font-face { font-family: "Atkinson Hyperlegible Next"; src: url("${fonts}atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext[wght].ttf") format("truetype"); font-weight: 200 800; }
* { box-sizing: border-box; margin: 0; }
html, body { background: #f3f5f9; color: #14202f; font-family: "Atkinson Hyperlegible Next", system-ui, sans-serif; }
.canvas { position: relative; overflow: hidden; background: #f3f5f9; }
.brand { display: flex; align-items: center; gap: 14px; font-weight: 700; letter-spacing: -0.01em; }
.brand svg { flex: none; }
h1 { font-weight: 700; letter-spacing: -0.02em; line-height: 1.12; }
p { color: #3b4a5c; line-height: 1.45; }
.panel { position: absolute; border: 1px solid #c4ccd8; border-radius: 14px; box-shadow: 0 10px 30px rgb(20 32 47 / 0.14); background: #fff; }
.panel img { display: block; width: 100%; height: 100%; border-radius: 13px; }
`;

async function mark() {
  const svg = await readFile(
    join(root, "packages/brand/masters/mark.svg"),
    "utf8",
  );
  return svg.replace(/<\?xml[^>]*\?>/u, "").trim();
}

function page(width: number, height: number, body: string) {
  return `<!doctype html><meta charset="utf-8"><style>${css}</style><div class="canvas" style="width:${width}px;height:${height}px">${body}</div>`;
}

function store(spec: ImageSpec, markSvg: string) {
  const locale = spec.locale as Locale;
  const story = spec.story as Story;
  const text = copy[story];
  const margin = 56;
  const panelHeight = spec.height - 2 * 48;
  const scale = panelHeight / panelViewport.height;
  const panelWidth = Math.round(panelViewport.width * scale);
  const textWidth = spec.width - panelWidth - 3 * margin;
  return page(
    spec.width,
    spec.height,
    `<div style="position:absolute;left:${margin}px;top:${margin}px" class="brand">${markSvg.replace("<svg", '<svg width="44" height="44"')}<span style="font-size:26px">Source Taster</span></div>
     <div style="position:absolute;left:${margin}px;top:0;bottom:0;width:${textWidth}px;display:flex;flex-direction:column;justify-content:center;gap:20px">
       <h1 style="font-size:46px">${text.headline[locale]}</h1>
       <p style="font-size:22px">${text.caption[locale]}</p>
     </div>
     <div class="panel" style="left:${spec.width - margin - panelWidth}px;top:48px;width:${panelWidth}px;height:${panelHeight}px"><img src="${pathToFileURL(join(captureDir, `${locale}-${story}.png`)).href}"></div>`,
  );
}

function promo(spec: ImageSpec, markSvg: string) {
  const small = spec.role === "promo-small";
  const icon = small ? 96 : 200;
  return page(
    spec.width,
    spec.height,
    `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div class="brand" style="gap:${small ? 18 : 40}px">${markSvg.replace("<svg", `<svg width="${icon}" height="${icon}"`)}<span style="font-size:${small ? 38 : 92}px">Source Taster</span></div></div>`,
  );
}

function social(spec: ImageSpec, markSvg: string) {
  const locale = spec.locale as Locale;
  const text = copy.social;
  return page(
    spec.width,
    spec.height,
    `<div style="position:absolute;left:80px;top:72px" class="brand">${markSvg.replace("<svg", '<svg width="64" height="64"')}<span style="font-size:36px">Source Taster</span></div>
     <div style="position:absolute;left:80px;right:80px;bottom:88px;display:flex;flex-direction:column;gap:24px">
       <h1 style="font-size:68px">${text.headline[locale]}</h1>
       <p style="font-size:30px;max-width:900px">${text.caption[locale]}</p>
     </div>`,
  );
}

let captureDir = "";

/** Writes every image of the set into `outDir`, composed from `outDir/captures`. */
export async function composeAll(outDir: string) {
  captureDir = join(outDir, "captures");
  await mkdir(outDir, { recursive: true });
  const markSvg = await mark();
  const browser = await chromium.launch({ channel: "chromium" });
  const work = await mkdtemp(join(tmpdir(), "st215-compose-"));
  try {
    for (const spec of imageSpecs) {
      const html =
        spec.role === "social"
          ? social(spec, markSvg)
          : spec.role.startsWith("promo")
            ? promo(spec, markSvg)
            : store(spec, markSvg);
      const file = join(work, `${spec.file}.html`);
      await writeFile(file, html);
      const context = await browser.newContext({
        viewport: { width: spec.width, height: spec.height },
        deviceScaleFactor: 1,
        colorScheme: "light",
        reducedMotion: "reduce",
      });
      const tab = await context.newPage();
      await tab.goto(pathToFileURL(file).href);
      await tab.evaluate(() => document.fonts.ready.then(() => undefined));
      const shot = PNG.sync.read(await tab.screenshot({ type: "png" }));
      await context.close();
      for (let i = 3; i < shot.data.length; i += 4)
        if (shot.data[i] !== 255)
          throw new Error(`${spec.file}: composition is not fully opaque`);
      await writeFile(
        join(outDir, spec.file),
        PNG.sync.write(shot, { colorType: 2 }),
      );
    }
  } finally {
    await browser.close();
    await rm(work, { recursive: true, force: true });
  }
}
