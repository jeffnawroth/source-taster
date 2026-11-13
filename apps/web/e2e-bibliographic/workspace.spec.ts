// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  choosePreferences,
  openEvidence,
  openReference,
} from "../e2e/support/workspace.ts";

for (const language of ["en", "de"] as const) {
  for (const scenario of ["tied", "ranked"] as const)
    test(`preserves server Best match and internal Candidate order for ${scenario} in ${language}`, async ({
      page,
    }) => {
      await page.goto("/");
      await choosePreferences(page, { language: language });
      await page
        .getByRole("textbox")
        .fill(
          scenario === "tied"
            ? "WorkspaceTie, A. (2021). Workspace tied article. Journal of Testing, 1, 1–2."
            : "WorkspaceRanked, R. (2021). Workspace ranked article. Journal of Testing, 1, 1–2.",
        );
      await page
        .getByRole("button", {
          name: language === "en" ? "Check reference" : "Referenz prüfen",
          exact: true,
        })
        .click();
      await openReference(page, 1);
      const detail = page.getByRole("region", {
        name: language === "en" ? "Reference detail" : "Referenzdetails",
        exact: true,
      });
      const comparison = detail.getByRole("region", {
        name:
          language === "en"
            ? "Reference and best match"
            : "Referenz und bester Treffer",
        exact: true,
      });
      await expect(comparison).toContainText(
        scenario === "tied"
          ? "https://openalex.org/W82002"
          : "https://openalex.org/W82013",
        { timeout: 15000 },
      );
      await expect(comparison.getByRole("table")).toContainText(
        scenario === "tied" ? "WorkspaceTie" : "WorkspaceRanked",
      );
      await openEvidence(detail);
      const candidates = detail.locator("li.detail-cand");
      await expect(candidates).toHaveCount(scenario === "tied" ? 2 : 3);
      if (scenario === "tied") {
        await expect(candidates.nth(0)).toContainText(
          "https://openalex.org/W82001",
        );
        await expect(candidates.nth(1)).toContainText(
          "https://openalex.org/W82002",
        );
        await expect(candidates.nth(0)).not.toContainText(
          language === "en"
            ? "Best match by score"
            : "Bester Treffer nach Score",
        );
        await expect(candidates.nth(1)).toContainText(
          language === "en"
            ? "Best match by score"
            : "Bester Treffer nach Score",
        );
        await expect(candidates.nth(0)).toContainText("100.00 %");
        await expect(candidates.nth(1)).toContainText("100.00 %");
      } else {
        await expect(candidates.nth(0)).toContainText(
          "https://openalex.org/W82013",
        );
        await expect(candidates.nth(1)).toContainText(
          "https://openalex.org/W82012",
        );
        await expect(candidates.nth(2)).toContainText(
          "https://openalex.org/W82011",
        );
        await expect(candidates.nth(0)).toContainText("100.00 %");
        await expect(candidates.nth(1)).toContainText("64.29 %");
        await expect(candidates.nth(2)).toContainText("21.43 %");
      }
      for (const candidate of await candidates.all()) {
        const link = candidate.getByRole("link");
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
        await expect(link).toHaveAttribute(
          "href",
          /^https:\/\/(doi.org|openalex.org)\//,
        );
      }
      expect(
        (
          await new AxeBuilder({ page })
            .withTags([
              "wcag2a",
              "wcag2aa",
              "wcag21a",
              "wcag21aa",
              "wcag22a",
              "wcag22aa",
            ])
            .analyze()
        ).violations,
      ).toEqual([]);
    });
}

for (const language of ["en", "de"] as const)
  test(`retains Reference fields when a completed search has no Best match in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language: language });
    await page
      .getByRole("textbox")
      .fill(
        "Zed, Z. (2021). Entirely synthetic missing article. Synthetic Journal, 1, 1–2.",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await openReference(page, 1);
    const detail = page.getByRole("region", {
      name: language === "en" ? "Reference detail" : "Referenzdetails",
      exact: true,
    });
    await expect(
      detail.getByText(language === "en" ? "Not found" : "Nicht gefunden", {
        exact: true,
      }),
    ).toBeVisible({ timeout: 15000 });
    const fields = detail.getByRole("table", {
      name:
        language === "en"
          ? "Reference and best match"
          : "Referenz und bester Treffer",
      exact: true,
    });
    await expect(fields).toBeVisible();
    const title = fields.getByRole("rowgroup").filter({
      has: page.getByRole("rowheader", {
        // #194 D: the row header is the bare field name.
        name: language === "en" ? "Title" : "Titel",
        exact: true,
      }),
    });
    // #194 D: each cell starts with its column name (aria-hidden, shown only
    // when the narrow detail stacks the columns), and the Best match cell
    // also carries the field's score line; the text is matched exactly.
    await expect(title.getByRole("cell").nth(0)).toHaveText(
      language === "en"
        ? /^Your referenceEntirely synthetic missing article$/u
        : /^Ihre ReferenzEntirely synthetic missing article$/u,
    );
    await expect(title.getByRole("cell").nth(1)).toHaveText(
      language === "en"
        ? /^Best matchUnknown \/ not suppliedExcluded from score · Unknown; not compared\.$/u
        : /^Bester TrefferUnbekannt \/ nicht angegebenVom Score ausgeschlossen · Unbekannt; nicht verglichen\.$/u,
    );
    await expect(detail).toContainText(
      language === "en"
        ? "No best match is available."
        : "Kein bester Treffer verfügbar.",
    );
    await expect(detail.getByRole("link")).toHaveCount(0);
  });
