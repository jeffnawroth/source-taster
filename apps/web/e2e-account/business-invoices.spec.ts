// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  bothPrograms,
  eventually,
} from "../../server/test/support/both-programs.ts";
let both: Awaited<ReturnType<typeof bothPrograms>>,
  fake: ChildProcess,
  vite: ChildProcess;
const webPort = process.env.SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT ?? "5483";
const webUrl = `http://127.0.0.1:${webPort}`;
test.beforeAll(async () => {
  const privatePath = process.env.SOURCE_TASTER_SERVICE_WORKTREE!;
  fake = spawn(process.execPath, ["test/commerce-provider-process.ts"], {
    cwd: join(privatePath, "apps/server"),
    env: {
      PATH: process.env.PATH,
      NODE_ENV: "test",
      SERVICE_TEST_EN16931_CONFIG: process.env.SERVICE_TEST_EN16931_CONFIG,
    },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  let output = "";
  fake.stderr!.on("data", (b) => {
    output += String(b);
  });
  const ready = await new Promise<{ config: string }>((resolve, reject) => {
    fake.once("message", (m) => resolve(m as { config: string }));
    fake.once("exit", () => reject(new Error(output)));
  });
  const config = JSON.parse(await readFile(ready.config, "utf8")) as {
    publicOrigin: string;
    allowedOrigins: string[];
  };
  config.publicOrigin = `http://127.0.0.1:${process.env.SOURCE_TASTER_TEST_SERVICE_PORT ?? "5803"}`;
  config.allowedOrigins.push(webUrl, config.publicOrigin);
  await writeFile(ready.config, JSON.stringify(config));
  both = await bothPrograms({
    accounts: true,
    serviceEnv: { SERVICE_COMMERCE_CONFIG: ready.config },
  });
  both.serviceConfig.allowedOrigins = [
    webUrl,
    config.publicOrigin,
    "https://web.test.invalid",
  ];
  await writeFile(both.serviceConfigPath, JSON.stringify(both.serviceConfig));
  await both.restartService();
  await both.service().command({ commerceSeed: true });
  vite = spawn(
    process.execPath,
    [
      new URL("../node_modules/vite/bin/vite.js", import.meta.url).pathname,
      "--host",
      "127.0.0.1",
      "--port",
      webPort,
      "--strictPort",
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: {
        PATH: process.env.PATH,
        NODE_ENV: "test",
        SOURCE_TASTER_API_URL: both.apiUrl,
        VITE_SOURCE_TASTER_MODE: "hosted",
        VITE_SOURCE_TASTER_SERVICE_URL: both.serviceUrl,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  vite.stderr!.on("data", (b) => {
    output += String(b);
  });
  await eventually(async () => {
    if (vite.exitCode !== null) throw new Error(output);
    return fetch(webUrl).then(
      (r) => r.ok,
      () => false,
    );
  });
});
test.afterAll(async () => {
  for (const process of [vite, fake])
    if (process && process.exitCode === null) {
      const exited = once(process, "exit");
      process.kill("SIGTERM");
      await exited;
    }
  await both?.stop();
});
for (const language of ["en", "de"] as const)
  test(`real ${language} business purchase and Account invoice downloads`, async ({
    browser,
  }) => {
    const a = await both.signIn(`business-browser-${language}@example.invalid`);
    const context = await browser.newContext({ locale: language });
    const [name, value] = a.cookie.split("=");
    await context.addCookies([
      { name: name!, value: value!, url: both.serviceUrl },
    ]);
    const page = await context.newPage();
    try {
      await page.goto(`${both.serviceUrl}/order?language=${language}`);
      await page
        .getByLabel(language === "en" ? "Billing name" : "Rechnungsname", {
          exact: true,
        })
        .fill("Synthetic business");
      await page
        .getByLabel(
          language === "en" ? "Billing address" : "Rechnungsanschrift",
          { exact: true },
        )
        .fill("Synthetic street 1");
      await page
        .getByLabel(
          language === "en"
            ? "VAT ID (optional)"
            : "Umsatzsteuer-ID (optional)",
          { exact: true },
        )
        .fill("DE123456789");
      await page
        .getByRole("button", {
          name: language === "en" ? "Validate VAT ID" : "USt-IdNr. prüfen",
          exact: true,
        })
        .click();
      await expect(page.getByRole("status")).toContainText(
        language === "en" ? "VAT ID validated" : "USt-IdNr. bestätigt",
      );
      await page.getByRole("checkbox").nth(0).check();
      await page.getByRole("checkbox").nth(1).check();
      const ordered = page.waitForResponse(
        (r) =>
          r.url().endsWith("/v1/commerce/orders") &&
          r.request().method() === "POST",
      );
      await page
        .getByRole("button", {
          name:
            language === "en"
              ? "Order with obligation to pay"
              : "zahlungspflichtig bestellen",
        })
        .click();
      const order = (await (await ordered).json()) as { data: { id: string } };
      const paid = once(fake, "message");
      fake.send({
        id: 1,
        orderId: order.data.id,
        now: both.now(),
        url: both.serviceUrl,
      });
      await paid;
      await eventually(async () => {
        const r = await fetch(both.serviceUrl + "/v1/commerce/invoices", {
          headers: { cookie: a.cookie },
        });
        return ((await r.json()) as { data: unknown[] }).data.length > 0;
      });
      await fetch(both.serviceUrl + "/v1/preferences", {
        method: "PATCH",
        headers: {
          cookie: a.cookie,
          origin: "https://web.test.invalid",
          "content-type": "application/json",
        },
        body: JSON.stringify({ language }),
      });
      await page.goto(webUrl);
      // Account language is authoritative in the real service.
      await page
        .getByRole("button", {
          name: language === "en" ? "Load invoices" : "Rechnungen laden",
        })
        .click();
      const pdf = page.waitForEvent("download");
      await page
        .getByRole("button", {
          name: language === "en" ? "Download PDF" : "PDF herunterladen",
          exact: true,
        })
        .click();
      expect((await pdf).suggestedFilename()).toBe("invoice.pdf");
      const ubl = page.waitForEvent("download");
      await page
        .getByRole("button", {
          name:
            language === "en"
              ? "Download e-invoice (XML)"
              : "E-Rechnung herunterladen (XML)",
          exact: true,
        })
        .click();
      expect((await ubl).suggestedFilename()).toBe("invoice.xml");
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
