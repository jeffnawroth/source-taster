// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import {
  choosePreferences,
  openEvidence,
  openReference,
} from "../e2e/support/workspace.ts";
for (const language of ["en", "de"] as const)
  test(`opens a Candidate without DOI at its provider record in ${language}`, async ({
    page,
  }) => {
    const recordUrl = "https://openalex.org/W77902";
    await page.context().route(recordUrl, (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<h1>Synthetic Source record</h1>",
      }),
    );
    await page.goto("/");
    await choosePreferences(page, { language: language });
    await page
      .getByRole("textbox")
      .fill(
        "Alpha, A. (2021). Source link witness. Journal of Testing, 1, 1–2.",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await openReference(page, 1);
    const result = page.getByRole("region", {
      name: /^(Reference detail|Referenzdetails)$/,
      exact: true,
    });
    await expect(
      result.getByText(language === "en" ? "Correct" : "Korrekt", {
        exact: true,
      }),
    ).toBeVisible({ timeout: 15000 });
    await openEvidence(result);
    const link = result
      .getByRole("link", {
        name: language === "en" ? "Open source" : "Quelle öffnen",
        exact: true,
      })
      .first();
    await expect(link).toHaveAttribute("href", recordUrl);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    const opened = page.context().waitForEvent("page");
    await link.click();
    const source = await opened;
    await expect(source).toHaveURL(recordUrl);
    await expect(
      source.getByRole("heading", { name: "Synthetic Source record" }),
    ).toBeVisible();
    expect(await source.evaluate(() => window.opener === null)).toBe(true);
    await source.close();
  });
for (const language of ["en", "de"] as const)
  test(`shows an independent retraction notice with provenance in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language: language });
    await page
      .getByRole("textbox")
      .fill(
        "Alpha, A. (2021). Synthetic retracted article. Journal of Testing, 1, 1–2.",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await openReference(page, 1);
    const result = page.getByRole("region", {
      name: /^(Reference detail|Referenzdetails)$/,
      exact: true,
    });
    await expect(
      result.getByText(language === "en" ? "Correct" : "Korrekt", {
        exact: true,
      }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      result.getByText(
        language === "en"
          ? "The best match is reported as retracted."
          : "Der beste Treffer wird als zurückgezogen gemeldet.",
        { exact: true },
      ),
    ).toBeVisible({ timeout: 5000 });
    await openEvidence(result);
    await expect(
      result.getByText(
        /(?:Retraction report from|Rücknahmemeldung von) OpenAlex:/u,
      ),
    ).toContainText("https://openalex.org/W77901");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
for (const language of ["en", "de"] as const)
  test(`shows bibliographic OpenAlex identity, score, fields and provenance in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language: language });
    await page
      .getByRole("textbox")
      .fill(
        "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12.",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await openReference(page, 1);
    const result = page.getByRole("region", {
      name: /^(Reference detail|Referenzdetails)$/,
      exact: true,
    });
    await expect(
      result.getByText(language === "en" ? "Correct" : "Korrekt", {
        exact: true,
      }),
    ).toBeVisible({ timeout: 15000 });
    await openEvidence(result);
    await expect(result).toContainText("openalex");
    await expect(result).toContainText("100.00 %");
    await expect(result).toContainText(
      language === "en" ? "Combined search" : "Kombinierte Suche",
    );
    await expect(result).toContainText(
      language === "en" ? "Candidate slot: 1" : "Kandidatenplatz: 1",
    );
    await expect(result).toContainText("Markus");
    await expect(result).toContainText("Aspelmeyer");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
for (const language of ["en", "de"] as const)
  for (const scenario of ["mixed", "missing", "ambiguous"] as const)
    test(`explains ${scenario} bibliographic evidence in ${language}`, async ({
      page,
    }) => {
      await page.goto("/");
      await choosePreferences(page, { language: language });
      const text =
        scenario === "mixed"
          ? "Beta, B. (2009). Measured measurement. Nature Physics, 5, 11–12."
          : scenario === "missing"
            ? "Zed, Z. (2021). Entirely synthetic missing article. Synthetic Journal, 1, 1–2."
            : "Alpha, A. (2021). Synthetic ambiguous article. Synthetic Journal, 1, 1–2.";
      await page.getByRole("textbox").fill(text);
      await page
        .getByRole("button", {
          name: language === "en" ? "Check reference" : "Referenz prüfen",
          exact: true,
        })
        .click();
      await openReference(page, 1);
      const result = page.getByRole("region", {
        name: /^(Reference detail|Referenzdetails)$/,
        exact: true,
      });
      const expected =
        scenario === "mixed"
          ? language === "en"
            ? "Mixed citation"
            : "Gemischte Referenz"
          : scenario === "missing"
            ? language === "en"
              ? "Not found"
              : "Nicht gefunden"
            : language === "en"
              ? "Not verifiable"
              : "Nicht verifizierbar";
      await expect(result.getByText(expected, { exact: true })).toBeVisible({
        timeout: 15000,
      });
      const filter = page.getByRole("button", {
        name: `${expected}: 1`,
        exact: true,
      });
      await filter.click();
      await expect(filter).toHaveAttribute("aria-pressed", "true");
      await expect(
        page
          .getByRole("grid", {
            name: language === "en" ? "References" : "Referenzen",
            exact: true,
          })
          .getByRole("row"),
      ).toHaveCount(1);
      await openEvidence(result);
      if (scenario !== "missing") {
        await expect(result.locator("li.detail-cand")).toHaveCount(2);
        await expect(result).toContainText("openalex");
        await expect(result).toContainText(
          language === "en" ? "Title" : "Titel",
        );
      }
      await expect(result).toContainText(
        scenario === "mixed"
          ? language === "en"
            ? "different sources"
            : "verschiedenen Quellen"
          : scenario === "missing"
            ? language === "en"
              ? "completed search"
              : "abgeschlossene Suche"
            : language === "en"
              ? "unambiguous source"
              : "eindeutige Quelle",
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    });
for (const language of ["en", "de"] as const)
  test(`names a failed Data source instead of reporting Not found in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language: language });
    await page
      .getByRole("textbox")
      .fill(
        "Zed, Z. (2021). Synthetic unavailable article. Synthetic Journal, 1, 1–2.",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await openReference(page, 1);
    const result = page.getByRole("region", {
      name: /^(Reference detail|Referenzdetails)$/,
      exact: true,
    });
    await expect(
      result.getByText(
        language === "en" ? "Not verifiable" : "Nicht verifizierbar",
        { exact: true },
      ),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      result.getByText(language === "en" ? "Not found" : "Nicht gefunden", {
        exact: true,
      }),
    ).toHaveCount(0);
    const failed = result.getByRole("region", {
      name:
        language === "en"
          ? "Data sources that failed"
          : "Ausgefallene Datenquellen",
      exact: true,
    });
    await expect(failed.getByRole("listitem")).toHaveText([
      language === "en"
        ? "Europe PMC: returned an error or could not be reached"
        : "Europe PMC: hat einen Fehler gemeldet oder war nicht erreichbar",
    ]);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
