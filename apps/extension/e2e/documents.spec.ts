// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { docx, pdf } from "../../server/test/support/documents.ts";
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
  test(`native panel uploads a DOCX and reports a no-text PDF accessibly in ${language}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), "st89-panel-"));
    const browser = await launchChromium(build.outDir, directory, "en-GB");
    try {
      const file = join(directory, "references.docx");
      await writeFile(
        file,
        await docx([
          "Doe, J. (2020). Signal maps. Journal of Testing, 12(3), 45–67.",
        ]),
      );
      const scan = join(directory, "scan.pdf");
      await writeFile(scan, pdf([[]]));
      const panel = await browser.openPanel();
      await panel.select("combobox", /^(Language|Sprache)$/, language);
      const input = await panel.locate(
        'document.querySelector("#document-file")',
      );
      await panel.send("DOM.setFileInputFiles", {
        backendNodeId: input,
        files: [file],
      });
      const action =
        language === "en"
          ? "Upload and structure"
          : "Hochladen und strukturieren";
      await panel.click("button", action);
      await until(
        async () =>
          (
            await panel.text(
              "region",
              language === "en"
                ? "Recognized references"
                : "Erkannte Referenzen",
            )
          ).includes("Signal maps"),
        "The panel did not structure the uploaded document",
      );
      expect(
        await panel.call<string>(
          await panel.find(
            "textbox",
            language === "en"
              ? "Original document text — mark a region here"
              : "Originaler Dokumenttext — hier einen Bereich markieren",
          ),
          "function () { return this.value; }",
        ),
      ).toContain("Signal maps");
      await panel.send("DOM.setFileInputFiles", {
        backendNodeId: input,
        files: [scan],
      });
      await panel.click("button", action);
      await until(
        async () =>
          (await panel.text("alert")).includes(
            language === "en"
              ? "no extractable text"
              : "keinen auslesbaren Text",
          ),
        "The panel did not show the no-text message",
      );
      expect(await panel.axe()).toEqual([]);
      expect(Object.keys(await browser.storage())).toEqual([
        "source-taster-guest-preferences-v1",
      ]);
      expect(JSON.stringify(await browser.storage())).not.toContain(
        "Signal maps",
      );
    } finally {
      await browser.close();
      await rm(directory, { recursive: true, force: true });
    }
  });
}
