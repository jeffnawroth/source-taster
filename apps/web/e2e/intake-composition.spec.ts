// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { docx } from "../../server/test/support/documents.ts";

test("switches between library and document input without checking stale References", async ({
  page,
}) => {
  const library = "@patent{Library,title={Library witness},year={2024}}\n";
  const document = "Doe, J. (2020). Document witness. Example Press.";
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /^(Language|Sprache)$/ })
    .selectOption("en");
  const libraryInput = page.getByLabel("Import BibTeX or RIS", { exact: true });
  const documentInput = page.getByLabel("PDF or Word document", {
    exact: true,
  });
  const upload = page.getByRole("button", {
    name: "Upload and structure",
    exact: true,
  });
  const start = page.getByRole("button", {
    name: "Check Reference",
    exact: true,
  });
  const reset = page.getByRole("button", { name: "Reset", exact: true });

  await libraryInput.setInputFiles({
    name: "library.bib",
    mimeType: "application/x-bibtex",
    buffer: Buffer.from(library),
  });
  await expect(
    page.getByRole("region", { name: "Recognized References" }),
  ).toContainText("Library witness");
  await documentInput.setInputFiles({
    name: "references.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: Buffer.from(await docx([document])),
  });
  await upload.click();
  await expect(page.getByRole("textbox")).toHaveValue(document);
  const documentResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/v2/checks"),
  );
  await start.click();
  const documentCheck = CheckResponse.parse(
    await (await documentResponse).json(),
  ).data;
  expect(
    documentCheck.references.map((reference) => reference.originalText),
  ).toEqual([document]);
  await reset.click();

  await documentInput.setInputFiles({
    name: "references.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: Buffer.from(await docx([document])),
  });
  await upload.click();
  await expect(page.getByRole("textbox")).toHaveValue(document);
  await libraryInput.setInputFiles({
    name: "library.bib",
    mimeType: "application/x-bibtex",
    buffer: Buffer.from(library),
  });
  await expect(
    page.getByRole("region", { name: "Recognized References" }),
  ).toContainText("Library witness");
  await expect(documentInput).toHaveValue("");
  await expect(upload).toBeDisabled();
  const libraryResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/v2/checks"),
  );
  await start.click();
  const libraryCheck = CheckResponse.parse(
    await (await libraryResponse).json(),
  ).data;
  expect(
    libraryCheck.references.map((reference) => reference.originalText),
  ).toEqual([library]);
});
