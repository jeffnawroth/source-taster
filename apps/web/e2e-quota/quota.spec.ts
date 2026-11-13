// SPDX-License-Identifier: AGPL-3.0-or-later
// Real browser against the real web UI, the verification program and the private
// service's Quota journal. Only what a user sees is asserted.
import { spawn, type ChildProcess } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { once } from "node:events";
import { expect, test, type Page } from "@playwright/test";
import { newCheck } from "../e2e/support/workspace.ts";
import AxeBuilder from "@axe-core/playwright";
import {
  bothPrograms,
  freePort,
  eventually,
} from "../../server/test/support/both-programs.ts";
import { physicsReference } from "../../server/test/support/doi-fixtures.ts";
let both: Awaited<ReturnType<typeof bothPrograms>>,
  vite: ChildProcess,
  url: string;
const references = (n: number) =>
  Array.from({ length: n }, () => physicsReference).join("\n\n");
test.beforeAll(async () => {
  both = await bothPrograms({ accounts: true });
  const port = process.env.SOURCE_TASTER_TEST_BROWSER_PORT
    ? Number(process.env.SOURCE_TASTER_TEST_BROWSER_PORT)
    : await freePort();
  url = `http://127.0.0.1:${port}`;
  both.serviceConfig.allowedOrigins = [url];
  await writeFile(both.serviceConfigPath, JSON.stringify(both.serviceConfig));
  await both.restartService();
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
  vite.stdout!.on("data", (b) => {
    output += String(b);
  });
  await eventually(async () => {
    if (vite.exitCode !== null) throw new Error(output);
    try {
      return (await fetch(url)).ok;
    } catch {
      return false;
    }
  });
});
test.afterAll(async () => {
  if (vite && vite.exitCode === null) {
    const exited = once(vite, "exit");
    vite.kill("SIGTERM");
    await exited;
  }
  await both?.stop();
});
async function open(page: Page) {
  // #99: Quota and consumption are visible before the first start.
  await page.goto(url);
  await expect(page.getByTestId("quota-summary")).toContainText(
    "20 of 20 checks left · 0 used",
  );
}
const guestTokens = (page: Page) => {
  const seen: string[] = [];
  page.on("request", (r) => {
    if (r.url().endsWith("/v1/guest-tokens")) seen.push(r.url());
  });
  return seen;
};
const check = (page: Page) =>
  page.getByRole("button", { name: "Check reference", exact: true }).click();

test("the Guest sees count and consumption before the start and the balance afterwards", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("textbox").fill(references(2));
  await check(page);
  await expect(page.getByTestId("quota-note")).toContainText(
    "2 references will use 2 of your 20 remaining checks. 18 will be left.",
  );
  await expect(page.getByTestId("quota-meter")).toBeVisible();
  await expect(page.locator("#results-title")).toBeVisible();
  // The debit lands after the last Verdict; the meter follows without a reload.
  await expect(page.getByTestId("quota-summary")).toContainText(
    "18 of 20 checks left · 2 used",
    { timeout: 30000 },
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("a start beyond the balance asks: first N in input order, or upgrade; warning at 80 and 100 percent", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("textbox").fill(references(23));
  await check(page);
  const choice = page.getByTestId("quota-choice");
  await expect(choice).toContainText("You entered 23 references");
  await expect(choice).toContainText("20 checks left");
  // Nothing was reserved by merely asking.
  await expect(page.getByTestId("quota-summary")).toContainText(
    "20 of 20 checks left",
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await choice.getByRole("button", { name: "Check first 20" }).click();
  await expect(page.getByTestId("quota-note")).toContainText(
    "Started 20 of 23 references; 3 were not checked.",
  );
  await expect(page.getByTestId("quota-warning-exhausted")).toBeVisible({
    timeout: 45000,
  });
  await expect(page.getByTestId("quota-summary")).toContainText(
    "0 of 20 checks left · 20 used",
    { timeout: 45000 },
  );
  // A new start finds nothing left: only upgrade or cancel.
  await newCheck(page);
  await page.getByRole("textbox").fill(references(1));
  await check(page);
  await expect(page.getByTestId("quota-choice")).toContainText(
    "no checks left",
  );
  await expect(page.getByRole("button", { name: /Check first/ })).toHaveCount(
    0,
  );
});

test("80 percent of the Quota raises an upgrade warning", async ({ page }) => {
  await open(page);
  await page.getByRole("textbox").fill(references(16));
  await check(page);
  await expect(page.getByTestId("quota-warning-eighty")).toBeVisible({
    timeout: 45000,
  });
  await expect(page.getByTestId("quota-summary")).toContainText(
    "4 of 20 checks left · 16 used",
    { timeout: 45000 },
  );
});

test("the interface speaks German", async ({ page }) => {
  await open(page);
  await page.getByLabel("Language").selectOption("de");
  await page.getByRole("textbox").fill(references(1));
  await page
    .getByRole("button", { name: "Referenz prüfen", exact: true })
    .click();
  await expect(page.getByTestId("quota-meter")).toBeVisible();
  await expect(page.getByTestId("quota-summary")).toContainText(
    "von 20 Prüfungen übrig",
  );
});

test("a returning Guest sees the real, already reduced balance before starting again", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("textbox").fill(references(2));
  await check(page);
  await expect(page.getByTestId("quota-summary")).toContainText(
    "18 of 20 checks left · 2 used",
    { timeout: 30000 },
  );
  await page.reload();
  // Not the catalog value: the service's journal for this Guest, before any start.
  await expect(page.getByTestId("quota-summary")).toContainText(
    "18 of 20 checks left · 2 used",
  );
  await expect(page.locator("#results-title")).toHaveCount(0);
});

test("a signed-in Account sees its Free Quota before starting and never reads as a Guest", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("quota-reader@example.invalid");
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await expect(page.getByLabel("Six-digit code")).toBeVisible();
  const code = (await both.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0];
  const minted = guestTokens(page);
  await page.getByLabel("Six-digit code").fill(code);
  await page.getByLabel("Six-digit code").press("Enter");
  await expect(
    page.getByText("quota-reader@example.invalid", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("quota-summary")).toContainText(
    "100 of 100 checks left · 0 used",
  );
  await page.reload();
  await expect(page.getByTestId("quota-summary")).toContainText(
    "100 of 100 checks left · 0 used",
  );
  expect(minted).toEqual([]);
});

test("while the session is still pending nothing reads Quota or mints a Guest", async ({
  page,
}) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/v1/session", async (route) => {
    await held;
    await route.continue();
  });
  const minted = guestTokens(page);
  const quotaReads: string[] = [];
  page.on("request", (r) => {
    if (r.url().endsWith("/v2/quota")) quotaReads.push(r.url());
  });
  await page.goto(url);
  await expect(page.getByRole("status")).toHaveText("Please wait…");
  await page.waitForTimeout(500);
  expect(minted).toEqual([]);
  expect(quotaReads).toEqual([]);
  await expect(page.getByTestId("quota-summary")).toHaveCount(0);
  release();
  // Resolved as Guest: only now the Guest path reads its real balance.
  await expect(page.getByTestId("quota-summary")).toContainText(
    "20 of 20 checks left · 0 used",
  );
  expect(minted).toHaveLength(1);
});

test("a refused Guest sees Quota as unavailable, without a number or an unimplemented label", async ({
  page,
}) => {
  await open(page);
  const id = await page.evaluate(() =>
    localStorage.getItem("source-taster-guest-id-v1"),
  );
  expect(id).toMatch(/^[0-9a-f-]{36}$/);
  await both.change(id!, { revoke: true });
  await page.reload();
  const meter = page.getByTestId("quota-meter");
  await expect(meter).toContainText("Quota is currently unavailable.");
  await expect(meter).not.toContainText(/[0-9]+ of [0-9]+/);
  await expect(page.getByText(/not implemented/i)).toHaveCount(0);
  await expect(page.getByTestId("quota-summary")).toHaveCount(0);
  // The same Guest identity is kept; nothing falls back to a new one.
  expect(
    await page.evaluate(() =>
      localStorage.getItem("source-taster-guest-id-v1"),
    ),
  ).toBe(id);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("an unreachable service shows sign-in as unavailable and never falls back to a Guest", async ({
  page,
}) => {
  const minted = guestTokens(page);
  await both.service().stop();
  try {
    await page.goto(url);
    await expect(page.getByRole("alert")).toHaveText(
      "Try again shortly. Sign-in is temporarily unavailable.",
    );
    await expect(page.getByTestId("quota-summary")).toHaveCount(0);
    expect(minted).toEqual([]);
    expect(
      await page.evaluate(() =>
        localStorage.getItem("source-taster-guest-id-v1"),
      ),
    ).toBeNull();
  } finally {
    await both.restartService();
  }
});
