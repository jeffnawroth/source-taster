// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
const reference =
  "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
for (const language of ["en", "de"] as const) {
  test(`shows the DOI Verdict with icon, text, field values and evidence in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page.getByRole("textbox").fill(reference);
    await page
      .getByRole("button", {
        name: language === "en" ? "Check Reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const result = page.getByRole("status");
    const verdict = result.getByText(
      language === "en"
        ? "Exists, with deviations"
        : "Existiert, mit Abweichungen",
      { exact: true },
    );
    await expect(verdict).toBeVisible({ timeout: 15000 });
    await expect(
      verdict.locator("..").locator('span[aria-hidden="true"]'),
    ).toHaveText("△");
    await result
      .getByText(
        language === "en"
          ? "Explanation and source evidence"
          : "Erklärung und Quellenbelege",
        { exact: true },
      )
      .click();
    await expect(result).toContainText("uncalibrated");
    await expect(result).toContainText("doi.org");
    await expect(result).toContainText("crossref");
    await expect(result).toContainText("2008");
    await expect(result).toContainText("2009-01");
    await expect(result).toContainText("50.00 %");
    await expect(
      result.getByRole("link", {
        name: language === "en" ? "Open Source" : "Quelle öffnen",
      }),
    ).toHaveAttribute("href", "https://doi.org/10.1038%2Fnphys1170");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    // Language switches preserve the same result and change its explanations.
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language === "en" ? "de" : "en");
    await expect(result).toContainText(
      language === "en"
        ? "Existiert, mit Abweichungen"
        : "Exists, with deviations",
    );
    await expect(result).toContainText(reference);
  });
}
