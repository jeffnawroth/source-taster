// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  bothPrograms,
  eventually,
} from "../../server/test/support/both-programs.ts";
import {
  CommerceCatalogResponse,
  SubscriptionResponse,
  SubscriptionsResponse,
} from "@source-taster/contract-service";
import { pages, pathFor } from "../../website/src/content.ts";

for (const language of ["de", "en"] as const)
  test(`actual programs: ${language} statutory route survives Account frontend failure and provider outage`, async ({
    browser,
  }) => {
    test.setTimeout(90000);
    const privatePath = process.env.SOURCE_TASTER_SERVICE_WORKTREE;
    if (!privatePath)
      throw new Error("SOURCE_TASTER_SERVICE_WORKTREE is required");
    const fake = spawn(
      process.execPath,
      ["test/commerce-provider-process.ts"],
      {
        cwd: join(privatePath, "apps/server"),
        env: { PATH: process.env.PATH, NODE_ENV: "test" },
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      },
    );
    let both: Awaited<ReturnType<typeof bothPrograms>> | undefined,
      vite: ChildProcess | undefined;
    const context = await browser.newContext({
      locale: language === "de" ? "de-DE" : "en-GB",
    });
    try {
      const [ready] = (await once(fake, "message")) as [{ config: string }];
      const port = Number(
        process.env.SOURCE_TASTER_TEST_COMMERCE_WEB_PORT ?? 5442,
      );
      const url = `http://127.0.0.1:${port}`;
      both = await bothPrograms({
        accounts: true,
        serviceEnv: { SERVICE_COMMERCE_CONFIG: ready.config },
      });
      both.serviceConfig.allowedOrigins.push(url);
      await writeFile(
        both.serviceConfigPath,
        JSON.stringify(both.serviceConfig),
      );
      const commerce = JSON.parse(await readFile(ready.config, "utf8")) as {
        allowedOrigins: string[];
      };
      commerce.allowedOrigins.push(both.serviceUrl);
      await writeFile(ready.config, JSON.stringify(commerce));
      await both.restartService();
      await both.service().command({ commerceSeed: true });
      const a = await both.signIn("statutory-browser@example.invalid");
      expect(
        (
          await fetch(both.serviceUrl + "/v1/preferences", {
            method: "PATCH",
            headers: {
              cookie: a.cookie,
              origin: "https://web.test.invalid",
              "content-type": "application/json",
            },
            body: JSON.stringify({ language }),
          })
        ).status,
      ).toBe(200);
      const catalog = CommerceCatalogResponse.parse(
        await (await fetch(both.serviceUrl + "/v1/commerce/catalog")).json(),
      ).data;
      const response = await a.call("/v1/commerce/subscriptions", {
        operationKey: randomUUID(),
        catalogVersion: catalog.pro[0]!.version,
        legalVersion: catalog.legal.version,
        acceptTerms: true,
        immediateStart: true,
        language: "en",
        billing: { name: "Subscriber", address: "Example 1", country: "DE" },
      });
      expect(response.status).toBe(200);
      const order = SubscriptionResponse.parse(await response.json()).data;
      const paid = once(fake, "message");
      fake.send({
        id: 1,
        orderId: order.id,
        now: both.now(),
        url: both.serviceUrl,
      });
      await paid;
      let paidUntil: string | null = null;
      await eventually(async () => {
        const r = await fetch(both!.serviceUrl + "/v1/commerce/subscriptions", {
          headers: { cookie: a.cookie },
        });
        const own = SubscriptionsResponse.parse(await r.json()).data[0]!;
        paidUntil = own.paidUntil;
        return own.status === "active";
      });
      vite = spawn(
        process.execPath,
        [
          new URL("../node_modules/vite/bin/vite.js", import.meta.url).pathname,
          "--host",
          "127.0.0.1",
          "--port",
          String(port),
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
      let output = "";
      vite.stderr!.on("data", (b) => {
        output += String(b);
      });
      await eventually(async () => {
        if (vite!.exitCode !== null) throw new Error(output);
        return fetch(url)
          .then((r) => r.ok)
          .catch(() => false);
      });
      const page = await context.newPage();
      const label =
        language === "de" ? "Verträge hier kündigen" : "Cancel contracts here";
      await page.goto(url);
      await expect(
        page.getByRole("link", { name: label, exact: true }),
      ).toHaveAttribute(
        "href",
        `${both.serviceUrl}/cancel?language=${language}`,
      );
      // All static information layouts share the same public entrance, without context in the URL.
      for (const entry of pages[language]) {
        await page.goto(url + pathFor(language, entry));
        await expect(
          page.getByRole("link", { name: label, exact: true }),
        ).toHaveAttribute(
          "href",
          `${both.serviceUrl}/cancel?language=${language}`,
        );
      }
      const [name, value] = a.cookie.split("=");
      await context.addCookies([
        {
          name: name!,
          value: value!,
          domain: "127.0.0.1",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "Lax",
        },
      ]);
      await page.goto(url);
      await expect(
        page.getByRole("button", {
          name: language === "de" ? "Hier abmelden" : "Sign out here",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: label, exact: true }),
      ).toBeVisible();
      await context.clearCookies();
      await page.route("**/v1/session", (route) => route.abort());
      await page.goto(url);
      const down = once(fake, "message");
      fake.send({
        id: 2,
        providerDown: true,
        now: both.now(),
        url: both.serviceUrl,
      });
      await down;
      const navigation = page.waitForRequest(
        (r) => new URL(r.url()).pathname === "/cancel",
      );
      await page.getByRole("link", { name: label, exact: true }).click();
      const request = await navigation;
      expect(request.headers()["authorization"]).toBeUndefined();
      expect(request.headers()["cookie"]).toBeUndefined();
      expect(request.headers()["referer"]).toBeUndefined();
      await expect(page).toHaveURL(
        `${both.serviceUrl}/cancel?language=${language}`,
      );
      await page
        .getByLabel(
          language === "de" ? "Vertragsreferenz" : "Contract reference",
          { exact: true },
        )
        .fill(order.id);
      await page
        .getByLabel(
          language === "de"
            ? "Bestätigte E-Mail-Adresse"
            : "Confirmed email address",
          { exact: true },
        )
        .fill("statutory-browser@example.invalid");
      await page
        .getByRole("button", {
          name: language === "de" ? "jetzt kündigen" : "Cancel now",
          exact: true,
        })
        .click();
      await expect(page.getByRole("status")).toContainText(
        new Date(both.now()).toISOString(),
      );
      const receipts = (await both.mail()).filter((m) =>
        /cancellation received|Kündigung/.test(m.subject),
      );
      expect(receipts).toHaveLength(1);
      expect(receipts[0]!.text).toContain(paidUntil!);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    } finally {
      await context.close();
      if (vite && vite.exitCode === null) {
        const stopped = once(vite, "exit");
        vite.kill("SIGTERM");
        await stopped;
      }
      await both?.stop();
      if (fake.exitCode === null) {
        const stopped = once(fake, "exit");
        fake.kill("SIGTERM");
        await stopped;
      }
    }
  });
