import {
  AccountSessionResponse,
  ExtensionCredential,
  DpaAgreement,
} from "@source-taster/contract-service";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { bothPrograms } from "../../server/test/support/both-programs.ts";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium, until } from "../e2e/support/chromium.ts";
for (const language of ["en", "de"] as const)
  for (const paid of [false, true])
    test(`native panel ${language} ${paid ? "paid" : "Free"} concludes and downloads a retained packet`, async () => {
      const b = await bothPrograms({ accounts: true, startWorker: false }),
        directory = await mkdtemp(join(tmpdir(), "st110-panel-"));
      let build: Awaited<ReturnType<typeof buildExtension>> | undefined,
        browser: Awaited<ReturnType<typeof launchChromium>> | undefined;
      const de = language === "de";
      try {
        const packet = {
          version: "review-v1",
          language,
          documents: ["agreement", "processing", "toms", "subprocessors"].map(
            (kind) => ({
              kind,
              version: "review-v1",
              title: kind,
              text: `PLACEHOLDER ${kind}; human legal review required.`,
            }),
          ),
        };
        await b.service().command({ dpa: { publish: packet } });
        build = await buildExtension("chromium", {
          SOURCE_TASTER_EXTENSION_MODE: "hosted",
          SOURCE_TASTER_EXTENSION_API_URL: b.apiUrl,
          SOURCE_TASTER_EXTENSION_SERVICE_URL: b.serviceUrl,
          SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
        });
        browser = await launchChromium(
          build.outDir,
          join(directory, "profile"),
          de ? "de-DE" : "en-GB",
        );
        const settings = JSON.parse(
          await readFile(b.accountConfigPath, "utf8"),
        ) as Record<string, unknown>;
        await writeFile(
          b.accountConfigPath,
          JSON.stringify({ ...settings, extensionOrigins: [browser.origin] }),
        );
        await b.restartService();
        await browser.browser.send("Browser.setDownloadBehavior", {
          behavior: "allow",
          downloadPath: directory,
          eventsEnabled: true,
        });
        let panel = await browser.openPanel();
        if (de) await panel.select("combobox", "Language", "de");
        await panel.click("button", de ? "Anmelden" : "Sign in");
        await panel.fill(
          "textbox",
          de ? "E-Mail-Adresse" : "Email address",
          `dpa-native-${language}-${paid}@example.invalid`,
        );
        await panel.click("button", de ? "Code senden" : "Send code");
        const code = await until(
          async () => (await b.mail()).at(-1)?.text.match(/\b[0-9]{6}\b/)?.[0],
          "Sign-in mail missing",
        );
        await panel.fill(
          "textbox",
          de ? "Sechsstelliger Code" : "Six-digit code",
          code,
        );
        await panel.click("button", de ? "Code bestätigen" : "Confirm code");
        await panel.find("button", de ? "Hier abmelden" : "Sign out here");
        if (paid) {
          const credential = ExtensionCredential.parse(
            (await browser.storage())["source-taster-extension-session-v1"],
          );
          const response = await fetch(b.serviceUrl + "/v1/extension/session", {
            headers: {
              origin: browser.origin,
              authorization: `Bearer ${credential}`,
            },
          });
          const data = AccountSessionResponse.parse(await response.json()).data;
          await b.service().command({
            operator: {
              credit: {
                ownerId: data.ownerId,
                amount: 100,
                key: "dpa-native-paid",
                features: ["ai-extraction", "history-extended"],
              },
            },
          });
        }
        await panel.click(
          "button",
          de ? "Datenverarbeitungsvereinbarung" : "Data processing agreement",
        );
        await panel.fill(
          "textbox",
          de ? "Rechtlicher Name" : "Legal business name",
          "Example Research",
        );
        await panel.fill(
          "textbox",
          de ? "Geschäftsanschrift" : "Business address",
          "Example Street 1, Berlin",
        );
        await panel.fill(
          "textbox",
          de ? "Bevollmächtigte Person" : "Authorized representative",
          "Alex Example",
        );
        await panel.click(
          "checkbox",
          de
            ? "Ich nutze den Dienst geschäftlich und bin zum Abschluss für diese Vertragspartei bevollmächtigt."
            : "I use the service for business and am authorized to conclude for this Contracting party.",
        );
        const before = (await b.mail()).length;
        await panel.click(
          "button",
          de ? "Frischen Code anfordern" : "Request fresh code",
        );
        const proof = await until(async () => {
          const mail = await b.mail();
          return (
            mail.length > before && mail.at(-1)?.text.match(/\b[0-9]{6}\b/)?.[0]
          );
        }, "DPA proof missing");
        await panel.fill(
          "textbox",
          de ? "DPA-Bestätigungscode" : "DPA confirmation code",
          proof,
        );
        await panel.click(
          "button",
          de ? "Vereinbarung abschließen" : "Conclude agreement",
        );
        await panel.find(
          "button",
          de ? "Akzeptiertes Paket herunterladen" : "Download accepted packet",
        );
        await panel.click(
          "button",
          de ? "Akzeptiertes Paket herunterladen" : "Download accepted packet",
        );
        const file = await until(
          async () =>
            (await readdir(directory)).find(
              (f) => f.startsWith("dpa-") && f.endsWith(".json"),
            ),
          "Native DPA download missing",
        );
        const exact = await readFile(join(directory, file), "utf8");
        expect(DpaAgreement.parse(JSON.parse(exact))).toMatchObject({
          packet,
          party: { name: "Example Research" },
        });
        expect(
          (await b.mail()).some(
            (m) =>
              m.subject ===
              (de
                ? "Deine DPA-Abschlussbestätigung"
                : "Your DPA conclusion receipt"),
          ),
        ).toBe(true);
        expect(await panel.axe()).toEqual([]);
        panel.detach();
        await browser.close();
        browser = await launchChromium(
          build.outDir,
          join(directory, "profile"),
          de ? "de-DE" : "en-GB",
        );
        panel = await browser.openPanel();
        await panel.find("button", de ? "Hier abmelden" : "Sign out here");
        await panel.click(
          "button",
          de ? "Datenverarbeitungsvereinbarung" : "Data processing agreement",
        );
        await panel.find(
          "button",
          de ? "Akzeptiertes Paket herunterladen" : "Download accepted packet",
        );
        panel.detach();
      } finally {
        await browser?.close();
        await build?.remove();
        await b.stop();
        await rm(directory, { recursive: true, force: true });
      }
    });
