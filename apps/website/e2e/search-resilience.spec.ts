// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import { openDocumentationSearch } from "./search.ts";

for (const language of ["de", "en"] as const) {
  for (const [boundary, pattern] of [
    ["entry", "**/pagefind-entry.json*"],
    ["WASM", "**/wasm.*.pagefind"],
    ["fragment", "**/fragment/**"],
  ] as const) {
    test(`${language}: actual Pagefind ${boundary} failure can be retried`, async ({
      page,
    }) => {
      await page.goto(`/docs/${language}/`);
      await openDocumentationSearch(page);
      await page.route(pattern, (route) => route.abort());
      await page.getByRole("searchbox").fill("Harvard");
      await page.getByRole("searchbox").press("Enter");
      await expect(page.getByRole("status")).toHaveText(
        language === "en"
          ? "Try again or use the documentation links. Search could not load."
          : "Versuchen Sie es erneut oder nutzen Sie die Dokumentationslinks. Die Suche konnte nicht geladen werden.",
      );
      await page.unroute(pattern);
      await page
        .getByRole("button", {
          name: language === "en" ? "Retry search" : "Suche erneut versuchen",
          exact: true,
        })
        .click();
      await expect(
        page.locator("#search-results").getByRole("link", {
          name:
            language === "en"
              ? "Structuring references"
              : "Referenzen strukturieren",
          exact: true,
        }),
      ).toHaveAttribute("href", `/docs/${language}/structuring/`);
    });
  }

  test(`${language}: a late result cannot replace a newer empty search`, async ({
    page,
  }) => {
    const arrived = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    await page.route("**/fragment/**", async (route) => {
      arrived.resolve();
      await release.promise;
      await route.continue();
    });
    await page.goto(`/docs/${language}/`);
    await openDocumentationSearch(page);
    const query = page.getByRole("searchbox");
    await query.fill("Harvard");
    await query.press("Enter");
    await arrived.promise;
    try {
      await query.fill("zzzzuniquenomatch");
      await query.press("Enter");
      await expect(page.getByRole("status")).toHaveText(
        language === "en"
          ? "No matching pages. Try another word."
          : "Keine passenden Seiten. Versuchen Sie ein anderes Wort.",
      );
    } finally {
      release.resolve();
    }
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#search-results").getByRole("link")).toHaveCount(
      0,
    );
    await expect(page.getByRole("status")).toHaveText(
      language === "en"
        ? "No matching pages. Try another word."
        : "Keine passenden Seiten. Versuchen Sie ein anderes Wort.",
    );
  });
}
