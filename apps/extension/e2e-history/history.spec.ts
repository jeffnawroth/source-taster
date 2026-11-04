// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  CheckResponse,
  HistoryResponse,
} from "@source-taster/contract-verification/v2";
// Real native panel, verification API and PostgreSQL. Only private Account and
// Quota authority and external DOI providers are replaced at their HTTP edges.
import { test, expect } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  startAccountApi,
  newAccount,
} from "../../server/test/support/account-api.ts";
import { sensitiveService } from "../../server/test/support/sensitive-service.ts";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium } from "../e2e/support/chromium.ts";
for (const language of ["en", "de"] as const) {
  test(`native panel keeps History on the same Account, opens for free and restarts as new work (${language})`, async () => {
    const account = { ...newAccount(), email: "history@example.org" };
    const secret = "history-opaque-" + "s".repeat(43);
    const fake = await sensitiveService({
      prefix: "/v1/extension",
      account,
      secret,
      deleteOwner: () => Promise.resolve({ status: 200 }),
      revoke: () => {},
    });
    await fake.setPreferences({ language, citationStyle: "apa" });
    const api = await startAccountApi({
      worker: true,
      service: (request, tokens) => fake.handle(request, tokens),
    });
    const profile = await mkdtemp(join(tmpdir(), "st104-native-"));
    const build = await buildExtension("chromium", {
      SOURCE_TASTER_EXTENSION_MODE: "hosted",
      SOURCE_TASTER_EXTENSION_API_URL: api.apiUrl,
      SOURCE_TASTER_EXTENSION_SERVICE_URL: api.serviceUrl,
      SOURCE_TASTER_EXTENSION_WEBSITE_URL: api.apiUrl,
      SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
    });
    const browser = await launchChromium(build.outDir, profile);
    const t =
      language === "en"
        ? {
            enable: "Enable History",
            refresh: "Refresh History",
            open: "Open Check",
            restart: "Start as a new Check",
            confirm: "Start new billable Check",
            revoke: "Revoke History",
            remove: "Delete all History",
          }
        : {
            enable: "Verlauf aktivieren",
            refresh: "Verlauf aktualisieren",
            open: "Check öffnen",
            restart: "Als neuen Check starten",
            confirm: "Neuen kostenpflichtigen Check starten",
            revoke: "Verlauf widerrufen",
            remove: "Gesamten Verlauf löschen",
          };
    try {
      await browser.setStorage({
        "source-taster-extension-session-v1": secret,
      });
      const panel = await browser.openPanel();
      try {
        await panel.find("button", t.enable);
        await panel.click("button", t.enable);
        await panel.find("button", t.revoke);
        const response = await fetch(`${api.apiUrl}/v2/checks`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${api.token(account)}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            references: [
              {
                originalText: "Native History sentinel",
                fields: { DOI: "10.1038/nphys1170" },
              },
            ],
          }),
        });
        expect(response.status).toBe(201);
        const id = CheckResponse.parse(await response.json()).data.id;
        await expect
          .poll(
            async () =>
              HistoryResponse.parse(
                await (
                  await fetch(`${api.apiUrl}/v2/history`, {
                    headers: { authorization: `Bearer ${api.token(account)}` },
                  })
                ).json(),
              ).data.entries.length,
          )
          .toBe(1);
        await panel.click("button", t.refresh);
        await panel.click("button", t.open);
        await panel.waitForText("main", undefined, "Native History sentinel");
        expect(
          api.state.quotaCalls.filter(
            (c) => c.path.endsWith("/reserve") && c.body.checkId === id,
          ),
        ).toHaveLength(1);
        await expect
          .poll(async () =>
            panel.call(
              await panel.find("button", t.restart),
              "function() { return this.disabled; }",
            ),
          )
          .toBe(false);
        await panel.click("button", t.restart);
        await panel.click("button", t.confirm);
        await expect
          .poll(
            () =>
              api.state.quotaCalls.filter((c) => c.path.endsWith("/reserve"))
                .length,
          )
          .toBe(2);
        // Wait for the restarted Check to end before the destructive control.
        await expect
          .poll(async () => {
            const b = await panel.find("button", t.revoke);
            return panel.call(b, "function() { return this.disabled; }");
          })
          .toBe(false);
        await panel.click("button", t.revoke);
        await panel.click("button", t.remove);
        await panel.find("button", t.enable);
        expect(JSON.stringify(await browser.storage())).not.toContain(
          "Native History sentinel",
        );
        expect(await panel.axe()).toEqual([]);
      } finally {
        panel.detach();
      }
    } finally {
      await browser.close();
      await build.remove();
      await rm(profile, { recursive: true, force: true });
      await api.stop();
      await fake.stop();
    }
  });
}
