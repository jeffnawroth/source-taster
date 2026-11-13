// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import {
  choosePreferences,
  openEvidence,
  openReference,
} from "../e2e/support/workspace.ts";
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
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
