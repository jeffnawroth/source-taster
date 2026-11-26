import {
  openPanelAccount,
  openWebAccount,
  openWebSignIn,
  panelAccountName,
} from "../e2e/support/account-entry.ts";
// SPDX-License-Identifier: AGPL-3.0-or-later
// Client race injection at the HTTP edge; Preferences persist in the real private service.
import type { Page } from "@playwright/test";
import type { Panel } from "../e2e/support/chromium.ts";
import {
  choosePreferencesOnWeb,
  expectPreferencesOnWeb,
} from "../e2e/support/workspace.ts";
import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import {
  bothPrograms,
  freePort,
} from "../../server/test/support/both-programs.ts";
let real: Awaited<ReturnType<typeof bothPrograms>>;
let realAccount: Awaited<ReturnType<typeof real.signIn>>;
// Only an old/removed-style response is injected: closed writes cannot create one.
let removedStyle = false;
async function preferences(method = "GET", body?: unknown) {
  const response = await fetch(real.serviceUrl + "/v1/preferences", {
    method,
    headers: {
      origin: "https://web.test.invalid",
      cookie: realAccount.cookie,
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`real-preferences-${response.status}`);
  return (
    (await response.json()) as {
      data: {
        language: string;
        citationStyle: string;
        theme: "system" | "light" | "dark";
      };
    }
  ).data;
}
const setStored = (body: unknown) => preferences("PATCH", body);
const readStored = () => preferences();
const account = {
  accountId: "11111111-1111-4111-8111-111111111111",
  ownerId: "22222222-2222-4222-8222-222222222222",
  email: "reader@example.org",
};
let signedIn = false;
let patches: unknown[] = [];
let registration: unknown;
let denied = false;
let logoutDenied = false;
let unavailable = false;
let reads = 0;
let holdRead: ((send: () => void) => void) | undefined;
let holdPatch: ((send: () => void) => void) | undefined;
const server = createServer((req, res) => {
  void (async () => {
    res.setHeader(
      "access-control-allow-origin",
      req.headers.origin ??
        `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT ?? 5381}`,
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
      if (logoutDenied) res.statusCode = 401;
      data = { signedOut: true };
    } else if (!signedIn || denied) res.statusCode = 401;
    else if (unavailable) res.statusCode = 503;
    else if (path === "/v1/preferences") {
      if (req.method === "PATCH") {
        patches.push(body);
      } else reads++;
      const current = await preferences(req.method, body);
      if (req.method === "PATCH") removedStyle = false;
      data = removedStyle
        ? { ...current, citationStyle: "removed-style" }
        : current;
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
  real = await bothPrograms({
    accounts: true,
    startWorker: false,
    apiPort: await freePort(),
    servicePort: await freePort(),
  });
  server.listen(
    Number(process.env.SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT ?? 4802),
    "127.0.0.1",
  );
  await once(server, "listening");
});
test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await real.stop();
});
test.beforeEach(async () => {
  realAccount = await real.signIn(
    `preferences-${randomUUID()}@example.invalid`,
  );
  await setStored({ language: "de", citationStyle: "ieee" });
  removedStyle = false;
  signedIn = false;
  patches = [];
  registration = undefined;
  denied = false;
  logoutDenied = false;
  unavailable = false;
  reads = 0;
  holdRead = undefined;
  holdPatch = undefined;
});
const guestKey = "source-taster-guest-preferences-v1";
async function signIn(page: Page) {
  await openWebSignIn(page);
  await page.getByLabel("Email address", { exact: true }).fill(account.email);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await page.getByLabel("Six-digit code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Confirm code", exact: true }).click();
  await expect(
    page.getByRole("button", { name: panelAccountName(account.email) }),
  ).toBeVisible();
}

test("Account appearance wins, stale reads cannot undo a toggle, and language writes preserve it", async ({
  page,
}) => {
  await setStored({ language: "en", theme: "dark" });
  signedIn = true;
  await page.addInitScript((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({ language: "en", citationStyle: "apa", theme: "system" }),
    );
  }, guestKey);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("textbox", { name: "Reference", exact: true })
    .fill("Unfinished reference");
  let release!: () => void;
  holdRead = (send) => {
    release = send;
  };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => !!release).toBe(true);
  await page
    .getByRole("button", { name: "Switch to light appearance" })
    .click();
  await expect.poll(() => patches).toEqual([{ theme: "light" }]);
  release();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("textbox", { name: "Reference", exact: true }),
  ).toHaveValue("Unfinished reference");
  await choosePreferencesOnWeb(page, { language: "de" });
  await expect
    .poll(readStored)
    .toEqual({ language: "de", citationStyle: "ieee", theme: "light" });
  await expectPreferencesOnWeb(page, { theme: "light" });
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      guestKey,
    ),
  ).toEqual({ language: "en", citationStyle: "apa", theme: "system" });
  await openWebAccount(page);
  await page
    .getByRole("button", { name: "Hier abmelden", exact: true })
    .click();
  await expect
    .poll(async () =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
        guestKey,
      ),
    )
    .toEqual({ language: "de", citationStyle: "ieee", theme: "light" });
});

test("existing Account wins, immediate partial changes never write Guest storage, sign-out copies displayed values", async ({
  page,
}) => {
  await page.goto("/");
  await choosePreferencesOnWeb(page, { citationStyle: "oxford" });
  await signIn(page);
  await expectPreferencesOnWeb(page, { language: "de" });
  await expectPreferencesOnWeb(page, { citationStyle: "ieee" });
  expect(registration).toEqual({
    language: "en",
    citationStyle: "oxford",
    theme: "system",
  });
  await choosePreferencesOnWeb(page, { language: "en" });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect.poll(() => patches).toEqual([{ language: "en" }]);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      guestKey,
    ),
  ).toEqual({ language: "en", citationStyle: "oxford", theme: "system" });
  await openWebAccount(page);
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
  await expectPreferencesOnWeb(page, { language: "de" });
  await page
    .getByRole("textbox", { name: "Referenz", exact: true })
    .fill("Unfinished bibliography");
  await setStored({ language: "en" });
  removedStyle = true;
  const before = reads;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => reads).toBeGreaterThan(before);
  await expectPreferencesOnWeb(page, { language: "en" });
  await expectPreferencesOnWeb(page, { citationStyle: "apa" });
  await expect(page.getByRole("status")).toContainText(
    "Your saved citation style is no longer available.",
  );
  await expect(
    page.getByRole("textbox", { name: "Reference", exact: true }),
  ).toHaveValue("Unfinished bibliography");
  expect(patches).toEqual([]);
  await choosePreferencesOnWeb(page, { citationStyle: "vancouver" });
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect
    .poll(async () => (await readStored()).citationStyle)
    .toBe("vancouver");
  await page.reload();
  await expectPreferencesOnWeb(page, { citationStyle: "vancouver" });
});

test("a delayed refocus read cannot undo a later edit or a newer refocus response", async ({
  page,
}) => {
  signedIn = true;
  await page.goto("/");
  await expectPreferencesOnWeb(page, { language: "de" });
  let release!: () => void;
  holdRead = (send) => {
    release = send;
  };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => !!release).toBe(true);
  await choosePreferencesOnWeb(page, { language: "en" });
  await choosePreferencesOnWeb(page, { citationStyle: "oxford" });
  await expect.poll(() => patches.length).toBe(2);
  release();
  await page.waitForLoadState("networkidle");
  await expectPreferencesOnWeb(page, { language: "en" });
  await expectPreferencesOnWeb(page, { citationStyle: "oxford" });
  let older!: () => void;
  holdRead = (send) => {
    older = send;
  };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => !!older).toBe(true);
  await setStored({ language: "de", citationStyle: "acs" });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expectPreferencesOnWeb(page, { citationStyle: "acs" });
  older();
  await page.waitForLoadState("networkidle");
  await expectPreferencesOnWeb(page, { language: "de" });
  await expectPreferencesOnWeb(page, { citationStyle: "acs" });
});

test("rapid per-field writes remain immediate and refocus waits for pending writes", async ({
  page,
}) => {
  signedIn = true;
  await page.goto("/");
  await expectPreferencesOnWeb(page, { citationStyle: "ieee" });
  let release!: () => void;
  holdPatch = (send) => {
    release = send;
  };
  await choosePreferencesOnWeb(page, { language: "en" });
  await expect.poll(() => !!release).toBe(true);
  await choosePreferencesOnWeb(page, { citationStyle: "oxford" });
  await choosePreferencesOnWeb(page, { citationStyle: "vancouver" });
  await expectPreferencesOnWeb(page, { citationStyle: "vancouver" });
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
  await expectPreferencesOnWeb(page, { citationStyle: "vancouver" });
  await expectPreferencesOnWeb(page, { language: "en" });
});

test("unavailable Account writes remain separate from Guest storage; retry reads authority, expiry copies displayed values", async ({
  page,
}) => {
  signedIn = true;
  await page.goto("/");
  await expectPreferencesOnWeb(page, { citationStyle: "ieee" });
  unavailable = true;
  await choosePreferencesOnWeb(page, { language: "en" });
  const preferenceAlert = page
    .getByRole("alert")
    .filter({ hasText: /Account preferences|Kontoeinstellungen/ });
  await expect(preferenceAlert).toContainText(
    "Account preferences could not be synchronised.",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), guestKey),
  ).toBeNull();
  unavailable = false;
  await page
    .getByRole("button", { name: "Retry session", exact: true })
    .click();
  await expectPreferencesOnWeb(page, { language: "de" });
  await expect(preferenceAlert).toHaveCount(0);
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
  await choosePreferencesOnWeb(page, { citationStyle: "oxford" });
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
  await expectPreferencesOnWeb(page, { citationStyle: "ieee" });
  let release!: () => void;
  await setStored({ language: "en", citationStyle: "acs" });
  holdRead = (send) => {
    release = send;
  };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => !!release).toBe(true);
  await openWebAccount(page);
  await page
    .getByRole("button", { name: "Hier abmelden", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Anmelden", exact: true }),
  ).toBeVisible();
  release();
  await page.waitForLoadState("networkidle");
  await expectPreferencesOnWeb(page, { language: "de" });
  await expectPreferencesOnWeb(page, { citationStyle: "ieee" });
  await page.reload();
  await expectPreferencesOnWeb(page, { citationStyle: "ieee" });
});

test("web and native Chromium panel share Account values on refocus while keeping Guest stores separate", async ({
  page,
}) => {
  const { buildExtension } = await import("../e2e/support/build.ts");
  const { launchChromium } = await import("../e2e/support/chromium.ts");
  const build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_API_URL: `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_API_PORT ?? 4801}`,
    SOURCE_TASTER_EXTENSION_SERVICE_URL: `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT ?? 4802}`,
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
    await panel.find("button", panelAccountName(account.email));
    expect(await panel.evaluate("document.documentElement.lang")).toBe("de");
    expect(await browser.storage()).toEqual({
      [sessionKey]: "s".repeat(43),
      [guestKey]: guestValues,
    });
    await page.goto("/");
    await expectPreferencesOnWeb(page, { language: "de" });
    await choosePreferencesOnWeb(page, { language: "en" });
    await choosePreferencesOnWeb(page, { citationStyle: "oxford" });
    await expect
      .poll(readStored)
      .toEqual({ language: "en", citationStyle: "oxford", theme: "system" });
    await panel.evaluate('window.dispatchEvent(new Event("focus"))');
    // The panel's Preferences live in its Preferences Dialog (ADR-0023).
    await panel.openPreferences();
    await expect
      .poll(() =>
        panel!
          .find("combobox", "Preferred citation style")
          .then((node) =>
            panel!.call(node, "function () { return this.value; }"),
          ),
      )
      .toBe("oxford");
    await panel.select("combobox", "Preferred citation style", "vancouver");
    await expect
      .poll(async () => (await readStored()).citationStyle)
      .toBe("vancouver");
    await panel.closePreferences();
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expectPreferencesOnWeb(page, { citationStyle: "vancouver" });
    expect(await browser.storage()).toEqual({
      [sessionKey]: "s".repeat(43),
      [guestKey]: guestValues,
    });
    expect(
      await page.evaluate((key) => localStorage.getItem(key), guestKey),
    ).toBeNull();
    await openPanelAccount(panel);
    await panel.click("button", "Sign out here");
    await panel.find("button", "Sign in");
    // #99 reads the Guest Quota on mount, so the panel may now hold its own
    // Guest ID; ADR-0023 only forbids keying Preferences to it.
    const signedOut = await browser.storage();
    const { "source-taster-guest-id-v1": guestId, ...rest } = signedOut;
    expect(rest).toEqual({
      [guestKey]: {
        language: "en",
        citationStyle: "vancouver",
        theme: "system",
      },
    });
    if (typeof guestId === "string")
      expect(JSON.stringify(rest[guestKey])).not.toContain(guestId);
    expect(
      await page.evaluate((key) => localStorage.getItem(key), guestKey),
    ).toBeNull();
    await panel.reload();
    await panel.find("button", "Sign in");
    await panel.openPreferences();
    expect(
      await panel.call(
        await panel.find("combobox", "Preferred citation style"),
        "function () { return this.value; }",
      ),
    ).toBe("vancouver");
    await panel.closePreferences();
  } finally {
    panel?.detach();
    await browser?.close();
    await build.remove();
  }
});

test("registration transports the current client Preferences, including changes made after requesting a code", async ({
  page,
}) => {
  const challenges: unknown[] = [];
  const confirmations: unknown[] = [];
  page.on("request", (request) => {
    if (request.method() !== "POST") return;
    if (request.url().endsWith("/v1/sign-in/challenges"))
      challenges.push(request.postDataJSON());
    if (request.url().endsWith("/v1/sign-in/confirm"))
      confirmations.push(request.postDataJSON());
  });
  await page.goto("/");
  await choosePreferencesOnWeb(page, { citationStyle: "din-iso-690" });
  await openWebSignIn(page);
  await page.getByLabel("Email address", { exact: true }).fill(account.email);
  const issued = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/v1/sign-in/challenges"),
  );
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  const challenge = (await (await issued).json()) as {
    data: { challengeId: string };
  };
  await page.getByLabel("Six-digit code", { exact: true }).fill("123456");
  const dialog = page.getByRole("dialog", { name: /^(Sign in|Anmelden)$/ });
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toBeHidden();
  // The full Preferences dialog is reachable while the transaction is hidden.
  await choosePreferencesOnWeb(page, { language: "de", theme: "dark" });
  await openWebSignIn(page);
  await expect(page.getByLabel("E-Mail-Adresse", { exact: true })).toHaveValue(
    account.email,
  );
  await expect(
    page.getByLabel("E-Mail-Adresse", { exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByLabel("Sechsstelliger Code", { exact: true }),
  ).toHaveValue("123456");
  // Both Preferences are also available inside the modal during the code phase.
  await dialog
    .getByRole("combobox", { name: "Sprache", exact: true })
    .selectOption("en");
  await dialog
    .getByRole("combobox", { name: "Appearance", exact: true })
    .selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await dialog
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("de");
  await dialog
    .getByRole("combobox", { name: "Darstellung", exact: true })
    .selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Code bestätigen", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: panelAccountName(account.email) }),
  ).toBeVisible();
  expect(challenges).toHaveLength(1);
  expect(confirmations).toEqual([
    {
      challengeId: challenge.data.challengeId,
      code: "123456",
      preferences: {
        language: "de",
        citationStyle: "din-iso-690",
        theme: "dark",
      },
    },
  ]);
  expect(registration).toEqual({
    language: "de",
    citationStyle: "din-iso-690",
    theme: "dark",
  });
  // This fixture represents an existing Account: it must remain authoritative.
  await expectPreferencesOnWeb(page, { citationStyle: "ieee" });
});

test("Escape preserves a pending sign-in challenge, while Cancel discards it", async ({
  page,
}) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requested!: () => void;
  const requestStarted = new Promise<void>((resolve) => {
    requested = resolve;
  });
  let challenges = 0;
  await page.route("**/v1/sign-in/challenges", async (route) => {
    challenges++;
    requested();
    await held;
    await route.continue();
  });
  await page.goto("/");
  await openWebSignIn(page);
  await page.getByLabel("Email address", { exact: true }).fill(account.email);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await requestStarted;
  await page.keyboard.press("Escape");
  const dialog = page.getByRole("dialog", { name: "Sign in", exact: true });
  await expect(dialog).toBeHidden();
  release();
  await openWebSignIn(page);
  await expect(
    page.getByLabel("Six-digit code", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send a new code", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Cancel sign-in", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await openWebSignIn(page);
  await expect(page.getByLabel("Six-digit code", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByLabel("Email address", { exact: true })).toBeEnabled();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("another@example.org");
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await expect(
    page.getByLabel("Six-digit code", { exact: true }),
  ).toBeVisible();
  expect(challenges).toBe(2);
});

// The web cookie host has no subscription/replacement controls. Exercise the
// shared workspace through its real host seam, with a deferred transport reply.
async function signInLifecycleHost(page: Page) {
  await page.route("**/src/main.tsx", async (route) => {
    const response = await route.fetch();
    const source = await response.text();
    const imports = Array.from(
      source.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g),
      (match) => match[1]!,
    );
    const moduleUrl = (pattern: RegExp) => {
      const url = imports.find((value) => pattern.test(value));
      if (!url) throw new Error(`Missing lifecycle host import: ${pattern}`);
      return JSON.stringify(url);
    };
    await route.fulfill({
      response,
      body: `
        import React from ${moduleUrl(/\/react\.js/)};
        import ReactDOM from ${moduleUrl(/react-dom/)};
        import { AccountWorkspace } from ${moduleUrl(/web-account-workspace/)};
        import { loadGuestPreferences, webPreferenceStorage } from ${moduleUrl(/\/preferences/)};
        import ${moduleUrl(/style\.css/)};
        const storage = webPreferenceStorage();
        const initial = await loadGuestPreferences(storage, ["en"]);
        const previous = ${JSON.stringify(account)};
        const replacement = { ...previous, accountId: "44444444-4444-4444-8444-444444444444", email: "newer@example.org" };
        let session = null;
        let notify;
        let release;
        const makeClient = () => ({
          session: async () => session,
          subscribe: (changed) => {
            notify = changed;
            return () => { if (notify === changed) notify = undefined; };
          },
          challenge: async () => ({ challengeId: "held-challenge", resendAfter: 60 }),
          confirm: () => new Promise((resolve) => { release = () => resolve(previous); }),
          preferences: async () => initial.preferences,
          updatePreferences: async (patch) => ({ ...initial.preferences, ...patch }),
          activity: async () => session,
        });
        const guest = { credentials: async () => { throw new Error("No Check transport in lifecycle host"); } };
        function Host() {
          const [client, setClient] = React.useState(makeClient);
          const [settled, setSettled] = React.useState(false);
          return React.createElement(React.Fragment, null,
            React.createElement("button", { onClick: () => { session = replacement; notify(); } }, "Replace session"),
            React.createElement("button", { onClick: () => setClient(makeClient()) }, "Replace client"),
            React.createElement("button", { onClick: async () => {
              release();
              await new Promise((resolve) => setTimeout(resolve, 0));
              setSettled(true);
            } }, settled ? "Confirmation settled" : "Release confirmation"),
            React.createElement(AccountWorkspace, { initial, preferenceStorage: storage, client, guest }),
          );
        }
        ReactDOM.createRoot(document.getElementById("root")).render(
          React.createElement(React.StrictMode, null, React.createElement(Host)),
        );
      `,
    });
  });
  await page.goto("/");
  await openWebSignIn(page);
  await page.getByLabel("Email address", { exact: true }).fill(account.email);
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await page.getByLabel("Six-digit code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Confirm code", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Please wait…", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Sign in", exact: true }),
  ).toBeHidden();
}

for (const replacement of ["session", "client"] as const) {
  test(`a late confirmation cannot replace a newer ${replacement}`, async ({
    page,
  }) => {
    await signInLifecycleHost(page);
    await page
      .getByRole("button", { name: `Replace ${replacement}`, exact: true })
      .click();
    if (replacement === "session") {
      await expect(
        page.getByRole("button", {
          name: panelAccountName("newer@example.org"),
        }),
      ).toBeVisible();
    } else {
      await openWebSignIn(page);
      await expect(
        page.getByLabel("Email address", { exact: true }),
      ).toHaveValue("");
      await expect(
        page.getByLabel("Email address", { exact: true }),
      ).toBeEnabled();
      await page.keyboard.press("Escape");
    }
    await page
      .getByRole("textbox", { name: "Reference", exact: true })
      .fill("Keep the current workspace");
    await page
      .getByRole("button", { name: "Release confirmation", exact: true })
      .click();
    // Wait for the host to render after the confirmation's promise continuations;
    // a stale changed() would also erase the current workspace's unfinished input.
    await expect(
      page.getByRole("button", { name: "Confirmation settled", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Reference", exact: true }),
    ).toHaveValue("Keep the current workspace");
    await expect(
      page.getByRole("button", { name: panelAccountName(account.email) }),
    ).toHaveCount(0);
  });
}

test("closing a pending confirmation still completes the same sign-in", async ({
  page,
}) => {
  await signInLifecycleHost(page);
  await page
    .getByRole("button", { name: "Release confirmation", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: panelAccountName(account.email) }),
  ).toBeVisible();
});

test("an already expired sign-out copies last displayed values and announces session expiry", async ({
  page,
}) => {
  signedIn = true;
  await page.goto("/");
  await expectPreferencesOnWeb(page, { citationStyle: "ieee" });
  // Record foreground activity before the simulated server-side expiry.
  await choosePreferencesOnWeb(page, { language: "en" });
  await expect.poll(() => patches.length).toBe(1);
  logoutDenied = true;
  await openWebAccount(page);
  await page
    .getByRole("button", { name: "Sign out here", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: /session has expired/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      guestKey,
    ),
  ).toEqual({ language: "en", citationStyle: "ieee", theme: "system" });
});
