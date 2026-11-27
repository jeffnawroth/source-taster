import {
  AccountSessionResponse,
  DpaAgreement,
} from "@source-taster/contract-service";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { writeFile, readFile } from "node:fs/promises";
import { test, expect, type Page, type Route } from "@playwright/test";
import { message } from "../e2e/support/catalog.ts";
import AxeBuilder from "@axe-core/playwright";
import {
  bothPrograms,
  eventually,
  freePort,
} from "../../server/test/support/both-programs.ts";
import { withOrphanGuard } from "../../server/test/support/orphan-guard.ts";
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
      env: withOrphanGuard({
        PATH: process.env.PATH,
        NODE_ENV: "test",
        SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT: new URL(both.serviceUrl).port,
        SOURCE_TASTER_ACCOUNT_TEST_API_PORT: new URL(both.apiUrl).port,
        SOURCE_TASTER_API_URL: both.apiUrl,
        VITE_SOURCE_TASTER_MODE: "hosted",
        VITE_SOURCE_TASTER_SERVICE_URL: both.serviceUrl,
      }),
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
          const data = AccountSessionResponse.parse(await session.json()).data;
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
        // #194 D: the DPA lives in the Account dialog behind the Account entry.
        await page
          .getByRole("button", { name: de ? /^Konto: / : /^Account: / })
          .click();
        await page
          .locator(".account-entry")
          .getByRole("button", { name: de ? "Konto" : "Account", exact: true })
          .click();
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
              : "I use the service for business and am authorized to conclude for this contracting party.",
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
        const exact = DpaAgreement.parse(
          JSON.parse(await readFile(await file.path(), "utf8")),
        );
        expect(exact.packet).toEqual(packet(language));
        expect(exact.party.name).toBe("Example Research");
        await page.goto(url + `/#dpa/${exact.id}`);
        await page.reload();
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

const operationId = "55555555-5555-4555-8555-555555555555";
const noticeId = "66666666-6666-4666-8666-666666666666";
const agreementId = "77777777-7777-4777-8777-777777777777";
const effective = "2027-01-15T00:00:00.000Z";
const deadline = "2026-12-15T00:00:00.000Z";
const notice = (overrides: Record<string, unknown> = {}) => ({
  id: noticeId,
  agreementId,
  version: "subprocessors-v2",
  change: "A new hosting provider processes check requests.",
  intendedEffectiveAt: effective,
  objectionDeadline: deadline,
  objectionRoute: "https://example.invalid/objection-route",
  delivery: "queued",
  objection: null,
  resolved: false,
  ...overrides,
});

/** Signs in with the real service and opens the Account dialog's entry. */
async function signInToAccount(page: Page, language: "en" | "de") {
  const de = language === "de";
  const codeField = page.getByLabel(
    de ? "Sechsstelliger Code" : "Six-digit code",
  );
  await page.goto(url);
  await page
    .getByRole("button", { name: de ? "Anmelden" : "Sign in", exact: true })
    .click();
  const email = `dpa-states-${language}-${test.info().repeatEachIndex}@example.invalid`;
  await page
    .getByLabel(de ? "E-Mail-Adresse" : "Email address", { exact: true })
    .fill(email);
  await page
    .getByRole("button", {
      name: de ? "Code senden" : "Send code",
      exact: true,
    })
    .click();
  await expect(codeField).toBeVisible();
  await codeField.fill(
    (await both.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0],
  );
  await codeField.press("Enter");
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: de ? /^Konto: / : /^Account: / })
    .click();
  await page
    .getByRole("dialog", { name: de ? "Konto" : "Account", exact: true })
    .getByRole("button", { name: de ? "Konto" : "Account", exact: true })
    .click();
}

for (const language of ["en", "de"] as const)
  test(`web ${language} agreement view: closing, error messages, recovery and subprocessor notices`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: language });
    const page = await context.newPage();
    const t = (key: string, values: Record<string, string | number> = {}) =>
      message(language, key, values);
    try {
      await signInToAccount(page, language);
      const session = AccountSessionResponse.parse(
        await (
          await context.request.get(both.serviceUrl + "/v1/session")
        ).json(),
      ).data;
      // The service answers these requests from the page's other origin, so a
      // fulfilled response carries the CORS headers the real service sends.
      const cors = {
        "access-control-allow-origin": new URL(url).origin,
        "access-control-allow-credentials": "true",
        "access-control-allow-headers": "content-type",
        "access-control-allow-methods": "GET, POST, OPTIONS",
      };
      const answer = (route: Route, status: number, data?: unknown) =>
        route.fulfill({
          status,
          headers: cors,
          ...(data === undefined
            ? {}
            : {
                contentType: "application/json",
                body: JSON.stringify({ data, quota: null }),
              }),
        });
      let state: { status: number; data?: unknown } = { status: 200 };
      let operation: "pending" | "expired" = "pending";
      const objections: unknown[] = [];
      const offered = (notices: unknown[]) => ({
        packet: packet(language),
        party: null,
        partyRevision: 0,
        agreements: [],
        notices,
      });
      await page.route(/\/v1\/dpa\//u, (route) => {
        const request = route.request();
        const path = new URL(request.url()).pathname;
        if (request.method() === "OPTIONS") return answer(route, 204);
        if (path === `/v1/dpa/operations/${operationId}`)
          return answer(route, 200, {
            operationId,
            status: operation,
            expiresAt: new Date(Date.now() + 300_000).toISOString(),
            agreement: null,
          });
        if (path === "/v1/dpa/objections") {
          objections.push(request.postDataJSON());
          return answer(route, 204);
        }
        return answer(route, state.status, state.data);
      });
      const toggle = page.getByRole("button", {
        name: t("dpa_title"),
        exact: true,
      });
      const section = page.getByRole("region", {
        name: t("dpa_title"),
        exact: true,
      });
      const close = section.getByRole("button", {
        name: t("dpa_close"),
        exact: true,
      });
      const open = async () => {
        await toggle.click();
        await expect(section).toBeVisible();
      };

      await test.step("every failed request reads as its own message, and Close hides the view", async () => {
        for (const [status, key] of [
          [409, "dpa_conflict"],
          [403, "dpa_proof_failed"],
          [400, "dpa_proof_failed"],
          [429, "dpa_limited"],
          [500, "dpa_failed"],
        ] as const) {
          state = { status };
          await open();
          await expect(toggle).toHaveAttribute("aria-expanded", "true");
          await expect(section.getByRole("alert")).toHaveText(t(key));
          await close.click();
          await expect(section).toHaveCount(0);
          await expect(toggle).toHaveAttribute("aria-expanded", "false");
        }
      });

      await test.step("an interrupted conclusion can be checked again or restarted", async () => {
        state = { status: 200, data: offered([]) };
        const key = `source-taster-dpa-operation:${session.accountId}`;
        await page.evaluate(
          ([name, id]) => sessionStorage.setItem(name!, id!),
          [key, operationId],
        );
        await open();
        await expect(
          section.getByText(t("dpa_recovery_pending")),
        ).toBeVisible();
        const recover = section.getByRole("button", {
          name: t("dpa_recover"),
          exact: true,
        });
        await expect(recover).toBeEnabled();
        operation = "expired";
        await recover.click();
        await expect(section.getByText(t("dpa_expired"))).toBeVisible();
        await section
          .getByRole("button", { name: t("dpa_restart"), exact: true })
          .click();
        await expect(
          section.getByRole("button", { name: t("dpa_request"), exact: true }),
        ).toBeVisible();
        await expect(recover).toHaveCount(0);
        expect(
          await page.evaluate((name) => sessionStorage.getItem(name), key),
        ).toBeNull();
        await close.click();
      });

      await test.step("intended subprocessor changes show dates, route and delivery, and record an objection", async () => {
        state = { status: 200, data: offered([notice()]) };
        await open();
        await expect(
          section.getByRole("heading", { name: t("dpa_notices"), exact: true }),
        ).toBeVisible();
        const change = section
          .getByRole("article")
          .filter({ hasText: "subprocessors-v2" });
        await expect(change).toContainText(notice().change);
        await expect(change).toContainText(
          t("dpa_notice_dates", { effective, deadline }),
        );
        const route = change.getByRole("link", {
          name: t("dpa_notice_route"),
          exact: true,
        });
        await expect(route).toHaveAttribute(
          "href",
          "https://example.invalid/objection-route",
        );
        await expect(route).toHaveAttribute("target", "_blank");
        await expect(change).toContainText(t("dpa_queued"));
        await expect(change).toContainText(t("dpa_hold"));
        await change
          .getByRole("textbox", { name: t("dpa_objection"), exact: true })
          .fill("The new provider is not acceptable.");
        // The refreshed state after the objection: recorded, sent and resolved.
        state = {
          status: 200,
          data: offered([
            notice({
              objection: "The new provider is not acceptable.",
              delivery: "sent",
              resolved: true,
            }),
          ]),
        };
        await change
          .getByRole("button", { name: t("dpa_object"), exact: true })
          .click();
        await expect(change).toContainText(
          "The new provider is not acceptable.",
        );
        await expect(change).toContainText(t("dpa_sent"));
        await expect(change).not.toContainText(t("dpa_hold"));
        await expect(
          change.getByRole("button", { name: t("dpa_object"), exact: true }),
        ).toHaveCount(0);
        expect(objections).toEqual([
          { noticeId, reason: "The new provider is not acceptable." },
        ]);
      });
    } finally {
      await context.close();
    }
  });
