// SPDX-License-Identifier: AGPL-3.0-or-later
// #216 website regression evidence: rendered contrast in both colour schemes and
// languages, reflow with enlarged text, forced colours, reduced motion, and a
// search journey that stays on this origin and stores nothing. It sits beside
// the existing axe, privacy, legal-route and search-resilience suites and does
// not repeat them. Automated checks only; this is not a conformance claim.
import { expect, test, type Page } from "@playwright/test";
import { paintedContrast, ratioFloor } from "../../web/e2e/support/rendered.ts";
import { openDocumentationSearch } from "./search.ts";

const languages = ["en", "de"] as const;
const schemes = ["light", "dark"] as const;

function samples(page: Page) {
  return [
    ["heading", page.getByRole("heading", { level: 1 }).first()],
    ["body", page.locator("main p").first()],
    [
      "navigation link",
      page.getByRole("navigation").first().getByRole("link").first(),
    ],
    ["footer link", page.getByRole("contentinfo").getByRole("link").first()],
  ] as const;
}

for (const language of languages)
  for (const scheme of schemes)
    test(`${language}/${scheme}: rendered text keeps its contrast on the page and in the search dialog`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/${language}/`);
      for (const [name, locator] of samples(page)) {
        await locator.scrollIntoViewIfNeeded();
        const painted = await paintedContrast(locator, "text");
        expect(painted.count, `${name} painted pixels`).toBeGreaterThan(5);
        expect(painted.min, name).toBeGreaterThanOrEqual(ratioFloor.text);
      }
      await openDocumentationSearch(page);
      const dialog = page.getByRole("dialog");
      const query = dialog.getByRole("searchbox");
      await query.fill("Harvard");
      await query.press("Enter");
      const result = dialog.getByRole("link").first();
      await expect(result).toBeVisible();
      for (const [name, locator] of [
        ["search field", query],
        ["search result", result],
      ] as const) {
        const painted = await paintedContrast(locator, "text");
        expect(painted.count, `${name} painted pixels`).toBeGreaterThan(5);
        expect(painted.min, name).toBeGreaterThanOrEqual(ratioFloor.text);
      }
    });

test("a deliberately faint text colour is caught by the same measurement", async ({
  page,
}) => {
  await page.goto("/en/");
  const heading = page.getByRole("heading", { level: 1 }).first();
  await heading.evaluate((element) => {
    element.style.setProperty("color", "rgb(226 228 234)", "important");
  });
  const painted = await paintedContrast(heading, "text");
  expect(painted.count).toBeGreaterThan(5);
  expect(painted.min).toBeLessThan(ratioFloor.text);
});

for (const language of languages)
  for (const width of [640, 320])
    test(`${language}: text enlarged to 200% still reflows at ${width}px and keeps navigation reachable`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/${language}/`);
      // Through the CSSOM: the site's policy forbids injected style elements.
      await page.evaluate(() =>
        document.documentElement.style.setProperty(
          "font-size",
          "200%",
          "important",
        ),
      );
      expect(
        await page.evaluate(
          () => getComputedStyle(document.documentElement).fontSize,
        ),
      ).toBe("32px");
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      const search = page.getByRole("button", {
        name: /^(Search documentation|Dokumentation durchsuchen)$/,
      });
      await search.scrollIntoViewIfNeeded();
      await expect(search).toBeVisible();
      const box = (await search.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      await openDocumentationSearch(page);
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("searchbox")).toBeFocused();
      const frame = (await dialog.boundingBox())!;
      expect(frame.x).toBeGreaterThanOrEqual(0);
      expect(frame.x + frame.width).toBeLessThanOrEqual(width + 1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    });

for (const language of languages)
  test(`${language}: forced colours keep a visible focus indicator and the dialog its edge`, async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto(`/${language}/`);
    const search = page.getByRole("button", {
      name: /^(Search documentation|Dokumentation durchsuchen)$/,
    });
    await search.focus();
    const focus = await search.evaluate((element) => {
      const css = getComputedStyle(element);
      return {
        style: css.outlineStyle,
        width: Number.parseFloat(css.outlineWidth),
      };
    });
    expect(focus.style).not.toBe("none");
    expect(focus.width).toBeGreaterThanOrEqual(2);
    await search.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const edge = await dialog.evaluate((element) => {
      const css = getComputedStyle(element);
      return (
        Number.parseFloat(css.borderTopWidth) +
        Number.parseFloat(css.outlineWidth)
      );
    });
    expect(edge).toBeGreaterThan(0);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(search).toBeFocused();
  });

for (const language of languages)
  test(`${language}: reduced motion leaves nothing moving on the page or in the dialog`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${language}/`);
    await openDocumentationSearch(page);
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("searchbox").fill("Harvard");
    await dialog.getByRole("searchbox").press("Enter");
    await expect(dialog.getByRole("link").first()).toBeVisible();
    const moving = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => {
          const timing = animation.effect?.getComputedTiming();
          return (
            animation.playState === "running" &&
            ((timing?.iterations ?? 1) > 1 || (timing?.duration as number) > 50)
          );
        })
        .map((animation) => animation.id || animation.constructor.name),
    );
    expect(moving).toEqual([]);
  });

for (const language of languages)
  test(`${language}: a search journey stays on this origin, sets no cookie and stores nothing`, async ({
    page,
    baseURL,
  }) => {
    const origins = new Set<string>();
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.protocol === "http:" || url.protocol === "https:")
        origins.add(url.origin);
    });
    await page.goto(`/${language}/`);
    await openDocumentationSearch(page);
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("searchbox").fill("Harvard");
    await dialog.getByRole("searchbox").press("Enter");
    await expect(dialog.getByRole("link").first()).toBeVisible();
    await dialog.getByRole("searchbox").fill("zzzzqqqq");
    await dialog.getByRole("searchbox").press("Enter");
    await expect(dialog.getByRole("status")).not.toHaveText("");
    expect([...origins]).toEqual([new URL(baseURL!).origin]);
    expect(await page.context().cookies()).toEqual([]);
    expect(
      await page.evaluate(async () => ({
        local: localStorage.length,
        session: sessionStorage.length,
        databases: (await indexedDB.databases()).length,
      })),
    ).toEqual({ local: 0, session: 0, databases: 0 });
  });
