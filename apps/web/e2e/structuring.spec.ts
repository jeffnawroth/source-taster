// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  choosePreferences,
  closeStructuringPreview,
  structureReferences,
  structuringOffered,
} from "./support/workspace.ts";

for (const language of ["en", "de"] as const) {
  test(`structures References and shows original text, fields, rejected entries and guidance accessibly in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language });
    // Nothing to structure yet, so the launcher does not offer it.
    expect(await structuringOffered(page)).toBe(false);
    await page
      .getByRole("textbox")
      .fill(
        "Doe, J. (2020). A careful title. Journal of Testing, 12(3), 45–67.\n\nNot a Reference",
      );
    await structureReferences(page);
    const results = page.getByRole("region", {
      name: language === "en" ? "Recognized references" : "Erkannte Referenzen",
    });
    await expect(results).toContainText("A careful title");
    await expect(results).toContainText("Doe, J. (2020).");
    await expect(results).toContainText(
      language === "en" ? "Authors" : "Autoren",
    );
    await expect(results).toContainText("45–67");
    await page
      .getByText(
        language === "en"
          ? "Not recognized as a reference"
          : "Nicht als Referenz erkannt",
        { exact: true },
      )
      .click();
    await expect(
      page.getByText("Not a Reference", { exact: true }),
    ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await closeStructuringPreview(page);
    await page.getByRole("textbox").fill("No bibliographic features");
    await structureReferences(page);
    await expect(page.getByRole("status")).toContainText(
      language === "en"
        ? "No references recognized"
        : "Keine Referenzen erkannt",
    );
    await expect(page.getByRole("status")).toContainText(
      language === "en" ? "author" : "Autor",
    );
    await expect(results).toHaveCount(0);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test("Check and Structuring show a safe localized Problem for a non-JSON server failure", async ({
  page,
}) => {
  await page.route("**/v2/checks", (route) =>
    route.fulfill({
      status: 502,
      contentType: "text/html",
      body: "upstream unavailable",
    }),
  );
  await page.route("**/v2/structurings", (route) =>
    route.fulfill({
      status: 502,
      contentType: "text/html",
      body: "upstream unavailable",
    }),
  );
  await page.goto("/");
  await page.getByRole("textbox").fill("Doe, J. (2020). A study.");
  for (const run of [
    () => structureReferences(page),
    () =>
      page
        .getByRole("button", { name: "Check reference", exact: true })
        .click(),
  ]) {
    await run();
    await expect(page.getByRole("alert")).toContainText(
      "Try again. A technical error occurred on our side. A technical status uses no quota; completed verdicts remain debited.",
    );
  }
});
