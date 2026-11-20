// SPDX-License-Identifier: AGPL-3.0-or-later
// The real native Chromium side panel with the shared report control. Only
// the Quota feature grant is faked (the private service owns it). The
// downloaded file is read with an independent PDF parser.
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium, until } from "../e2e/support/chromium.ts";
import { standaloneConfig } from "../e2e/support/standalone.ts";
import { checkInPanel } from "../e2e/support/workspace.ts";
import {
  inspectPdf,
  rawCatalog,
  roles,
} from "../../server/test/support/pdf-inspect.ts";

let build: Awaited<ReturnType<typeof buildExtension>>;
test.beforeAll(async () => {
  build = await buildExtension("chromium", standaloneConfig);
});
test.afterAll(async () => {
  await build?.remove();
});

const copy = {
  en: {
    locale: "en-GB",
    menu: "PDF report",
    create: "Create report",
    download: "Download report",
    heading: "Verification report",
  },
  de: {
    locale: "de-DE",
    menu: "PDF-Bericht",
    create: "Bericht erstellen",
    download: "Bericht herunterladen",
    heading: "Prüfbericht",
  },
} as const;

for (const language of ["en", "de"] as const)
  test(`native panel downloads an accessible PDF report in ${language} and stores nothing`, async () => {
    const t = copy[language];
    const downloads = await mkdtemp(join(tmpdir(), "st105-downloads-"));
    const profile = await mkdtemp(join(tmpdir(), "st105-chromium-profile-"));
    const browser = await launchChromium(build.outDir, profile, t.locale);
    try {
      await browser.browser.send("Browser.setDownloadBehavior", {
        behavior: "allowAndName",
        downloadPath: downloads,
        eventsEnabled: true,
      });
      const completed = new Set<string>();
      const started: { guid: string; suggestedFilename: string }[] = [];
      browser.browser.on("Browser.downloadWillBegin", (event) =>
        started.push(event),
      );
      browser.browser.on("Browser.downloadProgress", (event) => {
        if (event.state === "completed") completed.add(event.guid);
      });
      const panel = await browser.openPanel();
      await panel.preferences({ language: language });
      await checkInPanel(panel, language, {
        name: "report",
        text: "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
        marker: "10.1038/nphys1170",
        verdict: "exists",
        scores: [],
      });
      // The PDF report is a Dialog from the ⋯ Menu (#194 D).
      await panel.moreAction(t.menu);
      await panel.click("button", t.create);
      await panel.find("button", t.download, 30_000);
      await panel.click("button", t.download);
      const download = await until(() => {
        const value = started[0];
        return value && completed.has(value.guid) ? value : false;
      }, "Native report download did not complete");
      expect(download.suggestedFilename).toBe("source-taster-report.pdf");
      const bytes = new Uint8Array(
        await readFile(join(downloads, download.guid)),
      );
      const pdf = await inspectPdf(bytes);
      expect(rawCatalog(bytes)).toMatchObject({
        language,
        marked: true,
        displayDocTitle: true,
        hasStructTree: true,
      });
      expect(pdf.title).toContain(t.heading);
      expect(roles(pdf.pages[0]!.tree).slice(0, 2)).toEqual(["Document", "H1"]);
      expect(pdf.text).toContain("Aspelmeyer, M. (2008)");
      // The extension keeps no part of the report or its Check.
      expect(JSON.stringify(await browser.storage())).not.toContain("report");
      expect(await panel.axe()).toEqual([]);
    } finally {
      await browser.close();
      await rm(profile, { recursive: true, force: true });
      await rm(downloads, { recursive: true, force: true });
    }
  });
