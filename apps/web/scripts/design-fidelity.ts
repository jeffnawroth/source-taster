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
//   pnpm dev:local:hosted                            # instead, for --hosted
//   pnpm --filter @source-taster/web fidelity --hosted [--only free-account]
//
// Output: apps/web/test-results/design-fidelity/index.html and <state>.png;
// with --hosted, design-fidelity-hosted/. The hosted run signs a never-seen
// address in once through the mail capture (--mail, default port 5496).
// Full-size pixels and measured geometry/styles fail the process outside tolerance.
import {
  chromium,
  type Browser,
  type Page,
  type Response,
} from "@playwright/test";
import {
  beginEvidence,
  privateCoverage,
  type PrivateResult,
} from "./design-fidelity/evidence.ts";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  measure,
  compareMeasurements,
  pixelDiff,
  probesFor,
  tolerances,
  type Measurements,
} from "./design-fidelity/measurements.ts";

import {
  CheckResponse,
  QuotaResponse,
  type Check,
} from "@source-taster/contract-verification/v2";
import { TextStructuringResponse } from "@source-taster/contract-verification/document";
import type { AiStructuringResult } from "@source-taster/contract-verification/ai";
import {
  normalizePrototype,
  normalizeStructuringPrototype,
} from "./design-fidelity/fixtures.ts";
import {
  normalizeShell,
  readShellFixture,
  ownerGeometryChecks,
  type ShellFixture,
} from "./design-fidelity/normalization.ts";
import {
  preparePdfComparisons,
  websiteProbes,
  readWebsiteFixture,
  normalizeWebsiteFixture,
  prepareWebsiteCanvas,
  assertWebsiteAssets,
  type WebsiteFixture,
} from "./design-fidelity/media.ts";

import {
  readAppFixture,
  normalizeAppFixture,
  type AppFixture,
} from "./design-fidelity/app.ts";
import { interactions } from "./design-fidelity/interactions.ts";
import { normalizeAppUtilities } from "./design-fidelity/theme.ts";
import { appFontFaces, appFontSource } from "./design-fidelity/fonts.ts";
import {
  readManualFixture,
  normalizeManualFixture,
  type ManualFixture,
} from "./design-fidelity/manual-fixture.ts";
import {
  readListFixture,
  normalizeListFixture,
  type ListFixture,
} from "./design-fidelity/list-fixture.ts";
import { scrollAppEnd } from "./design-fidelity/scroll.ts";
import {
  captureScrollCoverage,
  compareScrollCoverage,
  scrollCoverageDom,
  type ScrollCoverage,
} from "./design-fidelity/scroll-coverage.ts";
import { normalizeBrand } from "./design-fidelity/brand.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const args = process.argv.slice(2);
// Hosted states (#229) need `pnpm dev:local:hosted`; they write their own
// sheets so a hosted run never wipes the standalone ones.
const hosted = args.includes("--hosted");
const option = (name: string) => {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--"))
    throw new Error(`Missing value for ${name}`);
  return value;
};
const out = resolve(
  root,
  option("--out") ??
    `apps/web/test-results/design-fidelity${hosted ? "-hosted" : ""}`,
);
const url = option("--url") ?? "http://127.0.0.1:5493";
const only = option("--only");
const mailUrl = option("--mail") ?? "http://127.0.0.1:5496/mail.json";

import { pins } from "../design-sources.ts";
export { pins };

// Deterministic preview fixtures (docs/local-preview.md and
// apps/server/test/support/preview-fixtures.ts) chosen to reach as many
// verdict kinds as the standalone preview can produce.
export const references = [
  "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
  "Aspelmeyer, M. (2011). Measured measurements. Nature Physics, 7, 13–15. https://doi.org/10.1038/nphys1170",
  "Smith, A. (2021). Synthetic journal evidence. The Journal of biological chemistry, 1, 1–2. https://doi.org/10.5555/browser-journal",
  "Jones, B. (2015). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.5555/browser-journal",
  "Doe, J. (2020). A reference whose DOI does not exist. Journal of Examples, 1, 1–2. https://doi.org/10.5555/workspace-nonexistent",
  "Nobody, N. (2018). A title nobody has written anywhere. Journal of Nothing, 3, 5–6.",
  "Poe, P. (2022). Invalid metadata. Journal of Examples, 3, 1–2. https://doi.org/10.5555/browser-invalid",
  "Roe, R. (2021). Unavailable resolver. Journal of Examples, 2, 3–4. https://doi.org/10.5555/browser-unavailable",
].join("\n\n");

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
  /** Clicks in the prototype after its stage has rendered (menus, dialogs). */
  prototypeAfter?: (page: Page) => Promise<void>;
  /** Expected, documented differences that are not fidelity defects. */
  note?: string;
  /** Built side runs signed in as the run's fresh Free Account (hosted). */
  signedIn?: boolean;
  scrollEnd?: "feed" | "detail";
  /** Element both sides scroll to the viewport centre before capture. */
  centre?: { built: string; prototype: string };
  /** Per-state fixture text only; masks preserve surrounding chrome and geometry. */
  masks?: { prototype: string; built: string }[];
}

const standalone =
  "Standalone mode: no Guest, Account, Plan or Quota UI is expected (ADR-0003). Prototype fixture data and counts differ.";

type AppStage =
  | "intake"
  | "filled"
  | "counted"
  | "running"
  | "done"
  | "detail"
  | "menu"
  | "export";

// The held DOI never answers, so the Check stays running for the screenshot.
const held =
  "Held, H. (2023). A resolver that never answers. Journal of Examples, 4, 1–2. https://doi.org/10.5555/browser-held";

/**
 * Drives the built preview to a state. The selectors are the contract the
 * rebuilt UI must keep (en and de): the primary "Check" button, the ⋯ trigger
 * named like the prototype's "More actions", an "Export" menu item, and
 * progress as a role=progressbar with aria-valuenow/max.
 */
function app(stage: AppStage) {
  return async (page: Page) => {
    const reuse =
      !["intake", "filled", "counted", "running"].includes(stage) &&
      (await page.locator(".check-status > p.sr-only").count()) > 0 &&
      /^(Finished|Abgeschlossen)$/.test(
        (
          await page
            .locator(".check-status > p.sr-only")
            .first()
            .textContent()
            .catch(() => "")
        )?.trim() ?? "",
      );
    if (reuse) {
      // Restore the genuine completed Check with ordinary UI actions.
      for (let i = 0; i < 3; i++) await page.keyboard.press("Escape");
      const discard = page
        .getByRole("button", {
          name: /^(Discard draft|Discard|Entwurf verwerfen|Verwerfen)$/,
        })
        .first();
      if (await discard.isVisible()) await discard.click();
      const back = page.locator(".check-back");
      if (await back.isVisible()) await back.click();
      // A previous filter or "Show all labels" state must not leak forward.
      const clearFilter = page.locator(".active-filter button").first();
      if (await clearFilter.isVisible()) await clearFilter.click();
      if (
        (page.viewportSize()?.width ?? 0) <= 360 &&
        (await page.locator('.summary-section[data-compact="false"]').count()) >
          0
      ) {
        await page
          .getByRole("button", { name: /^(More actions|Weitere Aktionen)$/ })
          .first()
          .click();
        await page
          .getByRole("menuitem", { name: /^(Hide labels|Labels ausblenden)$/ })
          .click();
      }
    } else {
      await page.goto(`${url}/`);
      await page.waitForLoadState("networkidle");
    }
    if (stage === "intake") return;
    if (stage === "counted") {
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      page.once("close", release);
      await page.route("**/v2/checks", async (route) => {
        if (route.request().method() !== "POST") {
          await route.continue();
          return;
        }
        await gate;
        if (!page.isClosed()) await route.continue();
      });
    }
    if (!reuse)
      await page
        .getByRole("textbox")
        .first()
        .fill(stage === "running" ? held : references);
    if (stage === "filled") return;
    if (!reuse)
      await page
        .getByRole("button", { name: /^Check\b|pr\u00fcfen$/ })
        .first()
        .click();
    if (stage === "counted") {
      await page.getByTestId("counted-preview").waitFor();
      return;
    }
    if (stage === "running") {
      await page.waitForTimeout(3000);
      return;
    }
    // A newly mounted counted view has no progressbar: absence must never pass as completion.
    await page.locator(".check-status").waitFor({ timeout: 120_000 });
    await page.waitForFunction(
      () =>
        /^(Finished|Abgeschlossen)$/.test(
          document
            .querySelector(".check-status > p.sr-only")
            ?.textContent?.trim() ?? "",
        ),
      undefined,
      { timeout: 120_000, polling: 200 },
    );
    if (stage === "done") return;
    if (stage === "menu" || stage === "export") {
      await page
        .getByRole("button", { name: /^(More actions|Weitere Aktionen)$/ })
        .first()
        .click();
      if (stage === "export")
        await page
          .getByRole("menuitem", { name: /^(Export|Exportieren)\b/ })
          .first()
          .click();
      await page.waitForTimeout(800);
      return;
    }
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

/** Prototype interactions after its `stage` param has rendered. */
const prototypeAfter: Partial<Record<string, (page: Page) => Promise<void>>> = {
  palette: (page) => page.keyboard.press("ControlOrMeta+k"),
  "palette-query": async (page) => {
    await page.keyboard.press("ControlOrMeta+k");
    await page.locator(".v-D .pq input").fill("zzzz-no-command");
  },
  "input-focus": (page) => page.locator(".v-D .cmdbar textarea").focus(),
  "command-hover": (page) => page.locator(".v-D .cmdf").hover(),
  "command-focus": (page) => page.locator(".v-D .cmdf").focus(),
  menu: (page) => page.click('[data-k="menubtn"]'),
  export: async (page) => {
    await page.click('[data-k="menubtn"]');
    await page.click('[data-act="dlg:export"]');
  },
};

type HostedStage = "intake" | "counted" | "short" | "account" | "history";

/** As many references as the Guest's or Free Account's balance plus three. */
const beyond = (n: number) =>
  Array.from(
    { length: n },
    (_, i) =>
      `Aspelmeyer, M. (${2000 + (i % 20)}). Measured measurement ${i + 1}. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170`,
  ).join("\n\n");

/**
 * Drives the hosted preview. References are separated by blank lines: the
 * hosted run counted single-newline pastes as one (docs/local-preview.md).
 */
function hostedApp(stage: HostedStage, beyondCount: number) {
  return async (page: Page) => {
    await page.goto(`${url}/`);
    await page.waitForLoadState("networkidle");
    await page
      .getByTestId("quota-meter")
      .or(page.getByTestId("quota-summary"))
      .first()
      .waitFor({ timeout: 15_000 })
      .catch(() => undefined);
    const topbar = page.locator(".checking-topbar");
    if (stage === "intake") return;
    if (stage === "account") {
      await topbar
        .getByRole("button", { name: /^(Account|Konto|Sign in|Anmelden)\b/ })
        .last()
        .click();
      await page.waitForTimeout(800);
      return;
    }
    if (stage === "history") {
      await topbar
        .getByRole("button", { name: /^(History|Verlauf)$/ })
        .first()
        .click();
      await page.waitForTimeout(800);
      return;
    }
    const text =
      stage === "short"
        ? beyond(beyondCount)
        : references.split("\n").join("\n\n");
    if (stage === "counted") {
      // Same counted state as standalone: Check is pressed, the Check POST is held so no Quota is spent.
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      page.once("close", release);
      await page.route("**/v2/checks", async (route) => {
        if (route.request().method() !== "POST") {
          await route.continue();
          return;
        }
        await gate;
        if (!page.isClosed()) await route.continue();
      });
    }
    await page.getByRole("textbox").first().fill(text);
    await page
      .getByRole("button", { name: /^Check\b|pr\u00fcfen$/ })
      .first()
      .click();
    if (stage === "counted") {
      await page.getByTestId("counted-preview").waitFor({ timeout: 30_000 });
      return;
    }
    await page.getByTestId("quota-choice").waitFor({ timeout: 30_000 });
  };
}

/** Signs a never-seen address in through the mail capture; returns the session. */
async function signIn(browser: Browser) {
  const context = await browser.newContext({ locale: "en-US" });
  const page = await context.newPage();
  const email = `fidelity-${Date.now()}@example.invalid`;
  await page.goto(`${url}/`);
  await page.waitForLoadState("networkidle");
  await page
    .locator(".checking-topbar")
    .getByRole("button", { name: /^Account: Guest$/ })
    .click();
  await page
    .locator(".account-entry")
    .getByRole("button", { name: "Sign in", exact: true })
    .click();
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  let code: string | undefined;
  for (let attempt = 0; attempt < 60 && !code; attempt++) {
    const mail = (await (await fetch(mailUrl)).json()) as {
      to: string;
      code?: string;
      text: string;
    }[];
    const hit = mail.find((entry) => entry.to.includes(email));
    code = hit?.code ?? hit?.text.match(/\b[0-9]{6}\b/)?.[0];
    if (!code) await new Promise((done) => setTimeout(done, 500));
  }
  if (!code) throw new Error(`No sign-in code for ${email} at ${mailUrl}.`);
  await page.getByLabel("Six-digit code").fill(code);
  await page.getByRole("button", { name: "Confirm code", exact: true }).click();
  await page.getByText(email, { exact: true }).first().waitFor();
  const state = await context.storageState();
  await context.close();
  return state;
}

function hostedStates(structure: string): State[] {
  const list: State[] = [];
  const d = (
    stage: string,
    frame: Frame,
    theme: Theme,
    lang: Lang,
    extra: string,
  ) =>
    `${pathToFileURL(structure).href}?variant=D&calm=1&strip=a&still=1&theme=${theme}&lang=${lang}&stage=${stage}${extra}${frame === "360" ? "&w=360" : ""}`;
  const note =
    "Hosted preview (pnpm dev:local:hosted). Prototype fixture data, names and balances differ: the prototype's short Quota is 6 left, the built one is the real Guest or Free balance.";
  for (const frame of ["web", "360"] as const)
    for (const theme of ["light", "dark"] as const)
      for (const lang of ["en", "de"] as const) {
        const tag = `${frame}-${theme}-${lang}`;
        for (const [account, stage, prototypeStage, extra] of [
          ["guest", "intake", "intake", ""],
          ["guest", "counted", "counted", "&quota=enough"],
          ["guest", "short", "counted", "&quota=short"],
          ["guest", "account", "intake", ""],
          ["free", "intake", "intake", ""],
          ["free", "short", "counted", "&quota=short"],
          ["free", "account", "intake", ""],
          ["free", "history", "intake", ""],
        ] as const)
          list.push({
            id: `hosted-${account}-${stage}-${tag}`,
            frame,
            theme,
            lang,
            prototype: d(
              prototypeStage,
              frame,
              theme,
              lang,
              `&acct=${account}${extra}`,
            ),
            prototypeAfter:
              stage === "account"
                ? (page) => page.click('[data-k="acctbtn"]')
                : stage === "history"
                  ? (page) => page.click('[data-k="histbtn"]')
                  : undefined,
            built: hostedApp(stage, account === "guest" ? 23 : 103),
            signedIn: account === "free",
            note,
          });
      }
  return only ? list.filter((state) => state.id.includes(only)) : list;
}

function site(path: string, after?: (page: Page) => Promise<void>) {
  return async (page: Page) => {
    await page.goto(`${url}${path}`);
    await page.waitForLoadState("networkidle");
    await assertWebsiteAssets(page);
    await after?.(page);
  };
}

function states(structure: string, website: string): State[] {
  const list: State[] = [];
  const d = (stage: string, frame: Frame, theme: Theme, lang: Lang) =>
    `${pathToFileURL(structure).href}?variant=D&calm=1&strip=a&still=1&theme=${theme}&lang=${lang}&stage=${stage}${frame === "360" ? "&w=360" : ""}`;
  const s = (pageId: string, frame: Frame, theme: Theme, lang: Lang) =>
    `${pathToFileURL(website).href}?variant=S&page=${pageId}&theme=${theme}&lang=${lang}&frame=${frame}`;
  for (const frame of ["web", "360"] as const)
    for (const theme of ["light", "dark"] as const)
      for (const lang of ["en", "de"] as const) {
        const tag = `${frame}-${theme}-${lang}`;
        for (const [stage, built, prototypeStage] of [
          ["intake", "intake", "intake"],
          ["palette", "intake", "intake"],
          ["palette-query", "intake", "intake"],
          ["input-focus", "intake", "intake"],
          ["command-hover", "intake", "intake"],
          ["command-focus", "intake", "intake"],
          ["theme-hover", "intake", "intake"],
          ["theme-focus", "intake", "intake"],
          ["filled", "filled", "intake"],
          ["counted", "counted", "counted"],
          ["running", "running", "running"],
          ["done", "done", "done"],
          ["done-end", "done", "done"],
          ["detail", "detail", "detail"],
          ["detail-end", "detail", "detail"],
          ["menu", "menu", "done"],
          ["export", "export", "done"],
        ] as const)
          list.push({
            id: `app-${stage}-${tag}`,
            frame,
            theme,
            lang,
            prototype: d(prototypeStage, frame, theme, lang),
            prototypeAfter: prototypeAfter[stage],
            built: async (page) => {
              await app(built)(page);
              if (stage === "palette" || stage === "palette-query") {
                await page.keyboard.press("ControlOrMeta+k");
                if (stage === "palette-query")
                  await page
                    .locator(".st-search input")
                    .fill("zzzz-no-command");
                if (stage === "palette-query")
                  await page.locator(".command-palette-empty").waitFor();
              }
              if (stage === "input-focus")
                await page.getByRole("textbox").first().focus();
              if (stage === "command-hover")
                await page.locator(".command-trigger").hover();
              if (stage === "theme-hover")
                await page.locator(".theme-toggle").hover();
              if (stage === "theme-focus") {
                await page.keyboard.press("Tab");
                await page.locator(".theme-toggle").focus();
              }
              if (stage === "command-focus")
                await page.locator(".command-trigger").focus();
            },
            note: standalone,
            ...(stage === "done-end"
              ? { scrollEnd: "feed" as const }
              : stage === "detail-end"
                ? { scrollEnd: "detail" as const }
                : {}),
          });
        for (const interaction of interactions.filter(
          (item) => !item.frame || item.frame === frame,
        ))
          list.push({
            id: `app-${interaction.id}-${tag}`,
            frame,
            theme,
            lang,
            prototype: d(interaction.sourceStage, frame, theme, lang),
            prototypeAfter: interaction.prototype,
            ...(interaction.centre ? { centre: interaction.centre } : {}),
            built: async (page) => {
              await app(interaction.builtStage)(page);
              await interaction.built(page);
            },
            note: standalone,
          });
        for (const [pageId, path] of [
          ["home", `/${lang}/`],
          ["index", `/docs/${lang}/`],
          ["how-the-check-works", `/docs/${lang}/how-the-check-works/`],
          ["structuring", `/docs/${lang}/structuring/`],
          ["preferences", `/docs/${lang}/preferences/`],
          ["errors-and-retry", `/docs/${lang}/errors-and-retry/`],
          ["availability", `/docs/${lang}/availability/`],
          ["faq", `/${lang}/faq/`],
          ["contact", `/${lang}/contact/`],
          ["legal-notice", `/${lang}/legal-notice/`],
          ["terms", `/${lang}/terms/`],
          ["privacy", `/${lang}/privacy/`],
          ["withdrawal", `/${lang}/withdrawal/`],
          ["accessibility", `/${lang}/accessibility/`],
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
        for (const interaction of ["hover", "focus"] as const)
          list.push({
            id: `site-header-search-${interaction}-${tag}`,
            frame,
            theme,
            lang,
            prototype: s("home", frame, theme, lang),
            prototypeAfter: async (page) => {
              const control = page.locator('[data-action="search"]').first();
              if (interaction === "hover") await control.hover();
              else await control.focus();
            },
            built: site(`/${lang}/`, async (page) => {
              const control = page.locator("[data-search-open]").first();
              if (interaction === "hover") await control.hover();
              else await control.focus();
            }),
            note: "Source-supported header control hover/focus; full native-size comparison.",
          });
        list.push({
          id: `site-faq-open-${tag}`,
          frame,
          theme,
          lang,
          prototype: s("faq", frame, theme, lang),
          prototypeAfter: (page) =>
            page.locator(".faq details > summary").first().click(),
          built: site(`/${lang}/faq/`, (page) =>
            page.locator(".faq details > summary").first().click(),
          ),
          note: "First FAQ disclosure expanded on both surfaces.",
        });
        if (frame === "360")
          list.push({
            id: `site-chapters-open-${tag}`,
            frame,
            theme,
            lang,
            prototype: s("how-the-check-works", frame, theme, lang),
            prototypeAfter: (page) =>
              page.locator(".mobile-chapters > summary").click(),
            built: site(`/docs/${lang}/how-the-check-works/`, (page) =>
              page.locator(".mobile-chapters > summary").click(),
            ),
            note: "Narrow article chapter navigation disclosure expanded.",
          });
        // The mobile navigation overlay, open on the home page.
        if (frame === "360")
          list.push({
            id: `site-menu-${tag}`,
            frame,
            theme,
            lang,
            prototype: s("home", frame, theme, lang),
            prototypeAfter: async (page) => {
              await page.click("[data-action=menu]");
            },
            built: site(`/${lang}/`, async (page) => {
              await page.locator(".mobile-menu > summary").click();
            }),
            note: "The prototype's top review bar and bottom switcher are review chrome, not design. The prototype's extra app-design link is omitted (see website-gaps.md).",
          });
        // The search dialog, opened from the documentation index. The built
        // search needs the Pagefind index, which loads on the first open.
        list.push({
          id: `site-search-${tag}`,
          frame,
          theme,
          lang,
          prototype: s("index", frame, theme, lang),
          prototypeAfter: async (page) => {
            await page.click("[data-action=search]");
          },
          built: site(`/docs/${lang}/`, async (page) => {
            await page.locator("[data-search-open]").first().click();
            await page.waitForSelector("dialog[data-search][open]");
          }),
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

if (!args.includes("--list")) beginEvidence(out, { tolerances, pins });
const work = mkdtempSync(join(tmpdir(), "st-fidelity-"));
let browser: Browser | undefined;
try {
  const structure = extract(work, pins.structure);
  const website = extract(work, pins.website);
  const selected = hosted
    ? hostedStates(structure)
    : states(structure, website);
  const includePdf = !hosted && (!only || only.startsWith("pdf-"));
  const pdfIds = ["de", "en"]
    .flatMap((language) =>
      Array.from({ length: 5 }, (_, i) => `pdf-C-${language}-page-${i + 1}`),
    )
    .filter((id) => !only || id.includes(only));
  if (!selected.length && (!includePdf || !pdfIds.length))
    throw new Error(`No fidelity states match ${only ?? "selection"}`);
  if (args.includes("--list")) {
    console.log(
      [
        ...selected.map((state) => state.id),
        ...(includePdf ? pdfIds : []),
      ].join("\n"),
    );
  } else {
    mkdirSync(out, { recursive: true });
    writeFileSync(
      join(out, "results.json"),
      JSON.stringify(
        { tolerances, pins, complete: false, state: "running", results: [] },
        null,
        2,
      ),
    );
    writeFileSync(
      join(out, "index.html"),
      '<!doctype html><meta charset="utf-8"><title>Design fidelity in progress</title><h1>Measured run in progress</h1><p>No acceptance result is available for this run yet.</p>',
    );
    browser = await chromium.launch();
    const session = hosted ? await signIn(browser) : undefined;
    const rows: string[] = [];
    const results: {
      id: string;
      passed: boolean;
      failures: string[];
      [key: string]: unknown;
    }[] = [];
    let completedPage:
      { group: string; page: Page; snapshot: Check } | undefined;
    const escape = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll('"', "&quot;");
    async function compare(
      id: string,
      failures: string[],
      note: string,
      extra: Record<string, unknown> = {},
    ) {
      let pixels;
      try {
        const diff = await pixelDiff(
          browser!,
          readFileSync(join(out, `${id}.prototype.png`)),
          readFileSync(join(out, `${id}.built.png`)),
        );
        const { image, ...summary } = diff;
        pixels = summary;
        writeFileSync(
          join(out, `${id}.diff.png`),
          Buffer.from(image, "base64"),
        );
        if (!diff.passed)
          failures.push(
            `Pixel diff ${(diff.ratio * 100).toFixed(3)}% exceeds ${tolerances.pixels * 100}% or dimensions differ`,
          );
      } catch (error) {
        failures.push(`Pixel comparison: ${String(error)}`);
      }
      results.push({
        id,
        passed: failures.length === 0,
        failures,
        pixels,
        ...extra,
      });
      rows.push(
        `<section id="${id}"><h2>${id}</h2><p>${escape(note)}</p>${failures.length ? `<p class="fail">${failures.map(escape).join("<br>")}</p>` : "<p>PASS</p>"}<div class="pair"><figure><figcaption>Accepted source with logged fixture alignment</figcaption><img src="${id}.prototype.png"></figure><figure><figcaption>Built product</figcaption><img src="${id}.built.png"></figure><figure><figcaption>Full-size pixel diff</figcaption><img src="${id}.diff.png"></figure></div></section>`,
      );
      console.log(
        `${failures.length ? "FAIL" : "PASS"} ${id}${pixels ? ` (${(pixels.ratio * 100).toFixed(3)}%)` : ""}`,
      );
      // Write after every state: a crash never leaves stale clean evidence.
      writeFileSync(
        join(out, "results.json"),
        JSON.stringify(
          {
            tolerances,
            pins,
            selected: selected.length + (includePdf ? pdfIds.length : 0),
            completed: results.length,
            failed: results.filter((r) => !r.passed).length,
            complete: false,
            results,
          },
          null,
          2,
        ),
      );
    }
    for (const state of selected) {
      for (const suffix of ["prototype", "built", "diff", "source"]) {
        rmSync(join(out, `${state.id}.${suffix}.png`), { force: true });
      }
      const viewport = {
        width: state.frame === "360" ? 360 : 1280,
        height: 860,
      };
      const failures: string[] = [];
      const probes = state.id.startsWith("site-")
        ? websiteProbes(state.id)
        : probesFor(state.id);
      const measurements: { prototype: Measurements; built: Measurements } = {
        prototype: {},
        built: {},
      };
      const themeGlyphs: { built?: Buffer; prototype?: Buffer } = {};
      const scrollCoverage: {
        built?: ScrollCoverage;
        prototype?: ScrollCoverage;
      } = {};
      let snapshot: Check | undefined;
      let structuring: AiStructuringResult | undefined;
      let quota:
        { granted: number; remaining: number; reserved: number } | undefined;
      let fixture: ShellFixture = { commands: [] };
      let appFixture: AppFixture | undefined;
      let manualFixture: ManualFixture | null = null;
      let listFixture: ListFixture | null = null;
      let websiteFixture: WebsiteFixture = { legalLinks: [] };
      const normalizations: unknown[] = [];
      const shoot = async (prototype: boolean) => {
        const completedState =
          /^app-(?:done|detail|menu|export|report|reset|edit-list|filter|labels)(?:-|$)/.test(
            state.id,
          );
        const group = `${state.frame}-${state.theme}-${state.lang}`;
        const reused =
          !prototype && completedState && completedPage?.group === group
            ? completedPage
            : undefined;
        if (!prototype && completedState && completedPage && !reused) {
          await completedPage.page.close();
          completedPage = undefined;
        }
        const page =
          reused?.page ??
          (await browser!.newPage({
            viewport,
            reducedMotion: "reduce",
            colorScheme: state.theme,
            locale: state.lang === "de" ? "de-DE" : "en-US",
            storageState: !prototype && state.signedIn ? session : undefined,
          }));
        if (reused) {
          snapshot = reused.snapshot;
          normalizations.push({
            field: "driver.checkReuse",
            reason:
              "Sequential real clicks reuse one genuine ended Check; no API response or product state is fabricated",
            checkId: snapshot.id,
          });
        }
        let capture: Promise<void> | undefined;
        let headers: Record<string, string> = {};
        const captureResponse = (response: Response) => {
          if (
            !prototype &&
            new URL(response.url()).pathname === "/v2/quota" &&
            response.ok()
          ) {
            capture = (async () => {
              const slot = QuotaResponse.parse(await response.json()).data;
              if (slot && "remaining" in slot)
                quota = {
                  granted: slot.granted,
                  remaining: slot.remaining,
                  reserved: slot.reserved,
                };
            })().catch((error: unknown) => {
              failures.push(`Quota fixture capture: ${String(error)}`);
            });
            return;
          }
          if (
            !prototype &&
            new URL(response.url()).pathname === "/v2/structurings" &&
            response.ok()
          ) {
            capture = (async () => {
              structuring = TextStructuringResponse.parse(await response.json())
                .data.structuring;
            })().catch((error: unknown) => {
              failures.push(`Structuring fixture capture: ${String(error)}`);
            });
            return;
          }
          if (
            prototype ||
            !/^\/v2\/checks(?:\/[a-f0-9-]+)?$/.test(
              new URL(response.url()).pathname,
            ) ||
            !response.ok()
          )
            return;
          capture = (async () => {
            const body: unknown = await response.json();
            const parsed = CheckResponse.safeParse(body);
            if (parsed.success) {
              snapshot = parsed.data.data;
              headers = await response.request().allHeaders();
            }
          })().catch((error: unknown) => {
            failures.push(`API fixture capture: ${String(error)}`);
          });
        };
        page.on("response", captureResponse);
        let successful = false;
        try {
          if (!prototype) {
            await page.addInitScript(
              ({ language, theme }) =>
                localStorage.setItem(
                  "source-taster-guest-preferences-v1",
                  JSON.stringify({ language, theme, citationStyle: "apa" }),
                ),
              { language: state.lang, theme: state.theme },
            );
            if (state.signedIn) {
              const updated = await page.request.patch(
                "http://127.0.0.1:5494/v1/preferences",
                {
                  data: { language: state.lang, theme: state.theme },
                  headers: { Origin: "http://127.0.0.1:5493" },
                },
              );
              if (!updated.ok())
                throw new Error(
                  `Account preference fixture returned ${updated.status()}`,
                );
            }
            await state.built(page);
            await capture;
            if (snapshot) {
              // Read the real completed/current Check, including streamed updates.
              const auth = Object.fromEntries(
                Object.entries(headers).filter(
                  ([name]) => name === "authorization",
                ),
              );
              const response = await page.request.get(
                `${url}/v2/checks/${snapshot.id}`,
                { headers: auth },
              );
              if (!response.ok())
                throw new Error(
                  `Check fixture read returned ${response.status()}`,
                );
              snapshot = CheckResponse.parse(await response.json()).data;
            }
            if (!state.id.startsWith("site-")) {
              fixture = await readShellFixture(page);
              appFixture = await readAppFixture(page, snapshot, state.lang);
              manualFixture = await readManualFixture(page);
              listFixture = await readListFixture(page);
              fixture.quota = quota;
              failures.push(...(await ownerGeometryChecks(page, quota)));
              if (hosted) {
                // FA-KTO-27 needs the cancellation entry on every hosted page;
                // #194 D has none. Assert it is present, then set it aside so
                // the shell compares against the prototype's own layout.
                const legal = page.locator(".legal-foot a.legal-link");
                if ((await legal.count()) !== 1)
                  failures.push("Statutory cancellation link missing");
                else {
                  const href = (await legal.getAttribute("href")) ?? "";
                  if (!/\/cancel\?language=(en|de)$/.test(href))
                    failures.push(`Statutory cancellation link href ${href}`);
                  await page.addStyleTag({
                    content: ".legal-foot{display:none!important}",
                  });
                  await page.addStyleTag({
                    content:
                      ".account-entry :is(.account-entry-more,.account-sign-out,.account-entry-preferences){display:none!important}",
                  });
                  normalizations.push({
                    field: "legal.cancellation",
                    reason:
                      "FA-KTO-27 (§312k BGB) requires the cancellation link on every hosted page; #194 D predates it, so the harness asserts the link and its href, then hides the footer below the shell",
                    before: "footer.legal-foot",
                    after: "",
                  });
                }
              }
            } else websiteFixture = await readWebsiteFixture(page);
          } else {
            await page.route("https://fonts.googleapis.com/**", (route) =>
              route.abort(),
            );
            await page.goto(state.prototype);
            await page.addStyleTag({
              content: `#switcher,#devbar,#review,.panel-chrome{display:none!important}
              #stage[data-w="360"]{display:block!important}.fake-page{display:none!important}
              #stage[data-w="360"] .panel-wrap{border:0!important;height:100dvh}
              .site{border-radius:0!important;padding-bottom:0!important}
              ${appFontFaces(root)}`,
            });
            await page.evaluate(async () => {
              await document.fonts.ready;
            });
            if (!state.id.startsWith("site-")) {
              normalizations.push({ field: "source-fonts", ...appFontSource });
              if (
                structuring &&
                !snapshot &&
                (state.id.includes("counted") || state.id.includes("-short-"))
              )
                normalizations.push(
                  await normalizeStructuringPrototype(
                    page,
                    structuring,
                    references,
                  ),
                );
              if (snapshot)
                normalizations.push(
                  await normalizePrototype(page, snapshot, state.lang, {
                    inputText: references,
                    ...(state.id.includes("detail")
                      ? { selectedSlot: snapshot.references[0]?.slot }
                      : {}),
                  }),
                );
              if (state.prototypeAfter) {
                // The copy and data swaps re-render D. For a hover or focus
                // on the top bar, run them before the interaction too: a
                // re-render after it would resize D's field while focus sits
                // on the command field, which D never does.
                if (/^app-(command|theme)-(hover|focus)-/.test(state.id))
                  normalizations.push(
                    ...(await normalizeShell(page, fixture, hosted)),
                  );
                await state.prototypeAfter(page);
                // D coalesces pointer-up renders in a zero-delay task.
                await page.waitForTimeout(50);
              }
              normalizations.push(
                ...(await normalizeShell(page, fixture, hosted)),
              );
              if (appFixture)
                normalizations.push(
                  ...(await normalizeAppFixture(page, appFixture, state.id)),
                );
              normalizations.push(
                ...(await normalizeManualFixture(page, manualFixture)),
              );
              normalizations.push(
                ...(await normalizeListFixture(page, listFixture, state.id)),
              );
              normalizations.push(
                await normalizeAppUtilities(
                  page,
                  root,
                  state.id,
                  state.theme,
                  state.lang,
                ),
              );
              normalizations.push(await normalizeBrand(page, root, "web"));
            } else {
              if (state.prototypeAfter) await state.prototypeAfter(page);
              normalizations.push(await prepareWebsiteCanvas(page));
              await page.screenshot({
                path: join(out, `${state.id}.source.png`),
                fullPage: true,
                animations: "disabled",
                caret: "hide",
              });
              normalizations.push(
                ...(await normalizeWebsiteFixture(
                  page,
                  state.lang,
                  websiteFixture,
                )),
              );
            }
          }
          await page.evaluate(async () => {
            await document.fonts.ready;
          });
          if (!state.id.includes("hover")) await page.mouse.move(0, 0);
          await page.waitForTimeout(400);
          if (state.centre) {
            const selector = state.centre[prototype ? "prototype" : "built"];
            await page
              .locator(selector)
              .first()
              .evaluate((node) => {
                // Put the element's top on the same viewport line on both
                // sides; scrollIntoView centres within each scroll container,
                // and D's container starts below its header.
                const line = Math.round(window.innerHeight * 0.4);
                let scroller: Element | null = node.parentElement;
                while (scroller) {
                  const { overflowY } = getComputedStyle(scroller);
                  if (
                    /auto|scroll/.test(overflowY) &&
                    scroller.scrollHeight > scroller.clientHeight
                  )
                    break;
                  scroller = scroller.parentElement;
                }
                const delta = node.getBoundingClientRect().top - line;
                if (scroller) scroller.scrollTop += delta;
                else window.scrollBy(0, delta);
              });
            normalizations.push({
              field: "viewport.centre",
              reason:
                "Driver alignment: the source restores its remembered scroll offset after the interaction re-render; both sides put the same element's top on the same viewport line",
              selector,
            });
            await page.waitForTimeout(100);
          }
          if (state.scrollEnd) {
            normalizations.push(
              await scrollAppEnd(page, prototype, state.scrollEnd),
            );
            await page.waitForTimeout(100);
          }
          measurements[prototype ? "prototype" : "built"] = await measure(
            page,
            probes,
            prototype,
          );
          if (hosted && !prototype && state.id.includes("-account-")) {
            // #194 D accountStub: "this is only the entry point" to Account
            // and Preferences, whose pages #196 designs. Assert the entry
            // actions exist; they are hidden above so the prototype rows
            // compare one to one.
            const signedIn = state.id.includes("-free-");
            const required = signedIn
              ? [
                  ".account-entry-more",
                  ".account-sign-out",
                  ".account-entry-preferences",
                ]
              : [".account-entry-preferences"];
            for (const selector of required)
              if (!(await page.locator(`.account-entry ${selector}`).count()))
                failures.push(`Account entry action missing: ${selector}`);
            normalizations.push({
              field: "account.entry-actions",
              reason:
                "#194 D accountStub defers Account, sign-out and Preferences to #196 and shows only the entry point; the product's entry actions are asserted present and hidden below the prototype rows",
              before: required.join(", "),
              after: "",
            });
          }
          for (const mask of state.masks ?? []) {
            const locator = page.locator(
              prototype ? mask.prototype : mask.built,
            );
            if (!(await locator.count()))
              throw new Error("Missing declared fixture mask");
            await locator.evaluateAll((nodes) =>
              nodes.forEach((node) => {
                (node as HTMLElement).style.setProperty(
                  "color",
                  "transparent",
                  "important",
                );
                (node as HTMLElement).style.setProperty(
                  "text-shadow",
                  "none",
                  "important",
                );
              }),
            );
          }
          if (state.id.startsWith("app-")) {
            // An element screenshot scrolls its target into view, which
            // moves a sticky top bar's document back to the top; keep the
            // measured scroll state for the page screenshot.
            const scrolled = await page.evaluate(() =>
              [
                document.scrollingElement,
                ...document.querySelectorAll("[data-scroll], .check-detail"),
              ].map((node) => node?.scrollTop ?? 0),
            );
            const glyph = page.locator(
              prototype ? ".owner-theme > svg" : ".theme-toggle svg",
            );
            themeGlyphs[prototype ? "prototype" : "built"] =
              await glyph.screenshot({
                path: join(
                  out,
                  `${state.id}.theme-glyph.${prototype ? "prototype" : "built"}.png`,
                ),
                animations: "disabled",
              });
            await page.evaluate((tops) => {
              [
                document.scrollingElement,
                ...document.querySelectorAll("[data-scroll], .check-detail"),
              ].forEach((node, index) => {
                if (node) node.scrollTop = tops[index] ?? 0;
              });
            }, scrolled);
          }
          await page.screenshot({
            path: join(
              out,
              `${state.id}.${prototype ? "prototype" : "built"}.png`,
            ),
            fullPage: state.id.startsWith("site-"),
            animations: "disabled",
            caret: "hide",
          });
          if (!state.id.startsWith("site-"))
            scrollCoverage[prototype ? "prototype" : "built"] =
              await captureScrollCoverage(
                (request) => page.evaluate(scrollCoverageDom, request),
                (path) =>
                  page.screenshot({
                    path,
                    animations: "disabled",
                    caret: "hide",
                  }),
                out,
                state.id,
                prototype,
              );
          successful = true;
        } catch (error) {
          failures.push(
            `${prototype ? "prototype" : "built"} driver: ${String(error).split("\n")[0]}`,
          );
        } finally {
          page.off("response", captureResponse);
          if (!prototype && completedState && successful && snapshot)
            completedPage = { group, page, snapshot };
          else {
            if (completedPage?.page === page) completedPage = undefined;
            await page.close();
          }
        }
      };
      await shoot(false);
      await shoot(true);
      failures.push(
        ...compareMeasurements(
          probes,
          measurements.prototype,
          measurements.built,
        ),
      );
      const scrolling = state.id.startsWith("site-")
        ? undefined
        : await compareScrollCoverage(
            browser,
            scrollCoverage.prototype,
            scrollCoverage.built,
            out,
            state.id,
          );
      failures.push(...(scrolling?.failures ?? []));
      let themeGlyphPixels;
      if (state.id.startsWith("app-")) {
        if (!themeGlyphs.prototype || !themeGlyphs.built)
          failures.push("Theme glyph capture missing");
        else {
          const glyph = await pixelDiff(
            browser,
            themeGlyphs.prototype,
            themeGlyphs.built,
          );
          const { image, ...metric } = glyph;
          themeGlyphPixels = metric;
          writeFileSync(
            join(out, `${state.id}.theme-glyph.diff.png`),
            Buffer.from(image, "base64"),
          );
          if (!glyph.passed)
            failures.push(
              `Theme glyph pixel diff ${(glyph.ratio * 100).toFixed(3)}% exceeds fixed 1% or dimensions differ`,
            );
        }
      }
      await compare(state.id, failures, state.note ?? "", {
        ...(themeGlyphPixels ? { themeGlyphPixels } : {}),
        measurements,
        ...(scrolling
          ? {
              scrollCoverage: {
                ...scrollCoverage,
                comparisons: scrolling.comparisons,
              },
            }
          : {}),
        normalizations,
        masks: state.masks ?? [],
      });
      for (const slice of scrolling?.comparisons ?? [])
        rows.push(
          `<section><h2>${state.id}: scroll ${slice.key}</h2><p>${slice.passed ? "PASS" : "FAIL"} (${(slice.ratio * 100).toFixed(3)}%). Overlapping native-size coverage; no scaling or masks.</p><div class="pair">${["prototype", "built", "diff"].map((suffix) => `<figure><figcaption>${suffix}</figcaption><img src="${state.id}.scroll-${slice.key}.${suffix}.png"></figure>`).join("")}</div></section>`,
        );
    }
    if (includePdf) {
      const pdfs = await preparePdfComparisons(browser, root, out);
      for (const pdf of pdfs.filter((item) => !only || item.id.includes(only)))
        await compare(pdf.id, [...pdf.failures], pdf.note);
    }
    await browser.close();
    browser = undefined;
    let privateSummary: ReturnType<typeof privateCoverage> | undefined;
    if (hosted && !only) {
      const service = process.env.SOURCE_TASTER_SERVICE_WORKTREE;
      if (!service)
        throw new Error(
          "Full hosted fidelity requires SOURCE_TASTER_SERVICE_WORKTREE for private #196/#197 coverage",
        );
      const privateOut = resolve(
        service,
        "apps/web/test-results/design-fidelity",
      );
      rmSync(join(privateOut, "summary.json"), { force: true });
      let privateChildSucceeded = false;
      try {
        execFileSync(
          process.execPath,
          [
            resolve(service, "apps/web/scripts/design-fidelity.ts"),
            "--public-root",
            root,
            "--url",
            "http://127.0.0.1:5495",
            "--app",
            url,
            "--mail",
            mailUrl,
            "--out",
            privateOut,
          ],
          { cwd: service, stdio: "inherit" },
        );
        privateChildSucceeded = true;
      } catch {
        process.exitCode = 1;
      }
      if (existsSync(join(privateOut, "summary.json"))) {
        privateSummary = privateCoverage(
          JSON.parse(
            readFileSync(join(privateOut, "summary.json"), "utf8"),
          ) as PrivateResult,
        );
      } else {
        privateSummary = {
          passed: false,
          complete: false,
          states: 0,
          evidence: "Private child produced no fresh summary",
        };
      }
      if (!privateChildSucceeded) privateSummary.passed = false;
      if (!privateSummary.passed || !privateSummary.complete)
        process.exitCode = 1;
    }
    const failed = results.filter((result) => !result.passed).length;
    const coverageComplete =
      !only &&
      results.length === selected.length + (includePdf ? pdfIds.length : 0) &&
      (!hosted || privateSummary?.complete === true);
    const complete =
      coverageComplete &&
      failed === 0 &&
      (!hosted || privateSummary?.passed === true);
    writeFileSync(
      join(out, "results.json"),
      JSON.stringify(
        {
          tolerances,
          pins,
          selected: selected.length + (includePdf ? pdfIds.length : 0),
          completed: results.length,
          failed,
          complete,
          passed: complete,
          coverageComplete,
          private: privateSummary,
          results,
        },
        null,
        2,
      ),
    );
    if (failed || (!only && !complete)) process.exitCode = 1;
    writeFileSync(
      join(out, "index.html"),
      `<!doctype html><meta charset="utf-8"><title>Measured design fidelity</title><style>body{font:14px system-ui;margin:16px}section{margin-bottom:48px}.pair{display:flex;gap:16px;align-items:start;overflow-x:auto}img{max-width:none;border:1px solid #ccc}figure{margin:0}figcaption{font-weight:600;margin:4px 0}.fail{color:#b00020}</style><h1>Measured design fidelity</h1><p>${results.length} states, ${failed} failures. Fixed policy: pixel ratio ≤1%, channel difference ≤16; geometry ≤1px; computed lengths ≤0.5px. Source-only fixture normalizations are recorded in results.json. ${only ? "Partial diagnostic run." : complete ? "All selected full-matrix gates passed; live and independent review remain separate." : "Integrated gate incomplete."}</p>${rows.join("")}`,
    );
    console.log(`Sheets: ${join(out, "index.html")}`);
  }
} finally {
  await browser?.close();
  rmSync(work, { recursive: true, force: true });
}
