// SPDX-License-Identifier: AGPL-3.0-or-later
// Mixed citation and the "failed" Technical status have no reachable fixture
// in the local services. The real Check runs; only its event frames and
// snapshot are rewritten at the route seam, so the same feed, strip and
// detail components render both outcomes (#211, #212).
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { choosePreferences, openReference } from "./support/workspace.ts";

const references = [
  "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
  "Darwin, C. (1859). On the Origin of Species.",
].join("\n");

/** Aspelmeyer 2008 exists with deviations; Darwin is Not checked. */
const rewrite = (body: string) =>
  body
    .replaceAll('"verdict":"exists-with-deviations"', '"verdict":"mixed-citation"')
    .replaceAll('"status":"not-checked"', '"status":"failed"');

async function rewriteOutcomes(page: Page) {
  await page.route("**/v2/checks/*/events", async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: rewrite(await response.text()) });
  });
  await page.route("**/v2/checks/*", async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    const response = await route.fetch();
    await route.fulfill({ response, body: rewrite(await response.text()) });
  });
}

const copy = {
  en: {
    check: "Check reference",
    mixed: "Mixed citation",
    failed: "Technical error",
    status: "Technical status",
    feed: "References",
    detail: "Reference detail",
    remove: "Remove filter: Mixed citation",
  },
  de: {
    check: "Referenz prüfen",
    mixed: "Gemischte Referenz",
    failed: "Technischer Fehler",
    status: "Technischer Status",
    feed: "Referenzen",
    detail: "Referenzdetails",
    remove: "Filter entfernen: Gemischte Referenz",
  },
} as const;

async function axe(page: Page) {
  return (
    await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
  ).violations;
}

for (const language of ["en", "de"] as const) {
  const t = copy[language];
  test(`renders Mixed citation and a Technical error in the wide workspace (${language})`, async ({
    page,
  }) => {
    await rewriteOutcomes(page);
    await page.goto("/");
    await choosePreferences(page, { language });
    await page.getByRole("textbox").fill(references);
    await page.getByRole("button", { name: t.check, exact: true }).click();
    const summary = page.getByRole("region", {
      name: language === "en" ? "Check summary" : "Prüfungsübersicht",
    });
    const mixed = summary.getByRole("button", {
      name: `${t.mixed}: 1`,
      exact: true,
    });
    await expect(mixed).toBeEnabled({ timeout: 20_000 });
    const failed = summary.getByRole("button", {
      name: `${t.failed}: 1`,
      exact: true,
    });
    await expect(failed).toBeVisible();
    const feed = page.getByRole("grid", { name: t.feed, exact: true });
    await expect(feed.getByRole("row")).toHaveCount(2);
    await expect(feed.getByRole("row").first()).toContainText(t.mixed);
    await expect(feed.getByRole("row").nth(1)).toContainText(t.failed);
    // Filters narrow the feed to each outcome.
    await mixed.click();
    await expect(feed.getByRole("row")).toHaveCount(1);
    await expect(feed).toContainText(t.mixed);
    await summary.getByRole("button", { name: t.remove, exact: true }).click();
    await failed.click();
    await expect(feed.getByRole("row")).toHaveCount(1);
    await expect(feed).toContainText("On the Origin of Species");
    await failed.click();
    await expect(feed.getByRole("row")).toHaveCount(2);
    await openReference(page, 1);
    await expect(
      page.getByRole("region", { name: t.detail, exact: true }),
    ).toContainText(t.mixed);
    expect(await axe(page)).toEqual([]);
  });

  test(`renders Mixed citation and a Technical error in the compact strip (${language})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await rewriteOutcomes(page);
    await page.goto("/");
    await choosePreferences(page, { language });
    await page.getByRole("textbox").fill(references);
    await page.getByRole("button", { name: t.check, exact: true }).click();
    const toolbar = page
      .getByRole("region", {
        name: language === "en" ? "Check summary" : "Prüfungsübersicht",
      })
      .getByRole("toolbar");
    await expect(
      toolbar.getByRole("button", { name: `${t.mixed}: 1`, exact: true }),
    ).toBeEnabled({ timeout: 20_000 });
    await toolbar
      .getByRole("button", {
        name: `${t.status}: 1 ${t.failed}`,
        exact: true,
      })
      .click();
    await page
      .getByRole("menuitem", { name: `${t.failed}: 1`, exact: true })
      .click();
    // Axe reads the page once the status Menu has finished closing.
    await expect(page.getByRole("menu")).toHaveCount(0);
    const feed = page.getByRole("grid", { name: t.feed, exact: true });
    await expect(feed.getByRole("row")).toHaveCount(1);
    await expect(feed).toContainText(t.failed);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(await axe(page)).toEqual([]);
  });
}
