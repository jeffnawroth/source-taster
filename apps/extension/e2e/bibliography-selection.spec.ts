// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { docx } from "../../server/test/support/documents.ts";
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
  test(`native panel moves and deselects bibliography regions before checking in ${language}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), "st90-panel-"));
    const browser = await launchChromium(build.outDir, directory, "en-GB");
    try {
      const first = "Doe, J. (2020). Signal maps. Example Press.";
      const second = "Roe, A. (2021). Careful systems. Example Press.";
      const text = `Introduction\nRunning text (2018).\nReferences\n${first}\nChapter 2\nOutside (2019).\nBibliography\n${second}`;
      const file = join(directory, "chapters.docx");
      await writeFile(file, await docx(text.split("\n")));
      const panel = await browser.openPanel();
      await panel.select("combobox", /^(Language|Sprache)$/, language);
      await panel.send("DOM.setFileInputFiles", {
        backendNodeId: await panel.locate(
          'document.querySelector("#document-file")',
        ),
        files: [file],
      });
      await panel.click(
        "button",
        language === "en"
          ? "Upload and structure"
          : "Hochladen und strukturieren",
      );
      await until(async () => {
        const marks = await panel.evaluate<string[]>(
          `[...document.querySelectorAll("mark")].map(m => m.textContent)`,
        );
        return JSON.stringify(marks) === JSON.stringify([first, second]);
      }, "Detected bibliography regions were not highlighted");
      await panel.click(
        "button",
        language === "en" ? "Deselect region 2" : "Bereich 2 abwählen",
      );
      // Move the remaining region to the second bibliography, excluding the body.
      await panel.fill(
        "spinbutton",
        language === "en" ? "Region 1 end" : "Bereich 1 Ende",
        String(text.length),
      );
      await panel.fill(
        "spinbutton",
        language === "en" ? "Region 1 start" : "Bereich 1 Anfang",
        String(text.indexOf(second)),
      );
      await panel.click(
        "button",
        language === "en" ? "Structure References" : "Referenzen strukturieren",
      );
      const recognized =
        language === "en" ? "Recognized References" : "Erkannte Referenzen";
      await panel.waitForText("region", recognized, second);
      expect(await panel.text("region", recognized)).not.toContain(
        "Signal maps",
      );
      expect(
        panel.requests.filter(
          (r) => r.method === "POST" && r.url.endsWith("/v2/checks"),
        ),
      ).toHaveLength(0);
      expect(await panel.axe()).toEqual([]);
      await panel.click(
        "button",
        language === "en" ? "Check Reference" : "Referenz prüfen",
      );
      const list = await panel.text(
        "list",
        language === "en" ? "References" : "Referenzen",
      );
      expect(list).toContain("Careful systems");
      for (const excluded of ["Signal maps", "Running text", "Outside"])
        expect(list).not.toContain(excluded);
      expect(JSON.stringify(await browser.storage())).not.toContain(
        "Careful systems",
      );
    } finally {
      await browser.close();
      await rm(directory, { recursive: true, force: true });
    }
  });
