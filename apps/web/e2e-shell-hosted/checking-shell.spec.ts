// SPDX-License-Identifier: AGPL-3.0-or-later
// Public-client contract evidence: real verification API/worker/PostgreSQL. The
// established Account HTTP-edge fixture signs the test identity; it does not
// qualify the independently implemented private service or change product gates.
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  startAccountApi,
  newAccount,
} from "../../server/test/support/account-api.ts";
let api: Awaited<ReturnType<typeof startAccountApi>>, vite: ChildProcess;
const identity = { ...newAccount(), email: "shell-contract@example.invalid" };
const port = process.env.SOURCE_TASTER_SHELL_WEB_PORT ?? "5616";
const url = `http://127.0.0.1:${port}`;
let language: "en" | "de" = "en",
  unavailable = false;
const reference =
  "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
let serviceCalls: string[] = [];
test.beforeAll(async () => {
  api = await startAccountApi({
    worker: true,
    service: (request, tokens) => {
      if (!request.url.startsWith("/v1/")) return Promise.resolve(undefined);
      serviceCalls.push(request.url);
      const headers = {
        "content-type": "application/json",
        "access-control-allow-origin": url,
        "access-control-allow-credentials": "true",
        "access-control-allow-headers": "content-type",
        "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
      };
      const ok = (data: unknown) => ({
        status: 200,
        headers,
        body: { data, quota: { status: "not-implemented" } },
      });
      if (request.method === "OPTIONS")
        return Promise.resolve({ status: 204, headers });
      if (request.url === "/v1/session" && unavailable)
        return Promise.resolve({
          status: 503,
          headers,
          body: {
            type: "about:blank",
            title: "Unavailable",
            status: 503,
            code: "internal",
            i18nKey: "problem_internal",
          },
        });
      if (
        (request.url === "/v1/session" ||
          request.url === "/v1/session/activity" ||
          request.url === "/v1/account-tokens") &&
        !String(request.headers.cookie ?? "").includes(
          "st-shell-contract=existing-account-test-session",
        )
      )
        return Promise.resolve({
          status: 401,
          headers,
          body: {
            type: "about:blank",
            status: 401,
            title: "Sign in required",
            code: "unauthenticated",
            i18nKey: "problem_unauthenticated",
          },
        });
      if (
        request.url === "/v1/session" ||
        request.url === "/v1/session/activity"
      )
        return Promise.resolve(
          ok({
            accountId: identity.accountId,
            ownerId: identity.ownerId,
            email: identity.email,
          }),
        );
      if (request.url === "/v1/preferences")
        return Promise.resolve(ok({ language, citationStyle: "apa" }));
      if (request.url === "/v1/account-tokens")
        return Promise.resolve(
          ok({
            accessToken: tokens.token(identity),
            expiresAt: new Date(Date.now() + 300000).toISOString(),
          }),
        );
      return Promise.resolve(undefined);
    },
  });
  vite = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--config",
      "e2e-sensitive/vite.config.ts",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: {
        PATH: process.env.PATH,
        SOURCE_TASTER_API_URL: api.apiUrl,
        VITE_SOURCE_TASTER_MODE: "hosted",
        VITE_SOURCE_TASTER_SERVICE_URL: api.serviceUrl,
        VITE_SOURCE_TASTER_SENSITIVE_ACCOUNT_ACTIONS: "enabled",
      },
      stdio: "pipe",
    },
  );
  await expect
    .poll(
      () =>
        fetch(url).then(
          (r) => r.ok,
          () => false,
        ),
      { timeout: 30000 },
    )
    .toBe(true);
});
test.afterAll(async () => {
  if (vite?.exitCode === null) {
    const done = once(vite, "exit");
    vite.kill();
    await done;
  }
  await api?.stop();
});
test.beforeEach(async ({ page }) => {
  await page
    .context()
    .addCookies([
      {
        name: "st-shell-contract",
        value: "existing-account-test-session",
        url: api.serviceUrl,
        httpOnly: true,
        sameSite: "Strict",
      },
    ]);
  identity.accountId = newAccount().accountId;
  identity.ownerId = newAccount().ownerId;
  unavailable = false;
  serviceCalls = [];
});
for (const locale of ["en", "de"] as const) {
  test(`History is modal, restores focus and confirms restart safely (${locale})`, async ({
    page,
  }) => {
    language = locale;
    const en = locale === "en";
    await page.goto(url);
    const trigger = page.getByRole("button", {
      name: en ? "History" : "Verlauf",
      exact: true,
    });
    await expect(trigger).toBeVisible();
    await trigger.focus();
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog", {
      name: en ? "History" : "Verlauf",
      exact: true,
    });
    await expect(drawer).toHaveAttribute("aria-modal", "true");
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page
      .getByRole("button", {
        name: en ? "Enable history" : "Verlauf aktivieren",
        exact: true,
      })
      .click();
    await page.keyboard.press("Escape");
    await page
      .getByRole("textbox", {
        name: en ? "Reference" : "Referenz",
        exact: true,
      })
      .fill(reference);
    await page
      .getByRole("button", {
        name: en ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await expect(page.getByRole("grid")).toContainText(
      en ? "Correct" : "Korrekt",
      { timeout: 15000 },
    );
    await trigger.click();
    const restart = page.getByRole("button", {
      name: en ? "Start as a new check" : "Als neue Prüfung starten",
      exact: true,
    });
    await expect(restart).toBeEnabled({ timeout: 15000 });
    await restart.click();
    const confirm = page.getByRole("alertdialog");
    await expect(confirm).toBeVisible();
    await expect(
      confirm.getByRole("button", {
        name: en ? "Back" : "Zurück",
        exact: true,
      }),
    ).toBeFocused();
    const reservations = api.state.quotaCalls.filter((c) =>
      c.path.endsWith("/reserve"),
    ).length;
    await page.keyboard.press("Escape");
    await expect(confirm).toBeHidden();
    expect(
      api.state.quotaCalls.filter((c) => c.path.endsWith("/reserve")),
    ).toHaveLength(reservations);
    await restart.click();
    await confirm
      .getByRole("button", {
        name: en
          ? "Start new billable check"
          : "Neue kostenpflichtige Prüfung starten",
        exact: true,
      })
      .click();
    await expect(drawer).toBeHidden();
    await expect(page.getByRole("grid")).toContainText(
      en ? "Correct" : "Korrekt",
      { timeout: 15000 },
    );
    expect(
      api.state.quotaCalls.filter((c) => c.path.endsWith("/reserve")),
    ).toHaveLength(reservations + 1);
    expect(
      await page.evaluate(() => JSON.stringify([localStorage, sessionStorage])),
    ).not.toContain("Aspelmeyer");
  });
  test(`account entry and order links preserve content-free handoff (${locale})`, async ({
    page,
  }) => {
    language = locale;
    const en = locale === "en";
    await page.goto(url);
    await page
      .getByRole("textbox", {
        name: en ? "Reference" : "Referenz",
        exact: true,
      })
      .fill("Private draft must stay in the checking client");
    await page
      .getByRole("button", { name: en ? /^Account:/ : /^Konto:/ })
      .click();
    const entry = page.getByRole("dialog", {
      name: en ? "Account" : "Konto",
      exact: true,
    });
    await expect(entry).toHaveAttribute("aria-modal", "false");
    const links = await entry
      .getByRole("link")
      .evaluateAll((elements) =>
        elements.map((e) => (e as HTMLAnchorElement).href),
      );
    expect(links).toContain(`${api.serviceUrl}/account?language=${locale}`);
    expect(links).toContain(`${api.serviceUrl}/plan?language=${locale}`);
    expect(links.join(" ")).not.toMatch(/Private|draft|Reference|checkId/);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("textbox", {
        name: en ? "Reference" : "Referenz",
        exact: true,
      }),
    ).toHaveValue("Private draft must stay in the checking client");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
test("hosted session failure stays closed and never requests a guest token", async ({
  page,
}) => {
  unavailable = true;
  language = "en";
  await page.goto(url);
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Reference", exact: true }),
  ).toHaveCount(0);
  expect(serviceCalls).not.toContain("/v1/guest-tokens");
});
