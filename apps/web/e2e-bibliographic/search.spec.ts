// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
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
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/u })
      .selectOption(language);
    await page
      .getByRole("textbox")
      .fill(
        "Alpha, A. (2021). Source link witness. Journal of Testing, 1, 1–2.",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check Reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const result = page.getByRole("status");
    await expect(
      result.getByText(language === "en" ? "Correct" : "Korrekt", {
        exact: true,
      }),
    ).toBeVisible({ timeout: 15000 });
    await result
      .getByText(
        language === "en"
          ? "Explanation and source evidence"
          : "Erklärung und Quellenbelege",
        { exact: true },
      )
      .click();
    const link = result.getByRole("link", {
      name: language === "en" ? "Open Source" : "Quelle öffnen",
      exact: true,
    });
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
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/u })
      .selectOption(language);
    await page
      .getByRole("textbox")
      .fill(
        "Alpha, A. (2021). Synthetic retracted article. Journal of Testing, 1, 1–2.",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check Reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const result = page.getByRole("status");
    await expect(
      result.getByText(language === "en" ? "Correct" : "Korrekt", {
        exact: true,
      }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      result.getByText(
        language === "en"
          ? "The Best match is reported as retracted."
          : "Der beste Treffer wird als zurückgezogen gemeldet.",
        { exact: true },
      ),
    ).toBeVisible({ timeout: 5000 });
    await result
      .getByText(
        language === "en"
          ? "Explanation and source evidence"
          : "Erklärung und Quellenbelege",
        { exact: true },
      )
      .click();
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
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/u })
      .selectOption(language);
    await page
      .getByRole("textbox")
      .fill(
        "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12.",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check Reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const result = page.getByRole("status");
    await expect(
      result.getByText(language === "en" ? "Correct" : "Korrekt", {
        exact: true,
      }),
    ).toBeVisible({ timeout: 15000 });
    await result
      .getByText(
        language === "en"
          ? "Explanation and source evidence"
          : "Erklärung und Quellenbelege",
        { exact: true },
      )
      .click();
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
      await page
        .getByRole("combobox", { name: /^(Language|Sprache)$/u })
        .selectOption(language);
      const text =
        scenario === "mixed"
          ? "Beta, B. (2009). Measured measurement. Nature Physics, 5, 11–12."
          : scenario === "missing"
            ? "Zed, Z. (2021). Entirely synthetic missing article. Synthetic Journal, 1, 1–2."
            : "Alpha, A. (2021). Synthetic ambiguous article. Synthetic Journal, 1, 1–2.";
      await page.getByRole("textbox").fill(text);
      await page
        .getByRole("button", {
          name: language === "en" ? "Check Reference" : "Referenz prüfen",
          exact: true,
        })
        .click();
      const result = page.getByRole("status");
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
      await result
        .getByText(
          language === "en"
            ? "Explanation and source evidence"
            : "Erklärung und Quellenbelege",
          { exact: true },
        )
        .click();
      if (scenario !== "missing") {
        await expect(result.getByRole("heading", { level: 3 })).toHaveCount(2);
        await expect(result).toContainText("openalex");
        await expect(result).toContainText(
          language === "en" ? "Title" : "Titel",
        );
      }
      await expect(result).toContainText(
        scenario === "mixed"
          ? language === "en"
            ? "different Sources"
            : "verschiedenen Quellen"
          : scenario === "missing"
            ? language === "en"
              ? "completed search"
              : "abgeschlossene Suche"
            : language === "en"
              ? "unambiguous Source"
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
