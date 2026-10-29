// SPDX-License-Identifier: AGPL-3.0-or-later
// Native #96 Guest acceptance: a real loaded extension, its real side panel,
// actual browser.storage.local and the actual API/worker/PostgreSQL/peer authority.
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { physicsReference } from "../../server/test/support/doi-fixtures.ts";
import { buildExtension } from "../e2e/support/build.ts";
import {
  launchChromium,
  until,
  type NativeChromium,
  type Panel,
} from "../e2e/support/chromium.ts";
import { evidence } from "../e2e/support/evidence.ts";
import {
  allowOrigins,
  bothPrograms,
  expireIssuedTokensIn,
  startHostedWeb,
  type Both,
  withoutCheckCreation,
} from "../e2e/support/hosted.ts";

const identityKey = "source-taster-guest-id-v1";
const preferencesKey = "source-taster-guest-preferences-v1";
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
let both: Both,
  web: Awaited<ReturnType<typeof startHostedWeb>>,
  build: Awaited<ReturnType<typeof buildExtension>>,
  origin: string;

async function launch(profile: string, locale = "en-GB") {
  return launchChromium(build.outDir, profile, locale);
}
async function withProfile<T>(run: (profile: string) => Promise<T>) {
  const profile = await mkdtemp(join(tmpdir(), "st92-guest-profile-"));
  try {
    return await run(profile);
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
}
async function native<T>(run: (browser: NativeChromium) => Promise<T>) {
  return withProfile(async (profile) => {
    const browser = await launch(profile);
    try {
      return await run(browser);
    } finally {
      await browser.close();
    }
  });
}
const alerts = (panel: Panel) =>
  panel.evaluate<string[]>(
    `[...document.querySelectorAll("[role=alert]")].map((e) => e.innerText)`,
  );
const issued = (panel: Panel) =>
  panel.requests
    .filter(
      (r) =>
        r.url === `${both.serviceUrl}/v1/guest-tokens` && r.method === "POST",
    )
    .map((r) => JSON.parse(r.postData!) as { guestId: string; client: string });
const bearer = (panel: Panel, suffix: string) =>
  panel.requests
    .filter((r) => r.url.startsWith(both.apiUrl) && r.url.endsWith(suffix))
    .map((r) => r.headers.Authorization ?? r.headers.authorization);
async function check(panel: Panel, name = "Check Reference") {
  await panel.fill("textbox", /^(Reference|Referenz)$/, physicsReference);
  await panel.click("button", name);
}
async function results(panel: Panel) {
  await panel.locate(`document.getElementById("results-title")`, 20_000);
}
async function panelPersistence(panel: Panel) {
  return panel.evaluate<{
    local: string[];
    session: string[];
    databases: number;
  }>(
    `(async () => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      databases: (await indexedDB.databases()).length,
    }))()`,
  );
}

test.beforeAll(async () => {
  test.setTimeout(180_000);
  both = await bothPrograms({ startWorker: false, clientLeaseMs: 1500 });
  web = await startHostedWeb(both);
  build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_API_URL: both.apiUrl,
    SOURCE_TASTER_EXTENSION_SERVICE_URL: both.serviceUrl,
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: web.url,
  });
  // The unpacked ID follows from the owned build path; read it from a browser.
  origin = await native((browser) => Promise.resolve(browser.origin));
  await allowOrigins(both, [web.url, origin]);
});
test.afterAll(async () => {
  await web?.stop();
  await both?.stop();
  await build?.remove();
});

test("the extension Guest ID persists in extension storage across panel close, reopen, reload and browser restart; tokens and Check content stay in memory", async () => {
  test.setTimeout(180_000);
  await withProfile(async (profile) => {
    let browser = await launch(profile);
    let id: string;
    try {
      let panel = await browser.openPanel();
      await check(panel);
      await results(panel);
      const [first] = issued(panel);
      expect(first?.client).toBe("extension");
      expect(first?.guestId).toMatch(uuid);
      id = first!.guestId;
      const stored = await browser.storage();
      expect(Object.keys(stored)).toEqual([identityKey]);
      expect(stored[identityKey]).toBe(id);
      const serialized = JSON.stringify(stored);
      for (const secret of ["eyJ", "accessToken", "Aspelmeyer"])
        expect(serialized).not.toContain(secret);
      expect(await panelPersistence(panel)).toEqual({
        local: [],
        session: [],
        databases: 0,
      });
      expect(await panel.axe()).toEqual([]);
      await panel.screenshot(evidence("chromium-guest-panel.png"));

      panel.detach();
      await browser.triggerAction();
      await until(
        async () => (await browser.panelTargets()).length === 0,
        "The side panel did not close",
      );
      panel = await browser.openPanel();
      expect(await panel.query("region", "Your Check")).toEqual([]);
      await check(panel, "Structure References");
      await panel.locate(
        `[...document.querySelectorAll("p, span, dd, li")].find((e) => e.textContent === "Measured measurement")`,
        20_000,
      );
      expect(issued(panel).map((r) => r.guestId)).toEqual([id]);

      await panel.reload();
      await check(panel);
      await results(panel);
      expect(
        issued(panel)
          .map((r) => r.guestId)
          .at(-1),
      ).toBe(id);
    } finally {
      await browser.close();
    }
    browser = await launch(profile);
    try {
      expect(browser.origin).toBe(origin);
      const panel = await browser.openPanel();
      expect(
        await panel.call(
          await panel.find("textbox", "Reference"),
          "function () { return this.value; }",
        ),
      ).toBe("");
      await check(panel);
      await results(panel);
      expect(issued(panel)).toEqual([{ guestId: id, client: "extension" }]);
      expect((await browser.storage())[identityKey]).toBe(id);
    } finally {
      await browser.close();
    }
  });
});

test("web and extension keep separate Guest IDs and Preferences in the same native profile", async () => {
  await native(async (browser) => {
    const panel = await browser.openPanel();
    await check(panel);
    await results(panel);
    const extension = issued(panel)[0]!;

    const page = await browser.context.newPage();
    const webIssued: { guestId: string; client: string }[] = [];
    page.on("request", (r) => {
      if (r.url() === `${both.serviceUrl}/v1/guest-tokens`)
        webIssued.push(r.postDataJSON() as { guestId: string; client: string });
    });
    await page.goto(web.url);
    await page.getByRole("combobox", { name: "Language" }).selectOption("de");
    await page.getByRole("textbox").fill(physicsReference);
    await page
      .getByRole("button", { name: "Referenz prüfen", exact: true })
      .click();
    await expect(page.locator("#results-title")).toBeVisible();
    const local = await page.evaluate((): Record<string, string> => ({
      ...localStorage,
    }));

    expect(webIssued).toEqual([{ guestId: local[identityKey], client: "web" }]);
    expect(local[identityKey]).toMatch(uuid);
    expect(local[identityKey]).not.toBe(extension.guestId);
    expect(JSON.parse(local[preferencesKey]!)).toMatchObject({
      language: "de",
    });
    const stored = await browser.storage();
    expect(stored[identityKey]).toBe(extension.guestId);
    expect(stored[preferencesKey]).toBeUndefined();
    expect(JSON.stringify(local)).not.toContain(extension.guestId);
    // The panel keeps its own language; the web choice does not reach it.
    expect(await panel.query("button", "Check Reference")).not.toEqual([]);
  });
});

test("an expiring Guest token is renewed for the same extension Guest ID and the protected event stream uses the current token", async () => {
  await native(async (browser) => {
    try {
      await renewal(browser);
    } finally {
      // Later cases start from a clock matching real time again.
      await both.advance(Date.now() - both.now());
    }
  });
});
async function renewal(browser: NativeChromium) {
  {
    const panel = await browser.openPanel();
    // Tokens issued now expire 40 s from now, inside the 30 s renewal margin
    // after about 10 s.
    await expireIssuedTokensIn(both, 40_000);
    await check(panel, "Structure References");
    await panel.locate(
      `[...document.querySelectorAll("p, span, dd, li")].find((e) => e.textContent === "Measured measurement")`,
      20_000,
    );
    const [structure] = bearer(panel, "/v1/structurings");
    expect(structure).toMatch(/^Bearer /);
    await new Promise((r) => setTimeout(r, 11_000));
    await both.advance(60_000);
    await check(panel);
    await results(panel);
    const ids = issued(panel);
    expect(ids).toHaveLength(2);
    expect(ids.every((r) => r.guestId === ids[0]!.guestId)).toBe(true);
    const [created] = bearer(panel, "/v2/checks");
    expect(created).toMatch(/^Bearer /);
    expect(created).not.toBe(structure);
    const events = await until(
      () => panel.requests.find((r) => r.url.endsWith("/events")),
      "The panel never opened the Check event stream",
    );
    expect(events.headers.Authorization ?? events.headers.authorization).toBe(
      created,
    );
    await until(
      () =>
        panel.responses.some((r) => r.url === events.url && r.status === 200),
      "The protected event stream was not accepted",
    );
    expect((await browser.storage())[identityKey]).toBe(ids[0]!.guestId);
  }
}

test("revocation stops lease renewal and later Checks fail closed without replacing the extension Guest ID", async () => {
  await native(async (browser) => {
    const panel = await browser.openPanel();
    await panel.select("combobox", "Language", "de");
    await check(panel, "Referenz prüfen");
    await results(panel);
    const id = issued(panel)[0]!.guestId;
    await until(
      () => bearer(panel, "/lease").length > 0,
      "No lease renewal",
      10_000,
    );
    await both.change(id, { revoke: true, client: "extension" });
    const alert = await panel.waitForText(
      "alert",
      undefined,
      (t) => t.length > 0,
      15_000,
    );
    await new Promise((r) => setTimeout(r, 300));
    const stopped = bearer(panel, "/lease").length;
    await new Promise((r) => setTimeout(r, 2_000));
    expect(bearer(panel, "/lease").length).toBe(stopped);

    // A new Check with the in-memory token is refused by the API.
    await panel.click("button", "Zurücksetzen");
    await check(panel, "Referenz prüfen");
    await until(
      () =>
        panel.responses.some(
          (r) => r.url === `${both.apiUrl}/v2/checks` && r.status === 403,
        ),
      "The API accepted a Check from a revoked Guest",
    );
    await until(
      async () =>
        (await alerts(panel)).includes(
          "Sie haben keine Berechtigung für diese Aktion.",
        ),
      "The refused Check was not reported",
    );
    // After a reload the token is gone and the authority refuses a new one for
    // the same Guest ID. Its 403 currently carries no CORS header, so the panel
    // can only report a failed connection (handoff: private peer); it still
    // fails closed: no token, no results, no other identity.
    const mark = panel.responses.length;
    await panel.reload();
    await check(panel, "Referenz prüfen");
    await until(
      async () => (await alerts(panel)).length > 0,
      "The refused token was not reported",
    );
    const tokens = `${both.serviceUrl}/v1/guest-tokens`;
    expect(
      panel.responses
        .slice(mark)
        .filter((r) => r.url === tokens && r.status === 200),
    ).toEqual([]);
    expect(issued(panel)).toEqual([
      { guestId: id, client: "extension" },
      { guestId: id, client: "extension" },
    ]);
    const denied = (await alerts(panel)).join(" | ");
    const stored = await browser.storage();
    expect(Object.keys(stored).sort()).toEqual(
      [identityKey, preferencesKey].sort(),
    );
    expect(stored[identityKey]).toBe(id);
    expect(
      await panel.evaluate(`document.getElementById("results-title") === null`),
    ).toBe(true);
    expect(await panel.axe()).toEqual([]);
    await panel.screenshot(evidence("chromium-guest-revoked-de.png"));
    test
      .info()
      .annotations.push(
        { type: "revocation alert", description: alert },
        { type: "refused token alert", description: denied },
      );
  });
});

for (const language of ["en", "de"] as const) {
  const deniedText =
    language === "en"
      ? "You do not have permission for this action."
      : "Sie haben keine Berechtigung für diese Aktion.";
  const checkName = language === "en" ? "Check Reference" : "Referenz prüfen";
  const structureName =
    language === "en" ? "Structure References" : "Referenzen strukturieren";
  const resetName = language === "en" ? "Reset" : "Zurücksetzen";
  test(`native extension ${language} token refusal is readable and latched without replacing identity`, async () => {
    await native(async (browser) => {
      const panel = await browser.openPanel();
      await panel.select("combobox", "Language", language);
      await check(panel, structureName);
      await panel.locate(
        `[...document.querySelectorAll("p, span, dd, li")].find((e) => e.textContent === "Measured measurement")`,
        20_000,
      );
      const id = issued(panel)[0]!.guestId;
      await both.change(id, { revoke: true, client: "extension" });
      await panel.reload();
      const mark = panel.requests.length;
      await check(panel, checkName);
      await until(
        async () => (await alerts(panel)).includes(deniedText),
        "The token refusal was not explained",
        10_000,
      );
      expect(
        panel.responses.some(
          (r) =>
            r.url === `${both.serviceUrl}/v1/guest-tokens` && r.status === 403,
        ),
      ).toBe(true);
      await panel.click("button", resetName);
      expect(await alerts(panel)).toEqual([]);
      await check(panel, checkName);
      await until(
        async () => (await alerts(panel)).includes(deniedText),
        "The latched refusal was not explained",
        10_000,
      );
      expect(issued(panel)).toEqual([
        { guestId: id, client: "extension" },
        { guestId: id, client: "extension" },
      ]);
      expect(
        panel.requests.slice(mark).filter((r) => r.url.startsWith(both.apiUrl)),
      ).toEqual([]);
      expect((await browser.storage())[identityKey]).toBe(id);
      expect(await panel.query("region", "Your Check")).toEqual([]);
      expect(await panel.axe()).toEqual([]);
      await panel.screenshot(
        evidence(`chromium-token-refused-${language}.png`),
      );
    });
  });
  test(`hosted web ${language} token refusal is readable and latched without replacing identity`, async ({
    page,
  }) => {
    const posts: { guestId: string; client: string }[] = [];
    const apiRequests: string[] = [];
    page.on("request", (r) => {
      if (
        r.url() === `${both.serviceUrl}/v1/guest-tokens` &&
        r.method() === "POST"
      )
        posts.push(r.postDataJSON() as { guestId: string; client: string });
      if (r.url().startsWith(`${web.url}/v`)) apiRequests.push(r.url());
    });
    await page.goto(web.url);
    await page
      .getByRole("combobox", { name: "Language" })
      .selectOption(language);
    await page.getByRole("textbox").fill(physicsReference);
    await page
      .getByRole("button", { name: structureName, exact: true })
      .click();
    await expect(
      page.getByText("Measured measurement", { exact: true }),
    ).toBeVisible();
    const id = posts[0]!.guestId;
    await both.change(id, { revoke: true, client: "web" });
    await page.reload();
    const mark = apiRequests.length;
    await page.getByRole("textbox").fill(physicsReference);
    await page.getByRole("button", { name: checkName, exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText(deniedText);
    await page.getByRole("button", { name: resetName, exact: true }).click();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await page.getByRole("textbox").fill(physicsReference);
    await page.getByRole("button", { name: checkName, exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText(deniedText);
    expect(posts).toEqual([
      { guestId: id, client: "web" },
      { guestId: id, client: "web" },
    ]);
    expect(apiRequests.slice(mark)).toEqual([]);
    expect(
      await page.evaluate(() =>
        localStorage.getItem("source-taster-guest-id-v1"),
      ),
    ).toBe(id);
    await expect(page.locator("#results-title")).toHaveCount(0);
  });
}

test("a Guest without Check creation permission is refused by the API in the native panel, keeping the same Guest ID", async () => {
  await native(async (browser) => {
    const panel = await browser.openPanel();
    await check(panel);
    await results(panel);
    const id = issued(panel)[0]!.guestId;
    await both.change(id, {
      permissions: withoutCheckCreation,
      client: "extension",
    });
    await panel.click("button", "Reset");
    const mark = panel.responses.length;
    await check(panel);
    await until(
      () =>
        panel.responses
          .slice(mark)
          .some(
            (r) => r.url === `${both.apiUrl}/v2/checks` && r.status === 403,
          ),
      "The API accepted a Check without permission",
    );
    await until(
      async () =>
        (await alerts(panel)).includes(
          "You do not have permission for this action.",
        ),
      "The refused Check was not reported",
    );
    expect(issued(panel).every((r) => r.guestId === id)).toBe(true);
    expect((await browser.storage())[identityKey]).toBe(id);
    expect(
      await panel.evaluate(`document.getElementById("results-title") === null`),
    ).toBe(true);
    expect(await panel.axe()).toEqual([]);
  });
});

for (const failure of ["corrupt", "full"] as const)
  test(`${failure} extension storage stops the Check with an explicit message and no fallback identity`, async () => {
    await native(async (browser) => {
      const worker = await browser.serviceWorker();
      if (failure === "corrupt")
        await browser.setStorage({ [identityKey]: "not-a-guest-id" });
      else
        // Fill the real 10 MB storage.local quota until even a short item fails.
        await worker.evaluate(async () => {
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
      const before = await browser.storage();
      const panel = await browser.openPanel();
      await check(panel);
      await until(
        async () =>
          (await alerts(panel)).includes(
            "Browser storage is required to keep your Guest identity. Allow local storage and try again.",
          ),
        "The storage failure was not reported",
      );
      await new Promise((r) => setTimeout(r, 500));
      expect(issued(panel)).toEqual([]);
      expect(
        panel.requests.filter((r) => r.url.startsWith(both.apiUrl)),
      ).toEqual([]);
      expect(
        await panel.evaluate(
          `document.getElementById("results-title") === null`,
        ),
      ).toBe(true);
      const after = await browser.storage();
      expect(after[identityKey]).toEqual(before[identityKey]);
      if (failure === "full") expect(identityKey in after).toBe(false);
      expect(await panelPersistence(panel)).toEqual({
        local: [],
        session: [],
        databases: 0,
      });
      expect(await panel.axe()).toEqual([]);
      await panel.screenshot(evidence(`chromium-guest-storage-${failure}.png`));
    });
  });

test("the production background denies extension-local storage to a test-only untrusted content script", async () => {
  const probe = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_API_URL: both.apiUrl,
    SOURCE_TASTER_EXTENSION_SERVICE_URL: both.serviceUrl,
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: web.url,
  });
  try {
    const manifestPath = join(probe.outDir, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<
      string,
      unknown
    >;
    expect(manifest.content_scripts).toBeUndefined();
    // Counterfactual probe only: production bundles/manifest contain no content
    // script. This owned temporary build adds one untrusted context so the real
    // background's restriction must deny an actual browser.storage operation.
    const target = new URL(web.url);
    manifest.content_scripts = [
      {
        matches: [`${target.protocol}//${target.hostname}/*`],
        js: ["untrusted-storage-probe.js"],
      },
    ];
    await writeFile(manifestPath, JSON.stringify(manifest));
    await writeFile(
      join(probe.outDir, "untrusted-storage-probe.js"),
      `
      void (async () => {
        let result;
        try {
          await chrome.storage.local.get("source-taster-guest-id-v1");
          result = "readable";
        } catch {
          result = "denied";
        }
        document.documentElement.dataset.st92StorageProbe = result;
      })();
    `,
    );
    await withProfile(async (profile) => {
      const browser = await launchChromium(probe.outDir, profile);
      try {
        await allowOrigins(both, [web.url, browser.origin]);
        const panel = await browser.openPanel();
        await check(panel, "Structure References");
        await panel.locate(
          `[...document.querySelectorAll("p, span, dd, li")].find((e) => e.textContent === "Measured measurement")`,
          20_000,
        );
        expect((await browser.storage())[identityKey]).toMatch(uuid);
        const page = await browser.context.newPage();
        await page.goto(web.url);
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.dataset.st92StorageProbe,
            ),
          )
          .toBe("denied");
      } finally {
        await browser.close();
      }
    });
  } finally {
    await allowOrigins(both, [web.url, origin]);
    await probe.remove();
  }
});

test("extension storage and pages stay in trusted extension contexts", async () => {
  await native(async (browser) => {
    const panel = await browser.openPanel();
    await check(panel);
    await results(panel);
    const worker = await browser.serviceWorker();
    // Observe persistence and available contexts without setting access policy.
    expect(
      await worker.evaluate(async () => {
        const chrome = (
          globalThis as unknown as {
            chrome: {
              storage: {
                sync: { get(k: null): Promise<object> };
              };
            };
          }
        ).chrome;
        return chrome.storage.sync.get(null);
      }),
    ).toEqual({});
    expect((await browser.contexts()).map((c) => c.contextType).sort()).toEqual(
      ["BACKGROUND", "SIDE_PANEL"],
    );
    const page = await browser.context.newPage();
    await page.goto(web.url);
    expect(
      await page.evaluate(async (origin) => {
        const scope = globalThis as unknown as {
          chrome?: { runtime?: { id?: string }; storage?: unknown };
        };
        const reach = async (path: string) => {
          try {
            await fetch(`${origin}/${path}`);
            return "reachable";
          } catch {
            return "blocked";
          }
        };
        return {
          runtime: scope.chrome?.runtime?.id ?? null,
          storage: scope.chrome?.storage === undefined,
          panel: await reach("panel.html"),
          manifest: await reach("manifest.json"),
        };
      }, browser.origin),
    ).toEqual({
      runtime: null,
      storage: true,
      panel: "blocked",
      manifest: "blocked",
    });
  });
});

test("a Guest token refused for the extension origin is reported without any fallback, and the same Guest ID works once allowed", async () => {
  await native(async (browser) => {
    await allowOrigins(both, [web.url]);
    try {
      const panel = await browser.openPanel();
      await check(panel);
      await until(
        async () => (await alerts(panel)).length > 0,
        "The refusal was not reported",
      );
      expect(await alerts(panel)).toEqual([
        "The connection failed. Please try again.",
      ]);
      expect(
        panel.requests.filter((r) => r.url.startsWith(both.apiUrl)),
      ).toEqual([]);
      const id = (await browser.storage())[identityKey];
      expect(id).toMatch(uuid);
      expect(issued(panel)).toEqual([{ guestId: id, client: "extension" }]);

      await allowOrigins(both, [web.url, browser.origin]);
      await panel.click("button", "Check Reference");
      await results(panel);
      expect(issued(panel).map((r) => r.guestId)).toEqual([id, id]);
      expect((await browser.storage())[identityKey]).toBe(id);
    } finally {
      await allowOrigins(both, [web.url, origin]);
    }
  });
});
