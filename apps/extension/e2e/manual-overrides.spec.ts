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
for (const language of ["en", "de"] as const) {
  test(`native panel confirms, filters and resets a result-bound manual verdict in ${language}`, async () => {
    const en = language === "en";
    const directory = await mkdtemp(join(tmpdir(), "st84-panel-"));
    const browser = await launchChromium(
      build.outDir,
      directory,
      en ? "en-GB" : "de-DE",
    );
    try {
      const panel = await browser.openPanel();
      await panel.select("combobox", /^(Language|Sprache)$/, language);
      await panel.fill(
        "textbox",
        en ? "Reference" : "Referenz",
        "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
      );
      await panel.click("button", en ? "Check reference" : "Referenz prüfen");
      await panel.waitForText(
        "list",
        en ? "References" : "Referenzen",
        en ? "Correct" : "Korrekt",
      );
      await panel.click(
        "button",
        en ? /^Open reference 1:/ : /^Referenz 1 öffnen:/,
      );
      await panel.click("button", en ? "Confirm verdict" : "Befund bestätigen");
      await panel.waitForText(
        "region",
        en ? "Reference detail" : "Referenzdetails",
        en ? "Manual verdict: Correct" : "Manueller Befund: Korrekt",
      );
      await panel.click("button", en ? "Judge manually" : "Manuell beurteilen");
      await panel.select(
        "combobox",
        en ? "Manual verdict" : "Manueller Befund",
        "not-found",
      );
      await panel.click(
        "button",
        en ? "Save manual verdict" : "Manuellen Befund speichern",
      );
      await panel.waitForText(
        "region",
        en ? "Reference detail" : "Referenzdetails",
        en ? "Manual verdict: Not found" : "Manueller Befund: Nicht gefunden",
      );
      expect(
        await panel.text("region", en ? "Reference detail" : "Referenzdetails"),
      ).toContain(
        en
          ? "Original system verdict: Correct"
          : "Ursprünglicher Systembefund: Korrekt",
      );
      await panel.click(
        "button",
        en ? "Back to references" : "Zurück zu Referenzen",
      );
      await panel.waitForText(
        "list",
        en ? "References" : "Referenzen",
        en ? "Manual verdict: Not found" : "Manueller Befund: Nicht gefunden",
      );
      await panel.click("button", en ? /^Not found: 1/ : /^Nicht gefunden: 1/);
      await panel.waitForText(
        "region",
        en ? "Check summary" : "Prüfungsübersicht",
        en ? "Manual: 1" : "Manuell: 1",
      );
      await panel.click(
        "button",
        en ? /^Open reference 1:/ : /^Referenz 1 öffnen:/,
      );
      await panel.click(
        "button",
        en ? /^All references:/ : /^Alle Referenzen:/,
      );
      await panel.click(
        "button",
        en ? /^Open reference 1:/ : /^Referenz 1 öffnen:/,
      );
      await panel.click(
        "button",
        en ? "Re-check this reference" : "Diese Referenz erneut prüfen",
      );
      await panel.waitForText(
        "region",
        en ? "Reference detail" : "Referenzdetails",
        en
          ? "reset by the re-check"
          : "durch die erneute Prüfung zurückgesetzt",
      );
      await until(
        async () =>
          (
            await panel.query(
              "button",
              en ? "Confirm verdict" : "Befund bestätigen",
            )
          )[0],
        "Re-check did not finish",
      );
      await panel.click(
        "button",
        en ? "Back to references" : "Zurück zu Referenzen",
      );
      await panel.waitForText(
        "list",
        en ? "References" : "Referenzen",
        en ? "Correct" : "Korrekt",
      );
      expect(
        await panel.text("list", en ? "References" : "Referenzen"),
      ).not.toContain(en ? "Manual verdict:" : "Manueller Befund:");
      await panel.click(
        "button",
        en ? /^Open reference 1:/ : /^Referenz 1 öffnen:/,
      );
      await panel.evaluate(
        `Array.from(document.querySelectorAll('summary')).find(e => e.textContent.includes(${JSON.stringify(en ? "Previous results (historical)" : "Frühere Ergebnisse (historisch)")})).click()`,
      );
      await panel.waitForText(
        "region",
        en ? "Historical result" : "Historisches Ergebnis",
        en ? "Manual verdict: Not found" : "Manueller Befund: Nicht gefunden",
      );
      expect(await panel.axe()).toEqual([]);
      expect(
        await panel.evaluate<boolean>(
          "document.documentElement.scrollWidth <= innerWidth",
        ),
      ).toBe(true);
      expect(JSON.stringify(await browser.storage())).not.toContain(
        "Measured measurement",
      );
      expect(
        panel.requests.filter((r) => r.url.endsWith("/manual-override")),
      ).toHaveLength(2);
    } finally {
      await browser.close();
      await rm(directory, { recursive: true, force: true });
    }
  });
}
