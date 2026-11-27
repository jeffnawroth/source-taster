// SPDX-License-Identifier: AGPL-3.0-or-later
// Every server problem reaches the person through one error alert that renders
// the catalogue message of the problem's `i18nKey`. The local services cannot
// produce all of these problems (an unavailable extraction area, a quota
// authority, a plan without a feature), so the route seam answers with the
// exact RFC 9457 body the server sends and the alert text is asserted in full.
import { expect, test, type Page } from "@playwright/test";
import {
  fulfillProblem,
  message,
  type Language,
  type Problem,
} from "./support/catalog.ts";
import {
  choosePreferences,
  closeStructuringPreview,
  editReferenceList,
} from "./support/workspace.ts";
import { docx } from "../../server/test/support/documents.ts";

const documentProblems: Problem[] = [
  { code: "document-unsupported", status: 415 },
  { code: "document-no-text", status: 422 },
  { code: "document-encrypted", status: 422 },
  { code: "document-unreadable", status: 422 },
  { code: "document-page-limit", status: 422 },
  { code: "document-expansion-limit", status: 422 },
  { code: "document-time-limit", status: 422 },
  { code: "document-resource-limit", status: 422 },
  { code: "document-aborted", status: 422 },
  { code: "document-unavailable", status: 503 },
].map((problem) => ({
  ...problem,
  i18nKey: `problem_${problem.code.replaceAll("-", "_")}`,
}));

const reference =
  "Doe, J. (2020). Signal maps. Journal of Testing, 12(3), 45–67.";

for (const language of ["en", "de"] as const) {
  test(`shows the message of each document upload problem in the error alert (${language})`, async ({
    page,
  }) => {
    let current: Problem = documentProblems[0]!;
    await page.route("**/v2/document-structurings", (route) =>
      fulfillProblem(route, current),
    );
    await page.goto("/");
    await choosePreferences(page, { language });
    const input = page.getByLabel(
      language === "en" ? "PDF or Word document" : "PDF- oder Word-Dokument",
      { exact: true },
    );
    const upload = page.getByRole("button", {
      name:
        language === "en"
          ? "Upload and structure"
          : "Hochladen und strukturieren",
      exact: true,
    });
    for (const problem of documentProblems) {
      await test.step(problem.i18nKey, async () => {
        current = problem;
        await input.setInputFiles({
          name: "references.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.7"),
        });
        await upload.click();
        const alert = page.getByRole("alert");
        await expect(alert).toContainText(message(language, problem.i18nKey));
        // The key's own text, never the generic technical error.
        await expect(alert).not.toContainText(
          message(language, "problem_internal"),
        );
      });
    }
  });
}

const startProblems: Problem[] = [
  {
    code: "abuse-unavailable",
    status: 503,
    i18nKey: "problem_abuse_unavailable",
  },
  { code: "invalid-request", status: 400, i18nKey: "problem_invalid_request" },
  {
    code: "authority-unavailable",
    status: 503,
    i18nKey: "problem_authority_unavailable",
  },
  {
    code: "feature-unavailable",
    status: 403,
    i18nKey: "problem_feature_unavailable",
  },
  {
    code: "quota-insufficient",
    status: 402,
    i18nKey: "problem_quota_insufficient",
  },
];

async function startCheck(page: Page, language: Language) {
  await page
    .getByRole("button", {
      name: language === "en" ? "Check reference" : "Referenz prüfen",
      exact: true,
    })
    .click();
}

for (const language of ["en", "de"] as const) {
  test(`shows the message of a problem that refuses to start a Check (${language})`, async ({
    page,
  }) => {
    let current: Problem = startProblems[0]!;
    await page.route("**/v2/checks", (route) =>
      route.request().method() === "POST"
        ? fulfillProblem(route, current)
        : route.continue(),
    );
    await page.goto("/");
    await choosePreferences(page, { language });
    await page.getByRole("textbox").fill(reference);
    for (const problem of startProblems) {
      await test.step(problem.i18nKey, async () => {
        current = problem;
        await startCheck(page, language);
        const alert = page.getByRole("alert");
        await expect(alert).toContainText(message(language, problem.i18nKey));
        await expect(alert).not.toContainText(
          message(language, "problem_internal"),
        );
      });
    }
  });

  test(`offers the first references when the balance no longer covers the start (${language})`, async ({
    page,
  }) => {
    // The server states how many References the Owner can still start. The
    // alert is then replaced by the choice, which names both numbers.
    await page.route("**/v2/checks", (route) =>
      route.request().method() === "POST"
        ? fulfillProblem(
            route,
            {
              code: "quota-insufficient",
              status: 402,
              i18nKey: "problem_quota_insufficient",
            },
            { available: 1, required: 3 },
          )
        : route.continue(),
    );
    await page.goto("/");
    await choosePreferences(page, { language });
    await page
      .getByRole("textbox")
      .fill(
        [
          reference,
          "Roe, A. (2021). Careful systems.",
          "Poe, E. (1845). A raven.",
        ].join("\n"),
      );
    await startCheck(page, language);
    const choice = page.getByRole("alertdialog");
    await expect(choice).toContainText(
      message(language, "quota_choice_heading"),
    );
    // The counted strip states the shortfall; the choice names it as its
    // description.
    await expect(choice).toHaveAccessibleDescription(
      message(language, "quota_choice_body", { required: 3, available: 1 }),
    );
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test(`shows "check not found" when the stream finds no Check (${language})`, async ({
    page,
  }) => {
    await page.route("**/v2/checks/*/events", (route) =>
      fulfillProblem(route, {
        code: "check-not-found",
        status: 404,
        i18nKey: "problem_check_not_found",
      }),
    );
    await page.goto("/");
    await choosePreferences(page, { language });
    await page
      .getByRole("textbox")
      .fill("Doe, J. (2020). Held Reference. doi:10.5555/browser-held");
    await startCheck(page, language);
    await expect(page.getByRole("alert")).toContainText(
      message(language, "problem_check_not_found"),
    );
    await expect(
      page.getByRole("button", {
        name: message(language, "shell_reconnect"),
        exact: true,
      }),
    ).toBeVisible();
  });

  test(`shows "invalid request" when a changed bibliography selection is refused (${language})`, async ({
    page,
  }) => {
    await page.route("**/v2/checks/*/selection/preview", (route) =>
      fulfillProblem(route, {
        code: "invalid-request",
        status: 400,
        i18nKey: "problem_invalid_request",
      }),
    );
    await page.goto("/");
    await choosePreferences(page, { language });
    const text = `Introduction\nReferences\n${reference}\nAppendix\nOutside (2019).`;
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
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Upload and structure"
            : "Hochladen und strukturieren",
        exact: true,
      })
      .click();
    await closeStructuringPreview(page);
    await startCheck(page, language);
    await editReferenceList(page);
    const editor = page.getByRole("region", {
      name: message(language, "selection_change"),
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
        name: message(language, "selection_preview"),
        exact: true,
      })
      .click();
    await expect(editor.getByRole("alert")).toContainText(
      message(language, "problem_invalid_request"),
    );
  });
}
