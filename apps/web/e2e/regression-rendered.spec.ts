// SPDX-License-Identifier: AGPL-3.0-or-later
// #216 integrated visual and accessibility regression evidence, standalone Web.
// Real verification API and worker; the DOI providers stay at their HTTP
// boundary. Assertions are on rendered pixels and live accessibility state, not
// on screenshots. This is automated evidence from Chromium; it is not a WCAG
// conformance claim and does not replace the native/human gates in
// docs/implementation/216-regression-evidence.md.
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  greyscaleMask,
  outlineContrast,
  overlap,
  paintedContrast,
  ratioFloor,
} from "./support/rendered.ts";

type Language = "en" | "de";
type Theme = "light" | "dark";
const words = {
  en: {
    input: "Reference",
    check: "Check reference",
    summary: "Check summary",
    feed: "References",
    language: "Language",
  },
  de: {
    input: "Referenz",
    check: "Referenz prüfen",
    summary: "Prüfungsübersicht",
    feed: "Referenzen",
    language: "Sprache",
  },
} as const;
const darwin = "Darwin, C. (1859). On the Origin of Species.";
const aspelmeyer =
  "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
// Enough rows that a short viewport scrolls content under the sticky glass.
const references = [
  aspelmeyer,
  ...Array.from({ length: 7 }, () => darwin),
].join("\n");

async function openChecked(
  page: Page,
  language: Language,
  theme: Theme,
  viewport = { width: 1100, height: 520 },
  media: { name: string; value: string }[] = [],
) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ colorScheme: theme });
  if (media.length) {
    // CDP replaces the whole feature list, so the scheme is restated.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value: theme }, ...media],
    });
  }
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /^(Language|Sprache)$/ })
    .selectOption(language);
  const w = words[language];
  await page
    .getByRole("textbox", { name: w.input, exact: true })
    .fill(references);
  await page.getByRole("button", { name: w.check, exact: true }).click();
  const feed = page.getByRole("grid", { name: w.feed, exact: true });
  await expect(feed.getByRole("row")).toHaveCount(8);
  // Every slot has a result: nothing is running, so the glyphs are final.
  await expect(page.locator("svg[data-verdict]").first()).toBeVisible({
    timeout: 20000,
  });
  await expect(
    page.getByRole("button", { name: /^(Cancel check|Prüfung abbrechen)$/ }),
  ).toHaveCount(0, { timeout: 30000 });
  return { feed, w };
}

for (const language of ["en", "de"] as const)
  for (const theme of ["light", "dark"] as const)
    test(`glass strip and top bar keep text and glyph contrast over scrolled feed rows (${language}, ${theme})`, async ({
      page,
    }) => {
      // Each measurement takes two screenshots; the check itself takes seconds.
      test.setTimeout(120_000);
      const { w } = await openChecked(page, language, theme);
      // Put real feed content behind the sticky layers.
      await page.mouse.move(600, 300);
      await page.mouse.wheel(0, 220);
      const strip = page
        .getByRole("region", { name: w.summary })
        .locator(".summary-strip");
      await expect(strip).toBeVisible();
      expect(
        await strip.evaluate((el) => getComputedStyle(el).backdropFilter),
        "this run must exercise the real glass, not the opaque fallback",
      ).not.toBe("none");
      const checked: string[] = [];
      for (const label of await strip.locator(".summary-counter").all()) {
        const text = label.locator("span").last();
        if (await text.count()) {
          const measured = await paintedContrast(text, "text");
          expect(
            measured.count,
            `strip counter text is painted and measurable (${await text.textContent()})`,
          ).toBeGreaterThan(5);
          expect(
            measured.min,
            `strip counter text on glass (${await text.textContent()})`,
          ).toBeGreaterThanOrEqual(ratioFloor.text);
          checked.push("text");
        }
      }
      expect(
        checked.length,
        "at least one counter was measurable",
      ).toBeGreaterThan(0);
      for (const glyph of await strip.locator("svg[data-verdict]").all()) {
        const measured = await paintedContrast(glyph, "shape");
        expect(
          measured.count,
          "fully painted glyph pixels must be present",
        ).toBeGreaterThan(20);
        expect(
          measured.min,
          `Verdict glyph ${await glyph.getAttribute("data-verdict")} on glass`,
        ).toBeGreaterThanOrEqual(ratioFloor.nonText);
      }
      const heading = page.locator(".checking-topbar h1");
      const top = await paintedContrast(heading, "text");
      expect(top.count).toBeGreaterThan(5);
      expect(top.min, "top bar title on glass").toBeGreaterThanOrEqual(
        ratioFloor.text,
      );
    });

test("negative control: the rendered measurer rejects text that is too faint", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const heading = page.locator(".checking-topbar h1");
  const real = await paintedContrast(heading, "text");
  expect(real.min).toBeGreaterThanOrEqual(ratioFloor.text);
  // Same element, a light-grey that nearly matches the light bar behind it.
  await heading.evaluate((el) => {
    (el as HTMLElement).style.setProperty(
      "color",
      "rgb(226 228 234)",
      "important",
    );
  });
  const faint = await paintedContrast(heading, "text");
  expect(faint.count).toBeGreaterThan(5);
  expect(faint.min).toBeLessThan(ratioFloor.text);
});

for (const theme of ["light", "dark"] as const)
  test(`the six Verdict glyphs keep distinct silhouettes in greyscale (${theme})`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1100, height: 700 });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/");
    await page
      .getByRole("textbox", { name: "Reference", exact: true })
      .fill(aspelmeyer);
    await page
      .getByRole("button", { name: "Check reference", exact: true })
      .click();
    const strip = page
      .getByRole("region", { name: "Check summary" })
      .locator(".summary-strip");
    await expect(strip.locator("svg[data-verdict]")).toHaveCount(6);
    const glyphs = strip.locator("svg[data-verdict]");
    const names: string[] = [];
    const masks: number[][] = [];
    for (let n = 0; n < 6; n++) {
      const glyph = glyphs.nth(n);
      names.push((await glyph.getAttribute("data-verdict"))!);
      masks.push(await greyscaleMask(page, glyph));
    }
    expect(new Set(names).size, "six different Verdict identifiers").toBe(6);
    const worst: string[] = [];
    let highest = 0;
    for (let a = 0; a < 6; a++) {
      expect(
        masks[a]!.reduce((sum, v) => sum + v, 0),
        `${names[a]} paints a measurable silhouette`,
      ).toBeGreaterThan(20);
      for (let b = a + 1; b < 6; b++) {
        const same = overlap(masks[a]!, masks[b]!);
        worst.push(`${names[a]}/${names[b]}=${same.toFixed(2)}`);
        highest = Math.max(highest, same);
      }
    }
    // Calibrated on this build: the most alike pair (circle and hexagon) scores
    // about 0.74, an identical glyph scores exactly 1.
    expect(highest, `most alike pair: ${worst.join(" ")}`).toBeLessThan(0.85);
    // Control: the measurer must call a glyph identical to itself.
    expect(overlap(masks[0]!, masks[0]!)).toBe(1);
  });

// 1100 is the wide layout; 360 and 320 are the reflow widths; 640x360 and
// 320x256 are what a 1280x720 viewport becomes at 200% and 400% browser zoom
// (CSS pixels; real zoom in native browsers stays a manual gate).
const reflowViewports = [
  { name: "wide", width: 1100, height: 700 },
  { name: "360", width: 360, height: 640 },
  { name: "320", width: 320, height: 700 },
  { name: "200% zoom", width: 640, height: 360 },
  { name: "400% zoom", width: 320, height: 256 },
] as const;

for (const language of ["en", "de"] as const)
  for (const theme of ["light", "dark"] as const)
    for (const viewport of reflowViewports)
      test(`checked workspace reflows without loss and without axe violations (${language}, ${theme}, ${viewport.name})`, async ({
        page,
      }) => {
        test.setTimeout(120_000);
        const { w } = await openChecked(page, language, theme, {
          width: viewport.width,
          height: viewport.height,
        });
        const overflow = await page.evaluate(() => ({
          page: document.documentElement.scrollWidth - window.innerWidth,
          body: document.body.scrollWidth - window.innerWidth,
        }));
        expect(overflow.page, "no horizontal page scroll").toBeLessThanOrEqual(
          0,
        );
        expect(overflow.body, "no horizontal body scroll").toBeLessThanOrEqual(
          0,
        );
        const strip = page
          .getByRole("region", { name: w.summary })
          .locator(".summary-strip");
        await expect(strip).toBeVisible();
        const box = (await strip.boundingBox())!;
        expect(
          box.x,
          "strip starts inside the viewport",
        ).toBeGreaterThanOrEqual(0);
        expect(
          box.x + box.width,
          "strip ends inside the viewport",
        ).toBeLessThanOrEqual(viewport.width + 1);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(results.violations).toEqual([]);
      });

for (const language of ["en", "de"] as const)
  for (const theme of ["light", "dark"] as const)
    test(`reduced transparency swaps glass for opaque surfaces that keep their contrast (${language}, ${theme})`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      const { w } = await openChecked(
        page,
        language,
        theme,
        { width: 1100, height: 520 },
        [{ name: "prefers-reduced-transparency", value: "reduce" }],
      );
      await page.mouse.move(600, 300);
      await page.mouse.wheel(0, 220);
      const strip = page
        .getByRole("region", { name: w.summary })
        .locator(".summary-strip");
      await expect(strip).toBeVisible();
      expect(
        await strip.evaluate((el) => getComputedStyle(el).backdropFilter),
        "no blur when transparency is reduced",
      ).toBe("none");
      const background = await strip.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      expect(background, "opaque surface, not a translucent wash").not.toMatch(
        /\/\s*0?\.\d+\)|rgba\(.*,\s*0?\.\d+\)/,
      );
      for (const counter of await strip.locator(".summary-counter").all()) {
        const text = counter.locator("span").last();
        const measured = await paintedContrast(text, "text");
        expect(measured.count).toBeGreaterThan(5);
        expect(
          measured.min,
          "counter text on the opaque strip",
        ).toBeGreaterThanOrEqual(ratioFloor.text);
      }
      for (const glyph of await strip.locator("svg[data-verdict]").all()) {
        const measured = await paintedContrast(glyph, "shape");
        expect(measured.count).toBeGreaterThan(20);
        expect(
          measured.min,
          "glyph on the opaque strip",
        ).toBeGreaterThanOrEqual(ratioFloor.nonText);
      }
    });

for (const theme of ["light", "dark"] as const)
  test(`keyboard focus is a visible 2px outline that keeps non-text contrast (${theme})`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const { feed } = await openChecked(page, "en", theme);
    const row = feed.getByRole("row").first();
    await row.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowUp");
    await expect(row).toBeFocused();
    const style = await row.evaluate((el) => {
      const css = getComputedStyle(el);
      return {
        style: css.outlineStyle,
        width: Number.parseFloat(css.outlineWidth),
      };
    });
    expect(style.style).not.toBe("none");
    expect(style.width).toBeGreaterThanOrEqual(2);
    expect(
      await outlineContrast(row),
      "row focus outline",
    ).toBeGreaterThanOrEqual(ratioFloor.nonText);
    const reset = page.getByRole("button", { name: "Reset", exact: true });
    await page.keyboard.press("Tab");
    await reset.focus();
    await expect(reset).toBeFocused();
    expect(
      await outlineContrast(reset),
      "button focus outline",
    ).toBeGreaterThanOrEqual(ratioFloor.nonText);
  });

test("reduced motion removes spinning and moving animation from a pending check", async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const measure = async (reduce: boolean) => {
    const context = await browser.newContext({
      reducedMotion: reduce ? "reduce" : "no-preference",
      viewport: { width: 1100, height: 700 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await page
      .getByRole("textbox", { name: "Reference", exact: true })
      .fill("Doe, J. (2020). Held Reference. doi:10.5555/browser-held");
    await page
      .getByRole("button", { name: "Check reference", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Cancel check", exact: true }),
    ).toBeVisible();
    // Control element: the shipped spinner class, to prove motion is observable.
    await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.className = "st-spinner";
      probe.textContent = "·";
      probe.id = "motion-probe";
      document.body.append(probe);
    });
    const result = await page.evaluate(() => {
      const movement =
        /^(rotate|translate|scale|transform|top|left|right|bottom|margin.*)$/;
      const all = document
        .getAnimations()
        .filter((a) => a.playState === "running");
      return {
        spins: all.filter(
          (a) => (a as CSSAnimation).animationName === "st-spin",
        ).length,
        moving: all.filter((a) =>
          (a.effect as KeyframeEffect | null)
            ?.getKeyframes()
            .some((frame) =>
              Object.keys(frame).some((property) => movement.test(property)),
            ),
        ).length,
      };
    });
    await context.close();
    return result;
  };
  const normal = await measure(false);
  expect(
    normal.spins,
    "control: the spinner rotates without the preference",
  ).toBe(1);
  const reduced = await measure(true);
  expect(reduced.spins, "nothing rotates under reduce").toBe(0);
  expect(reduced.moving, "nothing moves under reduce").toBe(0);
});

for (const language of ["en", "de"] as const)
  test(`a check announces bounded, meaningful progress to assistive technology (${language})`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.addInitScript(() => {
      const heard: string[] = [];
      (window as unknown as { __heard: string[] }).__heard = heard;
      // Leaf announcements only; the containing status region is aria-live=off.
      const live = "p[aria-live=polite], p[role=status], [role=alert]";
      const last = new WeakMap<Element, string>();
      const start = () => {
        new MutationObserver(() => {
          for (const region of document.querySelectorAll(live)) {
            const text = (region.textContent ?? "").trim();
            if (text && last.get(region) !== text) {
              last.set(region, text);
              heard.push(text);
            }
          }
        }).observe(document.documentElement, {
          subtree: true,
          childList: true,
          characterData: true,
        });
      };
      if (document.documentElement) start();
      else document.addEventListener("DOMContentLoaded", start);
    });
    await openChecked(page, language, "light");
    const heard = await page.evaluate(
      () => (window as unknown as { __heard: string[] }).__heard,
    );
    const progress = heard.filter((line) => /\d+\D+8/.test(line));
    // Updates are bounded (every third completion plus the end), not per event.
    expect(
      progress.length,
      `progress announcements: ${JSON.stringify(progress)}`,
    ).toBeLessThanOrEqual(6);
    expect(progress.length).toBeGreaterThan(0);
    const counts = progress.map((line) => Number(line.match(/\d+/)![0]));
    expect(counts, "progress only moves forward").toEqual(
      [...counts].sort((x, y) => x - y),
    );
    expect(counts.at(-1), "the finished count is announced").toBe(8);
    expect(
      heard.filter((line) => line.length > 200),
      "no announcement dumps a whole region",
    ).toEqual([]);
  });

for (const language of ["en", "de"] as const)
  test(`forced colors keep the strip opaque and its text, glyphs and focus visible (${language})`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const { w, feed } = await openChecked(
      page,
      language,
      "light",
      { width: 1100, height: 520 },
      [{ name: "forced-colors", value: "active" }],
    );
    expect(
      await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
      "forced colors really are active",
    ).toBe(true);
    await page.mouse.move(600, 300);
    await page.mouse.wheel(0, 220);
    const strip = page
      .getByRole("region", { name: w.summary })
      .locator(".summary-strip");
    await expect(strip).toBeVisible();
    expect(
      await strip.evaluate((el) => getComputedStyle(el).backdropFilter),
    ).toBe("none");
    for (const counter of await strip.locator(".summary-counter").all()) {
      // Forced colors ignore an author `color: transparent`, so the text is
      // hidden with opacity ("shape") instead of by its colour.
      const measured = await paintedContrast(
        counter.locator("span").last(),
        "shape",
      );
      expect(measured.count).toBeGreaterThan(5);
      expect(measured.min).toBeGreaterThanOrEqual(ratioFloor.text);
    }
    for (const glyph of await strip.locator("svg[data-verdict]").all()) {
      const measured = await paintedContrast(glyph, "shape");
      expect(measured.count).toBeGreaterThan(20);
      expect(measured.min).toBeGreaterThanOrEqual(ratioFloor.nonText);
    }
    const row = feed.getByRole("row").first();
    await row.focus();
    expect(
      await row.evaluate((el) => getComputedStyle(el).outlineStyle),
      "focus stays visible in forced colors",
    ).not.toBe("none");
  });
