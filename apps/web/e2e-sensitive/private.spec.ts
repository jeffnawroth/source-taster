// SPDX-License-Identifier: AGPL-3.0-or-later
// Both programs plus the independently implemented private web page.
import { test, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import {
  bothPrograms,
  eventually,
  freePort,
} from "../../server/test/support/both-programs.ts";
for (const language of ["en", "de"] as const)
  for (const scenario of ["management", "identity-isolation"] as const)
    test(`private Account ${scenario} preserves proof, failure and deletion boundaries (${language})`, async ({
      page,
    }) => {
      const both = await bothPrograms({ accounts: true, startWorker: false });
      const port = await freePort(),
        url = `http://127.0.0.1:${port}`;
      let vite: ReturnType<typeof spawn> | undefined;
      const t =
        language === "en"
          ? {
              email: "Email address",
              send: "Send code",
              sendProof: "Send confirmation code",
              confirm: "Confirm code",
              code: "Six-digit code",
              remove: "Delete Account",
              proofConfirm: "Confirm",
              forever: "Delete Account permanently",
              ack: /billing records are kept for eight years/,
              done: "Your Account was deleted.",
              invalid: /code is invalid/,
              nav: "Account",
              proofFirst: "Please confirm with the code first.",
            }
          : {
              email: "E-Mail-Adresse",
              send: "Code senden",
              sendProof: "Bestätigungscode senden",
              confirm: "Code bestätigen",
              code: "Sechsstelliger Code",
              remove: "Konto löschen",
              proofConfirm: "Bestätigen",
              forever: "Konto endgültig löschen",
              ack: /Abrechnungsdaten acht Jahre aufbewahrt/,
              done: "Ihr Konto wurde gelöscht.",
              invalid: /Code ist ungültig/,
              nav: "Konto",
              proofFirst: "Bitte bestätigen Sie zuerst mit dem Code.",
            };
      try {
        both.serviceConfig.allowedOrigins = [url, "https://web.test.invalid"];
        await writeFile(
          both.serviceConfigPath,
          JSON.stringify(both.serviceConfig),
        );
        await both.restartService();
        vite = spawn(
          process.execPath,
          [
            "node_modules/vite/bin/vite.js",
            "--host",
            "127.0.0.1",
            "--port",
            String(port),
            "--strictPort",
          ],
          {
            cwd: join(both.privatePath, "apps/web"),
            env: {
              PATH: process.env.PATH,
              NODE_ENV: "test",
              SERVICE_TEST_PROXY: both.serviceUrl,
            },
            stdio: "pipe",
          },
        );
        let output = "";
        vite.stderr!.on("data", (b) => {
          output += String(b);
        });
        await eventually(() => {
          if (vite!.exitCode !== null) throw new Error(output);
          return fetch(url).then(
            (r) => r.ok,
            () => false,
          );
        });
        const code = async () =>
          (await both.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0];
        // #196 KA: sign-in, Preferences, email change and deletion share
        // the Account Preferences section.
        await page.goto(
          `${url}/account?section=preferences&language=${language}`,
        );
        await page
          .getByLabel(t.email, { exact: true })
          .fill(`private-${language}@example.invalid`);
        await page.getByRole("button", { name: t.send, exact: true }).click();
        await expect(page.getByLabel(t.code, { exact: true })).toBeVisible();
        await page.getByLabel(t.code, { exact: true }).fill(await code());
        await page
          .getByRole("button", { name: t.confirm, exact: true })
          .click();
        await expect(
          page
            .getByRole("main")
            .getByText(`private-${language}@example.invalid`, {
              exact: true,
            }),
        ).toBeVisible();
        // Another client changes the authoritative language. Reopening this
        // page must read it even if the URL still requests the old language.
        const otherLanguage = language === "en" ? "de" : "en";
        const changedLanguage = await page.request.patch(
          `${url}/v1/preferences`,
          {
            headers: { origin: url },
            data: { language: otherLanguage },
          },
        );
        expect(changedLanguage.ok()).toBe(true);
        await page.reload();
        await expect(page.locator("html")).toHaveAttribute(
          "lang",
          otherLanguage,
        );
        // #196 KA: the language is a radio group named by each language.
        const languageOption = (l: "en" | "de") =>
          page.getByRole("radio", {
            name: l === "en" ? "English" : "Deutsch",
            exact: true,
          });
        await page.route("**/v1/preferences", (route) =>
          route.request().method() === "PATCH"
            ? route.abort()
            : route.continue(),
        );
        await languageOption(language).click();
        await expect(page.getByRole("alert")).toBeVisible();
        await expect(languageOption(otherLanguage)).toBeChecked();
        await page.unroute("**/v1/preferences");
        await languageOption(language).click();
        await expect(languageOption(language)).toBeChecked();
        await expect
          .poll(async () => {
            const r = await page.request.get(`${url}/v1/preferences`);
            return ((await r.json()) as { data: { language: string } }).data
              .language;
          })
          .toBe(language);
        await page.reload();
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        const externalSwitch = await page.request.patch(
          `${url}/v1/preferences`,
          {
            headers: { origin: url },
            data: { language: otherLanguage },
          },
        );
        expect(externalSwitch.ok()).toBe(true);
        await page.evaluate(() => window.dispatchEvent(new Event("focus")));
        await expect(page.locator("html")).toHaveAttribute(
          "lang",
          otherLanguage,
        );
        await languageOption(language).click();
        await expect(languageOption(language)).toBeChecked();
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        const change =
          language === "en" ? "Change email address" : "E-Mail-Adresse ändern";
        const replacement =
          language === "en" ? "New email address" : "Neue E-Mail-Adresse";
        await page.getByRole("button", { name: change, exact: true }).click();
        await expect(page.getByLabel(t.code, { exact: true })).toBeVisible();
        await page.getByLabel(t.code, { exact: true }).fill(await code());
        await page
          .getByRole("button", { name: t.proofConfirm, exact: true })
          .click();
        await page
          .getByLabel(replacement, { exact: true })
          .fill(`changed-${language}@example.invalid`);
        await page
          .getByRole("button", { name: t.sendProof, exact: true })
          .click();
        await expect(page.getByLabel(t.code, { exact: true })).toBeVisible();
        await page.getByLabel(t.code, { exact: true }).fill(await code());
        await page
          .getByRole("button", { name: t.confirm, exact: true })
          .click();
        await expect(
          page
            .getByRole("main")
            .getByText(`changed-${language}@example.invalid`, {
              exact: true,
            }),
        ).toBeVisible();
        // #196 KA: deletion is its own section; its action opens the
        // permanent-deletion dialog, which sends the proof code at once.
        const openDeletion = async () => {
          await page
            .getByRole("navigation", { name: t.nav })
            .getByRole("link", { name: t.remove, exact: true })
            .click();
          await page
            .getByRole("button", { name: `${t.remove} …`, exact: true })
            .click();
          await expect(page.getByLabel(t.code, { exact: true })).toBeVisible();
        };
        await openDeletion();
        // Without fresh proof the permanent action refuses.
        await page.getByRole("checkbox", { name: t.ack }).check();
        await page
          .getByRole("button", { name: t.forever, exact: true })
          .click();
        await expect(
          page.getByText(t.proofFirst, { exact: true }),
        ).toBeVisible();
        await page
          .getByLabel(t.code, { exact: true })
          .fill(
            (await code()).replace(/^./, (digit) =>
              String((Number(digit) + 1) % 10),
            ),
          );
        await page
          .getByRole("button", { name: t.proofConfirm, exact: true })
          .click();
        await expect(
          page.getByRole("alert").filter({ hasText: t.invalid }),
        ).toBeVisible();
        await page.getByLabel(t.code, { exact: true }).fill(await code());
        await page
          .getByRole("button", { name: t.proofConfirm, exact: true })
          .click();
        if (scenario === "identity-isolation") {
          const quota =
            language === "en"
              ? "100 of 100 References left · 0 used"
              : "100 von 100 Referenzen übrig · 0 verbraucht";
          await expect(page.getByText(quota, { exact: true })).toBeVisible();
          // #196 KA: signing out lives in the Preferences section.
          await page
            .getByRole("alertdialog")
            .getByRole("button", {
              name: language === "en" ? "Cancel" : "Abbrechen",
              exact: true,
            })
            .click();
          await expect(page.getByRole("alertdialog")).toHaveCount(0);
          await page
            .getByRole("navigation", { name: t.nav })
            .getByRole("link", {
              name: language === "en" ? "Preferences" : "Einstellungen",
              exact: true,
            })
            .click();
          await page
            .getByRole("button", {
              name: language === "en" ? "Sign out here" : "Hier abmelden",
              exact: true,
            })
            .click();
          // The Email address card is also labelled by its heading; the
          // sign-in field is the textbox.
          const emailField = page.getByRole("textbox", {
            name: t.email,
            exact: true,
          });
          await expect(emailField).toBeVisible();
          await page.route("**/v1/account/management", (route) =>
            route.abort(),
          );
          await emailField.fill(`second-${language}@example.invalid`);
          await page.getByRole("button", { name: t.send, exact: true }).click();
          await expect(page.getByLabel(t.code, { exact: true })).toBeVisible();
          await page.getByLabel(t.code, { exact: true }).fill(await code());
          await page
            .getByRole("button", { name: t.confirm, exact: true })
            .click();
          await expect(
            page
              .getByRole("main")
              .getByText(`second-${language}@example.invalid`, {
                exact: true,
              }),
          ).toBeVisible();
          await openDeletion();
          await page.getByLabel(t.code, { exact: true }).fill(await code());
          await page
            .getByRole("button", { name: t.proofConfirm, exact: true })
            .click();
          // The second Account's management read fails: no previous Quota
          // may stand in for it.
          await expect(page.getByText(quota, { exact: true })).toHaveCount(0);
          return;
        }
        await page
          .getByRole("button", { name: t.forever, exact: true })
          .click();
        await expect(
          page.getByRole("heading", { name: t.done, exact: true }),
        ).toBeVisible();
        await expect(page.getByLabel(t.email, { exact: true })).toHaveCount(0);
        await expect(
          page.getByRole("button", { name: t.remove, exact: true }),
        ).toHaveCount(0);
      } finally {
        if (vite && vite.exitCode === null) {
          const exited = once(vite, "exit");
          vite.kill("SIGTERM");
          await exited;
        }
        await both.stop();
      }
    });
