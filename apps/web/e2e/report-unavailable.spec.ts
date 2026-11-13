// SPDX-License-Identifier: AGPL-3.0-or-later
// Without a Quota feature grant (standalone has none) no report can be asked
// for, and the page says so instead of offering a button that cannot work.
import { expect, test } from "@playwright/test";
import { choosePreferences, openReport } from "./support/workspace.ts";

for (const language of ["en", "de"] as const)
  test(`explains that the accessible PDF report is unavailable in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language: language });
    await page
      .getByRole("textbox")
      .fill(
        "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    // The PDF report is a Dialog from the ⋯ Menu (#194 D).
    await openReport(page);
    const region = page.getByRole("region", {
      name:
        language === "en"
          ? "Accessible PDF report"
          : "Barrierefreier PDF-Bericht",
      exact: true,
    });
    await expect(region).toBeVisible({ timeout: 20_000 });
    await expect(region).toContainText(
      language === "en" ? "not available" : "nicht verfügbar",
    );
    await expect(region.getByRole("button")).toHaveCount(0);
  });
