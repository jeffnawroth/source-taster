// SPDX-License-Identifier: AGPL-3.0-or-later
// PUBLIC client witness: the private service is faked only at its external HTTP edge.
import type { Page } from "@playwright/test";
import type { Panel } from "../e2e/support/chromium.ts";
import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { once } from "node:events";
const account = {
  accountId: "11111111-1111-4111-8111-111111111111",
  ownerId: "22222222-2222-4222-8222-222222222222",
  email: "reader@example.org",
};
let signedIn = false;
let stored = { language: "de", citationStyle: "ieee" };
let patches: unknown[] = [];
let registration: unknown;
let denied = false;
let unavailable = false;
let reads = 0;
let holdRead: ((send: () => void) => void) | undefined;
let holdPatch: ((send: () => void) => void) | undefined;
const server = createServer((req, res) => {
  void (async () => {
    res.setHeader(
      "access-control-allow-origin",
      req.headers.origin ?? "http://127.0.0.1:5381",
    );
    res.setHeader("access-control-allow-credentials", "true");
    res.setHeader(
      "access-control-allow-headers",
      "authorization, content-type",
    );
    res.setHeader("access-control-allow-methods", "GET, POST, PATCH, OPTIONS");
    res.setHeader("cache-control", "no-store");
    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }
    let raw = "";
    for await (const chunk of req) raw += String(chunk);
    const body = raw
      ? (JSON.parse(raw) as {
          preferences?: unknown;
          language?: string;
          citationStyle?: string;
        })
      : undefined;
    const path = req.url!.replace("/extension", "");
    let data: unknown = account;
    if (path === "/v1/sign-in/challenges")
      data = {
        challengeId: "33333333-3333-4333-8333-333333333333",
        expiresIn: 300,
        resendAfter: 60,
        ...(req.url!.includes("extension")
          ? { transactionCredential: "t".repeat(43) }
          : {}),
      };
    else if (path === "/v1/sign-in/confirm") {
      signedIn = true;
      registration = body?.preferences;
      data = req.url!.includes("extension")
        ? { session: account, sessionCredential: "s".repeat(43) }
        : account;
    } else if (path === "/v1/sign-out") {
      signedIn = false;
      data = { signedOut: true };
    } else if (!signedIn || denied) res.statusCode = 401;
    else if (unavailable) res.statusCode = 503;
    else if (path === "/v1/preferences") {
      if (req.method === "PATCH") {
        patches.push(body);
        stored = { ...stored, ...body };
      } else reads++;
      data = { ...stored };
    }
    const send = () => {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ data, quota: { status: "not-implemented" } }));
    };
    if (path === "/v1/preferences" && req.method === "GET" && holdRead) {
      const hold = holdRead;
      holdRead = undefined;
      hold(send);
    } else if (
      path === "/v1/preferences" &&
      req.method === "PATCH" &&
      holdPatch
    ) {
      const hold = holdPatch;
      holdPatch = undefined;
      hold(send);
    } else send();
  })().catch(() => {
    res.statusCode = 500;
    res.end("{}");
  });
});
test.beforeAll(async () => {
  server.listen(4802, "127.0.0.1");
  await once(server, "listening");
});
test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});
test.beforeEach(() => {
  signedIn = false;
  stored = { language: "de", citationStyle: "ieee" };
  patches = [];
  registration = undefined;
  denied = false;
  unavailable = false;
  reads = 0;
  holdRead = undefined;
  holdPatch = undefined;
});
const guestKey = "source-taster-guest-preferences-v1";
async function signIn(page: Page) {
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Email address", { exact: true }).fill(account.email);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await page.getByLabel("Six-digit code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Confirm code", exact: true }).click();
  await expect(page.getByText(account.email, { exact: true })).toBeVisible();
}
const language = (page: Page) =>
  page.getByRole("combobox", { name: /^(Language|Sprache)$/ });
const style = (page: Page) =>
  page.getByRole("combobox", {
    name: /^(Preferred citation style|Bevorzugter Zitierstil)$/,
  });

test("existing Account wins, immediate partial changes never write Guest storage, sign-out copies displayed values", async ({
  page,
}) => {
  await page.goto("/");
  await style(page).selectOption("oxford");
  await signIn(page);
  await expect(language(page)).toHaveValue("de");
  await expect(style(page)).toHaveValue("ieee");
  expect(registration).toEqual({ language: "en", citationStyle: "oxford" });
  await language(page).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect.poll(() => patches).toEqual([{ language: "en" }]);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      guestKey,
    ),
  ).toEqual({ language: "en", citationStyle: "oxford", theme: "system" });
  await page
    .getByRole("button", { name: "Sign out here", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      guestKey,
    ),
  ).toEqual({ language: "en", citationStyle: "ieee", theme: "system" });
});

test("open/refocus reads apply another client's values without changing unfinished input; removed styles show APA notice", async ({
  page,
}) => {
  signedIn = true;
  await page.goto("/");
  await expect(language(page)).toHaveValue("de");
  await page
    .getByRole("textbox", { name: "Referenz", exact: true })
    .fill("Unfinished bibliography");
  stored = { language: "en", citationStyle: "removed-style" };
  const before = reads;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => reads).toBeGreaterThan(before);
  await expect(language(page)).toHaveValue("en");
  await expect(style(page)).toHaveValue("apa");
  await expect(page.getByRole("status")).toContainText(
    "Your saved citation style is no longer available.",
  );
  await expect(
    page.getByRole("textbox", { name: "Reference", exact: true }),
  ).toHaveValue("Unfinished bibliography");
  expect(patches).toEqual([]);
  await style(page).selectOption("vancouver");
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect.poll(() => stored.citationStyle).toBe("vancouver");
  await page.reload();
  await expect(style(page)).toHaveValue("vancouver");
});

test("a delayed refocus read cannot undo a later edit or a newer refocus response", async ({
  page,
}) => {
  signedIn = true;
  await page.goto("/");
  await expect(language(page)).toHaveValue("de");
  let release!: () => void;
  holdRead = (send) => {
    release = send;
  };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => !!release).toBe(true);
  await language(page).selectOption("en");
  await style(page).selectOption("oxford");
  await expect.poll(() => patches.length).toBe(2);
  release();
  await expect(language(page)).toHaveValue("en");
  await expect(style(page)).toHaveValue("oxford");
  let older!: () => void;
  holdRead = (send) => {
    older = send;
  };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => !!older).toBe(true);
  stored = { language: "de", citationStyle: "acs" };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(style(page)).toHaveValue("acs");
  older();
  await expect(language(page)).toHaveValue("de");
  await expect(style(page)).toHaveValue("acs");
});

test("rapid per-field writes remain immediate and refocus waits for pending writes", async ({
  page,
}) => {
  signedIn = true;
  await page.goto("/");
  await expect(style(page)).toHaveValue("ieee");
  let release!: () => void;
  holdPatch = (send) => {
    release = send;
  };
  await language(page).selectOption("en");
  await expect.poll(() => !!release).toBe(true);
  await style(page).selectOption("oxford");
  await style(page).selectOption("vancouver");
  await expect(style(page)).toHaveValue("vancouver");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const before = reads;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  expect(reads).toBe(before);
  release();
  await expect
    .poll(() => patches)
    .toEqual([
      { language: "en" },
      { citationStyle: "oxford" },
      { citationStyle: "vancouver" },
    ]);
  await expect.poll(() => reads).toBeGreaterThan(before);
  await expect(style(page)).toHaveValue("vancouver");
  await expect(language(page)).toHaveValue("en");
});

test("unavailable Account writes remain separate from Guest storage; retry reads authority, expiry copies displayed values", async ({
  page,
}) => {
  signedIn = true;
  await page.goto("/");
  await expect(style(page)).toHaveValue("ieee");
  unavailable = true;
  await language(page).selectOption("en");
  await expect(page.getByRole("alert")).toContainText(
    "Account Preferences could not be synchronized.",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), guestKey),
  ).toBeNull();
  unavailable = false;
  await page
    .getByRole("button", { name: "Retry session", exact: true })
    .click();
  await expect(language(page)).toHaveValue("de");
  await expect(page.getByRole("alert")).toHaveCount(0);
  denied = true;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByRole("alert").filter({ hasText: /abgelaufen/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      guestKey,
    ),
  ).toEqual({ language: "de", citationStyle: "ieee", theme: "system" });
  await style(page).selectOption("oxford");
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      guestKey,
    ),
  ).toEqual({ language: "de", citationStyle: "oxford", theme: "system" });
  expect(patches).toEqual([]);
});

test("a late Account reply after sign-out cannot change Guest values", async ({
  page,
}) => {
  signedIn = true;
  await page.goto("/");
  await expect(style(page)).toHaveValue("ieee");
  let release!: () => void;
  stored = { language: "en", citationStyle: "acs" };
  holdRead = (send) => {
    release = send;
  };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => !!release).toBe(true);
  await page
    .getByRole("button", { name: "Hier abmelden", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Anmelden", exact: true }),
  ).toBeVisible();
  release();
  await expect(language(page)).toHaveValue("de");
  await expect(style(page)).toHaveValue("ieee");
  await page.reload();
  await expect(style(page)).toHaveValue("ieee");
});

test("web and native Chromium panel share Account values on refocus while keeping Guest stores separate", async ({
  page,
}) => {
  const { buildExtension } = await import("../e2e/support/build.ts");
  const { launchChromium } = await import("../e2e/support/chromium.ts");
  const build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_API_URL: "http://127.0.0.1:4801",
    SOURCE_TASTER_EXTENSION_SERVICE_URL: "http://127.0.0.1:4802",
    SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
  });
  let browser: Awaited<ReturnType<typeof launchChromium>> | undefined;
  let panel: Panel | undefined;
  const sessionKey = "source-taster-extension-session-v1";
  const guestValues = { language: "en", citationStyle: "acs", theme: "system" };
  try {
    browser = await launchChromium(build.outDir, "");
    await browser.setStorage({
      [sessionKey]: "s".repeat(43),
      [guestKey]: guestValues,
    });
    signedIn = true;
    panel = await browser.openPanel();
    await panel.waitForText("main", undefined, account.email);
    expect(await panel.evaluate("document.documentElement.lang")).toBe("de");
    expect(await browser.storage()).toEqual({
      [sessionKey]: "s".repeat(43),
      [guestKey]: guestValues,
    });
    await page.goto("/");
    await expect(language(page)).toHaveValue("de");
    await language(page).selectOption("en");
    await style(page).selectOption("oxford");
    await expect
      .poll(() => stored)
      .toEqual({ language: "en", citationStyle: "oxford" });
    await panel.evaluate('window.dispatchEvent(new Event("focus"))');
    await panel.find("combobox", "Preferred citation style");
    await expect
      .poll(() =>
        panel!.evaluate('document.querySelectorAll("select")[1].value'),
      )
      .toBe("oxford");
    await panel.evaluate(
      'const select = document.querySelectorAll("select")[1]; select.value = "vancouver"; select.dispatchEvent(new Event("change", { bubbles: true }));',
    );
    await expect.poll(() => stored.citationStyle).toBe("vancouver");
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(style(page)).toHaveValue("vancouver");
    expect(await browser.storage()).toEqual({
      [sessionKey]: "s".repeat(43),
      [guestKey]: guestValues,
    });
    expect(
      await page.evaluate((key) => localStorage.getItem(key), guestKey),
    ).toBeNull();
    await panel.click("button", "Sign out here");
    await panel.find("button", "Sign in");
    expect(await browser.storage()).toEqual({
      [guestKey]: {
        language: "en",
        citationStyle: "vancouver",
        theme: "system",
      },
    });
    expect(
      await page.evaluate((key) => localStorage.getItem(key), guestKey),
    ).toBeNull();
    await panel.reload();
    await panel.find("button", "Sign in");
    expect(
      await panel.evaluate('document.querySelectorAll("select")[1].value'),
    ).toBe("vancouver");
  } finally {
    panel?.detach();
    await browser?.close();
    await build.remove();
  }
});

test("registration transports the current client Preferences, including changes made after requesting a code", async ({
  page,
}) => {
  await page.goto("/");
  await style(page).selectOption("din-iso-690");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Email address", { exact: true }).fill(account.email);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await language(page).selectOption("de");
  await page.getByLabel("Sechsstelliger Code", { exact: true }).fill("123456");
  await page
    .getByRole("button", { name: "Code bestätigen", exact: true })
    .click();
  await expect(page.getByText(account.email, { exact: true })).toBeVisible();
  expect(registration).toEqual({
    language: "de",
    citationStyle: "din-iso-690",
  });
  // This fixture represents an existing Account: it must remain authoritative.
  await expect(style(page)).toHaveValue("ieee");
});
