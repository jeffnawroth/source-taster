// SPDX-License-Identifier: AGPL-3.0-or-later
// Q08 (#256): the browser passes behind the WCAG 2.2 A/AA self-assessment of the
// website. It adds what the existing e2e accessibility spec (axe + reflow on
// every route) does not judge: keyboard order, skip link, focus visibility and
// obscuring, target size, text spacing, content on hover, motion, dark mode and
// the documentation search dialog. Evidence input only; no conformance claim.
//
//   pnpm --filter @source-taster/website preview --port 5497   # in another terminal
//   pnpm --filter @source-taster/web exec node scripts/wcag-website.ts [--url http://127.0.0.1:5497]
//
// Writes docs/evidence/256-wcag/website-browser-passes.json.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  axe,
  keyboardSummary,
  overflow,
  structure,
  tabPass,
  textSpacing,
  wcagTags,
} from "./wcag-probes.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const argument = process.argv.indexOf("--url");
const base = (
  argument > 0 ? process.argv[argument + 1]! : "http://127.0.0.1:5497"
).replace(/\/$/u, "");
const routes = [
  "/en/",
  "/de/",
  "/en/faq/",
  "/en/contact/",
  "/en/privacy/",
  "/en/accessibility/",
  "/de/accessibility/",
  "/docs/en/",
  "/docs/de/",
  "/docs/en/how-the-check-works/",
  "/docs/en/errors-and-retry/",
];

const results: Record<string, unknown> = {
  generated: new Date().toISOString().slice(0, 10),
  base,
  tags: wcagTags,
};
const browser = await chromium.launch();
try {
  const pages: Record<string, unknown> = {};
  for (const route of routes) {
    for (const scheme of ["light", "dark"] as const) {
      for (const [viewportName, viewport] of [
        ["desktop", { width: 1280, height: 800 }],
        ["reflow-320", { width: 320, height: 256 }],
      ] as const) {
        const key = `${route}|${scheme}|${viewportName}`;
        const context = await browser.newContext({
          viewport,
          colorScheme: scheme,
        });
        const page = await context.newPage();
        try {
          const response = await page.goto(`${base}${route}`);
          pages[key] = {
            status: response?.status(),
            axe: await axe(page),
            overflow: await overflow(page),
            structure: await structure(page),
          };
        } catch (error) {
          pages[key] = { error: String(error).slice(0, 300) };
        }
        console.log(
          key,
          JSON.stringify(
            (pages[key] as { axe?: { violations: unknown } }).axe?.violations ??
              (pages[key] as { error?: string }).error ??
              "",
          ).slice(0, 140),
        );
        await context.close();
      }
    }
  }
  results.pages = pages;

  // Keyboard, focus, target size, text spacing and the skip link, desktop and 320.
  const keyboard: Record<string, unknown> = {};
  for (const route of routes) {
    for (const [viewportName, viewport] of [
      ["desktop", { width: 1280, height: 800 }],
      ["reflow-320", { width: 320, height: 256 }],
    ] as const) {
      const context = await browser.newContext({ viewport, bypassCSP: true });
      const page = await context.newPage();
      await page.goto(`${base}${route}`);
      const stops = await tabPass(page);
      const first = stops[0];
      // Bypass blocks: the first stop is a skip link, activating it moves focus
      // to the main landmark.
      let skip: Record<string, unknown> = { firstStop: first?.name ?? null };
      if (first?.tag === "a") {
        await page.keyboard.press("Enter");
        skip = {
          ...skip,
          focusAfterActivate: await page.evaluate(
            () =>
              document.activeElement?.id ||
              document.activeElement?.tagName.toLowerCase() ||
              null,
          ),
          mainReached: await page.evaluate(() => {
            const active = document.activeElement;
            return (
              !!active &&
              (active.closest("main") !== null ||
                active.tagName.toLowerCase() === "main")
            );
          }),
        };
      }
      keyboard[`${route}|${viewportName}`] = {
        ...keyboardSummary(stops),
        skip,
        textSpacing: await textSpacing(page),
      };
      await context.close();
    }
  }
  results.keyboard = keyboard;

  // 1.4.4: 200 % text zoom through the browser's device scale is not the same as
  // text-only zoom; the font size is raised instead, the way a user stylesheet
  // does, and the page must still carry its content without clipping.
  {
    const zoom: Record<string, unknown> = {};
    for (const route of ["/en/", "/docs/en/", "/en/faq/"]) {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        bypassCSP: true,
      });
      const page = await context.newPage();
      await page.goto(`${base}${route}`);
      await page.addStyleTag({ content: "html{font-size:200% !important}" });
      await page.waitForTimeout(200);
      zoom[route] = {
        ...(await overflow(page)),
        axe: (await axe(page)).violations.map((violation) => violation.id),
      };
      await context.close();
    }
    results.textZoom200 = zoom;
  }

  // 2.3.3 / 2.2.2: reduced motion, and any animation that never ends.
  {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${base}/en/`);
    results.reducedMotion = await page.evaluate(() => ({
      running: document
        .getAnimations()
        .filter((animation) => animation.playState === "running").length,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    await context.close();
  }

  // The documentation search dialog: opens from the keyboard, holds focus,
  // Escape closes and returns focus to its trigger.
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto(`${base}/docs/en/`);
    const trigger = page
      .getByRole("button", { name: /^Search documentation$/u })
      .first();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    const open = await page.locator("[role=dialog],dialog[open]").count();
    const stops = await tabPass(page, 30);
    const inside = await page.evaluate(
      () =>
        !!document
          .querySelector("[role=dialog],dialog[open]")
          ?.contains(document.activeElement),
    );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    results.search = {
      open,
      stops: stops.length,
      focusInsideAfterTabbing: inside,
      closedByEscape:
        (await page.locator("[role=dialog],dialog[open]").count()) === 0,
      focusReturnedToTrigger: await trigger.evaluate(
        (node) => node === document.activeElement,
      ),
    };
    await context.close();
  }

  // Both languages: switch links carry lang so a screen reader pronounces them.
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${base}/en/`);
    results.languageLinks = await page.evaluate(() =>
      [...document.querySelectorAll("a[hreflang],a[lang]")].map((link) => ({
        text: (link.textContent ?? "").trim(),
        lang: link.getAttribute("lang"),
        hreflang: link.getAttribute("hreflang"),
      })),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
const output = resolve(
  root,
  "docs/evidence/256-wcag/website-browser-passes.json",
);
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(results, null, 2)}\n`);
console.log(`wrote ${output}`);
