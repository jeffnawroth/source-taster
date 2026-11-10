// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { docx, pdf } from "../../server/test/support/documents.ts";
for (const language of ["en", "de"] as const) {
  test(`uploads and structures a DOCX, reports PDF no-text, and resets accessibly in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    const input = page.getByLabel(
      language === "en" ? "PDF or Word document" : "PDF- oder Word-Dokument",
      { exact: true },
    );
    const action = page.getByRole("button", {
      name:
        language === "en"
          ? "Upload and structure"
          : "Hochladen und strukturieren",
      exact: true,
    });
    await expect(action).toBeDisabled();
    const reference =
      "Doe, J. (2020). Signal maps. Journal of Testing, 12(3), 45–67.";
    await input.setInputFiles({
      name: "references.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer: Buffer.from(await docx([reference])),
    });
    await action.click();
    await expect(
      page.getByRole("region", {
        name:
          language === "en" ? "Recognized references" : "Erkannte Referenzen",
      }),
    ).toContainText("Signal maps");
    await expect(page.getByRole("textbox")).toHaveValue(reference);
    await input.setInputFiles({
      name: "scan.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdf([[]])),
    });
    await action.click();
    await expect(page.getByRole("alert")).toContainText(
      language === "en" ? "no extractable text" : "keinen auslesbaren Text",
    );
    await input.setInputFiles({
      name: "partial.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdf([["Doe, J. (2020). Signal maps."], []])),
    });
    await action.click();
    await expect(
      page.getByText(
        language === "en"
          ? "Some pages contain no text."
          : "Einige Seiten enthalten keinen Text.",
        { exact: true },
      ),
    ).toBeVisible();
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
    await expect(input).toHaveValue("");
    await expect(
      page.getByRole("region", {
        name:
          language === "en" ? "Recognized references" : "Erkannte Referenzen",
      }),
    ).toHaveCount(0);
  });
}

for (const language of ["en", "de"] as const) {
  test(`states the 20 MB limit before sending an oversized upload in ${language}`, async ({
    page,
  }) => {
    let sent = 0;
    await page.route("**/v2/document-structurings", async (route) => {
      sent++;
      await route.fulfill({ status: 503, body: "unavailable" });
    });
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page
      .getByLabel(
        language === "en" ? "PDF or Word document" : "PDF- oder Word-Dokument",
        { exact: true },
      )
      .setInputFiles({
        name: "large.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.alloc(21 * 1024 * 1024),
      });
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Upload and structure"
            : "Hochladen und strukturieren",
        exact: true,
      })
      .click();
    await expect(page.getByRole("alert")).toContainText("20 MB");
    expect(sent).toBe(0);
  });
}

for (const language of ["en", "de"] as const) {
  test(`uses the current Operator upload limit in ${language}`, async ({
    page,
  }) => {
    let uploads = 0;
    await page.route("**/v2/document-settings", (route) =>
      route.fulfill({ json: { data: { inputBytes: 1_048_576 }, quota: null } }),
    );
    await page.route("**/v2/document-structurings", async (route) => {
      uploads++;
      await route.fulfill({ status: 503, body: "unavailable" });
    });
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page
      .getByLabel(
        language === "en" ? "PDF or Word document" : "PDF- oder Word-Dokument",
        { exact: true },
      )
      .setInputFiles({
        name: "large.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.alloc(2 * 1024 * 1024),
      });
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Upload and structure"
            : "Hochladen und strukturieren",
        exact: true,
      })
      .click();
    await expect(page.getByRole("alert")).toContainText("1 MB");
    expect(uploads).toBe(0);
  });
}
