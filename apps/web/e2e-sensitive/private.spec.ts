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
              confirm: "Confirm code",
              code: "Six-digit code",
              remove: "Delete account",
              proof: "Send confirmation code",
              proofConfirm: "Confirm",
              forever: "Delete account permanently",
              ack: /billing records are kept for eight years/,
              done: "Your Account was deleted.",
              invalid: /code is invalid/,
            }
          : {
              email: "E-Mail-Adresse",
              send: "Code senden",
              confirm: "Code bestätigen",
              code: "Sechsstelliger Code",
              remove: "Konto löschen",
              proof: "Bestätigungscode senden",
              proofConfirm: "Bestätigen",
              forever: "Konto endgültig löschen",
              ack: /Abrechnungsdaten acht Jahre aufbewahrt/,
              done: "Ihr Konto wurde gelöscht.",
              invalid: /Code ist ungültig/,
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
        await page.goto(`${url}/account?language=${language}`);
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
          page.getByText(`private-${language}@example.invalid`, {
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
        await page.route("**/v1/preferences", (route) =>
          route.request().method() === "PATCH"
            ? route.abort()
            : route.continue(),
        );
        await page.getByRole("combobox").selectOption(language);
        await expect(page.getByRole("alert")).toBeVisible();
        await expect(page.getByRole("combobox")).toHaveValue(otherLanguage);
        await page.unroute("**/v1/preferences");
        await page.getByRole("combobox").selectOption(language);
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
        await page.getByRole("combobox").selectOption(language);
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        const change =
          language === "en" ? "Change email address" : "E-Mail-Adresse ändern";
        const replacement =
          language === "en" ? "New email address" : "Neue E-Mail-Adresse";
        await page.getByRole("button", { name: change, exact: true }).click();
        await page.getByRole("button", { name: t.proof, exact: true }).click();
        await expect(page.getByLabel(t.code, { exact: true })).toBeVisible();
        await page.getByLabel(t.code, { exact: true }).fill(await code());
        await page
          .getByRole("button", { name: t.proofConfirm, exact: true })
          .click();
        await page
          .getByLabel(replacement, { exact: true })
          .fill(`changed-${language}@example.invalid`);
        await page.getByRole("button", { name: t.send, exact: true }).click();
        await expect(page.getByLabel(t.code, { exact: true })).toBeVisible();
        await page.getByLabel(t.code, { exact: true }).fill(await code());
        await page
          .getByRole("button", { name: t.confirm, exact: true })
          .click();
        await expect(
          page.getByText(`changed-${language}@example.invalid`, {
            exact: true,
          }),
        ).toBeVisible();
        await page.getByRole("button", { name: t.remove, exact: true }).click();
        await expect(
          page.getByRole("button", { name: t.forever, exact: true }),
        ).toHaveCount(0);
        await page.getByRole("button", { name: t.proof, exact: true }).click();
        await expect(page.getByLabel(t.code, { exact: true })).toBeVisible();
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
        await expect(page.getByRole("alert")).toContainText(t.invalid);
        await page.getByLabel(t.code, { exact: true }).fill(await code());
        await page
          .getByRole("button", { name: t.proofConfirm, exact: true })
          .click();
        if (scenario === "identity-isolation") {
          const quota =
            language === "en"
              ? "Remaining Quota: 100"
              : "Verbleibendes Kontingent: 100";
          await expect(page.getByText(quota, { exact: true })).toBeVisible();
          await page
            .getByRole("button", {
              name: language === "en" ? "Sign out here" : "Hier abmelden",
              exact: true,
            })
            .click();
          await expect(page.getByLabel(t.email, { exact: true })).toBeVisible();
          await page.route("**/v1/account/management", (route) =>
            route.abort(),
          );
          await page
            .getByLabel(t.email, { exact: true })
            .fill(`second-${language}@example.invalid`);
          await page.getByRole("button", { name: t.send, exact: true }).click();
          await expect(page.getByLabel(t.code, { exact: true })).toBeVisible();
          await page.getByLabel(t.code, { exact: true }).fill(await code());
          await page
            .getByRole("button", { name: t.confirm, exact: true })
            .click();
          await expect(
            page.getByText(`second-${language}@example.invalid`, {
              exact: true,
            }),
          ).toBeVisible();
          await page
            .getByRole("button", { name: t.remove, exact: true })
            .click();
          await page
            .getByRole("button", { name: t.proof, exact: true })
            .click();
          await expect(page.getByLabel(t.code, { exact: true })).toBeVisible();
          await page.getByLabel(t.code, { exact: true }).fill(await code());
          await page
            .getByRole("button", { name: t.proofConfirm, exact: true })
            .click();
          await page.getByRole("checkbox", { name: t.ack }).check();
          await expect(
            page.getByRole("button", { name: t.forever, exact: true }),
          ).toBeDisabled();
          await expect(page.getByText(quota, { exact: true })).toHaveCount(0);
          return;
        }
        await page.getByRole("checkbox", { name: t.ack }).check();
        await page
          .getByRole("button", { name: t.forever, exact: true })
          .click();
        await expect(page.getByText(t.done, { exact: true })).toBeVisible();
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
