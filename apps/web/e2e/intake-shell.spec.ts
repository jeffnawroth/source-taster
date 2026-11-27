// SPDX-License-Identifier: AGPL-3.0-or-later
// Intake and launcher behaviour that no other spec reaches: the command
// search, the Preferences command, the file drop zone and its "Choose a file"
// button, the reference limit alert and the permanent development notice.
import { expect, test, type Locator, type Page } from "@playwright/test";
import { message } from "./support/catalog.ts";
import {
  chooseFileSource,
  choosePreferences,
  closeStructuringPreview,
  runCommand,
} from "./support/workspace.ts";
import { docx } from "../../server/test/support/documents.ts";

const launcherName = /^(Search or command|Suchen oder Befehl) …$/u;
const paletteName = /^(Commands|Aktionen)$/u;
const reference =
  "Doe, J. (2020). Signal maps. Journal of Testing, 12(3), 45–67.";
const bibtex =
  "@article{Doe2020, author={Doe, Jane}, title={Signal maps}, journal={Journal of Testing}, year={2020}}";
const docxType =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

for (const language of ["en", "de"] as const) {
  test(`the command search filters the commands and its clear button restores them (${language})`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language });
    await page.getByRole("button", { name: launcherName }).click();
    const palette = page.getByRole("dialog", { name: paletteName });
    const items = palette.getByRole("menuitem");
    const search = palette.getByRole("searchbox", {
      name: message(language, "shell_find_command"),
      exact: true,
    });
    await expect(search).toBeFocused();
    await expect(items.first()).toBeVisible();
    const all = await items.allTextContents();
    expect(all.length).toBeGreaterThan(1);
    const preferences = message(language, "shell_preferences");
    expect(all).toContain(preferences);
    // A query matches case-insensitively and keeps only the matching commands.
    await search.fill(preferences.slice(0, 5).toUpperCase());
    await expect(items).toHaveText([preferences]);
    await search.fill("zzzz-no-command");
    await expect(items).toHaveCount(0);
    await expect(palette).toContainText(
      message(language, "shell_command_empty"),
    );
    // The clear button empties the field and brings every command back.
    await palette
      .getByRole("button", {
        name: message(language, "shell_clear_command"),
        exact: true,
      })
      .click();
    await expect(search).toHaveValue("");
    await expect(items).toHaveText(all);
  });

  test(`the Preferences command opens the Preferences dialog with focus inside it (${language})`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language });
    await runCommand(page, message(language, "shell_preferences"));
    const dialog = page.getByRole("dialog", {
      name: message(language, "shell_preferences"),
      exact: true,
    });
    await expect(dialog).toBeVisible();
    // The Dialog takes focus on its first control; the language select is
    // one tab stop away, so a keyboard user can change the language at once.
    const focused = dialog.locator(":focus");
    await expect(focused).toHaveCount(1);
    await expect(focused).toHaveJSProperty("tagName", "SELECT");
    await page.keyboard.press("Tab");
    await expect(
      dialog.getByRole("combobox", {
        name: message(language, "language_label"),
        exact: true,
      }),
    ).toBeFocused();
  });

  test(`the development notice stays on the intake and on the feed (${language})`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language });
    const notice = page.getByText(message(language, "skeleton_notice"), {
      exact: true,
    });
    await expect(notice).toBeVisible();
    await page.getByRole("textbox").fill(reference);
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("region", {
        name: language === "en" ? "Check summary" : "Prüfungsübersicht",
      }),
    ).toBeVisible();
    await expect(notice).toBeVisible();
  });

  test(`states the reference limit and checks nothing when a selection exceeds it (${language})`, async ({
    page,
  }) => {
    let checks = 0;
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        new URL(request.url()).pathname === "/v2/checks"
      )
        checks++;
    });
    await page.route("**/v2/structurings", async (route) => {
      const response = await route.fetch();
      const body = (await response.json()) as {
        data: {
          referenceLimitExceeded: boolean;
          structuring: { referenceLimit: number };
        };
      };
      body.data.referenceLimitExceeded = true;
      body.data.structuring.referenceLimit = 3;
      await route.fulfill({ response, json: body });
    });
    await page.goto("/");
    await choosePreferences(page, { language });
    await page.getByRole("textbox").fill(reference);
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      message(language, "selection_limit", { limit: 3 }),
    );
    expect(checks).toBe(0);
  });
}

/** Dispatches the drag sequence a browser sends when a file is dropped. */
async function dropFile(
  page: Page,
  zone: Locator,
  file: { name: string; type: string; bytes: number[] },
) {
  const transfer = await page.evaluateHandle((file) => {
    const data = new DataTransfer();
    data.items.add(
      new File([new Uint8Array(file.bytes)], file.name, { type: file.type }),
    );
    data.effectAllowed = "copy";
    return data;
  }, file);
  await zone.dispatchEvent("dragenter", { dataTransfer: transfer });
  await zone.dispatchEvent("dragover", { dataTransfer: transfer });
  await zone.dispatchEvent("drop", { dataTransfer: transfer });
}

for (const language of ["en", "de"] as const) {
  const upload = (page: Page) =>
    page.getByRole("button", {
      name:
        language === "en"
          ? "Upload and structure"
          : "Hochladen und strukturieren",
      exact: true,
    });
  const preview = (page: Page) =>
    page.getByRole("dialog", {
      name: language === "en" ? "Recognised references" : "Erkannte Referenzen",
    });

  test(`a dropped document is taken for upload and a dropped library is imported (${language})`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language });
    await chooseFileSource(page);
    const zone = page.getByRole("button", {
      name: message(language, "shell_drop"),
    });
    await expect(upload(page)).toBeDisabled();
    await dropFile(page, zone, {
      name: "references.docx",
      type: docxType,
      bytes: [...(await docx([reference]))],
    });
    await expect(upload(page)).toBeEnabled();
    await upload(page).click();
    await expect(preview(page)).toContainText("Signal maps");
    await closeStructuringPreview(page);
    // A BibTeX file is not uploaded as a document: it is imported at once.
    await dropFile(page, zone, {
      name: "library.bib",
      type: "application/x-bibtex",
      bytes: [...Buffer.from(bibtex)],
    });
    await expect(preview(page)).toContainText("Signal maps");
    await expect(
      page.getByText(
        message(language, "library_selected", { name: "library.bib" }),
        { exact: true },
      ),
    ).toBeVisible();
  });

  test(`"Choose a file" opens a file chooser for documents and libraries (${language})`, async ({
    page,
  }) => {
    await page.goto("/");
    await choosePreferences(page, { language });
    await chooseFileSource(page);
    // The button's hidden input names the accepted types.
    await expect(
      page.locator("#intake-files input[type=file][accept*='.ris']").nth(0),
    ).toHaveAttribute("accept", ".pdf,.docx,.bib,.bibtex,.ris");
    const choose = page.getByRole("button", {
      name: message(language, "shell_choose_file"),
      exact: true,
    });
    const first = page.waitForEvent("filechooser");
    await choose.click();
    await (
      await first
    ).setFiles({
      name: "references.docx",
      mimeType: docxType,
      buffer: Buffer.from(await docx([reference])),
    });
    await expect(upload(page)).toBeEnabled();
    await upload(page).click();
    await expect(preview(page)).toContainText("Signal maps");
    await closeStructuringPreview(page);
    const second = page.waitForEvent("filechooser");
    await choose.click();
    await (
      await second
    ).setFiles({
      name: "library.bib",
      mimeType: "application/x-bibtex",
      buffer: Buffer.from(bibtex),
    });
    await expect(preview(page)).toContainText("Signal maps");
    await expect(
      page.getByText(
        message(language, "library_selected", { name: "library.bib" }),
        { exact: true },
      ),
    ).toBeVisible();
  });
}
