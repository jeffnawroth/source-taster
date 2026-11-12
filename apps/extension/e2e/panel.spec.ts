// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { buildExtension } from "./support/build.ts";
import {
  launchChromium,
  until,
  type NativeChromium,
} from "./support/chromium.ts";
import { standaloneConfig, webUrl } from "./support/standalone.ts";
import { evidence } from "./support/evidence.ts";
import {
  checkInPanel,
  checkInWeb,
  comparable,
  expectWitness,
  labels,
  witnesses,
} from "./support/workspace.ts";

let build: Awaited<ReturnType<typeof buildExtension>>;
test.beforeAll(async () => {
  build = await buildExtension("chromium", standaloneConfig);
});
test.afterAll(async () => {
  await build?.remove();
});
async function native<T>(
  locale: string,
  run: (browser: NativeChromium) => Promise<T>,
) {
  const profile = await mkdtemp(join(tmpdir(), "st92-chromium-profile-"));
  const browser = await launchChromium(build.outDir, profile, locale);
  try {
    return await run(browser);
  } finally {
    await browser.close();
    await rm(profile, { recursive: true, force: true });
  }
}

test("the toolbar action opens the real native side panel with the shared Check workspace", async () => {
  await native("en-GB", async (browser) => {
    expect(await browser.panelTargets()).toEqual([]);
    const panel = await browser.openPanel();
    const contexts = await browser.contexts();
    expect(contexts).toContainEqual(
      expect.objectContaining({
        contextType: "SIDE_PANEL",
        documentUrl: `${browser.origin}/panel.html`,
      }),
    );
    await panel.find("textbox", "Reference");
    await panel.find("button", "Check reference");
    expect(
      await panel.evaluate<number>("window.innerWidth"),
    ).toBeLessThanOrEqual(480);
    await panel.screenshot(evidence("chromium-panel-open.png"));
    test
      .info()
      .annotations.push({ type: "browser", description: browser.version });
  });
});

for (const language of ["en", "de"] as const)
  test(`native panel and web keep identical server outcomes for the synthetic witnesses in ${language}`, async ({
    page,
  }) => {
    test.setTimeout(240_000);
    // Same narrow width as the panel, so both render the same detail layout.
    await page.setViewportSize({ width: 360, height: 585 });
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await native(language === "en" ? "en-GB" : "de-DE", async (browser) => {
      const panel = await browser.openPanel();
      await panel.select("combobox", /^(Language|Sprache)$/, language);
      await panel.find("button", labels[language].check);
      for (const witness of witnesses) {
        const extension = await checkInPanel(panel, language, witness);
        const web = await checkInWeb(page, language, witness);
        expectWitness(extension, language, witness);
        expectWitness(web, language, witness);
        expect(comparable(extension), witness.name).toEqual(comparable(web));
      }
      await panel.screenshot(evidence(`chromium-parity-${language}.png`));
    });
  });

test("closing, reopening and reloading the native panel keeps only validated Preferences, in DE and EN without axe violations", async () => {
  test.setTimeout(120_000);
  await native("en-GB", async (browser) => {
    let panel = await browser.openPanel();
    await panel.select("combobox", "Language", "de");
    await panel.select("combobox", "Bevorzugter Zitierstil", "mla");
    const witness = witnesses.at(-2)!;
    expectWitness(await checkInPanel(panel, "de", witness), "de", witness);
    expect(await panel.axe()).toEqual([]);
    await panel.screenshot(evidence("chromium-panel-de-result.png"));
    // Development configuration supplies the information origin explicitly.
    const help = await panel.find("link", "Hilfe");
    expect(await panel.call(help, "function () { return this.href; }")).toBe(
      `${webUrl}/docs/de/`,
    );
    const stored = await browser.storage();
    expect(Object.keys(stored).sort()).toEqual([
      "source-taster-guest-preferences-v1",
    ]);
    expect(stored["source-taster-guest-preferences-v1"]).toEqual({
      language: "de",
      citationStyle: "mla",
      theme: "system",
    });
    expect(JSON.stringify(stored)).not.toContain("WorkspaceRanked");

    await panel.reload();
    await panel.find("button", "Referenz prüfen");
    expect(
      await panel.call(
        await panel.find("textbox", "Referenz"),
        "function () { return this.value; }",
      ),
    ).toBe("");
    expect(await panel.query("region", "Referenzdetails")).toEqual([]);
    expect(
      await panel.call(
        await panel.find("combobox", "Bevorzugter Zitierstil"),
        "function () { return this.value; }",
      ),
    ).toBe("mla");

    // The toolbar action toggles the open panel closed.
    panel.detach();
    await browser.triggerAction();
    await until(
      async () => (await browser.panelTargets()).length === 0,
      "The toolbar action did not close the side panel",
    );
    expect(
      (await browser.contexts()).filter((c) => c.contextType === "SIDE_PANEL"),
    ).toEqual([]);

    panel = await browser.openPanel();
    await panel.find("button", "Referenz prüfen");
    expect(await panel.query("region", "Referenzdetails")).toEqual([]);
    await panel.select("combobox", "Sprache", "en");
    await panel.find("button", "Check reference");
    const english = witnesses[0]!;
    expectWitness(await checkInPanel(panel, "en", english), "en", english);
    expect(await panel.axe()).toEqual([]);
    await panel.screenshot(evidence("chromium-panel-en-result.png"));
  });
});

test("native panel renders a Correction suggestion and keeps export choices local", async () => {
  await native("en-GB", async (browser) => {
    const panel = await browser.openPanel();
    const original =
      "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
    await checkInPanel(panel, "en", {
      name: "correction export",
      text: original,
      marker: "10.1038/nphys1170",
      verdict: "exists",
      scores: [],
    });
    const region = await panel.find("region", "Correction suggestion");
    expect(
      await panel.call<string>(
        region,
        "function () { return this.textContent; }",
      ),
    ).toContain("Deleted: (2008).Inserted: (2009).");
    await panel.clickChoice("checkbox", "Apply for export only");
    expect(
      await panel.call<boolean>(
        await panel.find("checkbox", "Apply for export only"),
        "function () { return this.checked; }",
      ),
    ).toBe(true);
    await panel.select("combobox", "Preferred citation style", "ieee");
    await until(async () => {
      const [suggestion] = await panel.query("region", "Correction suggestion");
      if (!suggestion) return false;
      // The tracked change's kept and inserted parts read as the suggestion.
      return (
        await panel.call<string>(
          suggestion,
          `function () {
            const clone = this.cloneNode(true);
            for (const node of clone.querySelectorAll("del, .sr-only")) node.remove();
            return clone.textContent;
          }`,
        )
      ).includes("M. Aspelmeyer");
    }, "The panel did not re-render the IEEE suggestion");
    expect(
      await panel.call<string>(
        await panel.find("textbox", "Reference"),
        "function () { return this.value; }",
      ),
    ).toBe(original);
    expect(Object.keys(await browser.storage())).toEqual([
      "source-taster-guest-preferences-v1",
    ]);
    expect(await panel.axe()).toEqual([]);
  });
});

test("native panel downloads both citation formats with export-only corrections", async () => {
  const downloads = await mkdtemp(join(tmpdir(), "st87-downloads-"));
  try {
    await native("en-GB", async (browser) => {
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
      await checkInPanel(panel, "en", {
        name: "citation download",
        text: "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
        marker: "10.1038/nphys1170",
        verdict: "exists",
        scores: [],
      });
      await panel.find("checkbox", "Apply for export only");
      await panel.clickChoice("checkbox", "Apply for export only");
      await panel.select("combobox", "Export content", "selected-corrections");
      for (const [index, format] of ["csl-json", "bibtex"].entries()) {
        await panel.select("combobox", "Export format", format);
        await until(
          async () =>
            !(await panel.call<boolean>(
              await panel.find("button", "Download references"),
              "function () { return this.disabled; }",
            )),
          "Export is not ready",
        );
        await panel.click("button", "Download references");
        const download = await until(() => {
          const value = started[index];
          return value && completed.has(value.guid) ? value : false;
        }, "Native citation download did not complete");
        expect(download.suggestedFilename).toBe(
          `source-taster-references.${format === "csl-json" ? "json" : "bib"}`,
        );
        const content = await readFile(join(downloads, download.guid), "utf8");
        if (format === "csl-json") {
          const data = JSON.parse(content) as {
            issued: { "date-parts": number[][] };
            custom: { originalText: string };
          }[];
          expect(data[0]!.issued["date-parts"][0]![0]).toBe(2009);
          expect(data[0]!.custom.originalText).toContain("2008");
        } else expect(content).toContain("year = {2009}");
      }
      expect(Object.keys(await browser.storage())).toEqual([]);
      expect(await panel.axe()).toEqual([]);
    });
  } finally {
    await rm(downloads, { recursive: true, force: true });
  }
});

for (const language of ["en", "de"] as const)
  test(`native panel imports and round trips BibTeX and RIS with selected corrections in ${language}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), "st88-library-"));
    try {
      await native(language === "en" ? "en-GB" : "de-DE", async (browser) => {
        await browser.browser.send("Browser.setDownloadBehavior", {
          behavior: "allowAndName",
          downloadPath: directory,
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
        await panel.select("combobox", /^(Language|Sprache)$/u, language);
        for (const format of ["bibtex", "ris"] as const) {
          const text =
            format === "bibtex"
              ? "% Library header\n@article{Kept, title={Measured measurement}, author={Aspelmeyer, M.}, year={2008}, journal={Nature Physics}, volume={5}, pages={12}, doi={10.1038/nphys1170}, customfield={Keep me}}\n"
              : "\uFEFFTY  - JOUR\r\nTI  - Measured measurement\r\nAU  - Aspelmeyer, M.\r\nPY  - 2008\r\nJO  - Nature Physics\r\nVL  - 5\r\nSP  - 12\r\nDO  - 10.1038/nphys1170\r\nZZ  - Keep me\r\nER  - \r\n";
          const extension = format === "bibtex" ? "bib" : "ris";
          const file = join(directory, `library.${extension}`);
          await writeFile(file, text);
          await panel.send("DOM.setFileInputFiles", {
            // The workspace also has a document upload input; pick the
            // library import by its label, not by position.
            backendNodeId: await panel.locate(
              `[...document.querySelectorAll("input[type=file]")].find((input) => [...input.labels].some((label) => label.textContent.trim() === ${JSON.stringify(labels[language].library)}))`,
            ),
            files: [file],
          });
          await until(
            async () =>
              (
                await panel.evaluate<string>("document.body.innerText")
              ).includes(
                format === "bibtex" ? "customfield: Keep me" : "ZZ: Keep me",
              ),
            "Library preview not visible",
          );
          await panel.click("button", labels[language].check);
          await until(
            async () => {
              const [detail] = await panel.query(
                "region",
                labels[language].detail,
              );
              if (
                detail !== undefined &&
                (
                  await panel.call<string>(
                    detail,
                    "function () { return this.innerText; }",
                  )
                ).includes(labels[language].exists)
              )
                return true;
              const [open] = await panel.query("button", labels[language].open);
              if (open !== undefined) await panel.clickNode(open);
              return false;
            },
            "Imported Reference did not show its outcome",
            20_000,
          );
          await panel.find(
            "checkbox",
            language === "en"
              ? "Apply for export only"
              : "Nur für den Export übernehmen",
          );
          await panel.clickChoice(
            "checkbox",
            language === "en"
              ? "Apply for export only"
              : "Nur für den Export übernehmen",
          );
          await panel.select(
            "combobox",
            language === "en" ? "Export format" : "Exportformat",
            "imported-format",
          );
          for (const mode of ["original", "selected-corrections"] as const) {
            await panel.select(
              "combobox",
              language === "en" ? "Export content" : "Exportinhalt",
              mode,
            );
            await until(
              async () =>
                !(await panel.call<boolean>(
                  await panel.find(
                    "button",
                    language === "en"
                      ? "Download references"
                      : "Referenzen herunterladen",
                  ),
                  "function () { return this.disabled; }",
                )),
              "Library export is not ready",
            );
            const index = started.length;
            await panel.click(
              "button",
              language === "en"
                ? "Download references"
                : "Referenzen herunterladen",
            );
            const download = await until(() => {
              const value = started[index];
              return value && completed.has(value.guid) ? value : false;
            }, `Native library download did not complete (${format}, ${mode})`);
            expect(download.suggestedFilename).toBe(
              `source-taster-references.${extension}`,
            );
            const output = await readFile(
              join(directory, download.guid),
              "utf8",
            );
            if (mode === "original") expect(output).toBe(text);
            else {
              expect(output).toContain(
                format === "bibtex" ? "year={2009}" : "PY  - 2009\r\n",
              );
              expect(output).toContain(
                format === "bibtex"
                  ? "customfield={Keep me}"
                  : "ZZ  - Keep me\r\n",
              );
              expect(output).toContain("Aspelmeyer, Markus");
            }
          }
          expect(JSON.stringify(await browser.storage())).not.toContain(
            "Measured measurement",
          );
          expect(await panel.axe()).toEqual([]);
          await panel.click(
            "button",
            language === "en" ? "Reset" : "Zurücksetzen",
          );
        }
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
