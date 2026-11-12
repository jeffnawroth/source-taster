// SPDX-License-Identifier: AGPL-3.0-or-later
// Design fidelity sheets: the accepted prototypes beside the built product.
//
// The accepted structures are #194 D (calm, compact strip a) and #198 S. Their
// throwaway prototypes stay on their branches; this script reads them from the
// pinned commits in docs/design/sources.md, renders the same states from the
// running local preview and writes one side-by-side sheet per state.
//
//   pnpm dev:local                                   # in another terminal
//   pnpm --filter @source-taster/web fidelity [--only web-done] [--url http://127.0.0.1:5493]
//
// Output: apps/web/test-results/design-fidelity/index.html and <state>.png.
// The sheets are review evidence for a human, not an automated pass/fail gate.
import { chromium, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const out = resolve(root, "apps/web/test-results/design-fidelity");
const args = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const url = option("--url") ?? "http://127.0.0.1:5493";
const only = option("--only");

export const pins = {
  structure: {
    commit: "f6db1f512255bd404428212ade37abf5ea26f4a3",
    path: "apps/web/prototype/structure/prototype-194.html",
  },
  website: {
    commit: "b6dfa14909b7ec8ed4f8a7057d4bc0ea94f14022",
    path: "apps/website/prototype/website/prototype-198.html",
  },
} as const;

export const references = [
  "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
  "Doe, J. (2020). A reference whose DOI does not exist. Journal of Examples, 1, 1–2. https://doi.org/10.5555/workspace-nonexistent",
  "Roe, R. (2021). Unavailable resolver. Journal of Examples, 2, 3–4. https://doi.org/10.5555/browser-unavailable",
].join("\n");

type Frame = "web" | "360";
type Theme = "light" | "dark";
type Lang = "en" | "de";
interface State {
  id: string;
  frame: Frame;
  theme: Theme;
  lang: Lang;
  prototype: string;
  built: (page: Page) => Promise<void>;
  /** Expected, documented differences that are not fidelity defects. */
  note?: string;
}

const standalone =
  "Standalone mode: no Guest, Account, Plan or Quota UI is expected (ADR-0003). Prototype fixture data and counts differ.";

function app(stage: "intake" | "filled" | "done" | "detail") {
  return async (page: Page) => {
    await page.goto(`${url}/`);
    await page.waitForLoadState("networkidle");
    if (stage === "intake") return;
    await page.getByRole("textbox").first().fill(references);
    if (stage === "filled") return;
    await page
      .getByRole("button", { name: /^Check\b|pr\u00fcfen$/ })
      .first()
      .click();
    await page.waitForTimeout(6000);
    if (stage === "done") return;
    const open = page
      .getByRole("button", { name: /^Open\b|^\u00d6ffnen\b/ })
      .first();
    if (await open.count()) await open.click();
    else {
      await page.getByRole("row").first().focus();
      await page.keyboard.press("Enter");
    }
    await page.waitForTimeout(1500);
  };
}

function site(path: string) {
  return async (page: Page) => {
    await page.goto(`${url}${path}`);
    await page.waitForLoadState("networkidle");
  };
}

function states(structure: string, website: string): State[] {
  const list: State[] = [];
  const d = (stage: string, frame: Frame, theme: Theme, lang: Lang) =>
    `${pathToFileURL(structure).href}?variant=D&calm=1&strip=a&still=1&theme=${theme}&lang=${lang}&stage=${stage}${frame === "360" ? "&w=360" : ""}`;
  const s = (pageId: string, frame: Frame, theme: Theme, lang: Lang) =>
    `${pathToFileURL(website).href}?variant=S&page=${pageId}&theme=${theme}&lang=${lang}&frame=${frame}`;
  for (const frame of ["web", "360"] as const)
    for (const theme of ["light", "dark"] as const) {
      const lang: Lang = theme === "dark" ? "de" : "en";
      const tag = `${frame}-${theme}`;
      for (const [stage, built] of [
        ["intake", "intake"],
        ["counted", "filled"],
        ["done", "done"],
        ["detail", "detail"],
      ] as const)
        list.push({
          id: `app-${stage}-${tag}`,
          frame,
          theme,
          lang,
          prototype: d(stage, frame, theme, lang),
          built: app(built),
          note: standalone,
        });
      for (const [pageId, path] of [
        ["home", `/${lang}/`],
        ["index", `/docs/${lang}/`],
        ["how-the-check-works", `/docs/${lang}/how-the-check-works/`],
      ] as const)
        list.push({
          id: `site-${pageId}-${tag}`,
          frame,
          theme,
          lang,
          prototype: s(pageId, frame, theme, lang),
          built: site(path),
          note: "The prototype's top review bar and bottom switcher are review chrome, not design.",
        });
    }
  return only ? list.filter((state) => state.id.includes(only)) : list;
}

function extract(dir: string, pin: { commit: string; path: string }) {
  const file = join(dir, pin.path);
  mkdirSync(resolve(file, ".."), { recursive: true });
  writeFileSync(
    file,
    execFileSync("git", ["show", `${pin.commit}:${pin.path}`], {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
    }),
  );
  return file;
}

const work = mkdtempSync(join(tmpdir(), "st-fidelity-"));
try {
  const structure = extract(work, pins.structure);
  const website = extract(work, pins.website);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const rows: string[] = [];
  for (const state of states(structure, website)) {
    const viewport = {
      width: state.frame === "360" ? 360 : 1280,
      height: 860,
    };
    const shoot = async (
      name: string,
      go: (page: Page) => Promise<void>,
      prototype: boolean,
    ) => {
      const page = await browser.newPage({
        viewport:
          prototype && state.id.startsWith("app-") && state.frame === "360"
            ? { width: 1000, height: 860 }
            : viewport,
        colorScheme: state.theme,
        locale: state.lang === "de" ? "de-DE" : "en-US",
      });
      try {
        await go(page);
        if (prototype)
          await page.addStyleTag({
            content: "#switcher,#devbar{display:none!important}",
          });
        await page.waitForTimeout(800);
        await page.screenshot({ path: join(out, name), fullPage: true });
      } catch (error) {
        console.error(`${state.id} ${name}: ${String(error)}`);
      } finally {
        await page.close();
      }
    };
    await shoot(
      `${state.id}.prototype.png`,
      async (page) => {
        await page.goto(state.prototype);
        await page.waitForTimeout(1200);
      },
      true,
    );
    await shoot(`${state.id}.built.png`, state.built, false);
    rows.push(
      `<section><h2>${state.id}</h2>${state.note ? `<p>${state.note}</p>` : ""}<div class="pair"><figure><figcaption>Accepted prototype</figcaption><img src="${state.id}.prototype.png"></figure><figure><figcaption>Built</figcaption><img src="${state.id}.built.png"></figure></div></section>`,
    );
    console.log(state.id);
  }
  await browser.close();
  writeFileSync(
    join(out, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Design fidelity</title><style>body{font:14px system-ui;margin:16px}section{margin:0 0 48px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}img{width:100%;border:1px solid #ccc}figure{margin:0}figcaption{font-weight:600;margin:4px 0}</style><h1>Design fidelity: accepted prototype vs built</h1><p>Prototype pins: structure ${pins.structure.commit}, website ${pins.website.commit}. Built: ${url}.</p>${rows.join("")}`,
  );
  console.log(`Sheets: ${join(out, "index.html")}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
