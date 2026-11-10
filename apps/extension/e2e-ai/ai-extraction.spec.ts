// SPDX-License-Identifier: AGPL-3.0-or-later
// Native side panel, synthetic external HTTP edge; no provider qualification claim.
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { aiClientWitness } from "../../server/test/support/ai-client-witness.ts";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium } from "../e2e/support/chromium.ts";
const apiPort = Number(process.env.SOURCE_TASTER_E2E_AI_API_PORT ?? 5002);
const websitePort = Number(
  process.env.SOURCE_TASTER_E2E_AI_WEBSITE_PORT ?? 5401,
);
let server: Server;
let build: Awaited<ReturnType<typeof buildExtension>>;
let witness = aiClientWitness();
test.beforeAll(async () => {
  server = createServer((req, res) => {
    void (async () => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        if (!Buffer.isBuffer(chunk))
          throw new Error("synthetic-buffer-required");
        chunks.push(chunk);
      }
      const text = Buffer.concat(chunks).toString("utf8");
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify(
          witness.respond(
            req.url!,
            req.method!,
            text ? JSON.parse(text) : undefined,
          ),
        ),
      );
    })().catch(() => {
      res.statusCode = 500;
      res.end();
    });
  });
  server.listen(apiPort, "127.0.0.1");
  await once(server, "listening");
  build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_API_URL: `http://127.0.0.1:${apiPort}`,
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: `http://127.0.0.1:${websitePort}`,
  });
});
test.afterAll(async () => {
  await build?.remove();
  if (server?.listening)
    await new Promise<void>((r) => server.close(() => r()));
});
for (const language of ["en", "de"] as const)
  test(`native AI notices and explicit adoption match web in ${language}`, async () => {
    witness = aiClientWitness();
    const profile = await mkdtemp(join(tmpdir(), "st103-native-"));
    const browser = await launchChromium(
      build.outDir,
      profile,
      language === "en" ? "en-GB" : "de-DE",
    );
    try {
      const panel = await browser.openPanel();
      await panel.select("combobox", /^(Language|Sprache)$/, language);
      await panel.fill(
        "textbox",
        /^(Reference|Referenz)$/,
        "Doe (2020). Exact maps.",
      );
      await panel.click(
        "button",
        language === "en" ? "Structure references" : "Referenzen strukturieren",
      );
      await panel.waitForText(
        "main",
        undefined,
        language === "en"
          ? "AI results can be wrong"
          : "KI-Ergebnisse können falsch sein",
      );
      expect(await panel.text("main")).toContain("10.5555/PROPOSED");
      expect(await panel.text("main")).toContain(
        language === "en"
          ? "Excluded from search and scoring"
          : "Von Suche und Bewertung ausgeschlossen",
      );
      await panel.click(
        "button",
        language === "en" ? "Check reference" : "Referenz prüfen",
      );
      await panel.click(
        "button",
        language === "en" ? /^Open reference 1:/ : /^Referenz 1 öffnen:/,
      );
      await panel.click(
        "button",
        language === "en"
          ? "Adopt as a user correction"
          : "Als eigene Korrektur übernehmen",
      );
      await panel.waitForText(
        "region",
        language === "en" ? "Reference detail" : "Referenzdetails",
        language === "en" ? "Field revision 2" : "Feldrevision 2",
      );
      expect(
        witness.requests.find((r) => r.path.endsWith("/revisions"))?.body,
      ).toMatchObject({
        fields: { DOI: "10.5555/PROPOSED" },
        expectedRevision: 1,
        recheck: false,
      });
      expect(await panel.axe()).toEqual([]);
      panel.detach();
    } finally {
      await browser.close();
      await rm(profile, { recursive: true, force: true });
    }
  });

for (const language of ["en", "de"] as const)
  test(`native parser reasons and fallback passage match web in ${language}`, async () => {
    witness = aiClientWitness();
    witness.structuring.references[0]!.structuring.path = "parser";
    delete witness.structuring.references[0]!.ai;
    delete witness.structuring.receipt;
    const profile = await mkdtemp(join(tmpdir(), "st103-fallback-"));
    const browser = await launchChromium(
      build.outDir,
      profile,
      language === "en" ? "en-GB" : "de-DE",
    );
    try {
      const panel = await browser.openPanel();
      await panel.select("combobox", /^(Language|Sprache)$/, language);
      await panel.fill(
        "textbox",
        /^(Reference|Referenz)$/,
        "Doe (2020). Exact maps.",
      );
      for (const reason of [
        "guest",
        "feature-unavailable",
        "configuration-unavailable",
      ] as const) {
        witness.structuring.ai = {
          reason,
          upgrade: reason !== "configuration-unavailable",
          fallbacks: [],
        };
        await panel.click(
          "button",
          language === "en"
            ? "Structure references"
            : "Referenzen strukturieren",
        );
        await panel.waitForText(
          "main",
          undefined,
          language === "en"
            ? "The parser was used"
            : "Der Parser wurde verwendet",
        );
        if (reason !== "configuration-unavailable")
          expect(await panel.text("main")).toContain(
            language === "en" ? "paid Plan" : "kostenpflichtiger Plan",
          );
      }
      witness.structuring.ai = {
        reason: null,
        upgrade: false,
        fallbacks: [{ span: { start: 0, end: 23 }, reason: "timeout" }],
      };
      await panel.click(
        "button",
        language === "en" ? "Structure references" : "Referenzen strukturieren",
      );
      await panel.waitForText(
        "main",
        undefined,
        language === "en" ? "after one retry" : "nach einem erneuten Versuch",
      );
      expect(await panel.text("main")).toContain("Doe (2020). Exact maps.");
      expect(await panel.axe()).toEqual([]);
      panel.detach();
    } finally {
      await browser.close();
      await rm(profile, { recursive: true, force: true });
    }
  });
