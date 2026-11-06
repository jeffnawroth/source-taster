// PROTOTYPE (#191): screenshots. Needs the dev server running on :5191.
// Run from apps/web: node prototype/identity/capture.mjs <outDir>
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "prototype-screenshots";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1.5 });
const names = { A: "ink", B: "signal", C: "clarity" };
for (const v of ["A", "B", "C"]) {
  for (const theme of ["light", "dark"]) {
    await page.goto(`http://127.0.0.1:5191/?variant=${v}&theme=${theme}&lang=de`);
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: ".switcher{display:none!important}" });
    await page.waitForTimeout(300);
    const base = `${out}/${v}-${names[v]}`;
    await page.locator("#brand").screenshot({ path: `${base}-brand-${theme}.png` });
    await page.locator("#results-web").screenshot({ path: `${base}-results-web-${theme}.png` });
    await page.locator("#results-panel-list").screenshot({ path: `${base}-results-360-list-${theme}.png` });
    await page.locator("#results-panel-detail").screenshot({ path: `${base}-results-360-detail-${theme}.png` });
    if (theme === "light") await page.locator("#verdict-grey").screenshot({ path: `${base}-verdicts-greyscale.png` });
  }
}
await browser.close();
