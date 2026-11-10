// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

for (const language of ["en", "de"] as const)
  for (const format of ["bibtex", "ris"] as const)
    test(`imports a ${format} library, shows rejected and unsupported fields, and downloads exact records in ${language}`, async ({
      page,
    }) => {
      const text =
        format === "ris"
          ? "\uFEFFTY  - PAT\r\nTI  - Synthetic patent\r\nZZ  - Keep me\r\nER  - \r\n\r\n"
          : "% Library header\r\n@patent{Kept, title={Synthetic patent}, year={2024}, customfield={Keep me}}\r\n";
      const rejected =
        format === "ris"
          ? "TY  - BOOK\r\nTI  - Missing end marker"
          : "@book{Broken, title={Unclosed";
      await page.goto("/");
      await page
        .getByRole("combobox", { name: /^(Language|Sprache)$/u })
        .selectOption(language);
      await page
        .getByLabel(
          language === "en"
            ? "Import BibTeX or RIS"
            : "BibTeX oder RIS importieren",
        )
        .setInputFiles({
          name: `library.${format === "ris" ? "ris" : "bib"}`,
          mimeType: "application/x-bibtex",
          buffer: Buffer.from(text + rejected),
        });
      await expect(
        page.getByRole("status").filter({
          hasText:
            language === "en"
              ? "1 references recognized"
              : "1 Referenzen erkannt",
        }),
      ).toBeVisible();
      await expect(
        page.getByText(
          format === "ris" ? "ZZ: Keep me" : "customfield: Keep me",
          { exact: true },
        ),
      ).toBeVisible();
      await page
        .getByText(
          language === "en"
            ? "Not recognized as a reference"
            : "Nicht als Referenz erkannt",
          { exact: true },
        )
        .click();
      await expect(page.getByText(rejected, { exact: true })).toBeVisible();
      await page
        .getByRole("button", {
          name: language === "en" ? "Check reference" : "Referenz prüfen",
          exact: true,
        })
        .click();
      await expect(
        page.getByText(language === "en" ? "Finished" : "Abgeschlossen", {
          exact: true,
        }),
      ).toBeVisible();
      const exports = page.getByRole("region", {
        name:
          language === "en" ? "Export references" : "Referenzen exportieren",
        exact: true,
      });
      await exports
        .getByRole("combobox", {
          name: language === "en" ? "Export format" : "Exportformat",
          exact: true,
        })
        .selectOption("imported-format");
      const downloaded = page.waitForEvent("download");
      await exports
        .getByRole("button", {
          name:
            language === "en"
              ? "Download references"
              : "Referenzen herunterladen",
          exact: true,
        })
        .click();
      const download = await downloaded;
      expect(download.suggestedFilename()).toBe(
        `source-taster-references.${format === "ris" ? "ris" : "bib"}`,
      );
      expect(await readFile(await download.path(), "utf8")).toBe(text);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page
        .getByRole("button", {
          name: language === "en" ? "Reset" : "Zurücksetzen",
          exact: true,
        })
        .click();
      await expect(page.getByRole("textbox")).toHaveValue("");
      await expect(
        page.getByRole("button", {
          name: language === "en" ? "Check reference" : "Referenz prüfen",
          exact: true,
        }),
      ).toBeDisabled();
    });

test("keeps canonical exports available when membership adds a non-imported Reference", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /^(Language|Sprache)$/u })
    .selectOption("en");
  await page.getByLabel("Import BibTeX or RIS").setInputFiles({
    name: "library.bib",
    mimeType: "application/x-bibtex",
    buffer: Buffer.from("@patent{Kept,title={Synthetic patent},year=2024}\n"),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "1 references recognized" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const format = page.getByRole("combobox", {
    name: "Export format",
    exact: true,
  });
  await format.selectOption("imported-format");
  const edit = page.getByRole("button", {
    name: "Edit reference list",
    exact: true,
  });
  await expect(edit).toBeEnabled({ timeout: 15000 });
  await edit.click();
  await page
    .getByRole("textbox", {
      name: "Original input for the new reference",
      exact: true,
    })
    .fill("A new Reference");
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Added title");
  await page
    .getByRole("textbox", { name: "Source type (CSL)", exact: true })
    .fill("patent");
  await page
    .getByRole("button", { name: "Preview list changes", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply list changes", exact: true })
    .click();
  await expect(
    page
      .getByRole("list", { name: "References", exact: true })
      .getByRole("listitem"),
  ).toHaveCount(2);
  await expect(format).toHaveValue("csl-json");
  await expect(format.locator('option[value="imported-format"]')).toHaveCount(
    0,
  );
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download references", exact: true })
    .click();
  const output = JSON.parse(
    await readFile(await (await downloaded).path(), "utf8"),
  ) as { title: string }[];
  expect(output.map((reference) => reference.title)).toEqual([
    "Synthetic patent",
    "Added title",
  ]);
});
