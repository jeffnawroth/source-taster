// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { CheckResponse } from "@source-taster/contract-verification";
const cases = JSON.parse(
  await readFile(
    new URL(
      "../../server/test/fixtures/comparison/ten-cases.json",
      import.meta.url,
    ),
    "utf8",
  ),
) as {
  id: number;
  doi: string;
  field: string;
  supplied: string;
  metadata: string;
  value: number;
  overall: number;
  fieldDisplay: string;
  scoreDisplay: string;
  text: string;
}[];
for (const c of cases)
  test(`replays exact stored and displayed comparison case ${c.id}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption("en");
    await page.getByRole("textbox").fill(c.text);
    const creation = page.waitForResponse(
      (r) => r.url().endsWith("/v2/checks") && r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Check reference", exact: true })
      .click();
    const created = CheckResponse.parse(await (await creation).json()).data;
    const result = page.getByRole("region", {
      name: /^(Reference detail|Referenzdetails)$/,
      exact: true,
    });
    await expect(
      result.getByText(
        c.value === 100000000 ? "Correct" : "Exists, with deviations",
        { exact: true },
      ),
    ).toBeVisible({ timeout: 15000 });
    await result
      .getByText("Explanation and source evidence", { exact: true })
      .click();
    await expect(result).toContainText(`Score: ${c.scoreDisplay}`);
    const term = result.getByRole("term").filter({
      hasText:
        c.field === "title"
          ? /^Title:/
          : c.field === "page"
            ? /^Pages or article number:/
            : /^Journal/,
    });
    await expect(term.locator("..")).toContainText(c.fieldDisplay);
    await expect(term.locator("..")).toContainText(c.supplied);
    await expect(term.locator("..")).toContainText(c.metadata);
    const stored = CheckResponse.parse(
      await (await page.request.get(`/v2/checks/${created.id}`)).json(),
    ).data;
    const outcome = stored.references[0]!.outcome;
    if (outcome?.kind !== "verdict") throw new Error("Expected Verdict");
    expect(outcome.candidates[0]?.score).toEqual({
      value: c.overall,
      fullAgreement: c.value === 100000000,
    });
    expect(
      outcome.candidates[0]?.fields.find((f) => f.field === c.field)?.score,
    ).toEqual({ value: c.value, fullAgreement: c.value === 100000000 });
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption("de");
    await expect(result).toContainText(c.scoreDisplay);
    await expect(result).toContainText(c.fieldDisplay);
    const reread = CheckResponse.parse(
      await (await page.request.get(`/v2/checks/${created.id}`)).json(),
    ).data;
    expect(reread).toEqual(stored);
  });

for (const language of ["en", "de"] as const)
  test(`shows exact author assignment evidence accessibly in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page
      .getByRole("textbox")
      .fill(
        "Alpha, A., Beta, B., & Gamma, G. (2021). Assignment example. Journal of Testing, 12, 123–128. https://doi.org/10.5555/browser-authors",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const result = page.getByRole("region", {
      name: /^(Reference detail|Referenzdetails)$/,
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
    await result
      .getByText(
        language === "en"
          ? "Explanation and source evidence"
          : "Erklärung und Quellenbelege",
        { exact: true },
      )
      .click();
    await expect(result).toContainText("76.19 %");
    const author = result
      .getByRole("term")
      .filter({ hasText: language === "en" ? /^Authors:/ : /^Autoren/ })
      .locator("..");
    await expect(author).toContainText("66.67 %");
    await expect(author).toContainText("Anna");
    await expect(author).toContainText("Ben");
    await expect(author).toContainText("Greta");
    await expect(result).toContainText("uncalibrated");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
