// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
import {
  createServer,
  type Server,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildExtension } from "../e2e/support/build.ts";
import { launchFirefox } from "../e2e/support/firefox.ts";
import { launchChromium, until, type Panel } from "../e2e/support/chromium.ts";

import {
  startExtensionVerificationApi,
  extensionFixtureJwks,
  extensionFixtureToken,
  extensionFixtureQuota,
} from "../../server/test/support/extension-api.ts";
let api: Awaited<ReturnType<typeof startExtensionVerificationApi>>;
test.beforeAll(async () => {
  api = await startExtensionVerificationApi();
});
test.afterAll(async () => {
  await api?.stop();
});
const servicePort = Number(
  process.env.SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT ?? 4602,
);
const webPort = Number(process.env.SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT ?? 5361);
const apiPort = Number(process.env.SOURCE_TASTER_ACCOUNT_TEST_API_PORT ?? 4601);
const credential = "extension-session-" + "s".repeat(43);
const transaction = "transaction-" + "t".repeat(43);
const account = {
  accountId: "11111111-1111-4111-8111-111111111111",
  ownerId: "22222222-2222-4222-8222-222222222222",
  email: "reader@example.org",
};
const key = "source-taster-extension-session-v1";
const guestKey = "source-taster-guest-id-v1";
const guestId = "44444444-4444-4444-8444-444444444444";

async function withPanel(
  run: (tools: {
    panel: Panel;
    browser: Awaited<ReturnType<typeof launchChromium>>;
    requests: { path: string; auth?: string; body: unknown }[];
    state: {
      unavailable: boolean | "missing";
      denied: boolean;
      expiredToken: boolean;
      authority: boolean;
    };
    allowOrigin: (value: string) => void;
    restart: () => Promise<{
      panel: Panel;
      browser: Awaited<ReturnType<typeof launchChromium>>;
    }>;
  }) => Promise<void>,
  enabled = true,
) {
  const requests: { path: string; auth?: string; body: unknown }[] = [];
  const state: {
    unavailable: boolean | "missing";
    denied: boolean;
    expiredToken: boolean;
    authority: boolean;
  } = {
    unavailable: false,
    denied: false,
    expiredToken: false,
    authority: false,
  };
  let preferences = { language: "en", citationStyle: "apa" };
  const origins = new Set<string>();
  const quota = extensionFixtureQuota();
  const respond = async (req: IncomingMessage, res: ServerResponse) => {
    if (origins.has(req.headers.origin ?? "")) {
      res.setHeader("access-control-allow-origin", req.headers.origin!);
      res.setHeader("access-control-allow-credentials", "true");
    }
    res.setHeader(
      "access-control-allow-headers",
      "authorization, content-type, x-source-taster-client",
    );
    res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
    res.setHeader("cache-control", "no-store");
    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }
    let body = "";
    for await (const chunk of req) body += String(chunk);
    requests.push({
      path: req.url!,
      auth: req.headers.authorization,
      body: body ? JSON.parse(body) : null,
    });
    if (req.url?.startsWith("/v1/extension/"))
      expect(req.headers.cookie).toBeUndefined();
    if (req.url === "/v1/session" || req.url === "/v1/session/activity") {
      res.setHeader("content-type", "application/json");
      if (!req.headers.cookie?.includes("st98_web=active")) {
        res.statusCode = 401;
        res.end("{}");
      } else
        res.end(
          JSON.stringify({
            data: account,
            quota: { status: "not-implemented" },
          }),
        );
      return;
    }
    if (req.url === "/v1/sign-in/challenges") {
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          data: {
            challengeId: "33333333-3333-4333-8333-333333333333",
            expiresIn: 300,
            resendAfter: 60,
          },
          quota: { status: "not-implemented" },
        }),
      );
      return;
    }
    if (req.url === "/v1/sign-in/confirm") {
      preferences = (JSON.parse(body) as { preferences: typeof preferences })
        .preferences;
      res.setHeader(
        "set-cookie",
        "st98_web=active; Path=/; HttpOnly; Secure; SameSite=Strict",
      );
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({ data: account, quota: { status: "not-implemented" } }),
      );
      return;
    }
    if (req.url === "/.well-known/jwks.json") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(extensionFixtureJwks));
      return;
    }
    if (req.url?.startsWith("/internal/quota/")) {
      // #99: hosted Check creation reserves Quota fail-closed at the service.
      const answer = quota(req.url, body, state.authority);
      res.setHeader("content-type", "application/json");
      if (answer === undefined) res.statusCode = 404;
      res.end(JSON.stringify(answer ?? {}));
      return;
    }
    if (req.url === "/internal/account-authority") {
      res.setHeader("content-type", "application/json");
      // The public API must obey current authority, including valid signed JWTs.
      res.end(
        JSON.stringify(
          state.authority
            ? { allowed: true, version: 1 }
            : { allowed: false, reason: "forbidden" },
        ),
      );
      return;
    }
    if (req.url === "/v1/preferences") {
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          data: preferences,
          quota: { status: "not-implemented" },
        }),
      );
      return;
    }
    let data: unknown = account;
    let status = 200;
    if (state.unavailable) status = state.unavailable === "missing" ? 404 : 503;
    else if (req.url === "/v1/extension/preferences") data = preferences;
    else if (req.url === "/v1/extension/sign-in/challenges")
      data = {
        challengeId: "33333333-3333-4333-8333-333333333333",
        expiresIn: 300,
        resendAfter: 60,
        transactionCredential: transaction,
      };
    else if (req.url === "/v1/extension/sign-in/confirm") {
      expect(JSON.parse(body)).toEqual({
        challengeId: "33333333-3333-4333-8333-333333333333",
        code: "123456",
        transactionCredential: transaction,
        preferences: {
          language: expect.stringMatching(/^(de|en)$/),
          citationStyle: "apa",
        },
      });
      preferences = (JSON.parse(body) as { preferences: typeof preferences })
        .preferences;
      data = { session: account, sessionCredential: credential };
    } else if (req.url === "/v1/extension/sign-out") data = { signedOut: true };
    else if (req.url === "/v1/extension/account-tokens") {
      if (state.denied) status = 401;
      data = {
        accessToken: extensionFixtureToken(account),
        tokenType: "Bearer",
        expiresIn: 300,
        expiresAt: new Date(
          Date.now() + (state.expiredToken ? -1000 : 300000),
        ).toISOString(),
      };
    } else if (req.url?.startsWith("/v2/")) status = 403;
    else if (!req.url?.startsWith("/v1/extension/")) status = 404;
    res.statusCode = status;
    res.setHeader(
      "content-type",
      status === 200 ? "application/json" : "application/problem+json",
    );
    res.end(
      JSON.stringify(
        status === 200
          ? { data, quota: { status: "not-implemented" } }
          : {
              type: "urn:source-taster:problem:forbidden",
              title: "Denied",
              status,
              code: "forbidden",
              i18nKey: "error_forbidden",
            },
      ),
    );
  };
  const failures: unknown[] = [];
  const servers: Server[] = [
    createServer((req, res) => {
      void respond(req, res).catch((error) => {
        failures.push(error);
        res.statusCode = 500;
        res.end("{}");
      });
    }),
  ];
  let build: Awaited<ReturnType<typeof buildExtension>> | undefined;
  let browser: Awaited<ReturnType<typeof launchChromium>> | undefined;
  let panel: Panel | undefined;
  const profile = await mkdtemp(join(tmpdir(), "st98-profile-"));
  try {
    for (const [index, server] of servers.entries()) {
      server.listen(servicePort + index, "127.0.0.1");
      await once(server, "listening");
    }
    build = await buildExtension("chromium", {
      SOURCE_TASTER_EXTENSION_MODE: "hosted",
      SOURCE_TASTER_EXTENSION_API_URL: `http://127.0.0.1:${apiPort}`,
      SOURCE_TASTER_EXTENSION_SERVICE_URL: `http://127.0.0.1:${servicePort}`,
      SOURCE_TASTER_EXTENSION_WEBSITE_URL: `http://127.0.0.1:${webPort}`,
      ...(enabled
        ? { SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled" }
        : {}),
    });
    browser = await launchChromium(build.outDir, profile);
    origins.add(browser.origin);
    await browser.setStorage({ [guestKey]: guestId });
    panel = await browser.openPanel();
    await run({
      panel,
      browser,
      requests,
      state,
      allowOrigin: (value) => {
        origins.add(value);
      },
      restart: async () => {
        panel?.detach();
        await browser!.close();
        browser = await launchChromium(build!.outDir, profile);
        origins.add(browser.origin);
        panel = await browser.openPanel();
        return { panel, browser };
      },
    });
    expect(failures).toEqual([]);
  } finally {
    panel?.detach();
    await browser?.close();
    await build?.remove();
    await rm(profile, { recursive: true, force: true });
    for (const server of servers)
      if (server.listening)
        await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
async function signIn(panel: Panel) {
  await panel.click("button", "Sign in");
  await panel.fill("textbox", "Email address", account.email);
  await panel.click("button", "Send code");
  await panel.fill("textbox", "Six-digit code", "123456");
  await panel.click("button", "Confirm code");
  await panel.waitForText("main", undefined, account.email);
}

test("native sign-in persists only the opaque extension credential, clears Guest input and survives panel reload", async () => {
  await withPanel(async ({ panel, browser, requests }) => {
    await panel.fill("textbox", "Reference", "Guest content must not transfer");
    await signIn(panel);
    expect(await browser.storage()).toEqual({
      [guestKey]: guestId,
      [key]: credential,
    });
    expect(
      await panel.call(
        await panel.find("textbox", "Reference"),
        "function() { return this.value; }",
      ),
    ).toBe("");
    expect(
      await panel.evaluate("localStorage.length + sessionStorage.length"),
    ).toBe(0);
    await panel.reload();
    await panel.waitForText("main", undefined, account.email);
    expect(requests.find((r) => r.path === "/v1/extension/session")?.auth).toBe(
      `Bearer ${credential}`,
    );
    await panel.click("button", "Sign out here");
    await panel.find("button", "Sign in");
    expect(await browser.storage()).toEqual({
      [guestKey]: guestId,
      ["source-taster-guest-preferences-v1"]: {
        language: "en",
        citationStyle: "apa",
        theme: "system",
      },
    });
    expect(
      requests.find((r) => r.path === "/v1/extension/sign-out")?.body,
    ).toEqual({ everywhere: false });
  });
});

test("Account verification uses an in-memory access token; sign-out everywhere drops Account content", async () => {
  await withPanel(async ({ panel, browser, requests }) => {
    await signIn(panel);
    await panel.fill("textbox", "Reference", "Account private input");
    await panel.click("button", "Check Reference");
    await panel.waitForText("alert", undefined, /./);
    const verification = panel.requests.find((r) =>
      r.url.endsWith("/v2/structurings"),
    );
    expect(
      verification?.headers.Authorization ??
        verification?.headers.authorization,
    ).toMatch(/^Bearer ey/);
    expect(requests.some((r) => r.path === "/internal/account-authority")).toBe(
      true,
    );
    expect(
      panel.responses.find((r) => r.url.endsWith("/v2/structurings"))?.status,
    ).toBe(403);
    expect(await browser.storage()).toEqual({
      [guestKey]: guestId,
      [key]: credential,
    });
    await panel.click("button", "Sign out everywhere");
    await panel.find("button", "Sign in");
    expect(
      await panel.call(
        await panel.find("textbox", "Reference"),
        "function() { return this.value; }",
      ),
    ).toBe("");
    expect(
      requests.find((r) => r.path === "/v1/extension/sign-out")?.body,
    ).toEqual({ everywhere: true });
    expect(await browser.storage()).toEqual({
      [guestKey]: guestId,
      ["source-taster-guest-preferences-v1"]: {
        language: "en",
        citationStyle: "apa",
        theme: "system",
      },
    });
  });
});

test("another panel's sign-out clears the open panel and its unsent Account content", async () => {
  await withPanel(async ({ panel, browser }) => {
    await signIn(panel);
    await panel.fill(
      "textbox",
      "Reference",
      "Account input in another open panel",
    );
    await (
      await browser.serviceWorker()
    ).evaluate(async () => {
      const scope = globalThis as unknown as {
        chrome: { storage: { local: { remove(key: string): Promise<void> } } };
      };
      await scope.chrome.storage.local.remove(
        "source-taster-extension-session-v1",
      );
    });
    await panel.find("button", "Sign in");
    expect(
      await panel.call(
        await panel.find("textbox", "Reference"),
        "function() { return this.value; }",
      ),
    ).toBe("");
  });
});

test("an expired Account access token never reaches verification, including after Reset", async () => {
  await withPanel(async ({ panel, requests, state }) => {
    await signIn(panel);
    // #99 reads the Guest Quota before sign-in; only what follows counts.
    const mark = requests.length;
    state.expiredToken = true;
    await panel.fill("textbox", "Reference", "Expired token input");
    await panel.click("button", "Check Reference");
    await panel.waitForText("alert", undefined, /./);
    await panel.click("button", "Reset");
    await panel.fill("textbox", "Reference", "Retry expired token");
    await panel.click("button", "Check Reference");
    await panel.waitForText("alert", undefined, /./);
    expect(
      requests
        .slice(mark)
        .filter(
          (r) => r.path.startsWith("/v2/") || r.path === "/v1/guest-tokens",
        ),
    ).toEqual([]);
  });
});

test("revoked Account renewal stays denied after Reset and never changes into Guest", async () => {
  await withPanel(async ({ panel, requests, state, browser }) => {
    // #99 reads Account Quota as soon as the session is confirmed, so the
    // renewal is denied from that first read on.
    state.denied = true;
    await panel.click("button", "Sign in");
    await panel.fill("textbox", "Email address", account.email);
    await panel.click("button", "Send code");
    await panel.fill("textbox", "Six-digit code", "123456");
    await panel.click("button", "Confirm code");
    const mark = requests.length;
    await panel.waitForText(
      "main",
      undefined,
      "Your session has expired or was revoked. Sign in again to continue.",
    );
    await panel.click("button", "Reset");
    await panel.fill(
      "textbox",
      "Reference",
      "Reset cannot revive Account access",
    );
    await panel.click("button", "Check Reference");
    await panel.waitForText("alert", undefined, /./);
    expect(
      requests.filter((r) => r.path === "/v1/extension/account-tokens"),
    ).toHaveLength(1);
    expect(
      requests
        .slice(mark)
        .filter(
          (r) => r.path.startsWith("/v2/") || r.path === "/v1/guest-tokens",
        ),
    ).toEqual([]);
    expect(await browser.storage()).toEqual({
      [guestKey]: guestId,
      [key]: credential,
      ["source-taster-guest-preferences-v1"]: {
        language: "en",
        citationStyle: "apa",
        theme: "system",
      },
    });
  });
});

for (const failure of [true, "missing"] as const)
  test(`an unavailable service (${failure}) cannot complete sign-in or persist a session`, async () => {
    await withPanel(async ({ panel, requests, state, browser }) => {
      state.unavailable = failure;
      await panel.click("button", "Sign in");
      await panel.fill("textbox", "Email address", account.email);
      await panel.click("button", "Send code");
      await panel.waitForText(
        "alert",
        undefined,
        "Sign-in is temporarily unavailable. Try again shortly.",
      );
      expect(await browser.storage()).toEqual({ [guestKey]: guestId });
      expect(requests.some((r) => r.path.endsWith("/confirm"))).toBe(false);
      expect(await panel.query("button", "Sign out here")).toEqual([]);
    });
  });

test("extension sign-in remains gated off without explicit private-phase activation", async () => {
  await withPanel(async ({ panel, requests }) => {
    await panel.find("textbox", "Reference");
    expect(await panel.query("button", "Sign in")).toEqual([]);
    // #99: the Guest reads its Quota on load; nothing Account-related is asked.
    expect(
      requests.filter(
        (r) =>
          r.path !== "/v1/guest-tokens" &&
          !r.path.startsWith("/internal/quota/"),
      ),
    ).toEqual([]);
  }, false);
});

test("German native email-code controls support keyboard confirmation and scoped sign-out", async () => {
  await withPanel(async ({ panel, requests }) => {
    await panel.select("combobox", "Language", "de");
    await panel.click("button", "Anmelden");
    await panel.fill("textbox", "E-Mail-Adresse", account.email);
    await panel.click("button", "Code senden");
    await panel.fill("textbox", "Sechsstelliger Code", "123456");
    await panel.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Enter",
      code: "Enter",
      text: "\r",
      unmodifiedText: "\r",
      windowsVirtualKeyCode: 13,
    });
    await panel.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
    });
    await panel.waitForText("main", undefined, account.email);
    expect(requests.find((r) => r.path.endsWith("/challenges"))?.body).toEqual({
      email: account.email,
      language: "de",
    });
    expect(await panel.axe()).toEqual([]);
    await panel.click("button", "Hier abmelden");
    await panel.find("button", "Anmelden");
  });
});

test("Firefox's native sidebar uses the same cookie-free session transport without a service host permission", async () => {
  await withPanel(async ({ requests, allowOrigin }) => {
    const build = await buildExtension("firefox", {
      SOURCE_TASTER_EXTENSION_MODE: "hosted",
      SOURCE_TASTER_EXTENSION_API_URL: `http://127.0.0.1:${apiPort}`,
      SOURCE_TASTER_EXTENSION_SERVICE_URL: `http://127.0.0.1:${servicePort}`,
      SOURCE_TASTER_EXTENSION_WEBSITE_URL: `http://127.0.0.1:${webPort}`,
      SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
    });
    const firefox = await launchFirefox(build.outDir);
    try {
      test.info().annotations.push({
        type: "browser",
        description: `Firefox ${firefox.version}`,
      });
      await firefox.clickToolbarButton();
      const sidebar = await until(async () => {
        const current = await firefox.sidebar();
        return current.open && current.url ? current : false;
      }, "Firefox sidebar did not open");
      allowOrigin(new URL(sidebar.url!).origin);
      await firefox.click(await firefox.find("pushbutton", "Sign in"));
      await firefox.click(await firefox.find("entry", "Email address"));
      await firefox.type(account.email);
      await firefox.click(await firefox.find("pushbutton", "Send code"));
      await firefox.click(await firefox.find("entry", "Six-digit code"));
      await firefox.type("123456");
      await firefox.click(await firefox.find("pushbutton", "Confirm code"));
      await firefox.find("pushbutton", "Sign out here");
      await firefox.clickToolbarButton();
      await firefox.clickToolbarButton();
      await firefox.find("pushbutton", "Sign out here");
      expect(
        requests.find((r) => r.path === "/v1/extension/session")?.auth,
      ).toBe(`Bearer ${credential}`);
      await firefox.click(await firefox.find("pushbutton", "Sign out here"));
      await firefox.find("pushbutton", "Sign in");
    } finally {
      await firefox.close();
      await build.remove();
    }
  });
});

test("Account streams reconnect with memory tokens and generic permission cannot read another Owner's Check", async () => {
  await withPanel(async ({ panel, state, requests, browser }) => {
    state.authority = true;
    await signIn(panel);
    await panel.fill(
      "textbox",
      "Reference",
      "Doe, J. (2020). Signal maps. Example Press.",
    );
    await panel.click("button", "Check Reference");
    const creation = await until(
      () =>
        panel.responses.find(
          (response) =>
            response.url === `http://127.0.0.1:${apiPort}/v2/checks`,
        ),
      "Check creation did not answer",
    );
    expect(creation.status).toBe(201);
    await panel.waitForText("list", "References", /Queued|Running/);
    const created = panel.requests.find(
      (r) =>
        r.url === `http://127.0.0.1:${apiPort}/v2/checks` &&
        r.method === "POST",
    );
    expect(created).toBeDefined();
    const stream = await until(
      () => panel.requests.find((r) => /\/events(?:\?|$)/.test(r.url)),
      "Account stream did not open",
    );
    const checkId = new URL(stream.url).pathname.split("/")[3]!;
    const other = extensionFixtureToken({
      accountId: "66666666-6666-4666-8666-666666666666",
      ownerId: "77777777-7777-4777-8777-777777777777",
    });
    const foreign = await fetch(
      `http://127.0.0.1:${apiPort}/v2/checks/${checkId}`,
      {
        headers: {
          authorization: `Bearer ${other}`,
          "Source-Taster-Client": "extension/0.0.0",
        },
      },
    );
    expect(foreign.status).toBe(404);
    const count = panel.requests.filter((r) =>
      /\/events(?:\?|$)/.test(r.url),
    ).length;
    await api.restart();
    await until(
      () =>
        panel.requests.filter((r) => /\/events(?:\?|$)/.test(r.url)).length >
        count,
      "Account stream did not reconnect",
    );
    expect(
      panel.requests
        .filter((r) => /\/events(?:\?|$)/.test(r.url))
        .every((r) =>
          /^Bearer ey/.test(
            r.headers.Authorization ?? r.headers.authorization ?? "",
          ),
        ),
    ).toBe(true);
    state.authority = false;
    await panel.waitForText("alert", undefined, /./);
    expect(requests.some((r) => r.path === "/internal/account-authority")).toBe(
      true,
    );
    expect(await browser.storage()).toEqual({
      [guestKey]: guestId,
      [key]: credential,
    });
    await panel.click("button", "Reset");
    expect(await panel.query("list", "References")).toEqual([]);
  });
});

test("the actual web UI keeps #97 cookie transport while the native extension signs in separately", async () => {
  await withPanel(async ({ panel, browser, allowOrigin }) => {
    allowOrigin(`http://127.0.0.1:${webPort}`);
    const vite = spawn(
      process.execPath,
      [
        "node_modules/vite/bin/vite.js",
        "--config",
        "account-web.vite.config.ts",
      ],
      {
        cwd: new URL("..", import.meta.url),
        env: {
          PATH: process.env.PATH,
          SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT: String(servicePort),
          SOURCE_TASTER_ACCOUNT_TEST_API_PORT: String(apiPort),
          SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT: String(webPort),
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let output = "";
    vite.stdout.on("data", (b) => (output += String(b)));
    vite.stderr.on("data", (b) => (output += String(b)));
    const page = await browser.context.newPage();
    try {
      await until(async () => {
        if (vite.exitCode !== null) throw new Error(output);
        return fetch(`http://127.0.0.1:${webPort}`).then(
          (r) => r.ok,
          () => false,
        );
      }, "Web UI did not start");
      await page.goto(`http://127.0.0.1:${webPort}`);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await page
        .getByRole("textbox", { name: "Email address" })
        .fill(account.email);
      await page
        .getByRole("button", { name: "Send code", exact: true })
        .click();
      await page
        .getByRole("textbox", { name: "Six-digit code" })
        .fill("123456");
      await page
        .getByRole("textbox", { name: "Six-digit code" })
        .press("Enter");
      await expect(
        page.getByRole("button", { name: "Sign out here", exact: true }),
      ).toBeVisible();
      // A web cookie never automatically authenticates the extension.
      await panel.find("button", "Sign in");
      await signIn(panel);
      await panel.click("button", "Sign out here");
      await panel.find("button", "Sign in");
      await page.reload();
      await expect(
        page.getByRole("button", { name: "Sign out here", exact: true }),
      ).toBeVisible();
      // #99: the page first resolved as Guest and read its Quota, so only the
      // Guest ID may persist; no session, token or Account data.
      expect(
        (
          await page.evaluate(() => [
            ...Object.keys(localStorage),
            ...Object.keys(sessionStorage),
          ])
        ).filter((name) => name !== guestKey),
      ).toEqual([]);
    } finally {
      await page.close();
      if (vite.exitCode === null) {
        const exited = once(vite, "exit");
        vite.kill("SIGTERM");
        await exited;
      }
    }
  });
});

test("full extension-local storage cannot turn confirmation into successful sign-in", async () => {
  await withPanel(async ({ panel, browser, requests }) => {
    await (
      await browser.serviceWorker()
    ).evaluate(async () => {
      const local = (
        globalThis as unknown as {
          chrome: { storage: { local: { set(v: object): Promise<void> } } };
        }
      ).chrome.storage.local;
      let index = 0;
      for (let size = 1 << 20; size >= 1; size = Math.floor(size / 4))
        for (;;)
          try {
            await local.set({ [`filler-${index}`]: "x".repeat(size) });
            index++;
          } catch {
            break;
          }
    });
    await panel.click("button", "Sign in");
    await panel.fill("textbox", "Email address", account.email);
    await panel.click("button", "Send code");
    await panel.fill("textbox", "Six-digit code", "123456");
    await panel.click("button", "Confirm code");
    await panel.waitForText(
      "alert",
      undefined,
      "Sign-in is temporarily unavailable. Try again shortly.",
    );
    expect((await browser.storage())[key]).toBeUndefined();
    expect((await browser.storage())[guestKey]).toBe(guestId);
    expect(await panel.query("button", "Sign out here")).toEqual([]);
    expect(requests.find((r) => r.path.endsWith("/sign-out"))?.body).toEqual({
      everywhere: false,
    });
  });
});

test("browser restart restores only the extension session and never restores Check input", async () => {
  await withPanel(async ({ panel, restart }) => {
    await signIn(panel);
    await panel.fill(
      "textbox",
      "Reference",
      "Never persist this Account input",
    );
    const restored = await restart();
    await restored.panel.waitForText("main", undefined, account.email);
    expect(
      await restored.panel.call(
        await restored.panel.find("textbox", "Reference"),
        "function() { return this.value; }",
      ),
    ).toBe("");
    expect(await restored.browser.storage()).toEqual({
      [guestKey]: guestId,
      [key]: credential,
    });
  });
});

test("purchasing and Plan entries open the private web Order page without sending an extension credential", async () => {
  await withPanel(async ({ panel, requests }) => {
    const link = await panel.find("link", "Plans and Check packs on the web");
    expect(
      await panel.call(
        link,
        "function() { return {href:this.href,target:this.target,rel:this.rel}; }",
      ),
    ).toMatchObject({
      href: `http://127.0.0.1:${servicePort}/order?language=en`,
      target: "_blank",
      rel: "noopener noreferrer",
    });
    await panel.click("link", "Plans and Check packs on the web");
    await until(
      () => requests.some((r) => r.path === "/order?language=en"),
      "web Order page was not opened",
    );
    expect(requests.filter((r) => r.path.startsWith("/v1/commerce"))).toEqual(
      [],
    );
    expect(
      requests.find((r) => r.path === "/order?language=en")?.auth,
    ).toBeUndefined();
  });
});
