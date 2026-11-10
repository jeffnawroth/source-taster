// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { docx } from "../../server/test/support/documents.ts";
for (const language of ["en", "de"] as const)
  test(`adjusts detected regions, checks only selected text and preserves slots in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    const first = "Doe, J. (2020). Signal maps. Example Press.";
    const second = "Roe, A. (2021). Careful systems. Example Press.";
    const text = `Introduction\nRunning text (2018).\nReferences\n${first}\nChapter 2\nOutside (2019).\nBibliography\n${second}`;
    await page
      .getByLabel(
        language === "en" ? "PDF or Word document" : "PDF- oder Word-Dokument",
        { exact: true },
      )
      .setInputFiles({
        name: "chapters.docx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        buffer: Buffer.from(await docx(text.split("\n"))),
      });
    const uploaded = page.waitForResponse("**/v2/document-structurings");
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Upload and structure"
            : "Hochladen und strukturieren",
        exact: true,
      })
      .click();
    expect((await uploaded).ok()).toBe(true);
    const selection = page.getByRole("region", {
      name: language === "en" ? "Bibliography selection" : "Literaturauswahl",
      exact: true,
    });
    await expect(selection.locator("mark")).toHaveText([first, second]);
    await selection
      .getByRole("button", {
        name: language === "en" ? "Deselect region 2" : "Bereich 2 abwählen",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Structure references"
            : "Referenzen strukturieren",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("region", {
        name:
          language === "en" ? "Recognized references" : "Erkannte Referenzen",
      }),
    ).not.toContainText("Careful systems");
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("list", {
        name: language === "en" ? "References" : "Referenzen",
        exact: true,
      }),
    ).toContainText("Signal maps");
    await expect(
      page.getByRole("button", {
        name:
          language === "en"
            ? "Edit reference list"
            : "Referenzliste bearbeiten",
        exact: true,
      }),
    ).toBeEnabled();
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Edit reference list"
            : "Referenzliste bearbeiten",
        exact: true,
      })
      .click();
    const editor = page.getByRole("region", {
      name:
        language === "en"
          ? "Change bibliography selection"
          : "Literaturauswahl ändern",
      exact: true,
    });
    await editor
      .getByRole("spinbutton", {
        name: language === "en" ? "Region 1 end" : "Bereich 1 Ende",
        exact: true,
      })
      .fill(String(text.length));
    await editor
      .getByRole("button", {
        name:
          language === "en"
            ? "Preview selection changes"
            : "Auswahländerungen vorschauen",
        exact: true,
      })
      .click();
    await expect(editor).toContainText(
      language === "en"
        ? "Additional quota on first verdicts:"
        : "Zusätzliches Kontingent bei ersten Befunden:",
    );
    await expect(
      editor
        .getByRole("region", {
          name:
            language === "en"
              ? "Preview selection changes"
              : "Auswahländerungen vorschauen",
          exact: true,
        })
        .getByRole("list"),
    ).toContainText(second);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });

test("an undetected document requires a manual region and never checks surrounding text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/");
  const reference = "Doe, J. (2020). Signal maps. Example Press.";
  const text = `Running text (2018).\n${reference}\nOutside (2019).`;
  await page.getByLabel("PDF or Word document", { exact: true }).setInputFiles({
    name: "unheaded.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: Buffer.from(await docx(text.split("\n"))),
  });
  await page
    .getByRole("button", { name: "Upload and structure", exact: true })
    .click();
  const selection = page.getByRole("region", {
    name: "Bibliography selection",
    exact: true,
  });
  await expect(selection).toContainText("No bibliography detected or selected");
  const check = page.getByRole("button", {
    name: "Check reference",
    exact: true,
  });
  await expect(check).toBeDisabled();
  const original = selection.getByRole("textbox");
  await original.selectText();
  await original.press("Shift");
  await selection
    .getByRole("button", { name: "Add marked text as a region", exact: true })
    .click();
  await selection
    .getByRole("spinbutton", { name: "Region 1 start", exact: true })
    .fill(String(text.indexOf(reference)));
  await selection
    .getByRole("spinbutton", { name: "Region 1 end", exact: true })
    .fill(String(text.indexOf(reference) + reference.length));
  await expect(selection.locator("mark")).toHaveText(reference);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await check.click();
  const list = page.getByRole("list", { name: "References", exact: true });
  await expect(list).toContainText("Signal maps");
  await expect(list).not.toContainText("Running text");
  await expect(list).not.toContainText("Outside");
});
