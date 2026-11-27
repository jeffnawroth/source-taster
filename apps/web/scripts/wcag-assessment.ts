// SPDX-License-Identifier: AGPL-3.0-or-later
// Q08 (#256): the browser passes behind the WCAG 2.2 A/AA self-assessment of the
// web app (standalone) and the shared UI the extension panel renders. It runs
// what axe cannot judge: keyboard order, focus visibility and obscuring, target
// size, reflow, text spacing, content on hover, motion and form semantics. Its
// output is evidence for docs/implementation/256-wcag-22-aa-self-assessment.md;
// it is not a conformance claim and replaces no human review.
//
//   pnpm dev:local                                  # in another terminal
//   pnpm --filter @source-taster/web exec node scripts/wcag-assessment.ts [--url http://127.0.0.1:5493]
//
// Writes docs/evidence/256-wcag/web-browser-passes.json.
import { chromium, type BrowserContext, type Page } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  axe,
  keyboardSummary,
  overflow,
  structure,
  tabPass,
  textSpacing,
  wcagTags as tags,
} from "./wcag-probes.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const argument = process.argv.indexOf("--url");
const base = (
  argument > 0 ? process.argv[argument + 1]! : "http://127.0.0.1:5493"
).replace(/\/$/u, "");
const messages = {
  en: JSON.parse(
    readFileSync(resolve(root, "packages/i18n/messages/en.json"), "utf8"),
  ) as Record<string, string>,
  de: JSON.parse(
    readFileSync(resolve(root, "packages/i18n/messages/de.json"), "utf8"),
  ) as Record<string, string>,
};
type Language = keyof typeof messages;
const references = [
  "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
  "Doe, J. (2020). A reference whose DOI does not exist. Journal of Examples, 1, 1–2. https://doi.org/10.5555/workspace-nonexistent",
  "Doe, J. (2021). Unavailable evidence. doi:10.5555/browser-unavailable",
].join("\n");

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const name = (language: Language, key: string) =>
  new RegExp(`^${escape(messages[language][key]!)}$`, "u");

async function launcher(page: Page, language: Language) {
  await page
    .getByRole("button", {
      name: new RegExp(`^${escape(messages[language].shell_command_hint!)}`),
    })
    .click();
}
async function command(page: Page, language: Language, key: string) {
  await launcher(page, language);
  const palette = page.getByRole("dialog", {
    name: name(language, "shell_commands"),
  });
  await palette.getByRole("menuitem", { name: name(language, key) }).click();
}
async function chooseLanguage(page: Page, language: Language) {
  await page.goto(`${base}/`);
  await command(page, language, "shell_preferences");
  const dialog = page.getByRole("dialog", {
    name: name(language, "shell_preferences"),
  });
  await dialog
    .getByRole("combobox", { name: /^(Language|Sprache)$/u })
    .selectOption(language);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  await page.waitForTimeout(200);
}
/** The command palette fades out while the next dialog fades in; wait for one. */
async function dialogReady(page: Page) {
  await page.waitForFunction(
    () => document.querySelectorAll("[role=dialog]").length === 1,
  );
}
async function runCheck(page: Page, language: Language) {
  await page.getByRole("textbox").fill(references);
  await page
    .getByRole("button", { name: name(language, "check_action") })
    .click();
  await page
    .getByRole("grid", { name: /^(References|Referenzen)$/u })
    .getByRole("row")
    .first()
    .waitFor();
  await page.waitForFunction(
    () =>
      !document.body.innerText.includes("Running") &&
      !document.body.innerText.includes("Läuft"),
    undefined,
    { timeout: 30_000 },
  );
}

type Builder = (page: Page, language: Language) => Promise<void>;
const states: Record<string, Builder> = {
  intake: async () => {},
  counted: async (page) => {
    await page.getByRole("textbox").fill(references);
    await page.waitForTimeout(300);
  },
  "dialog-preferences": async (page, language) => {
    await command(page, language, "shell_preferences");
    await dialogReady(page);
  },
  "dialog-commands": async (page, language) => {
    await launcher(page, language);
    await dialogReady(page);
  },
  "dialog-how-it-works": async (page, language) => {
    await command(page, language, "workspace_help");
    await dialogReady(page);
  },
  done: async (page, language) => {
    await runCheck(page, language);
  },
  detail: async (page, language) => {
    await runCheck(page, language);
    await page
      .getByRole("grid", { name: /^(References|Referenzen)$/u })
      .getByRole("button")
      .first()
      .click();
    await page
      .getByRole("region", { name: /^(Reference detail|Referenzdetail)/u })
      .waitFor();
  },
  "dialog-export": async (page, language) => {
    await runCheck(page, language);
    await page
      .getByRole("region", { name: /^(Check summary|Prüfungsübersicht)$/u })
      .getByRole("button", { name: name(language, "shell_more_actions") })
      .click();
    await page
      .getByRole("menuitem", { name: name(language, "shell_export") })
      .click();
    await dialogReady(page);
  },
  "dialog-report": async (page, language) => {
    await runCheck(page, language);
    await page
      .getByRole("region", { name: /^(Check summary|Prüfungsübersicht)$/u })
      .getByRole("button", { name: name(language, "shell_more_actions") })
      .click();
    await page.getByRole("menuitem", { name: /PDF/u }).click();
    await dialogReady(page);
  },
};

async function newPage(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  language: Language,
  scheme: "light" | "dark",
  viewport: { width: number; height: number },
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    viewport,
    colorScheme: scheme,
    locale: language,
    // The 1.4.12 probe injects a stylesheet; the page's own CSP is not under test.
    bypassCSP: true,
  });
  const page = await context.newPage();
  await chooseLanguage(page, language);
  return { context, page };
}

// --extras re-runs only the keyboard, dialog, tooltip, toast and palette passes
// and keeps the matrix of an earlier run, which takes most of the time.
const extras = process.argv.includes("--extras");
const output = resolve(root, "docs/evidence/256-wcag/web-browser-passes.json");
const results: Record<string, unknown> = extras
  ? (JSON.parse(readFileSync(output, "utf8")) as Record<string, unknown>)
  : { generated: new Date().toISOString().slice(0, 10), base, tags };
const browser = await chromium.launch();
try {
  const matrix: Record<string, unknown> = {};
  for (const language of extras ? [] : (["en", "de"] as const))
    for (const scheme of ["light", "dark"] as const)
      for (const [viewportName, viewport] of [
        ["desktop", { width: 1280, height: 800 }],
        ["reflow-320", { width: 320, height: 256 }],
      ] as const)
        for (const [state, build] of Object.entries(states)) {
          const key = `${state}|${language}|${scheme}|${viewportName}`;
          const { context, page } = await newPage(
            browser,
            language,
            scheme,
            viewport,
          );
          try {
            await build(page, language);
            await page.waitForTimeout(250);
            matrix[key] = {
              axe: await axe(page),
              overflow: await overflow(page),
              structure: await structure(page),
            };
          } catch (error) {
            matrix[key] = { error: String(error).slice(0, 300) };
          }
          const outcome = matrix[key] as {
            axe?: { violations: unknown };
            error?: string;
          };
          console.log(
            key,
            JSON.stringify(
              outcome.axe?.violations ?? outcome.error ?? "",
            ).slice(0, 160),
          );
          await context.close();
        }
  if (!extras) results.matrix = matrix;

  // Keyboard, focus, target size and spacing run on the English desktop views.
  const keyboard: Record<string, unknown> = {};
  for (const state of ["intake", "counted", "done", "detail"] as const) {
    const { context, page } = await newPage(browser, "en", "light", {
      width: 1280,
      height: 800,
    });
    await states[state]!(page, "en");
    const stops = await tabPass(
      page,
      120,
      true,
      resolve(root, ".tmp/focus-shots", state),
    );
    keyboard[state] = keyboardSummary(stops);
    keyboard[`${state}:text-spacing`] = await textSpacing(page);
    await context.close();
  }
  results.keyboard = keyboard;

  // Dialog focus: opens from the keyboard, traps Tab inside, Escape returns focus.
  const dialogs: Record<string, unknown> = {};
  for (const state of [
    "dialog-preferences",
    "dialog-commands",
    "dialog-how-it-works",
    "dialog-export",
    "dialog-report",
  ] as const) {
    const { context, page } = await newPage(browser, "en", "light", {
      width: 1280,
      height: 800,
    });
    await states[state]!(page, "en");
    const dialog = page.getByRole("dialog");
    const stops = await tabPass(page, 60);
    const outside = await page.evaluate(
      () =>
        !document
          .querySelector("[role=dialog]")
          ?.contains(document.activeElement),
    );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    dialogs[state] = {
      stops: stops.length,
      focusEscapedDialog: outside,
      closedByEscape: (await dialog.count()) === 0,
      focusAfterClose: await page.evaluate(
        () => document.activeElement?.tagName.toLowerCase() ?? null,
      ),
      focusAfterCloseNotBody: await page.evaluate(
        () => document.activeElement !== document.body,
      ),
      smallTargets: stops.filter((stop) => stop.width < 24 || stop.height < 24),
    };
    await context.close();
  }
  results.dialogs = dialogs;

  // 1.4.13: a Tooltip appears on hover, stays while the pointer is on it, and
  // Escape dismisses it without moving focus.
  {
    const { context, page } = await newPage(browser, "en", "light", {
      width: 1280,
      height: 800,
    });
    const target = page.getByRole("button", { name: /^Preferences$/u }).first();
    // React Aria opens a hover tooltip only after a pointer interaction; the
    // setup above ended on the keyboard, so press once on empty space first.
    await page.mouse.move(5, 400);
    await page.mouse.down();
    await page.mouse.up();
    await target.hover();
    await page.waitForTimeout(1200);
    const shown = await page.locator("[role=tooltip]").count();
    let hoverable = false;
    if (shown) {
      const box = await page.locator("[role=tooltip]").first().boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(1500);
        hoverable = (await page.locator("[role=tooltip]").count()) > 0;
      }
    }
    await page.mouse.move(5, 400);
    await page.waitForTimeout(500);
    await page.keyboard.press("Tab");
    await target.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await page.waitForTimeout(1000);
    const focusShown = await page.locator("[role=tooltip]").count();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    results.tooltip = {
      hoverShown: shown,
      hoverable,
      focusShown,
      dismissedByEscape: (await page.locator("[role=tooltip]").count()) === 0,
      focusKept: await target.evaluate(
        (node) => node === document.activeElement,
      ),
    };
    await context.close();
  }

  // 2.2.1: a Toast times out after 5 s unless it carries an action; it must
  // pause while the pointer or focus is on it. Switching the language raises one.
  {
    const { context, page } = await newPage(browser, "en", "light", {
      width: 1280,
      height: 800,
    });
    await command(page, "en", "shell_preferences");
    const dialog = page.getByRole("dialog", {
      name: name("en", "shell_preferences"),
    });
    await dialog
      .getByRole("combobox", { name: /^Language$/u })
      .selectOption("de");
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    const toast = page.locator(".st-toast").first();
    await toast.waitFor({ timeout: 4000 }).catch(() => undefined);
    const appeared = await page.locator(".st-toast").count();
    let stillThereWhileHovered = false;
    let goneAfterLeaving = false;
    if (appeared) {
      await toast.hover();
      await page.waitForTimeout(7000);
      stillThereWhileHovered = (await page.locator(".st-toast").count()) > 0;
      await page.mouse.move(5, 5);
      await page.waitForTimeout(7000);
      goneAfterLeaving = (await page.locator(".st-toast").count()) === 0;
    }
    results.toast = {
      appeared,
      stillThereWhileHovered,
      goneAfterLeaving,
      closeButton: appeared
        ? await toast.getByRole("button").count()
        : undefined,
    };
    await context.close();
  }

  {
    const { context, page } = await newPage(browser, "en", "light", {
      width: 1280,
      height: 800,
    });
    await launcher(page, "en");
    await dialogReady(page);
    await page.waitForTimeout(400);
    results.paletteAxe = await axe(page);
    await context.close();
  }

  // 2.1.1: with the command palette scrolling at 320 x 256, arrow keys reach the
  // last command (axe flags the list as a scrollable region).
  {
    const { context, page } = await newPage(browser, "en", "light", {
      width: 320,
      height: 256,
    });
    await launcher(page, "en");
    const palette = page.getByRole("dialog", {
      name: name("en", "shell_commands"),
    });
    await palette.waitFor();
    const items = palette.getByRole("menuitem");
    const total = await items.count();
    for (let index = 0; index < total + 2; index++)
      await page.keyboard.press("ArrowDown");
    // The list scrolls smoothly toward the active command; let it settle.
    await page.waitForTimeout(800);
    const last = await page.evaluate(() => {
      // The palette keeps focus in its search field and points at the current
      // command with aria-activedescendant.
      const id = document
        .querySelector("[role=dialog] input")
        ?.getAttribute("aria-activedescendant");
      const active = id ? document.getElementById(id) : null;
      const list = active?.closest("[role=menu]") as HTMLElement | null;
      if (!active || !list) return null;
      const a = active.getBoundingClientRect();
      const l = list.getBoundingClientRect();
      return {
        activeLabel: (active.textContent ?? "").trim().slice(0, 40),
        inView: a.top >= l.top - 1 && a.bottom <= l.bottom + 1,
        scrolls: list.scrollHeight > list.clientHeight,
      };
    });
    results.paletteKeyboardScroll = { total, last };
    await context.close();
  }

  // 2.5.8 / 2.4.11 on a narrow screen, and 1.3.4 in both orientations.
  {
    const orientation: Record<string, unknown> = {};
    for (const [label, viewport] of [
      ["portrait-390x844", { width: 390, height: 844 }],
      ["landscape-844x390", { width: 844, height: 390 }],
    ] as const) {
      const { context, page } = await newPage(browser, "en", "light", viewport);
      await states.done!(page, "en");
      orientation[label] = {
        ...(await overflow(page)),
        axe: (await axe(page)).violations.map((violation) => violation.id),
      };
      await context.close();
    }
    results.orientation = orientation;
  }
} finally {
  await browser.close();
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(results, null, 2)}\n`);
console.log(`wrote ${output}`);
