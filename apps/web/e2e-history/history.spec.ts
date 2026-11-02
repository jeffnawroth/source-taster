// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  CheckResponse,
  HistoryResponse,
} from "@source-taster/contract-verification/v2";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  startAccountApi,
  newAccount,
} from "../../server/test/support/account-api.ts";
import { sensitiveService } from "../../server/test/support/sensitive-service.ts";
let api: Awaited<ReturnType<typeof startAccountApi>>;
let vite: ChildProcess;
const identity = { ...newAccount(), email: "history@example.org" };
const secret = "history-fixture-session";
const webPort = process.env.SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT ?? "5441";
const webUrl = `http://127.0.0.1:${webPort}`;
let fake: Awaited<ReturnType<typeof sensitiveService>>;
test.beforeAll(async () => {
  fake = await sensitiveService({
    prefix: "/v1",
    account: identity,
    secret,
    deleteOwner: () => Promise.resolve({ status: 200 }),
    revoke: () => {},
  });
  api = await startAccountApi({
    worker: true,
    service: (request, tokens) => fake.handle(request, tokens),
  });
  vite = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--config",
      "e2e-sensitive/vite.config.ts",
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
        SOURCE_TASTER_API_URL: api.apiUrl,
        VITE_SOURCE_TASTER_MODE: "hosted",
        VITE_SOURCE_TASTER_SERVICE_URL: api.serviceUrl,
      },
      stdio: "pipe",
    },
  );
  await expect
    .poll(
      () =>
        fetch(webUrl).then(
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
  await fake?.stop();
});
for (const language of ["en", "de"] as const) {
  test(`Account opts in, finds, opens, restarts and revokes History (${language})`, async ({
    page,
  }) => {
    Object.assign(identity, newAccount());
    fake.reset();
    await fake.setPreferences({ language, citationStyle: "apa" });
    await page.context().addCookies([
      {
        name: "st-fake",
        value: secret,
        url: api.serviceUrl,
        httpOnly: true,
        sameSite: "Strict",
      },
    ]);
    await page.goto(webUrl);
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
            search: "Find an earlier Check",
          }
        : {
            enable: "Verlauf aktivieren",
            refresh: "Verlauf aktualisieren",
            open: "Check öffnen",
            restart: "Als neuen Check starten",
            confirm: "Neuen kostenpflichtigen Check starten",
            revoke: "Verlauf widerrufen",
            remove: "Gesamten Verlauf löschen",
            search: "Früheren Check finden",
          };
    await expect(
      page.getByRole("button", { name: t.enable, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: t.enable, exact: true }).click();
    const created = await fetch(`${api.apiUrl}/v2/checks`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${api.token(identity)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        references: [
          {
            originalText: "History searchable original",
            fields: { DOI: "10.1038/nphys1170", title: "Find this History" },
          },
        ],
      }),
    });
    expect(created.status).toBe(201);
    const id = CheckResponse.parse(await created.json()).data.id;
    await expect
      .poll(
        async () =>
          HistoryResponse.parse(
            await (
              await fetch(`${api.apiUrl}/v2/history`, {
                headers: { authorization: `Bearer ${api.token(identity)}` },
              })
            ).json(),
          ).data.entries.length,
      )
      .toBe(1);
    await page.getByRole("button", { name: t.refresh, exact: true }).click();
    await page.getByLabel(t.search, { exact: true }).fill("Find this");
    await page.getByRole("button", { name: t.open, exact: true }).click();
    await expect(page.locator("#results-title")).toBeVisible();
    expect(
      api.state.quotaCalls.filter(
        (c) => c.path.endsWith("/reserve") && c.body.checkId === id,
      ),
    ).toHaveLength(1);
    await page.getByRole("button", { name: t.restart, exact: true }).click();
    await page.getByRole("button", { name: t.confirm, exact: true }).click();
    await expect
      .poll(
        () =>
          api.state.quotaCalls.filter((c) => c.path.endsWith("/reserve"))
            .length,
      )
      .toBeGreaterThanOrEqual(2);
    await page.getByRole("button", { name: t.revoke, exact: true }).click();
    await expect(
      page.getByRole("button", { name: t.remove, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: t.remove, exact: true }).click();
    await expect(
      page.getByRole("button", { name: t.enable, exact: true }),
    ).toBeVisible();
    await expect(page.locator("#results-title")).toHaveCount(0);
    expect(
      await page.evaluate(() => JSON.stringify(localStorage)),
    ).not.toContain("History searchable original");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test("locked entries explain the Plan rule and remain deletable", async ({
  page,
}) => {
  Object.assign(identity, newAccount());
  fake.reset();
  await fake.setPreferences({ language: "en", citationStyle: "apa" });
  api.state.quota.features = ["check", "extended-history"];
  api.state.quota.history.extendedUntil = new Date(
    api.now() + 60 * 86_400_000,
  ).toISOString();
  const auth = {
    authorization: `Bearer ${api.token(identity)}`,
    "content-type": "application/json",
  };
  await fetch(`${api.apiUrl}/v2/history`, {
    method: "PUT",
    headers: auth,
    body: JSON.stringify({ enabled: true }),
  });
  const created = await fetch(`${api.apiUrl}/v2/checks`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      references: [
        {
          originalText: "Locked History",
          fields: { DOI: "10.1038/nphys1170" },
        },
      ],
    }),
  });
  const id = CheckResponse.parse(await created.json()).data.id;
  await expect
    .poll(
      async () =>
        HistoryResponse.parse(
          await (
            await fetch(`${api.apiUrl}/v2/history`, { headers: auth })
          ).json(),
        ).data.entries.length,
    )
    .toBe(1);
  await api.advance(31 * 86_400_000);
  api.state.quota.features = ["check"];
  api.state.quota.history.extendedUntil = null;
  await page.context().addCookies([
    {
      name: "st-fake",
      value: secret,
      url: api.serviceUrl,
      httpOnly: true,
      sameSite: "Strict",
    },
  ]);
  await page.goto(webUrl);
  await expect(
    page.getByText(/This entry is locked under the Free rules/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open Check", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Start as a new Check", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete Check permanently", exact: true })
    .click();
  await expect(
    page.getByText("No earlier Checks yet. Checks are kept when they end."),
  ).toBeVisible();
  expect(
    (
      await fetch(`${api.apiUrl}/v2/checks/${id}`, {
        headers: { authorization: `Bearer ${api.token(identity)}` },
      })
    ).status,
  ).toBe(410);
});
