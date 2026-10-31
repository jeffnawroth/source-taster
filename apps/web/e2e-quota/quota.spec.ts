// SPDX-License-Identifier: AGPL-3.0-or-later
// Real browser against the real web UI, the verification program and the private
// service's Quota journal. Only what a user sees is asserted.
import { spawn, type ChildProcess } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { once } from "node:events";
import { expect, test, type Page } from "@playwright/test";
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
  // A passive page load reads nothing and mints no Guest identity; the meter
  // appears with the first start, which reads the balance anyway.
  await page.goto(url);
  await expect(page.getByTestId("quota-meter")).toHaveCount(0);
}
const check = (page: Page) =>
  page.getByRole("button", { name: "Check Reference", exact: true }).click();

test("the Guest sees count and consumption before the start and the balance afterwards", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("textbox").fill(references(2));
  await check(page);
  await expect(page.getByTestId("quota-note")).toContainText(
    "2 References will use 2 of your 20 remaining checks. 18 will be left.",
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
  await expect(choice).toContainText("You entered 23 References");
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
    "Started 20 of 23 References; 3 were not checked.",
  );
  await expect(page.getByTestId("quota-warning-exhausted")).toBeVisible({
    timeout: 45000,
  });
  await expect(page.getByTestId("quota-summary")).toContainText(
    "0 of 20 checks left · 20 used",
    { timeout: 45000 },
  );
  // A new start finds nothing left: only upgrade or cancel.
  await page.getByRole("button", { name: "Reset", exact: true }).click();
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
