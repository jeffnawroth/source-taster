// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { buildExtension } from "./support/build.ts";
import { launchChromium, until } from "./support/chromium.ts";
import { standaloneConfig } from "./support/standalone.ts";
let build: Awaited<ReturnType<typeof buildExtension>>;
test.beforeAll(async () => {
  build = await buildExtension("chromium", standaloneConfig);
});
test.afterAll(async () => {
  await build?.remove();
});
for (const language of ["en", "de"] as const)
  test(`native panel corrects one slot and keeps original evidence in ${language}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), "st83-panel-"));
    const browser = await launchChromium(
      build.outDir,
      directory,
      language === "en" ? "en-GB" : "de-DE",
    );
    try {
      const panel = await browser.openPanel();
      await panel.preferences({ language: language });
      const original =
        "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
      await panel.fill(
        "textbox",
        language === "en" ? "Reference" : "Referenz",
        original,
      );
      await panel.click(
        "button",
        language === "en" ? "Check reference" : "Referenz prüfen",
      );
      await panel.waitForText(
        "grid",
        language === "en" ? "References" : "Referenzen",
        language === "en" ? "Correct" : "Korrekt",
      );
      await panel.click(
        "button",
        language === "en" ? /^Open reference 1:/ : /^Referenz 1 öffnen:/,
      );
      // The Correction suggestion renders above the Edit fields row when its
      // response arrives. A press measured before that lands on the suggestion
      // text and never opens the editor, so the page settles first.
      await panel.waitForText(
        "region",
        language === "en" ? "Reference detail" : "Referenzdetails",
        language === "en" ? "Correction suggestion" : "Korrekturvorschlag",
      );
      await panel.click(
        "button",
        language === "en" ? "Edit fields" : "Felder bearbeiten",
      );
      await panel.fill(
        "textbox",
        language === "en" ? "Title" : "Titel",
        "Measured measurment",
      );
      expect(
        panel.requests.filter((r) => r.url.endsWith("/revisions")),
      ).toHaveLength(0);
      await panel.click(
        "button",
        language === "en" ? "Save fields only" : "Nur Felder speichern",
      );
      // #194 D sets detail section labels in capitals (CSS text-transform),
      // which innerText reports, so the label matches case-insensitively.
      await panel.waitForText(
        "region",
        language === "en" ? "Reference detail" : "Referenzdetails",
        language === "en" ? /Field revision 2/iu : /Feldrevision 2/iu,
      );
      await panel.waitForText(
        "region",
        language === "en" ? "Reference detail" : "Referenzdetails",
        language === "en" ? "Not checked" : "Nicht geprüft",
      );
      expect(
        panel.requests.filter((r) => r.url.endsWith("/recheck")),
      ).toHaveLength(0);
      await panel.click(
        "button",
        language === "en"
          ? "Re-check this reference"
          : "Diese Referenz erneut prüfen",
      );
      await panel.waitForText(
        "region",
        language === "en" ? "Reference detail" : "Referenzdetails",
        language === "en"
          ? "Exists, with deviations"
          : "Existiert, mit Abweichungen",
      );
      expect(
        await panel.text(
          "region",
          language === "en" ? "Reference detail" : "Referenzdetails",
        ),
      ).toContain(original);
      expect(
        panel.requests.filter((r) => r.url.endsWith("/revisions")),
      ).toHaveLength(1);
      expect(
        panel.requests.filter((r) => r.url.endsWith("/recheck")),
      ).toHaveLength(1);
      await until(
        async () =>
          (
            await panel.query(
              "button",
              language === "en" ? "Edit fields" : "Felder bearbeiten",
            )
          )[0],
        "Field editor did not become idle",
      );
      expect(await panel.axe()).toEqual([]);
      expect(
        await panel.evaluate<boolean>(
          "document.documentElement.scrollWidth <= innerWidth",
        ),
      ).toBe(true);
      await panel.click(
        "button",
        language === "en" ? "Back to references" : "Zurück zu Referenzen",
      );
      // The list editor is a Dialog from the ⋯ Menu (#194 D).
      await panel.moreAction(
        language === "en" ? "Edit reference list" : "Referenzliste bearbeiten",
      );
      // The membership row is a choice primitive: its input is visually hidden,
      // so a person presses the label that wraps it.
      await panel.clickChoice("checkbox", /^1\. Measured measurment/);
      await panel.fill(
        "textbox",
        language === "en"
          ? "Original input for the new reference"
          : "Originaleingabe für die neue Referenz",
        "A manually added Reference",
      );
      await panel.fill(
        "textbox",
        language === "en" ? "Title" : "Titel",
        "New slot",
      );
      await panel.fill("textbox", "DOI", "10.1038/nphys1170");
      await panel.click(
        "button",
        language === "en"
          ? "Preview list changes"
          : "Listenänderungen vorschauen",
      );
      expect(
        await panel.text(
          "region",
          language === "en"
            ? "Preview list changes"
            : "Listenänderungen vorschauen",
        ),
      ).toContain(
        language === "en"
          ? "Additional quota on first verdicts: 1."
          : "Zusätzliches Kontingent bei ersten Befunden: 1.",
      );
      expect(await panel.axe()).toEqual([]);
      await panel.click(
        "button",
        language === "en" ? "Apply list changes" : "Listenänderungen anwenden",
      );
      await panel.find(
        "button",
        language === "en"
          ? /^Open reference 2: New slot/
          : /^Referenz 2 öffnen: New slot/,
      );
      const stored = await browser.storage();
      expect(JSON.stringify(stored)).not.toContain("Measured measurment");
    } finally {
      await browser.close();
      await rm(directory, { recursive: true, force: true });
    }
  });

// The Correction suggestion for the selected Reference is requested as soon as
// the results show, and it renders above the Edit fields row whenever its
// response arrives. A response that settles between a press and its release
// would move the pressed button away and lose the press, so the panel waits
// for the release. The test holds the response, presses down, lets the
// response arrive, and checks that the button did not move before the pointer
// goes up.
for (const language of ["en", "de"] as const)
  test(`native Edit fields press survives a late suggestion in ${language}`, async () => {
    const en = language === "en";
    const directory = await mkdtemp(join(tmpdir(), "st220-panel-"));
    const browser = await launchChromium(
      build.outDir,
      directory,
      en ? "en-GB" : "de-DE",
    );
    try {
      const panel = await browser.openPanel();
      await panel.preferences({ language: language });
      await panel.fill(
        "textbox",
        en ? "Reference" : "Referenz",
        "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
      );
      const suggestion = await panel.holdRequests(/\/bibliography$/);
      await panel.click("button", en ? "Check reference" : "Referenz prüfen");
      await panel.waitForText(
        "grid",
        en ? "References" : "Referenzen",
        en ? "Correct" : "Korrekt",
      );
      await until(
        () => suggestion.held() > 0,
        "The suggestion request was never sent",
      );
      await panel.click(
        "button",
        en ? /^Open reference 1:/ : /^Referenz 1 öffnen:/,
      );
      const edit = en ? "Edit fields" : "Felder bearbeiten";
      const press = await panel.pressDown("button", edit);
      await suggestion.release();
      await until(
        () =>
          panel.evaluate<boolean>(
            `performance.getEntriesByType("resource").some((e) => e.name.endsWith("/bibliography") && e.responseEnd > 0)`,
          ),
        "The suggestion response never arrived",
      );
      // The response is complete; give the page ample frames to render it.
      await panel.evaluate(
        `(async () => { for (let i = 0; i < 30; i++) await new Promise((r) => requestAnimationFrame(r)); })()`,
      );
      const centre = await panel.centreOf("button", edit);
      expect(centre?.y).toBeCloseTo(press.point.y, 0);
      await press.release();
      // The press reached the button, and the suggestion renders afterwards.
      await panel.find("textbox", en ? "Title" : "Titel");
      await panel.waitForText(
        "region",
        en ? "Reference detail" : "Referenzdetails",
        en ? "Correction suggestion" : "Korrekturvorschlag",
      );
    } finally {
      await browser.close();
      await rm(directory, { recursive: true, force: true });
    }
  });
