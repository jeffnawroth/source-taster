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
import { randomBytes } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
    // With no match the list shows only its empty state, which React Aria
    // renders in the place of the items.
    await search.fill("zzzz-no-command");
    await expect(items).toHaveText([message(language, "shell_command_empty")]);
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
    // The dialog takes focus on its first control, the appearance select; the
    // language select is one tab stop away, so a keyboard user can change the
    // language at once (web-gaps SU-SH-06).
    await expect(
      dialog.getByRole("combobox", {
        name: message(language, "theme_label"),
        exact: true,
      }),
    ).toBeFocused();
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

/**
 * Drops a file from disk the way a browser does. A synthetic DataTransfer is
 * not enough: React Aria reads dropped files through `webkitGetAsEntry()`,
 * which only a native drag provides, so the drop goes through the DevTools
 * protocol.
 */
async function dropFile(
  page: Page,
  zone: Locator,
  file: { name: string; bytes: Uint8Array },
) {
  const path = join(await mkdtemp(join(tmpdir(), "intake-drop-")), file.name);
  await writeFile(path, file.bytes);
  const box = await zone.boundingBox();
  if (!box) throw new Error("The drop zone is not on screen");
  const cdp = await page.context().newCDPSession(page);
  const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const data = { items: [], files: [path], dragOperationsMask: 1 };
  for (const type of ["dragEnter", "dragOver", "drop"] as const)
    await cdp.send("Input.dispatchDragEvent", { type, ...at, data });
  await cdp.detach();
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
    const zone = page.getByText(message(language, "shell_drop"), {
      exact: true,
    });
    await expect(upload(page)).toBeDisabled();
    await dropFile(page, zone, {
      name: "references.docx",
      bytes: await docx([reference]),
    });
    await expect(upload(page)).toBeEnabled();
    await upload(page).click();
    await expect(preview(page)).toContainText("Signal maps");
    await closeStructuringPreview(page);
    // A BibTeX file is not uploaded as a document: it is imported at once.
    await dropFile(page, zone, {
      name: "library.bib",
      bytes: Buffer.from(bibtex),
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
    const choose = page.getByRole("button", {
      name: message(language, "shell_choose_file"),
      exact: true,
    });
    const first = page.waitForEvent("filechooser");
    await choose.click();
    const chooser = await first;
    // The chooser offers documents and libraries alike.
    expect(await chooser.element().getAttribute("accept")).toBe(
      ".pdf,.docx,.bib,.bibtex,.ris",
    );
    expect(chooser.isMultiple()).toBe(false);
    await chooser.setFiles({
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

for (const language of ["en", "de"] as const) {
  test(`a document over the operator's size limit is refused before upload (${language})`, async ({
    page,
  }) => {
    let uploads = 0;
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        new URL(request.url()).pathname === "/v2/document-structurings"
      )
        uploads++;
    });
    // The operator allows 1.5 MB; the browser compares the file with that
    // limit before it sends a byte.
    await page.route("**/v2/document-settings", async (route) => {
      const response = await route.fetch();
      const body = (await response.json()) as { data: { inputBytes: number } };
      body.data.inputBytes = 1_572_864;
      await route.fulfill({ response, json: body });
    });
    await page.goto("/");
    await choosePreferences(page, { language });
    await chooseFileSource(page);
    const chooser = page.waitForEvent("filechooser");
    await page
      .getByRole("button", {
        name: message(language, "shell_choose_file"),
        exact: true,
      })
      .click();
    await (
      await chooser
    ).setFiles({
      name: "large.docx",
      mimeType: docxType,
      buffer: Buffer.from(
        await docx([reference], {
          stored: [
            {
              name: "word/media/padding.bin",
              // Random bytes do not compress, so the file stays over 1.5 MB.
              bytes: randomBytes(2_000_000),
            },
          ],
        }),
      ),
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
    await expect(page.getByRole("alert")).toContainText(
      message(language, "problem_document_size_limit", {
        limit: language === "en" ? "1.5" : "1,5",
      }),
    );
    expect(uploads).toBe(0);
  });
}
