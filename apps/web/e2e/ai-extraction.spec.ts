// SPDX-License-Identifier: AGPL-3.0-or-later
// Client-only synthetic HTTP witnesses; provider/legal qualification is separate.
import { aiClientWitness } from "../../server/test/support/ai-client-witness.ts";
import { expect, test } from "@playwright/test";
for (const language of ["en", "de"] as const) {
  test(`shows grounded AI provenance and quarantined proposals in ${language}`, async ({
    page,
  }) => {
    await page.route("**/v2/structurings", (route) =>
      route.fulfill({
        json: {
          quota: null,
          data: {
            document: null,
            referenceLimitExceeded: false,
            structuring: {
              references: [
                {
                  originalText: "Doe (2020). Exact maps.",
                  span: { start: 0, end: 23 },
                  csl: { title: "Exact maps" },
                  fieldSources: {
                    title: { raw: "Exact maps", span: { start: 12, end: 22 } },
                  },
                  structuring: { path: "ai", version: "synthetic" },
                  ai: {
                    configuration: "synthetic",
                    notice: "ai-can-be-wrong",
                    changedFields: ["title"],
                    proposals: [
                      {
                        field: "DOI",
                        value: "10.5555/PROPOSED",
                        reason: "ungrounded",
                      },
                    ],
                  },
                },
              ],
              rejected: [],
              guidance: null,
              quotaConsumed: 0,
              referenceLimit: 1000,
              ai: { reason: null, upgrade: false, fallbacks: [] },
            },
          },
        },
      }),
    );
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page.getByRole("textbox").fill("Doe (2020). Exact maps.");
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Structure references"
            : "Referenzen strukturieren",
        exact: true,
      })
      .click();
    await expect(page.getByTestId("ai-uncertainty")).toContainText(
      language === "en"
        ? "AI results can be wrong"
        : "KI-Ergebnisse können falsch sein",
    );
    await expect(page.getByTestId("ai-proposals")).toContainText(
      "10.5555/PROPOSED",
    );
    await expect(page.getByTestId("ai-proposals")).toContainText(
      language === "en"
        ? "Excluded from search and scoring"
        : "Von Suche und Bewertung ausgeschlossen",
    );
    await expect(page.getByTestId("ai-changed")).toContainText(
      language === "en"
        ? "AI added or changed"
        : "Von KI ergänzt oder geändert",
    );
  });
}

for (const language of ["en", "de"] as const)
  test(`explicitly adopts an AI proposal as a user revision in ${language}`, async ({
    page,
  }) => {
    const witness = aiClientWitness();
    await page.route("**/v2/**", (route) => {
      const req = route.request();
      return route.fulfill({
        json: witness.respond(
          new URL(req.url()).pathname,
          req.method(),
          req.postDataJSON(),
        ),
      });
    });
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page.getByRole("textbox").fill("Doe (2020). Exact maps.");
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: language === "en" ? /^Open reference 1:/ : /^Referenz 1 öffnen:/,
      })
      .click();
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Adopt as a user correction"
            : "Als eigene Korrektur übernehmen",
      })
      .click();
    const detail = page.getByRole("region", {
      name: language === "en" ? "Reference detail" : "Referenzdetails",
      exact: true,
    });
    await expect(detail).toContainText(
      language === "en" ? "Field revision 2" : "Feldrevision 2",
    );
    expect(
      witness.requests.find((r) => r.path.endsWith("/revisions"))?.body,
    ).toMatchObject({
      fields: { DOI: "10.5555/PROPOSED" },
      recheck: false,
      expectedRevision: 1,
    });
    expect(
      witness.requests.find((r) => r.path.endsWith("/checks"))?.body,
    ).toMatchObject({
      extraction: {
        result: { references: [{ csl: { title: "Exact maps" } }] },
      },
    });
  });

for (const language of ["en", "de"] as const)
  test(`shows parser reasons, upgrade offers and the exact fallback passage in ${language}`, async ({
    page,
  }) => {
    const witness = aiClientWitness();
    witness.structuring.references[0]!.structuring.path = "parser";
    delete witness.structuring.references[0]!.ai;
    delete witness.structuring.receipt;
    await page.route("**/v2/**", (route) => {
      const req = route.request();
      return route.fulfill({
        json: witness.respond(
          new URL(req.url()).pathname,
          req.method(),
          req.postDataJSON(),
        ),
      });
    });
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page.getByRole("textbox").fill("Doe (2020). Exact maps.");
    const action = page.getByRole("button", {
      name:
        language === "en" ? "Structure references" : "Referenzen strukturieren",
      exact: true,
    });
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
      await action.click();
      await expect(page.getByTestId("ai-unavailable")).toContainText(
        language === "en"
          ? "The parser was used"
          : "Der Parser wurde verwendet",
      );
      if (reason !== "configuration-unavailable")
        await expect(page.getByTestId("ai-unavailable")).toContainText(
          language === "en" ? "paid plan" : "kostenpflichtiger Plan",
        );
    }
    witness.structuring.ai = {
      reason: null,
      upgrade: false,
      fallbacks: [{ span: { start: 0, end: 23 }, reason: "timeout" }],
    };
    await action.click();
    await expect(page.getByTestId("ai-fallback")).toContainText(
      language === "en" ? "after one retry" : "nach einem erneuten Versuch",
    );
    await expect(page.getByTestId("ai-fallback")).toContainText(
      "Doe (2020). Exact maps.",
    );
  });
