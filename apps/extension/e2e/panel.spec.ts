// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtemp, rm } from "node:fs/promises";
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
    await panel.find("button", "Check Reference");
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
    await panel.find("button", "Check Reference");
    const english = witnesses[0]!;
    expectWitness(await checkInPanel(panel, "en", english), "en", english);
    expect(await panel.axe()).toEqual([]);
    await panel.screenshot(evidence("chromium-panel-en-result.png"));
  });
});
