// SPDX-License-Identifier: AGPL-3.0-or-later
// Paths into the #194 D workspace that tests share. Preferences live in a
// Dialog (ADR-0023) and structuring in the launcher, so tests reach both the
// way a person does: through the launcher or the ⋯ Menu.
import { expect, type Locator, type Page } from "@playwright/test";

/** The launcher button is named by its visible hint. */
const launcherName = /^(Search or command|Suchen oder Befehl) …$/u;
const paletteName = /^(Commands|Aktionen)$/u;

/** Opens the launcher and runs the command with this accessible name. */
export async function runCommand(page: Page, name: string | RegExp) {
  await page.getByRole("button", { name: launcherName }).click();
  const palette = page.getByRole("dialog", { name: paletteName });
  await palette
    .getByRole("menuitem", {
      name,
      ...(typeof name === "string" ? { exact: true } : {}),
    })
    .click();
  await expect(palette).toBeHidden();
}

const preferencesName = /^(Preferences|Einstellungen)$/u;

/** Opens the Preferences Dialog from the launcher and returns it. */
export async function openPreferences(page: Page) {
  await runCommand(page, preferencesName);
  const dialog = page.getByRole("dialog", { name: preferencesName });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Closes an open Preferences Dialog with its Close button. */
export async function closePreferences(page: Page) {
  const dialog = page.getByRole("dialog", { name: preferencesName });
  await dialog.getByRole("button", { name: /^(Close|Schließen)$/u }).click();
  await expect(dialog).toBeHidden();
}

/** Language and citation style, set in the Preferences Dialog. */
export async function choosePreferences(
  page: Page,
  choice: { language?: string; citationStyle?: string },
) {
  const dialog = await openPreferences(page);
  if (choice.language)
    await dialog
      .getByRole("combobox", { name: /^(Language|Sprache)$/u })
      .selectOption(choice.language);
  if (choice.citationStyle)
    await dialog
      .getByRole("combobox", {
        name: /^(Preferred citation style|Bevorzugter Zitierstil)$/u,
      })
      .selectOption(choice.citationStyle);
  await closePreferences(page);
}

/** Structuring without a Check: a launcher command while the intake can run it. */
export async function structureReferences(page: Page) {
  await runCommand(page, /^(Structure references|Referenzen strukturieren)$/u);
}

/** Whether the launcher currently offers structuring. */
export async function structuringOffered(page: Page) {
  await page.getByRole("button", { name: launcherName }).click();
  const palette = page.getByRole("dialog", { name: paletteName });
  const offered =
    (await palette
      .getByRole("menuitem", {
        name: /^(Structure references|Referenzen strukturieren)$/u,
      })
      .count()) > 0;
  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();
  return offered;
}

const moreName = /^(More actions|Weitere Aktionen)$/u;

/** Runs a check-level action from the ⋯ Menu by its accessible name. */
export async function moreAction(page: Page, name: string | RegExp) {
  await page.getByRole("button", { name: moreName }).click();
  await page
    .getByRole("menuitem", {
      name,
      ...(typeof name === "string" ? { exact: true } : {}),
    })
    .click();
}

const editListName = /^(Edit reference list|Referenzliste bearbeiten)$/u;

/**
 * Opens list editing from the ⋯ Menu once the Check allows it: the item is
 * disabled while the Check runs. Returns the list editing Dialog.
 */
export async function editReferenceList(page: Page) {
  await expect(async () => {
    await page.getByRole("button", { name: moreName }).click();
    const item = page.getByRole("menuitem", { name: editListName });
    if (await item.isDisabled()) {
      await page.keyboard.press("Escape");
      throw new Error("List editing is not available yet");
    }
    await item.click();
  }).toPass({ timeout: 15000 });
  const dialog = page.getByRole("dialog", { name: editListName });
  await expect(dialog).toBeVisible();
  return dialog;
}

const exportName = /^(Export references|Referenzen exportieren)$/u;

/** Opens the Export Dialog from the ⋯ Menu and returns it. */
export async function openExport(page: Page) {
  await moreAction(page, /^(Export|Exportieren)$/u);
  const dialog = page.getByRole("dialog", { name: exportName });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Picks an export format radio by its value (csl-json, bibtex, imported-format). */
export async function chooseExportFormat(
  dialog: Locator,
  format: "csl-json" | "bibtex" | "imported-format",
) {
  const input = `input[type="radio"][value="${format}"]`;
  // The radio input is visually hidden; a person presses its visible label.
  await dialog
    .locator("label")
    .filter({ has: dialog.page().locator(input) })
    .click();
  await expect(dialog.locator(input)).toBeChecked();
}

/** Closes the Export Dialog with its Cancel button. */
export async function closeExport(page: Page) {
  const dialog = page.getByRole("dialog", { name: exportName });
  await dialog.getByRole("button", { name: /^(Cancel|Abbrechen)$/u }).click();
  await expect(dialog).toBeHidden();
}

const previewName = /^(Recognized references|Erkannte Referenzen)$/u;

/** The Structuring preview opens as a Dialog; this closes it with its Close button. */
export async function closeStructuringPreview(page: Page) {
  const dialog = page.getByRole("dialog", { name: previewName });
  await dialog.getByRole("button", { name: /^(Close|Schließen)$/u }).click();
  await expect(dialog).toBeHidden();
}

/**
 * Starts the Check from the open Structuring preview. The preview is a modal
 * Dialog over the intake, so it offers the same Check itself.
 */
export async function checkFromPreview(page: Page) {
  const dialog = page.getByRole("dialog", { name: previewName });
  await dialog
    .getByRole("button", { name: /^(Check reference|Referenz prüfen)$/u })
    .click();
  await expect(dialog).toBeHidden();
}

/** Opens a Reference's detail from the feed by its 1-based position. */
export async function openReference(page: Page, position: number) {
  await page
    .getByRole("button", {
      name: new RegExp(
        `^(Open reference ${position}:|Referenz ${position} öffnen:)`,
        "u",
      ),
    })
    .click();
}

/** One-action Reset: the launcher's "New check" discards input and results. */
export async function newCheck(page: Page) {
  await runCommand(page, /^(New check|Neue Prüfung)$/u);
}

/** Reset from the ⋯ Menu, confirmed in its AlertDialog. */
export async function resetFromMenu(page: Page) {
  await moreAction(page, /^(Reset|Zurücksetzen)$/u);
  const confirm = page.getByRole("alertdialog");
  await confirm
    .getByRole("button", { name: /^(Reset|Zurücksetzen)$/u })
    .click();
  await expect(confirm).toBeHidden();
}

/** The intake's File segment (#194 D) shows the upload and library import. */
export async function chooseFileSource(page: Page) {
  await page.getByRole("radio", { name: /^(File|Datei)$/u }).click();
}

/** Opens the PDF report Dialog from the ⋯ Menu (#194 D) and returns it. */
export async function openReport(page: Page) {
  await moreAction(page, /^(PDF report|PDF-Bericht)$/u);
  const dialog = page.getByRole("dialog", {
    name: /^(Accessible PDF report|Barrierefreier PDF-Bericht)$/u,
  });
  await expect(dialog).toBeVisible();
  return dialog;
}

const bibliographyName =
  /^(Formatted bibliography|Formatiertes Literaturverzeichnis)$/u;

/** Opens the formatted bibliography Dialog from the ⋯ Menu (#194 D). */
export async function openBibliography(page: Page) {
  await moreAction(page, bibliographyName);
  const dialog = page.getByRole("dialog", { name: bibliographyName });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Closes the open ⋯ Menu Dialog with this name by its Close button. */
export async function closeDialog(page: Page, name: RegExp) {
  const dialog = page.getByRole("dialog", { name });
  await dialog.getByRole("button", { name: /^(Close|Schließen)$/u }).click();
  await expect(dialog).toBeHidden();
}
