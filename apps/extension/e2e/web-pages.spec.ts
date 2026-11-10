// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { buildExtension } from "./support/build.ts";
import { launchChromium } from "./support/chromium.ts";
import { standaloneConfig } from "./support/standalone.ts";
import {
  checkInPanel,
  checkInWeb,
  comparable,
  type Witness,
} from "./support/workspace.ts";

let build: Awaited<ReturnType<typeof buildExtension>>;
test.beforeAll(async () => {
  build = await buildExtension("chromium", standaloneConfig);
});
test.afterAll(async () => {
  await build?.remove();
});

const originalUrl = "https://example.com/web80-dead";
const archiveUrl =
  "https://web.archive.org/web/20260102030405id_/https://example.com/web80-dead";
const witness: Witness = {
  name: "archived web page",
  text: `Web route witness. ${originalUrl}`,
  marker: archiveUrl,
  verdict: "exists",
  scores: ["100.00 %"],
};
const request = {
  references: [
    {
      originalText: witness.text,
      fields: { type: "webpage", title: "Web route witness", URL: originalUrl },
    },
  ],
};

for (const language of ["en", "de"] as const)
  test(`native panel and web explain archived web evidence identically in ${language}`, async ({
    page,
  }) => {
    // The free-text form has no type selector. Supply CSL at the published
    // request boundary in both hosts; all HTTP, SSE and rendering remain real.
    await page.route("**/v2/checks", (route) =>
      route.request().method() === "POST"
        ? route.continue({ postData: JSON.stringify(request) })
        : route.continue(),
    );
    await page.setViewportSize({ width: 360, height: 585 });
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/u })
      .selectOption(language);
    const profile = await mkdtemp(join(tmpdir(), "st80-chromium-profile-"));
    const browser = await launchChromium(
      build.outDir,
      profile,
      language === "en" ? "en-GB" : "de-DE",
    );
    try {
      const panel = await browser.openPanel();
      await panel.select("combobox", /^(Language|Sprache)$/u, language);
      await panel.evaluate(`(() => {
        const send = globalThis.fetch.bind(globalThis);
        globalThis.fetch = (input, init) => {
          if (String(input).endsWith('/v2/checks') && init?.method === 'POST')
            init = { ...init, body: ${JSON.stringify(JSON.stringify(request))} };
          return send(input, init);
        };
      })()`);
      const extension = await checkInPanel(panel, language, witness);
      const web = await checkInWeb(page, language, witness);
      expect(comparable(extension)).toEqual(comparable(web));
      expect(extension.text).toContain(
        language === "en"
          ? "Exists, with deviations"
          : "Existiert, mit Abweichungen",
      );
      expect(extension.text).toContain(
        language === "en"
          ? "The original URL and title identify the archived source."
          : "Die ursprüngliche URL und der Titel identifizieren die archivierte Quelle.",
      );
      expect(extension.text).toContain(originalUrl);
      expect(extension.text).toContain("20260102030405");
      expect(
        new Set(
          await panel.evaluate<string[]>(
            `[...document.querySelectorAll('#reference-detail a[target="_blank"]')].map(a => a.href)`,
          ),
        ),
      ).toEqual(new Set([archiveUrl]));
      expect(await panel.axe()).toEqual([]);
      expect(JSON.stringify(await browser.storage())).not.toContain(
        originalUrl,
      );
    } finally {
      await browser.close();
      await rm(profile, { recursive: true, force: true });
    }
  });
