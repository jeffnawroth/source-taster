// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
for (const language of ["en", "de"] as const)
  test(`downloads original or selected corrected References in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/u })
      .selectOption(language);
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
    const suggestion = page.getByRole("region", {
      name: language === "en" ? "Correction suggestion" : "Korrekturvorschlag",
      exact: true,
    });
    await expect(suggestion).toContainText("2009", { timeout: 15000 });
    await suggestion
      .getByText(
        language === "en"
          ? "Apply for export only"
          : "Nur für den Export übernehmen",
        { exact: true },
      )
      .click();
    await expect(suggestion.getByRole("checkbox")).toBeChecked();
    const exports = page.getByRole("region", {
      name: language === "en" ? "Export references" : "Referenzen exportieren",
      exact: true,
    });
    const format = exports.getByRole("combobox", {
      name: language === "en" ? "Export format" : "Exportformat",
      exact: true,
    });
    const mode = exports.getByRole("combobox", {
      name: language === "en" ? "Export content" : "Exportinhalt",
      exact: true,
    });
    for (const kind of ["csl-json", "bibtex"]) {
      await format.selectOption(kind);
      for (const choice of ["original", "selected-corrections"]) {
        await mode.selectOption(choice);
        const downloadEvent = page.waitForEvent("download");
        await exports
          .getByRole("button", {
            name:
              language === "en"
                ? "Download references"
                : "Referenzen herunterladen",
            exact: true,
          })
          .click();
        const download = await downloadEvent;
        expect(download.suggestedFilename()).toBe(
          `source-taster-references.${kind === "csl-json" ? "json" : "bib"}`,
        );
        const content = await readFile(await download.path(), "utf8");
        if (kind === "csl-json") {
          const data = JSON.parse(content) as {
            issued: { "date-parts": number[][] };
            custom: { originalText: string };
          }[];
          expect(data[0]!.issued["date-parts"][0]![0]).toBe(
            choice === "original" ? 2008 : 2009,
          );
          expect(data[0]!.custom.originalText).toContain("2008");
        } else {
          expect(content).toContain(
            `year = {${choice === "original" ? 2008 : 2009}}`,
          );
        }
      }
    }
    await expect(page.getByRole("textbox")).toContainText("2008");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await expect(format.getByRole("option")).toHaveCount(2);
  });
