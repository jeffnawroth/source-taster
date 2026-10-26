// SPDX-License-Identifier: AGPL-3.0-or-later
// Automated WCAG 2.2 AA checks (#115). They are not a manual audit.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const artifact = JSON.parse(
  readFileSync(
    new URL("../dist-preview/website-artifact.json", import.meta.url),
    "utf8",
  ),
) as { files: Record<string, string> };
const routes = Object.keys(artifact.files)
  .filter((file) => file.endsWith("index.html"))
  .map((file) => `/${file.slice(0, -"index.html".length)}`)
  .sort();

async function expectAccessible(page: Page, label: string) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    violations.map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
    ),
    label,
  ).toEqual([]);
}

test("every built page passes the automated WCAG 2.2 AA rules at 320 and 1280 pixels", async ({
  page,
}) => {
  expect(routes.length).toBeGreaterThanOrEqual(34);
  const failed: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400)
      failed.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => failed.push(`failed ${request.url()}`));
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expectAccessible(page, `${route} @ ${width}px`);
      // Reflow (WCAG 1.4.10): nothing scrolls sideways at 320 CSS pixels.
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${route} @ ${width}px`,
      ).toBeLessThanOrEqual(width);
    }
  }
  // Styles and scripts must actually load under the hosting boundary.
  expect(failed).toEqual([]);
});

test("the not-found page is accessible in both languages", async ({ page }) => {
  const response = await page.goto("/docs/en/missing/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Deutsch" })).toHaveAttribute(
    "href",
    "/de/",
  );
  await expectAccessible(page, "404");
});

test("search results, empty and failure states are accessible", async ({
  page,
}) => {
  for (const [language, query, label] of [
    ["en", "citation style", "Search documentation"],
    ["de", "Zitierstil", "Dokumentation durchsuchen"],
  ] as const) {
    await page.goto(`/docs/${language}/`);
    const searchbox = page.getByRole("searchbox", { name: label, exact: true });
    await searchbox.fill(query);
    await searchbox.press("Enter");
    await expect(page.locator("#search-results li").first()).toBeVisible();
    await expectAccessible(page, `${language} results`);
    await searchbox.fill("zzzzuniquenomatch");
    await searchbox.press("Enter");
    await expect(page.getByRole("status")).not.toBeEmpty();
    await expectAccessible(page, `${language} empty`);
  }
  await page.route("**/pagefind/**", (route) => route.abort());
  await page.goto("/docs/en/");
  await page.getByRole("searchbox").fill("citation");
  await page.getByRole("searchbox").press("Enter");
  await expect(page.getByRole("status")).toHaveText(/./);
  await expect(page.locator("#search-results li")).toHaveCount(0);
  await expectAccessible(page, "failure");
});
