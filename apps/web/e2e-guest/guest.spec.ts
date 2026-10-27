// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn, type ChildProcess } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { once } from "node:events";
import { join } from "node:path";
import { chromium, expect, test } from "@playwright/test";
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
test.beforeAll(async () => {
  both = await bothPrograms({ startWorker: false, clientLeaseMs: 1500 });
  const port = await freePort();
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
test("web Guest identity survives a real browser restart, with token and Check content absent from persistence", async () => {
  const directory = join(both.directory, "browser");
  let context = await chromium.launchPersistentContext(directory, {
    headless: true,
    locale: "en-GB",
  });
  try {
    let page = await context.newPage();
    await page.goto(url);
    await page.getByRole("textbox").fill(physicsReference);
    await page
      .getByRole("button", { name: "Check Reference", exact: true })
      .click();
    await expect(page.locator("#results-title")).toBeVisible();
    const id = await page.evaluate(() =>
      localStorage.getItem("source-taster-guest-id-v1"),
    );
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    const storage = await context.storageState();
    const serialized = JSON.stringify(storage);
    expect(serialized.includes("Aspelmeyer")).toBe(false);
    expect(serialized.includes("accessToken")).toBe(false);
    expect(serialized.includes("eyJ")).toBe(false);
    const keys = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    }));
    expect(keys.session).toEqual([]);
    expect(
      keys.local.filter((key) => key !== "source-taster-guest-id-v1"),
    ).toEqual([]);
    await context.close();
    context = await chromium.launchPersistentContext(directory, {
      headless: true,
      locale: "en-GB",
    });
    page = await context.newPage();
    await page.goto(url);
    expect(
      (await page.evaluate(() =>
        localStorage.getItem("source-taster-guest-id-v1"),
      )) === id,
    ).toBe(true);
    await expect(page.getByRole("textbox")).toHaveValue("");
    await expect(page.locator("#results-title")).toHaveCount(0);
    await page.getByRole("textbox").fill(physicsReference);
    await page
      .getByRole("button", { name: "Structure References", exact: true })
      .click();
    await expect(
      page.getByText("Measured measurement", { exact: true }),
    ).toBeVisible();
    expect(
      (await page.evaluate(() =>
        localStorage.getItem("source-taster-guest-id-v1"),
      )) === id,
    ).toBe(true);
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
for (const language of ["en", "de"] as const)
  test(`web ${language} revocation stops renewal without replacing Guest identity`, async ({
    page,
  }) => {
    await page.goto(url);
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page.getByRole("textbox").fill(physicsReference);
    await page
      .getByRole("button", {
        name: language === "en" ? "Check Reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    await expect(page.locator("#results-title")).toBeVisible();
    const id = await page.evaluate(() =>
      localStorage.getItem("source-taster-guest-id-v1"),
    );
    let renewals = 0;
    page.on("request", (r) => {
      if (r.url().endsWith("/lease")) renewals++;
    });
    await both.change(id!, { revoke: true });
    await expect(page.getByRole("alert")).toBeVisible();
    await page.waitForTimeout(300);
    const stopped = renewals;
    await page.waitForTimeout(1500);
    expect(renewals).toBe(stopped);
    expect(
      (await page.evaluate(() =>
        localStorage.getItem("source-taster-guest-id-v1"),
      )) === id,
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
test("unavailable identity storage gives an explicit message and never falls back to a new Guest", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await page.goto(url);
  await page.getByRole("textbox").fill(physicsReference);
  await page
    .getByRole("button", { name: "Check Reference", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Browser storage is required",
  );
  await expect(page.locator("#results-title")).toHaveCount(0);
});
test("concurrent origin tabs share one Guest while an independent browser context keeps its own", async ({
  page,
  context,
  browser,
}) => {
  const other = await context.newPage();
  await Promise.all([page.goto(url), other.goto(url)]);
  const issueIds: string[] = [];
  context.on("request", (request) => {
    if (request.url().endsWith("/v1/guest-tokens")) {
      const body = request.postDataJSON() as { guestId: string };
      issueIds.push(body.guestId);
    }
  });
  for (const tab of [page, other])
    await tab.getByRole("textbox").fill(physicsReference);
  await Promise.all([
    page
      .getByRole("button", { name: "Structure References", exact: true })
      .click(),
    other
      .getByRole("button", { name: "Structure References", exact: true })
      .click(),
  ]);
  for (const tab of [page, other])
    await expect(
      tab.getByText("Measured measurement", { exact: true }),
    ).toBeVisible();
  expect(new Set(issueIds).size).toBe(1);
  const separate = await browser.newContext();
  try {
    const foreign = await separate.newPage();
    await foreign.goto(url);
    await foreign.getByRole("textbox").fill(physicsReference);
    await foreign
      .getByRole("button", { name: "Structure References", exact: true })
      .click();
    await expect(
      foreign.getByText("Measured measurement", { exact: true }),
    ).toBeVisible();
    expect(
      (await foreign.evaluate(() =>
        localStorage.getItem("source-taster-guest-id-v1"),
      )) !== issueIds[0],
    ).toBe(true);
  } finally {
    await separate.close();
  }
});
