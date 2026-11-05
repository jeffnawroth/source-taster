// SPDX-License-Identifier: AGPL-3.0-or-later
// Firefox build of the real panel bundle, hosted on a loopback page with a fake
// `browser` namespace at the browser edge. Only the data collection permission
// and the private session service are faked; the panel code is the shipped
// bundle. The native Firefox prompt is covered in consent-native.spec.ts.
import { expect, test, type Page } from "@playwright/test";
import { createServer } from "node:http";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import type { AddressInfo } from "node:net";
import { buildExtension } from "../e2e/support/build.ts";
import {
  account,
  credential,
  startService,
} from "../e2e/support/preference-service.ts";

const guestKey = "source-taster-guest-preferences-v1";

/** The unpacked extension directory served as a plain loopback origin. */
async function serveDirectory(directory: string) {
  const types: Record<string, string> = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
  };
  const server = createServer((req, res) => {
    const path = new URL(req.url!, "http://x").pathname;
    readFile(join(directory, path))
      .then((content) => {
        res.setHeader("content-type", types[extname(path)] ?? "text/plain");
        res.end(content);
      })
      .catch(() => res.writeHead(404).end());
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

/** The extension namespace as the panel sees it, with a Firefox permissions
 * object whose answers and events the test controls. Each request records
 * whether the page had a live user activation when it was made. */
function installBrowser(options: {
  granted: string[];
  session?: string;
  promptAnswer: boolean;
  /** How permissions.getAll() behaves: at once, never, or when released. */
  lookup: "now" | "never" | "late";
}) {
  const local: Record<string, unknown> = {};
  if (options.session)
    local["source-taster-extension-session-v1"] = options.session;
  const changed = new Set<(c: object, area: string) => void>();
  const added = new Set<(p: object) => void>();
  const removed = new Set<(p: object) => void>();
  let granted = [...options.granted];
  const consent = {
    requests: [] as { request: unknown; activation: boolean }[],
    answer: options.promptAnswer,
    release() {},
    revoke() {
      granted = [];
      for (const l of removed)
        l({ data_collection: ["technicalAndInteraction"] });
    },
  };
  const port = {
    onMessage: { addListener() {}, removeListener() {} },
    onDisconnect: { addListener() {}, removeListener() {} },
    postMessage() {},
    disconnect() {},
  };
  (window as unknown as Record<string, unknown>).__consent = consent;
  (window as unknown as Record<string, unknown>).browser = {
    runtime: {
      id: "fake-extension",
      getURL: (path: string) => `${location.origin}/${path.replace(/^\//, "")}`,
      connect: () => port,
    },
    windows: { getCurrent: () => Promise.resolve({ id: 1 }) },
    storage: {
      local: {
        get: (key: string) =>
          Promise.resolve(key in local ? { [key]: local[key] } : {}),
        set: (values: Record<string, unknown>) => {
          Object.assign(local, values);
          for (const l of changed)
            l(
              Object.fromEntries(
                Object.entries(values).map(([k, v]) => [k, { newValue: v }]),
              ),
              "local",
            );
          return Promise.resolve();
        },
        remove: (key: string) => {
          delete local[key];
          return Promise.resolve();
        },
        dump: () => ({ ...local }),
      },
      onChanged: {
        addListener: (l: (c: object, area: string) => void) => changed.add(l),
        removeListener: (l: (c: object, area: string) => void) =>
          changed.delete(l),
      },
    },
    permissions: {
      getAll: () =>
        options.lookup === "never"
          ? new Promise(() => {})
          : options.lookup === "late"
            ? new Promise((resolve) => {
                consent.release = () =>
                  resolve({ data_collection: [...granted] });
              })
            : Promise.resolve({ data_collection: [...granted] }),
      request(request: { data_collection: string[] }) {
        consent.requests.push({
          request,
          activation: navigator.userActivation.isActive,
        });
        if (consent.answer) {
          granted = [...request.data_collection];
          for (const l of added) l(request);
        }
        return Promise.resolve(consent.answer);
      },
      onAdded: {
        addListener: (l: (p: object) => void) => added.add(l),
        removeListener: (l: (p: object) => void) => added.delete(l),
      },
      onRemoved: {
        addListener: (l: (p: object) => void) => removed.add(l),
        removeListener: (l: (p: object) => void) => removed.delete(l),
      },
    },
  };
}

async function withFirefoxPanel(
  options: {
    granted?: string[];
    signedIn?: boolean;
    promptAnswer?: boolean;
    lookup?: "now" | "never" | "late";
  },
  run: (tools: {
    page: Page;
    service: Awaited<ReturnType<typeof startService>>;
    consentRequests: () => Promise<{ request: unknown; activation: boolean }[]>;
    revoke: () => Promise<void>;
    releaseLookup: () => Promise<void>;
    stored: () => Promise<Record<string, unknown>>;
  }) => Promise<void>,
  page: Page,
) {
  const service = await startService();
  const build = await buildExtension("firefox", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_SERVICE_URL: service.url,
    SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
  });
  const files = await serveDirectory(build.outDir);
  try {
    await page.addInitScript(installBrowser, {
      granted: options.granted ?? [],
      session: (options.signedIn ?? true) ? credential : undefined,
      promptAnswer: options.promptAnswer ?? true,
      lookup: options.lookup ?? "now",
    });
    await page.goto(`${files.url}/panel.html`);
    await run({
      page,
      service,
      consentRequests: () =>
        page.evaluate(
          () =>
            (window as unknown as { __consent: { requests: never[] } })
              .__consent.requests,
        ),
      revoke: () =>
        page.evaluate(() =>
          (
            window as unknown as { __consent: { revoke(): void } }
          ).__consent.revoke(),
        ),
      releaseLookup: () =>
        page.evaluate(() =>
          (
            window as unknown as { __consent: { release(): void } }
          ).__consent.release(),
        ),
      stored: () =>
        page.evaluate(() =>
          (
            window as unknown as {
              browser: {
                storage: { local: { dump(): Record<string, unknown> } };
              };
            }
          ).browser.storage.local.dump(),
        ),
    });
  } finally {
    await files.close();
    await service.close();
    await build.remove();
  }
}

const style = (page: Page) => page.getByLabel("Preferred citation style");
const allow = (page: Page) =>
  page.getByRole("button", { name: "Allow Preferences sync" });

test.describe("Firefox Account Preferences sync consent", () => {
  test("without the grant, Preferences stay local and the service sees no Preferences request", async ({
    page,
  }) => {
    await withFirefoxPanel(
      {},
      async ({ service, stored }) => {
        await expect(allow(page)).toBeVisible();
        await expect(style(page)).toBeVisible();
        await style(page).selectOption("ieee");
        await expect(style(page)).toHaveValue("ieee");
        // Settle: a leaked request would arrive within the round trip.
        await page.waitForTimeout(500);
        expect(service.preferenceRequests()).toEqual([]);
        // The Account session itself works; only Preferences are held back.
        expect(service.requests.map((r) => r.path)).toContain(
          "/v1/extension/session",
        );
        await expect
          .poll(async () => (await stored())[guestKey])
          .toMatchObject({ citationStyle: "ieee" });
      },
      page,
    );
  });

  test("a sign-in without the grant registers without Preferences", async ({
    page,
  }) => {
    await withFirefoxPanel(
      { signedIn: false },
      async ({ service }) => {
        await page.getByRole("button", { name: "Sign in" }).click();
        await page.getByLabel("Email address").fill(account.email);
        await page.getByRole("button", { name: "Send code" }).click();
        await page.getByLabel("Six-digit code").fill("123456");
        await page.getByRole("button", { name: "Confirm code" }).click();
        await expect(page.getByText(account.email)).toBeVisible();
        const confirm = service.requests.find(
          (r) => r.path === "/v1/extension/sign-in/confirm",
        );
        expect(confirm?.body).toEqual({
          challengeId: "33333333-3333-4333-8333-333333333333",
          code: "123456",
          transactionCredential: "transaction-" + "t".repeat(43),
        });
        expect(service.preferenceRequests()).toEqual([]);
      },
      page,
    );
  });

  test("granting from the visible control asks only for technicalAndInteraction inside the click, then the Account values apply and edits sync", async ({
    page,
  }) => {
    await withFirefoxPanel(
      {},
      async ({ service, consentRequests }) => {
        await allow(page).click();
        await expect(page.getByRole("status")).toContainText(
          "Preferences sync is on",
        );
        expect(await consentRequests()).toEqual([
          {
            request: { data_collection: ["technicalAndInteraction"] },
            activation: true,
          },
        ]);
        // One read, applying the Account value, and nothing was written yet.
        await expect(style(page)).toHaveValue("chicago");
        expect(service.preferenceRequests().map((r) => r.method)).toEqual([
          "GET",
        ]);
        await style(page).selectOption("ieee");
        await expect
          .poll(() => service.preferenceRequests().map((r) => r.method))
          .toEqual(["GET", "PATCH"]);
        expect(service.preferenceRequests()[1]?.body).toEqual({
          citationStyle: "ieee",
        });
      },
      page,
    );
  });

  test("a denied prompt keeps Preferences local and says so", async ({
    page,
  }) => {
    await withFirefoxPanel(
      { promptAnswer: false },
      async ({ service, consentRequests }) => {
        await allow(page).click();
        await expect(page.getByRole("status")).toContainText(
          "Preferences sync was not allowed",
        );
        expect(await consentRequests()).toHaveLength(1);
        await style(page).selectOption("ieee");
        await page.waitForTimeout(500);
        expect(service.preferenceRequests()).toEqual([]);
        // The control stays available for another attempt.
        await expect(allow(page)).toBeVisible();
      },
      page,
    );
  });

  test("a sign-in with an existing grant registers with the current Preferences", async ({
    page,
  }) => {
    await withFirefoxPanel(
      { signedIn: false, granted: ["technicalAndInteraction"] },
      async ({ service }) => {
        await page.getByRole("button", { name: "Sign in" }).click();
        await page.getByLabel("Email address").fill(account.email);
        await page.getByRole("button", { name: "Send code" }).click();
        await page.getByLabel("Six-digit code").fill("123456");
        await page.getByRole("button", { name: "Confirm code" }).click();
        await expect(page.getByText(account.email)).toBeVisible();
        expect(
          service.requests.find(
            (r) => r.path === "/v1/extension/sign-in/confirm",
          )?.body,
        ).toMatchObject({ preferences: { citationStyle: "apa" } });
      },
      page,
    );
  });

  test("a grant that already exists syncs from the start", async ({ page }) => {
    await withFirefoxPanel(
      { granted: ["technicalAndInteraction"] },
      async ({ service }) => {
        await expect(style(page)).toHaveValue("chicago");
        await expect(allow(page)).toHaveCount(0);
        expect(service.preferenceRequests().map((r) => r.method)).toEqual([
          "GET",
        ]);
      },
      page,
    );
  });

  test("revoking the permission stops syncing at once; edits stay on the device", async ({
    page,
  }) => {
    await withFirefoxPanel(
      { granted: ["technicalAndInteraction"] },
      async ({ service, revoke, stored }) => {
        await expect(style(page)).toHaveValue("chicago");
        await style(page).selectOption("mla");
        await expect
          .poll(() => service.preferenceRequests().map((r) => r.method))
          .toEqual(["GET", "PATCH"]);
        await revoke();
        await expect(allow(page)).toBeVisible();
        await style(page).selectOption("ieee");
        // A refocus must not read either.
        await page.evaluate(() => window.dispatchEvent(new Event("focus")));
        await page.waitForTimeout(500);
        expect(service.preferenceRequests().map((r) => r.method)).toEqual([
          "GET",
          "PATCH",
        ]);
        await expect
          .poll(async () => (await stored())[guestKey])
          .toMatchObject({ citationStyle: "ieee" });
      },
      page,
    );
  });

  test("a permission lookup that never answers does not keep the panel from rendering, and nothing syncs", async ({
    page,
  }) => {
    await withFirefoxPanel(
      { granted: ["technicalAndInteraction"], lookup: "never" },
      async ({ service }) => {
        await expect(style(page)).toBeVisible();
        await expect(allow(page)).toBeVisible();
        await style(page).selectOption("ieee");
        await page.waitForTimeout(500);
        expect(service.preferenceRequests()).toEqual([]);
      },
      page,
    );
  });

  test("a late answer from the permission lookup then applies the grant", async ({
    page,
  }) => {
    await withFirefoxPanel(
      { granted: ["technicalAndInteraction"], lookup: "late" },
      async ({ service, releaseLookup }) => {
        await expect(allow(page)).toBeVisible();
        expect(service.preferenceRequests()).toEqual([]);
        await releaseLookup();
        await expect(allow(page)).toHaveCount(0);
        await expect(style(page)).toHaveValue("chicago");
        expect(service.preferenceRequests().map((r) => r.method)).toEqual([
          "GET",
        ]);
      },
      page,
    );
  });

  test("withdrawing the grant keeps the displayed Account values on the device without any further edit", async ({
    page,
  }) => {
    await withFirefoxPanel(
      { granted: ["technicalAndInteraction"] },
      async ({ revoke, stored }) => {
        await expect(style(page)).toHaveValue("chicago");
        await revoke();
        await expect(allow(page)).toBeVisible();
        await expect
          .poll(async () => (await stored())[guestKey])
          .toMatchObject({ language: "en", citationStyle: "chicago" });
      },
      page,
    );
  });

  test("a sign-in confirmed in the same turn as a withdrawal registers without Preferences", async ({
    page,
  }) => {
    await withFirefoxPanel(
      { signedIn: false, granted: ["technicalAndInteraction"] },
      async ({ service }) => {
        await page.getByRole("button", { name: "Sign in" }).click();
        await page.getByLabel("Email address").fill(account.email);
        await page.getByRole("button", { name: "Send code" }).click();
        await page.getByLabel("Six-digit code").fill("123456");
        // The click lands before React has rendered the withdrawal.
        await page.evaluate(() => {
          (
            window as unknown as { __consent: { revoke(): void } }
          ).__consent.revoke();
          [...document.querySelectorAll("button")]
            .find((b) => b.textContent === "Confirm code")!
            .click();
        });
        await expect(page.getByText(account.email)).toBeVisible();
        const confirm = service.requests.find(
          (r) => r.path === "/v1/extension/sign-in/confirm",
        );
        expect(confirm?.body).not.toHaveProperty("preferences");
      },
      page,
    );
  });
});
