// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import {
  choosePreferences,
  openEvidence,
  openReference,
} from "../e2e/support/workspace.ts";
import { message } from "../e2e/support/catalog.ts";
for (const language of ["en", "de"] as const)
  test(`explains a dead original URL and archive provenance in ${language}`, async ({
    page,
  }) => {
    // The current capture form accepts free text. Supply structured CSL at
    // its published API boundary to exercise this route without guessing type.
    await page.route("**/v2/checks", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      await route.continue({
        postData: JSON.stringify({
          references: [
            {
              originalText: "Web route witness. https://example.com/web80-dead",
              fields: {
                type: "webpage",
                title: "Web route witness",
                URL: "https://example.com/web80-dead",
              },
            },
          ],
        }),
      });
    });
    await page.goto("/");
    await choosePreferences(page, { language: language });
    await page
      .getByRole("textbox")
      .fill(
        "Alpha, A. (2021). Web route witness. https://example.com/web80-dead",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await openReference(page, 1);
    const result = page.getByRole("region", {
      name: /^(Reference detail|Referenzdetails)$/u,
      exact: true,
    });
    await expect(
      result.getByText(
        language === "en"
          ? "Exists, with deviations"
          : "Existiert, mit Abweichungen",
        { exact: true },
      ),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      result
        .getByRole("link", {
          name: language === "en" ? "Open source" : "Quelle öffnen",
          exact: true,
        })
        .first(),
    ).toHaveAttribute(
      "href",
      "https://web.archive.org/web/20260102030405id_/https://example.com/web80-dead",
    );
    await openEvidence(result);
    await expect(
      result.getByText(
        language === "en"
          ? "The original URL and title identify the archived source."
          : "Die ursprüngliche URL und der Titel identifizieren die archivierte Quelle.",
        { exact: false },
      ),
    ).toBeVisible();
    await expect(
      result.getByText("20260102030405", { exact: true }),
    ).toBeVisible();
    // Each web step names what it saw: the cited URL, the URL it ended on and
    // its title, and (for the archive step) the capture time.
    for (const key of [
      "web_original_url",
      "web_observed_url",
      "web_observed_title",
      "web_archive_capture",
    ])
      await expect(
        result
          .getByRole("term")
          .filter({ hasText: message(language, key) })
          .first(),
      ).toBeVisible();
    await expect(
      result
        .getByRole("definition")
        .filter({ hasText: /^Web route witness$/u })
        .first(),
    ).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });

for (const language of ["en", "de"] as const)
  test(`names the redirect target of a moved original URL in ${language}`, async ({
    page,
  }) => {
    await page.route("**/v2/checks", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      await route.continue({
        postData: JSON.stringify({
          references: [
            {
              originalText:
                "Web route witness. https://example.com/web80-moved",
              fields: {
                type: "webpage",
                title: "Web route witness",
                URL: "https://example.com/web80-moved",
              },
            },
          ],
        }),
      });
    });
    await page.goto("/");
    await choosePreferences(page, { language });
    await page
      .getByRole("textbox")
      .fill(
        "Alpha, A. (2021). Web route witness. https://example.com/web80-moved",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await openReference(page, 1);
    const result = page.getByRole("region", {
      name: /^(Reference detail|Referenzdetails)$/u,
      exact: true,
    });
    await openEvidence(result);
    // The fixture answers the cited URL with 301 to the dead page.
    await expect(
      result
        .getByRole("term")
        .filter({ hasText: message(language, "web_redirect_target") }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      result
        .getByRole("definition")
        .filter({ hasText: /^https:\/\/example\.com\/web80-dead$/u })
        .first(),
    ).toBeVisible();
  });
