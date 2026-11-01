// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { writeFile, readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  bothPrograms,
  eventually,
  freePort,
} from "../../server/test/support/both-programs.ts";
let both: Awaited<ReturnType<typeof bothPrograms>>,
  vite: ChildProcess,
  url: string;
const packet = (language: "en" | "de") => ({
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
});
test.beforeAll(async () => {
  both = await bothPrograms({ accounts: true, startWorker: false });
  url = `http://127.0.0.1:${await freePort()}`;
  both.serviceConfig.allowedOrigins.push(url);
  await writeFile(both.serviceConfigPath, JSON.stringify(both.serviceConfig));
  await both.restartService();
  for (const language of ["en", "de"] as const)
    await both.service().command({ dpa: { publish: packet(language) } });
  vite = spawn(
    process.execPath,
    [
      new URL("../node_modules/vite/bin/vite.js", import.meta.url).pathname,
      "--config",
      new URL("../../extension/account-web.vite.config.ts", import.meta.url)
        .pathname,
      "--host",
      "127.0.0.1",
      "--port",
      new URL(url).port,
      "--strictPort",
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: {
        PATH: process.env.PATH,
        NODE_ENV: "test",
        SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT: new URL(both.serviceUrl).port,
        SOURCE_TASTER_ACCOUNT_TEST_API_PORT: new URL(both.apiUrl).port,
        SOURCE_TASTER_API_URL: both.apiUrl,
        VITE_SOURCE_TASTER_MODE: "hosted",
        VITE_SOURCE_TASTER_SERVICE_URL: both.serviceUrl,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  vite.stderr!.on("data", (b) => {
    output += String(b);
  });
  await eventually(async () => {
    if (vite.exitCode !== null) throw new Error(output);
    return fetch(url).then(
      (r) => r.ok,
      () => false,
    );
  });
});
test.afterAll(async () => {
  if (vite && vite.exitCode === null) {
    const exit = once(vite, "exit");
    vite.kill("SIGTERM");
    await exit;
  }
  await both?.stop();
});
for (const language of ["en", "de"] as const)
  for (const paid of [false, true])
    test(`web ${language} ${paid ? "paid" : "Free"} concludes and downloads the exact DPA`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ locale: language });
      const page = await context.newPage();
      const de = language === "de";
      try {
        await page.goto(url);
        await page
          .getByRole("button", {
            name: de ? "Anmelden" : "Sign in",
            exact: true,
          })
          .click();
        const email = `dpa-${language}-${paid}@example.invalid`;
        await page
          .getByLabel(de ? "E-Mail-Adresse" : "Email address", { exact: true })
          .fill(email);
        await page
          .getByRole("button", {
            name: de ? "Code senden" : "Send code",
            exact: true,
          })
          .click();
        await expect(
          page.getByLabel(de ? "Sechsstelliger Code" : "Six-digit code"),
        ).toBeVisible();
        const signCode = (await both.mail())
          .at(-1)!
          .text.match(/\b[0-9]{6}\b/)![0];
        await page
          .getByLabel(de ? "Sechsstelliger Code" : "Six-digit code")
          .fill(signCode);
        await page
          .getByLabel(de ? "Sechsstelliger Code" : "Six-digit code")
          .press("Enter");
        await expect(page.getByText(email, { exact: true })).toBeVisible();
        if (paid) {
          const session = await context.request.get(
            both.serviceUrl + "/v1/session",
          );
          const data = (await session.json()).data;
          await both.service().command({
            operator: {
              credit: {
                ownerId: data.ownerId,
                amount: 100,
                key: `dpa-${language}`,
                features: ["ai-extraction", "history-extended"],
              },
            },
          });
        }
        await page
          .getByRole("button", {
            name: de
              ? "Datenverarbeitungsvereinbarung"
              : "Data processing agreement",
            exact: true,
          })
          .click();
        await expect(
          page.getByText(
            "PLACEHOLDER agreement; human legal review required.",
            { exact: true },
          ),
        ).toBeVisible();
        await page
          .getByLabel(de ? "Rechtlicher Name" : "Legal business name", {
            exact: true,
          })
          .fill("Example Research");
        await page
          .getByLabel(de ? "Geschäftsanschrift" : "Business address", {
            exact: true,
          })
          .fill("Example Street 1, Berlin");
        await page
          .getByLabel(
            de ? "Bevollmächtigte Person" : "Authorized representative",
            { exact: true },
          )
          .fill("Alex Example");
        await page
          .getByLabel(
            de
              ? "Ich nutze den Dienst geschäftlich und bin zum Abschluss für diese Vertragspartei bevollmächtigt."
              : "I use the service for business and am authorized to conclude for this Contracting party.",
          )
          .check();
        await page
          .getByRole("button", {
            name: de ? "Frischen Code anfordern" : "Request fresh code",
            exact: true,
          })
          .click();
        await expect(
          page.getByLabel(
            de ? "DPA-Bestätigungscode" : "DPA confirmation code",
            { exact: true },
          ),
        ).toBeVisible();
        const code = (await both.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0];
        await page
          .getByLabel(de ? "DPA-Bestätigungscode" : "DPA confirmation code", {
            exact: true,
          })
          .fill(code);
        await page
          .getByLabel(de ? "DPA-Bestätigungscode" : "DPA confirmation code", {
            exact: true,
          })
          .press("Enter");
        await expect(
          page.getByRole("status").filter({
            hasText: de ? "Vereinbarung abgeschlossen" : "Agreement concluded",
          }),
        ).toBeVisible();
        const download = page.waitForEvent("download");
        await page
          .getByRole("button", {
            name: de
              ? "Akzeptiertes Paket herunterladen"
              : "Download accepted packet",
            exact: true,
          })
          .first()
          .click();
        const file = await download;
        const exact = JSON.parse(await readFile((await file.path())!, "utf8"));
        expect(exact.packet).toEqual(packet(language));
        expect(exact.party.name).toBe("Example Research");
        await page.reload();
        await page
          .getByRole("button", {
            name: de
              ? "Datenverarbeitungsvereinbarung"
              : "Data processing agreement",
            exact: true,
          })
          .click();
        await expect(
          page.getByRole("button", {
            name: de
              ? "Akzeptiertes Paket herunterladen"
              : "Download accepted packet",
            exact: true,
          }),
        ).toHaveCount(1);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
      } finally {
        await context.close();
      }
    });
