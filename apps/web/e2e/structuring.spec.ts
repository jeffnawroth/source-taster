// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["en", "de"] as const) {
  test(`structures References and shows original text, fields, rejected entries and guidance accessibly in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/, exact: true })
      .selectOption(language);
    const action = page.getByRole("button", {
      name:
        language === "en" ? "Structure References" : "Referenzen strukturieren",
      exact: true,
    });
    await expect(action).toBeDisabled();
    await page
      .getByRole("textbox")
      .fill(
        "Doe, J. (2020). A careful title. Journal of Testing, 12(3), 45–67.\n\nNot a Reference",
      );
    await action.click();
    const results = page.getByRole("region", {
      name: language === "en" ? "Recognized References" : "Erkannte Referenzen",
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
          ? "Not recognized as a Reference"
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
    await page.getByRole("textbox").fill("No bibliographic features");
    await action.click();
    await expect(page.getByRole("status")).toContainText(
      language === "en"
        ? "No References recognized"
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
  await page.route("**/v1/structurings", (route) =>
    route.fulfill({
      status: 502,
      contentType: "text/html",
      body: "upstream unavailable",
    }),
  );
  await page.goto("/");
  await page.getByRole("textbox").fill("Doe, J. (2020). A study.");
  for (const name of ["Structure References", "Check Reference"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.getByRole("alert")).toContainText(
      "Something went wrong. Please try again.",
    );
  }
});
