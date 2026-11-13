// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import {
  choosePreferences,
  openEvidence,
  openReference,
} from "./support/workspace.ts";
for (const language of ["en", "de"] as const) {
  for (const abbreviation of ["J Biol Chem", "Unattested J Med"]) {
    test(`explains ${abbreviation} with NLM attribution accessibly in ${language}`, async ({
      page,
    }) => {
      await page.goto("/");
      await choosePreferences(page, { language: language });
      await page
        .getByRole("textbox")
        .fill(
          `1. Smith A. Synthetic journal evidence. ${abbreviation}. 2021;1:1-2. doi:10.5555/browser-journal`,
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
      await expect(result).toContainText(
        abbreviation === "J Biol Chem"
          ? language === "en"
            ? "The journal abbreviation is attested"
            : "Die Zeitschriftenabkürzung ist"
          : language === "en"
            ? "This field is unscored"
            : "Dieses Feld bleibt unbewertet",
      );
      await expect(result).toContainText(
        "Courtesy of the U.S. National Library of Medicine",
      );
      await expect(result).toContainText(
        language === "en"
          ? "NLM snapshot: 2026-10-29"
          : "NLM-Datenstand: 2026-10-29",
      );
      await expect(result).toContainText(
        language === "en"
          ? "may not reflect the most current"
          : "möglicherweise nicht die aktuellsten",
      );
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });
  }
}
