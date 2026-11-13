// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import {
  checkFromPreview,
  choosePreferences,
  closeStructuringPreview,
  newCheck,
} from "./support/workspace.ts";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { docx } from "../../server/test/support/documents.ts";

test("switches between library and document input without checking stale References", async ({
  page,
}) => {
  const library = "@patent{Library,title={Library witness},year={2024}}\n";
  const document = "Doe, J. (2020). Document witness. Example Press.";
  await page.goto("/");
  await choosePreferences(page, { language: "en" });
  const libraryInput = page.getByLabel("Import BibTeX or RIS", { exact: true });
  const documentInput = page.getByLabel("PDF or Word document", {
    exact: true,
  });
  const upload = page.getByRole("button", {
    name: "Upload and structure",
    exact: true,
  });

  await libraryInput.setInputFiles({
    name: "library.bib",
    mimeType: "application/x-bibtex",
    buffer: Buffer.from(library),
  });
  await expect(
    page.getByRole("region", { name: "Recognized references" }),
  ).toContainText("Library witness");
  // The Structuring preview is a modal Dialog over the intake (#194 D).
  await closeStructuringPreview(page);
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
  await checkFromPreview(page);
  const documentCheck = CheckResponse.parse(
    await (await documentResponse).json(),
  ).data;
  expect(
    documentCheck.references.map((reference) => reference.originalText),
  ).toEqual([document]);
  await newCheck(page);

  await documentInput.setInputFiles({
    name: "references.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: Buffer.from(await docx([document])),
  });
  await upload.click();
  await expect(page.getByRole("textbox")).toHaveValue(document);
  await closeStructuringPreview(page);
  await libraryInput.setInputFiles({
    name: "library.bib",
    mimeType: "application/x-bibtex",
    buffer: Buffer.from(library),
  });
  await expect(
    page.getByRole("region", { name: "Recognized references" }),
  ).toContainText("Library witness");
  await expect(documentInput).toHaveValue("");
  await expect(upload).toBeDisabled();
  const libraryResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/v2/checks"),
  );
  await checkFromPreview(page);
  const libraryCheck = CheckResponse.parse(
    await (await libraryResponse).json(),
  ).data;
  expect(
    libraryCheck.references.map((reference) => reference.originalText),
  ).toEqual([library]);
});
