// SPDX-License-Identifier: AGPL-3.0-or-later
// #216 integrated visual and accessibility regression evidence, standalone Web.
// Real verification API and worker; the DOI providers stay at their HTTP
// boundary. Assertions are on rendered pixels and live accessibility state, not
// on screenshots. This is automated evidence from Chromium; it is not a WCAG
// conformance claim and does not replace the native/human gates in
// docs/implementation/216-regression-evidence.md.
import { expect, test, type Page } from "@playwright/test";
import { choosePreferences } from "./support/workspace.ts";
import AxeBuilder from "@axe-core/playwright";
import {
  greyscaleDifference,
  outlineContrast,
  overlap,
  paintedContrast,
  ratioFloor,
  silhouette,
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
// Greyscale thresholds, set from measurements on this build (macOS, Chromium):
// the strongest cell of each glyph differs from its backdrop by 333 to 642 of
// 765 (summed over three channels), so 250 leaves about a quarter of margin
// under the weakest; the most alike pair of silhouettes reaches an
// intersection-over-union of 0.75 at the loosest silhouette threshold tried
// (0.68 at the half-maximum), so 0.80 leaves 0.05 over the worst case, where
// two identical glyphs score 1. A change of rendering engine can move these;
// the manifest in docs/implementation/216-regression-evidence.json records the
// observed values.
const greyscaleVisible = 250;
const greyscaleSameShape = 0.8;
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
  await choosePreferences(page, { language: language });
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

// The sticky glass header of the open detail (two panes, from 768 px). Its
// backdrop is the detail content scrolled underneath, not the feed. In #194 D
// the header carries Close and "Reference n of N", which are measured here. The
// Verdict moved below the title into the scrolling body, off the glass: axe
// color-contrast covers its text there, and Verdict glyphs on glass are
// measured in the strip test above.
async function openStuckDetail(page: Page, language: Language, theme: Theme) {
  const { feed } = await openChecked(page, language, theme);
  await feed.getByRole("row").first().getByRole("button").click();
  const header = page.locator(".detail-head");
  await expect(header).toBeVisible();
  expect(
    await header.evaluate((el) => getComputedStyle(el).position),
    "the header is sticky at this width",
  ).toBe("sticky");
  expect(
    await header.evaluate((el) => getComputedStyle(el).backdropFilter),
    "this run must exercise the real glass, not the opaque fallback",
  ).not.toBe("none");
  // Scroll the detail until its content really sits under the stuck header.
  const under = await page.evaluate(() => {
    const pane = document.querySelector<HTMLElement>(".check-detail")!;
    const head = document.querySelector<HTMLElement>(".detail-head")!;
    pane.scrollTop = 240;
    const box = head.getBoundingClientRect();
    const covered = [...pane.querySelectorAll<HTMLElement>("p, li, td")]
      .filter((el) => !head.contains(el))
      .filter((el) => {
        const at = el.getBoundingClientRect();
        return at.top < box.bottom && at.bottom > box.top;
      });
    return { scrolled: pane.scrollTop, covered: covered.length };
  });
  expect(under.scrolled, "the detail scrolled").toBeGreaterThan(0);
  expect(
    under.covered,
    "detail content is behind the header, so the backdrop is not empty",
  ).toBeGreaterThan(0);
  return header;
}

for (const language of ["en", "de"] as const)
  for (const theme of ["light", "dark"] as const)
    test(`the sticky detail header keeps text and glyph contrast over scrolled detail content (${language}, ${theme})`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      const header = await openStuckDetail(page, language, theme);
      const positionText = await paintedContrast(
        header.locator(".detail-position"),
        "text",
      );
      expect(positionText.count, "position text is painted").toBeGreaterThan(5);
      expect(
        positionText.min,
        "position text on the detail header",
      ).toBeGreaterThanOrEqual(ratioFloor.text);
      const closeLabel = await paintedContrast(
        header.locator(".check-back"),
        "text",
      );
      expect(closeLabel.count, "Close label is painted").toBeGreaterThan(5);
      expect(
        closeLabel.min,
        "Close label on the detail header",
      ).toBeGreaterThanOrEqual(ratioFloor.text);
      const glyph = header.locator(".check-back svg");
      await expect(glyph).toHaveCount(1);
      const shape = await paintedContrast(glyph, "shape");
      expect(shape.count, "fully painted glyph pixels").toBeGreaterThan(20);
      expect(
        shape.min,
        "Close glyph on the detail header",
      ).toBeGreaterThanOrEqual(ratioFloor.nonText);
    });

test("negative control: the detail header measurement rejects faint text and a faint glyph", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const header = await openStuckDetail(page, "en", "light");
  const label = header.locator(".detail-position");
  const glyph = header.locator(".check-back svg");
  expect(
    (await paintedContrast(label, "text")).min,
    "control: the real label passes",
  ).toBeGreaterThanOrEqual(ratioFloor.text);
  await label.evaluate((el) =>
    el.style.setProperty("color", "rgb(226 228 234)", "important"),
  );
  const faint = await paintedContrast(label, "text");
  expect(faint.count).toBeGreaterThan(5);
  expect(faint.min).toBeLessThan(ratioFloor.text);
  await glyph.evaluate((el) =>
    el.style.setProperty("color", "rgb(226 228 234)", "important"),
  );
  const pale = await paintedContrast(glyph, "shape");
  expect(pale.count).toBeGreaterThan(20);
  expect(pale.min).toBeLessThan(ratioFloor.nonText);
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
  // Text in the colour of the bar itself cannot be located: it reads as
  // unpainted, not as a pass, and so fails a floor that needs painted pixels.
  const backdrop = await heading.evaluate(
    (el) => getComputedStyle(el.parentElement!).backgroundColor,
  );
  await heading.evaluate((el, color) => {
    (el as HTMLElement).style.setProperty("color", color, "important");
  }, backdrop);
  const invisible = await paintedContrast(heading, "text");
  expect(invisible.count, "text in the bar's own colour").toBe(0);
  expect(invisible.min).toBe(0);
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
    // The #194 D strip shows from the start of the check, so the six counters
    // can be measured while they are still at 0 and disabled. A disabled counter
    // is dimmed to 0.55 opacity exactly as in the prototype (an inactive
    // component, outside WCAG 1.4.11). The dimming is not the glyph design
    // this test is about, so the counters are measured at full opacity.
    await page.addStyleTag({
      content: ".summary-counter { opacity: 1 !important; }",
    });
    const glyphs = strip.locator("svg[data-verdict]");
    const names: string[] = [];
    const differences: number[][] = [];
    for (let n = 0; n < 6; n++) {
      const glyph = glyphs.nth(n);
      names.push((await glyph.getAttribute("data-verdict"))!);
      differences.push(await greyscaleDifference(page, glyph));
    }
    expect(new Set(names).size, "six different Verdict identifiers").toBe(6);
    for (const [n, difference] of differences.entries())
      expect(
        Math.max(...difference),
        `${names[n]} is clearly visible in greyscale (strongest cell difference, of 765)`,
      ).toBeGreaterThanOrEqual(greyscaleVisible);
    // Every silhouette threshold from a quarter to three quarters of the
    // glyph's strongest cell must keep the six apart, so the result does not
    // hang on one number. The half-maximum (the edge criterion) is the one
    // reported.
    const report: string[] = [];
    for (const fraction of [0.25, 0.5, 0.75]) {
      const masks = differences.map((d) => silhouette(d, fraction));
      let highest = 0;
      const pairs: string[] = [];
      for (let a = 0; a < 6; a++) {
        expect(
          masks[a]!.reduce((sum, v) => sum + v, 0),
          `${names[a]} paints a measurable silhouette at ${fraction}`,
        ).toBeGreaterThan(20);
        for (let b = a + 1; b < 6; b++) {
          const same = overlap(masks[a]!, masks[b]!);
          pairs.push(`${names[a]}/${names[b]}=${same.toFixed(2)}`);
          highest = Math.max(highest, same);
        }
      }
      report.push(`${fraction}: ${highest.toFixed(2)}`);
      expect(
        highest,
        `most alike pair at ${fraction}: ${pairs.join(" ")}`,
      ).toBeLessThan(greyscaleSameShape);
    }
    // Control: the measurer must call a glyph identical to itself.
    const own = silhouette(differences[0]!);
    expect(overlap(own, own)).toBe(1);
    // Control: it must also tell a glyph from a different one.
    expect(overlap(own, silhouette(differences[1]!))).toBeLessThan(1);
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
          `counter text on the opaque strip ${JSON.stringify(measured.worst)}`,
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
    // Reset moved into the ⋯ Menu (#194 D); its trigger is the button here.
    const more = page.getByRole("button", {
      name: "More actions",
      exact: true,
    });
    await page.keyboard.press("Tab");
    await more.focus();
    await expect(more).toBeFocused();
    expect(
      await outlineContrast(more),
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
        probeSpins: all.filter(
          (a) =>
            (a as CSSAnimation).animationName === "st-spin" &&
            ((a.effect as KeyframeEffect | null)?.target as Element | null)
              ?.id === "motion-probe",
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
  // The D strip shows its own pending spinner beside the probe, so the
  // control counts the probe itself rather than every spinner on the page.
  expect(
    normal.probeSpins,
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
    // The product's own wording (`check_progress` in the message catalogs), in
    // the language of the page: a number, the total of 8, and what it counts.
    const template =
      language === "en"
        ? /^(\d+) of 8 references finished$/u
        : /^(\d+) von 8 Referenzen abgeschlossen$/u;
    const wrongLanguage =
      language === "en"
        ? /\b(von|Referenzen|abgeschlossen)\b/u
        : /\b(of|references|finished)\b/u;
    expect(
      heard.filter((line) => wrongLanguage.test(line)),
      "every announcement is in the page language",
    ).toEqual([]);
    const progress = heard.filter((line) => template.test(line));
    // Updates are bounded (every third completion plus the end), not per event.
    expect(
      progress.length,
      `progress announcements: ${JSON.stringify(progress)}`,
    ).toBeLessThanOrEqual(6);
    expect(
      progress.length,
      "progress is announced more than once, so it is followed",
    ).toBeGreaterThan(1);
    const counts = progress.map((line) => Number(template.exec(line)![1]));
    expect(counts, "progress only moves forward").toEqual(
      [...counts].sort((x, y) => x - y),
    );
    expect(new Set(counts).size, "no count is announced twice").toBe(
      counts.length,
    );
    expect(counts.at(-1), "the finished count is announced").toBe(8);
    // Meaning, not just a count: the check is announced when it starts, and the
    // finished count is the last of the progress lines, after the others.
    expect(heard[0], "the recognised References are announced first").toMatch(
      language === "en"
        ? /^8 references recognized\./u
        : /^8 Referenzen erkannt\./u,
    );
    expect(
      heard.lastIndexOf(progress.at(-1)!),
      "the finished count comes after every other progress line",
    ).toBeGreaterThan(heard.lastIndexOf(progress.at(-2)!));
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
    // Focus as a keyboard user gives it, so the focus indicator is what is
    // read. Before D the outline read here was the selected row's, as the
    // detail opened on its own; D (#194) opens no detail and selects no row,
    // and a programmatic focus after pointer input shows no focus ring.
    await page.keyboard.press("Shift");
    await row.focus();
    expect(
      await row.evaluate((el) => el.matches(":focus-visible")),
      "the row shows keyboard focus",
    ).toBe(true);
    expect(
      await row.evaluate((el) => getComputedStyle(el).outlineStyle),
      "focus stays visible in forced colors",
    ).not.toBe("none");
  });
