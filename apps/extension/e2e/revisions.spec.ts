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
      await panel.select("combobox", /^(Language|Sprache)$/, language);
      const original =
        "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
      await panel.fill(
        "textbox",
        language === "en" ? "Reference" : "Referenz",
        original,
      );
      await panel.click(
        "button",
        language === "en" ? "Check Reference" : "Referenz prüfen",
      );
      await panel.waitForText(
        "list",
        language === "en" ? "References" : "Referenzen",
        language === "en" ? "Correct" : "Korrekt",
      );
      await panel.click(
        "button",
        language === "en" ? /^Open Reference 1:/ : /^Referenz 1 öffnen:/,
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
      await panel.waitForText(
        "region",
        language === "en" ? "Reference detail" : "Referenzdetails",
        language === "en" ? "Field revision 2" : "Feldrevision 2",
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
          ? "Re-check this Reference"
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
        language === "en" ? "Back to References" : "Zurück zu Referenzen",
      );
      await panel.click(
        "button",
        language === "en" ? "Edit Reference list" : "Referenzliste bearbeiten",
      );
      await panel.click("checkbox", /^1\. Measured measurment/);
      await panel.fill(
        "textbox",
        language === "en"
          ? "Original input for the new Reference"
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
          ? "Additional Quota on first Verdicts: 1."
          : "Zusätzliches Kontingent bei ersten Urteilen: 1.",
      );
      expect(await panel.axe()).toEqual([]);
      await panel.click(
        "button",
        language === "en" ? "Apply list changes" : "Listenänderungen anwenden",
      );
      await panel.find(
        "button",
        language === "en"
          ? /^Open Reference 2: New slot/
          : /^Referenz 2 öffnen: New slot/,
      );
      const stored = await browser.storage();
      expect(JSON.stringify(stored)).not.toContain("Measured measurment");
    } finally {
      await browser.close();
      await rm(directory, { recursive: true, force: true });
    }
  });
