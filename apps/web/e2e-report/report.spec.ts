// SPDX-License-Identifier: AGPL-3.0-or-later
// Real browser against the real shared UI and server. Only the Quota feature
// grant is faked (the private service owns it). The downloaded file is read
// with an independent PDF parser.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  inspectPdf,
  rawCatalog,
  roles,
} from "../../server/test/support/pdf-inspect.ts";

const reference =
  "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
const copy = {
  en: {
    region: "Accessible PDF report",
    language: "Report language",
    create: "Create report",
    download: "Download report",
    check: "Check reference",
    heading: "Verification report",
    suggestion: "Correction suggestion",
    exportChoice: "Apply for export only",
    apply: "Apply to fields",
    date: "Publication date",
    title: "Title",
  },
  de: {
    region: "Barrierefreier PDF-Bericht",
    language: "Berichtssprache",
    create: "Bericht erstellen",
    download: "Bericht herunterladen",
    check: "Referenz prüfen",
    heading: "Prüfbericht",
    suggestion: "Korrekturvorschlag",
    exportChoice: "Nur für den Export übernehmen",
    apply: "In Felder übernehmen",
    date: "Veröffentlichungsdatum",
    title: "Titel",
  },
} as const;

for (const language of ["en", "de"] as const)
  test(`creates and downloads an accessible PDF report in ${language}`, async ({
    page,
  }) => {
    const t = copy[language];
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/u })
      .selectOption(language);
    await page.getByRole("textbox").fill(reference);
    await page.getByRole("button", { name: t.check, exact: true }).click();
    const region = page.getByRole("region", { name: t.region, exact: true });
    await expect(region).toBeVisible({ timeout: 20_000 });
    // The report language starts as the interface language.
    await expect(
      region.getByRole("combobox", { name: t.language, exact: true }),
    ).toHaveValue(language);
    // The report is frozen from server evidence even while local draft and
    // export-only suggestion state exist in the real shared workspace.
    const suggestion = page.getByRole("region", {
      name: t.suggestion,
      exact: true,
    });
    await expect(suggestion).toContainText("Aspelmeyer, M. (2009).", {
      timeout: 20_000,
    });
    await suggestion
      .getByRole("checkbox", { name: t.exportChoice, exact: true })
      .check();
    // Apply to fields only builds a local draft; the report keeps committed fields.
    await suggestion
      .getByRole("button", { name: t.apply, exact: true })
      .click();
    await expect(
      page.getByRole("textbox", { name: t.date, exact: true }),
    ).toHaveValue("2009-01");
    await page
      .getByRole("textbox", { name: t.title, exact: true })
      .fill("UNSAVED REPORT DRAFT");
    await region.getByRole("button", { name: t.create, exact: true }).click();
    const download = region.getByRole("button", {
      name: t.download,
      exact: true,
    });
    await expect(download).toBeVisible({ timeout: 30_000 });
    const event = page.waitForEvent("download");
    await download.click();
    const file = await event;
    expect(file.suggestedFilename()).toBe("source-taster-report.pdf");
    const bytes = new Uint8Array(await readFile(await file.path()));
    const pdf = await inspectPdf(bytes);
    expect(rawCatalog(bytes)).toMatchObject({
      language,
      marked: true,
      displayDocTitle: true,
      hasStructTree: true,
    });
    expect(pdf.title).toContain(t.heading);
    expect(roles(pdf.pages[0]!.tree).slice(0, 2)).toEqual(["Document", "H1"]);
    expect(pdf.text).toContain("Aspelmeyer, M. (2008)");
    expect(pdf.text).not.toContain("UNSAVED REPORT DRAFT");
    expect(pdf.text.replace(/\s+/gu, " ")).toContain(
      language === "de"
        ? "Veröffentlichungsdatum: 2008"
        : "Publication date: 2008",
    );
    // Nothing of the report is kept in browser storage.
    const storage = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    }));
    expect(JSON.stringify(storage)).not.toContain("report");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
