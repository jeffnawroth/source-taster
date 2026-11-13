// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { choosePreferences, openReference } from "./support/workspace.ts";

test("summary filters current Verdicts separately from technical Statuses", async ({
  page,
}) => {
  await page.goto("/");
  await choosePreferences(page, { language: "en" });
  await page
    .getByRole("textbox")
    .fill(
      "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170\nDarwin, C. (1859). On the Origin of Species.",
    );
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const summary = page.getByRole("region", { name: "Check summary" });
  // D (#194): the recognised count is the feed's echo of the input, and the
  // strip's progress bar shows only while running; a finished Check states
  // "Check complete" and how many of all References check out instead.
  await expect(
    page.getByRole("region", { name: "Your check", exact: true }),
  ).toContainText("2 references recognized");
  await expect(
    summary.getByRole("button", { name: "Correct: 1", exact: true }),
  ).toBeVisible();
  await expect(
    summary.getByRole("button", { name: "Not checked: 1", exact: true }),
  ).toBeVisible();
  await expect(summary).toContainText("Check complete");
  await expect(summary).toContainText("1 of 2 references check out.");
  for (const verdict of [
    "Correct",
    "Exists, with deviations",
    "Mixed citation",
    "DOI conflict",
    "Not found",
    "Not verifiable",
  ])
    await expect(
      summary.getByRole("button", { name: new RegExp(`^${verdict}: [01]$`) }),
    ).toBeVisible();
  await summary
    .getByRole("button", { name: "Correct: 1", exact: true })
    .click();
  await expect(
    summary.getByRole("button", { name: "Correct: 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const list = page.getByRole("grid", { name: "References" });
  await expect(list.getByRole("row")).toHaveCount(1);
  await expect(list).toContainText("Measured measurement");
  await expect(
    summary.getByRole("button", { name: "Not found: 0", exact: true }),
  ).toBeDisabled();
  // A currently matching result can leave the active filter after a real
  // Manual override; keep the empty-state and Show all recovery assertions.
  await list.getByRole("button").click();
  const detail = page.getByRole("region", {
    name: "Reference detail",
    exact: true,
  });
  await detail
    .getByRole("button", { name: "Judge manually", exact: true })
    .click();
  await detail
    .getByRole("radiogroup", { name: "Manual verdict", exact: true })
    .getByText("Not found", { exact: true })
    .click();
  await detail
    .getByRole("button", { name: "Save manual verdict", exact: true })
    .click();
  await expect(list.getByRole("row")).toHaveCount(0);
  await expect(
    page.getByText(
      "References matching the selected filter will appear here. Choose “All references” to see the whole check.",
      { exact: true },
    ),
  ).toBeVisible();
  // D: the empty filter state offers "All references" in the feed.
  await page
    .getByRole("button", { name: "All references", exact: true })
    .click();
  await expect(list.getByRole("row")).toHaveCount(2);
});

test("streaming keeps input order and focused selection; narrow Back restores list context", async ({
  page,
}) => {
  await page.goto("/");
  await choosePreferences(page, { language: "en" });
  await page
    .getByRole("textbox")
    .fill(
      "Doe, J. (2020). Held Reference. doi:10.5555/browser-held\nDarwin, C. (1859). On the Origin of Species.\nAspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
    );
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const list = page.getByRole("grid", { name: "References", exact: true });
  const rows = list.getByRole("row");
  const second = rows.nth(1);
  await second.focus();
  await expect(rows.nth(1)).toContainText("Not checked");
  await expect(rows.nth(0)).toContainText("Running");
  await expect(
    page
      .getByRole("region", { name: "Check summary" })
      .getByRole("button", { name: "Correct: 1", exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await expect(second).toBeFocused();
  await expect(rows.nth(0)).toContainText("Held Reference");
  await expect(rows.nth(1)).toContainText("On the Origin of Species");
  await expect(rows.nth(2)).toContainText("Measured measurement");
  await page.keyboard.press("Enter");
  const detail = page.getByRole("region", {
    name: "Reference detail",
    exact: true,
  });
  await expect(detail).toContainText(
    "Darwin, C. (1859). On the Origin of Species.",
  );
  await expect(list).toBeVisible();
  await page.setViewportSize({ width: 360, height: 640 });
  await expect(list).toBeHidden();
  // D: focus lands on the detail's title heading (the Reference's title).
  await expect(
    detail.getByRole("heading", {
      name: "On the Origin of Species",
      exact: true,
    }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Back to references", exact: true })
    .click();
  await expect(second).toBeFocused();
  await expect(list).toBeVisible();
  await expect(detail).toBeHidden();
});

for (const language of ["en", "de"] as const)
  test(`compares Reference and server Best match side by side at narrow zoom in ${language}`, async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await choosePreferences(page, { language: language });
    const original =
      "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
    await page.getByRole("textbox").fill(original);
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    // D: the detail opens only on a press, never on its own (#194).
    await openReference(page, 1);
    const comparison = page.getByRole("table", {
      name:
        language === "en"
          ? "Reference and best match"
          : "Referenz und bester Treffer",
      exact: true,
    });
    await expect(comparison).toBeVisible({ timeout: 15000 });
    const year = comparison.getByRole("rowgroup").filter({
      has: page.getByRole("rowheader", {
        // #194 D: the row header is the bare field name.
        name: language === "en" ? "Publication date" : "Veröffentlichungsdatum",
        exact: true,
      }),
    });
    await expect(year).toContainText("2008");
    await expect(year).toContainText("2009-01");
    await expect(year).toContainText("50.00 %");
    await expect(year).toContainText(
      language === "en" ? "Differs" : "Weicht ab",
    );
    // #194 D drops a row that neither side supplies (PMID here), so the field
    // the Reference leaves out while the Best match has it carries the check:
    // shown as not supplied, never scored as 0.00 %.
    await expect(
      comparison.getByRole("rowheader", { name: "PMID", exact: true }),
    ).toHaveCount(0);
    const missing = comparison.getByRole("rowgroup").filter({
      has: page.getByRole("rowheader", {
        name: language === "en" ? "Issue" : "Ausgabe",
        exact: true,
      }),
    });
    await expect(missing).toContainText(
      language === "en" ? "not supplied" : "nicht angegeben",
    );
    await expect(missing).not.toContainText("0.00 %");
    await page.setViewportSize({ width: 320, height: 640 });
    // D (#194): the open detail stays open across the resize and replaces the
    // feed at this width, so no second press reopens it.
    await expect(
      page.getByRole("grid", {
        name: language === "en" ? "References" : "Referenzen",
        exact: true,
      }),
    ).toBeHidden();
    // 200% zoom: a 640 CSS-pixel viewport reduced to 320 CSS pixels, plus text enlargement.
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    await expect(comparison).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags([
            "wcag2a",
            "wcag2aa",
            "wcag21a",
            "wcag21aa",
            "wcag22a",
            "wcag22aa",
          ])
          .analyze()
      ).violations,
    ).toEqual([]);
    const cells = year.getByRole("cell");
    const left = await cells.nth(0).boundingBox();
    const right = await cells.nth(1).boundingBox();
    expect(left!.x + left!.width).toBeLessThanOrEqual(right!.x + 1);
    expect(left!.width).toBeGreaterThan(110);
    expect(right!.width).toBeGreaterThan(110);
    await expect(
      page.getByRole("region", {
        name: language === "en" ? "Reference detail" : "Referenzdetails",
        exact: true,
      }),
    ).toContainText(original);
    await comparison.evaluate((element) =>
      element.scrollIntoView({ block: "start" }),
    );
    await page.screenshot({
      path: testInfo.outputPath(`comparison-${language}-320-200.png`),
    });
    await page.addStyleTag({ content: "html { font-size: 100%; }" });
    await comparison.evaluate((element) =>
      element.scrollIntoView({ block: "start" }),
    );
    await page.screenshot({
      path: testInfo.outputPath(`comparison-${language}-320-100.png`),
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await comparison.evaluate((element) =>
      element.scrollIntoView({ block: "start" }),
    );
    await page.screenshot({
      path: testInfo.outputPath(`comparison-${language}-wide.png`),
    });
  });

// The first Reference is selected by default, so its suggestion is rendered
// when the Check completes. That rendering must not move anything above the
// feed row when it settles, or a press on the row lands beside it. This was
// the Linux CI flake of the narrow-zoom comparison test (#220): the row moved
// by about 33 px between Playwright's stability check and the click. In D
// (#194) the Formatted bibliography is a Dialog from the ⋯ Menu rather than a
// panel above the feed, and the detail opens only on the press itself.
test("a narrow feed row stays under the pointer while the completed Reference's suggestion renders", async ({
  page,
}) => {
  let release!: () => void;
  let arrived!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const entered = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  // Only the rendering of the completed result carries a proven suggestion;
  // the two renderings while the Check runs do not.
  await page.route("**/bibliography", async (route) => {
    const response = await route.fetch();
    const body = (await response.json()) as {
      data: { entries: { suggestion: unknown }[] };
    };
    if (body.data.entries.some((entry) => entry.suggestion)) {
      arrived();
      await gate;
    }
    await route.fulfill({ response });
  });
  await page.goto("/");
  await choosePreferences(page, { language: "en" });
  await page
    .getByRole("textbox")
    .fill(
      "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
    );
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const comparison = page.getByRole("table", {
    name: "Reference and best match",
    exact: true,
  });
  await entered;
  await page.setViewportSize({ width: 320, height: 640 });
  const row = page
    .getByRole("grid", { name: "References", exact: true })
    .getByRole("button");
  // As a click finds it: the feed's header (in D the echo line above the
  // cards, which scrolls with them) shows through the top of the viewport and
  // the row sits low.
  await row.evaluate((element) => {
    const top = element.getBoundingClientRect().top;
    scrollBy(0, top - (innerHeight - 220));
  });
  await expect(page.locator(".feed-echo")).toBeInViewport();
  const before = (await row.boundingBox())!;
  const centre = {
    x: before.x + before.width / 2,
    y: before.y + before.height / 2,
  };
  await page.mouse.move(centre.x, centre.y);
  await page.mouse.down();
  const delivered = page.waitForResponse((response) =>
    /\/bibliography$/u.test(response.url()),
  );
  release();
  await delivered;
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const pressed = (await row.boundingBox())!;
  expect(
    Math.abs(pressed.y + pressed.height / 2 - centre.y),
    "the feed row did not move under the pointer",
  ).toBeLessThanOrEqual(1);
  await page.mouse.up();
  await expect(comparison).toBeVisible();
  await page.unrouteAll({ behavior: "ignoreErrors" });
});

for (const language of ["en", "de"] as const)
  test(`How the check works is directly reachable by keyboard in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language: language });
    await page
      .getByRole("textbox")
      .fill("Darwin, C. (1859). On the Origin of Species.");
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const help = page.getByRole("button", {
      name:
        language === "en"
          ? "How the check works"
          : "So funktioniert die Prüfung",
      exact: true,
    });
    await expect(help).toBeVisible();
    await help.focus();
    await page.keyboard.press("Enter");
    // D (#194): the explanation is a modal Dialog opened from the feed's
    // footer, not an inline disclosure; Escape closes it and focus returns
    // to its button.
    const explanation = page.getByRole("dialog", {
      name:
        language === "en"
          ? "How the check works"
          : "So funktioniert die Prüfung",
      exact: true,
    });
    await expect(explanation).toContainText(
      language === "en"
        ? "A verdict is not proof of deception. A human makes the decision."
        : "Ein Befund ist kein Beweis für Täuschung. Die Entscheidung trifft ein Mensch.",
    );
    await expect
      .poll(() =>
        explanation.evaluate((element) =>
          element.contains(document.activeElement),
        ),
      )
      .toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags([
            "wcag2a",
            "wcag2aa",
            "wcag21a",
            "wcag21aa",
            "wcag22a",
            "wcag22aa",
          ])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(explanation).toBeHidden();
    await expect(help).toBeFocused();
  });

for (const language of ["en", "de"] as const)
  test(`Back retains an active Verdict filter, scroll and keyboard context in ${language}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/");
    await choosePreferences(page, { language: language });
    const reference =
      "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
    await page.getByRole("textbox").fill(Array(12).fill(reference).join("\n"));
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const filter = page.getByRole("button", {
      name: language === "en" ? "Correct: 12" : "Korrekt: 12",
      exact: true,
    });
    await expect(filter).toBeVisible({ timeout: 15000 });
    await filter.click();
    const list = page.getByRole("grid", {
      name: language === "en" ? "References" : "Referenzen",
      exact: true,
    });
    const last = list.getByRole("row").last();
    await last.focus();
    // D: the feed scrolls with the page, not inside its own scroller.
    const scroll = await page.evaluate(() => scrollY);
    expect(scroll).toBeGreaterThan(0);
    await page.keyboard.press("Enter");
    await expect(list).toBeHidden();
    const back = page.getByRole("button", {
      name: language === "en" ? "Back to references" : "Zurück zu Referenzen",
      exact: true,
    });
    await back.focus();
    await page.keyboard.press("Enter");
    await expect(last).toBeFocused();
    await expect(filter).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags([
            "wcag2a",
            "wcag2aa",
            "wcag21a",
            "wcag21aa",
            "wcag22a",
            "wcag22aa",
          ])
          .analyze()
      ).violations,
    ).toEqual([]);
  });

test("DOI conflict has its own current count and filter", async ({ page }) => {
  await page.goto("/");
  await choosePreferences(page, { language: "en" });
  await page
    .getByRole("textbox")
    .fill(
      "Alpha, A. (2021). Workspace conflict. Journal of Testing, 1, 1–2. doi:10.5555/workspace-nonexistent",
    );
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const filter = page.getByRole("button", {
    name: "DOI conflict: 1",
    exact: true,
  });
  await expect(filter).toBeVisible({ timeout: 15000 });
  await filter.click();
  await expect(
    page
      .getByRole("grid", { name: "References", exact: true })
      .getByRole("row"),
  ).toHaveCount(1);
  // D: the detail opens only on a press, never on its own (#194).
  await openReference(page, 1);
  await expect(
    page.getByRole("region", { name: "Reference detail", exact: true }),
  ).toContainText("DOI conflict");
});

test("selected detail stays on its Reference while streaming completes other slots", async ({
  page,
}) => {
  await page.goto("/");
  await choosePreferences(page, { language: "en" });
  await page
    .getByRole("textbox")
    .fill(
      "Doe, J. (2020). Held Reference. doi:10.5555/browser-held\nDarwin, C. (1859). On the Origin of Species.",
    );
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const list = page.getByRole("grid", { name: "References", exact: true });
  await list.getByRole("button").first().click();
  const detail = page.getByRole("region", {
    name: "Reference detail",
    exact: true,
  });
  // D: focus lands on the detail's title heading (the Reference's title).
  const heading = detail.getByRole("heading", {
    name: "Held Reference",
    exact: true,
  });
  await expect(heading).toBeFocused();
  await expect(list.getByRole("row").nth(1)).toContainText("Not checked");
  await expect(detail.getByText("Running", { exact: true })).toBeVisible();
  await expect(detail.getByText("Not verifiable", { exact: true })).toBeVisible(
    { timeout: 15000 },
  );
  await expect(heading).toBeFocused();
  await expect(detail).toContainText(
    "Doe, J. (2020). Held Reference. doi:10.5555/browser-held",
  );
  await expect(list.getByRole("button").first()).toHaveAttribute(
    "aria-current",
    "true",
  );
});

// Scroll anchoring is what keeps a feed row under the reader while rows above
// it grow (streaming results, a wrapping header). The reference detail opts the
// window out of anchoring inside itself; the feed must keep the page's anchor.
// D (#194): the feed scrolls with the page and has no scroller of its own, so
// the former list-scroller case now inserts content inside the feed above its
// cards (where notices appear) and the page's anchor must hold the row there too.
for (const anchor of ["page", "feed"] as const)
  test(`the feed keeps a visible row in place when content is inserted above it at 360 px (${anchor} anchor)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/");
    await choosePreferences(page, { language: "en" });
    await page
      .getByRole("textbox")
      .fill(
        Array.from(
          { length: 8 },
          (_, index) =>
            `Darwin, C. (${1859 + index}). On the Origin of Species, volume ${index}. John Murray.`,
        ).join("\n"),
      );
    await page
      .getByRole("button", { name: "Check reference", exact: true })
      .click();
    const rows = page
      .getByRole("grid", { name: "References", exact: true })
      .getByRole("row");
    await expect(rows).toHaveCount(8);
    const target = rows.nth(3);
    await target.scrollIntoViewIfNeeded();
    // Rest the page away from its start and end, so that it can really move
    // in both directions.
    const rest = await page.evaluate(() => {
      const room = document.documentElement.scrollHeight - innerHeight;
      scrollTo(0, Math.max(0, Math.min(scrollY, room - 80)));
      return { pageRoom: room, pageTop: scrollY };
    });
    expect(rest.pageTop, "the page is mid-scroll").toBeGreaterThan(0);
    expect(rest.pageTop, "the page can still scroll").toBeLessThan(
      rest.pageRoom,
    );
    await target.scrollIntoViewIfNeeded();
    const before = (await target.boundingBox())!;
    expect(before.y, "the row is in view").toBeGreaterThan(0);
    expect(before.y + before.height, "the row is in view").toBeLessThan(640);
    await page.evaluate((where) => {
      const block = document.createElement("div");
      block.style.height = "120px";
      const reference = document.querySelector(
        where === "feed" ? ".feed-cards" : ".check-stage",
      )!;
      reference.parentElement!.insertBefore(block, reference);
    }, anchor);
    expect(
      await target.boundingBox(),
      "the row did not move when content appeared above it",
    ).toEqual(before);
  });
