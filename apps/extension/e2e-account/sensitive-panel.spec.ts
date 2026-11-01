// SPDX-License-Identifier: AGPL-3.0-or-later
// #102 public phase, extension panel. Real extension build and Chromium; the
// private Account service exists only as an HTTP-edge fixture, so this proves
// the panel's gate, wording and local-state handling, not fresh proof or
// deletion in the private service.
import { test, expect } from "@playwright/test";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium, type Panel } from "../e2e/support/chromium.ts";
import { extensionFixtureToken } from "../../server/test/support/extension-api.ts";
import {
  codes,
  sensitiveService,
} from "../../server/test/support/sensitive-service.ts";

const secret = "extension-session-" + "s".repeat(43);
const sessionKey = "source-taster-extension-session-v1";
const guestKey = "source-taster-guest-id-v1";
const guestId = "44444444-4444-4444-8444-444444444444";
const account = {
  accountId: "11111111-1111-4111-8111-111111111111",
  ownerId: "22222222-2222-4222-8222-222222222222",
  sessionId: "55555555-5555-4555-8555-555555555555",
  email: "reader@example.org",
};

async function withPanel(
  flags: { sensitive: boolean },
  run: (tools: {
    panel: Panel;
    fake: ReturnType<typeof sensitiveService>;
    requests: {
      method: string;
      path: string;
      authorization?: string;
      cookie?: string;
    }[];
    storage: () => Promise<Record<string, unknown>>;
  }) => Promise<void>,
) {
  const requests: {
    method: string;
    path: string;
    authorization?: string;
    cookie?: string;
  }[] = [];
  const fake = sensitiveService({
    prefix: "/v1/extension",
    account,
    secret,
    deleteOwner: () => Promise.resolve({ status: 200 }),
    revoke: () => undefined,
  });
  const server: Server = createServer((req, res) => {
    void (async () => {
      let text = "";
      for await (const chunk of req) text += String(chunk);
      requests.push({
        method: req.method!,
        path: req.url!,
        authorization: req.headers.authorization,
        cookie: req.headers.cookie,
      });
      const reply = await fake.handle(
        {
          method: req.method!,
          url: req.url!,
          headers: req.headers,
          body: text ? (JSON.parse(text) as Record<string, unknown>) : {},
        },
        { token: () => extensionFixtureToken(account) },
      );
      // The panel's own preflight headers are allowed by the fake's CORS reply.
      if (req.method === "OPTIONS")
        res.setHeader(
          "access-control-allow-headers",
          "authorization, content-type, x-source-taster-client",
        );
      for (const [name, value] of Object.entries(reply?.headers ?? {}))
        if (name !== "access-control-allow-headers" || req.method !== "OPTIONS")
          res.setHeader(name, value);
      res.statusCode = reply?.status ?? 404;
      res.end(reply?.body === undefined ? "" : JSON.stringify(reply.body));
    })().catch(() => {
      res.statusCode = 500;
      res.end("{}");
    });
  });
  server.listen(4902, "127.0.0.1");
  await once(server, "listening");
  const profile = await mkdtemp(join(tmpdir(), "st102-profile-"));
  const build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_API_URL: "http://127.0.0.1:4901",
    SOURCE_TASTER_EXTENSION_SERVICE_URL: "http://127.0.0.1:4902",
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: "http://127.0.0.1:4901",
    SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
    ...(flags.sensitive
      ? { SOURCE_TASTER_EXTENSION_SENSITIVE_ACCOUNT_ACTIONS: "enabled" }
      : {}),
  });
  const browser = await launchChromium(build.outDir, profile);
  try {
    await browser.setStorage({ [guestKey]: guestId, [sessionKey]: secret });
    const panel = await browser.openPanel();
    try {
      await panel.waitForText("main", undefined, account.email);
      await run({ panel, fake, requests, storage: () => browser.storage() });
    } finally {
      panel.detach();
    }
  } finally {
    await browser.close();
    await build.remove();
    await rm(profile, { recursive: true, force: true });
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
}

test("the controls do not exist unless the host enabled the gate", async () => {
  await withPanel({ sensitive: false }, async ({ panel, requests }) => {
    expect(await panel.query("button", "Delete Account")).toEqual([]);
    expect(await panel.query("button", "Change email address")).toEqual([]);
    expect(requests.some((r) => r.path.includes("/account/"))).toBe(false);
  });
});

test("deletion asks for proof, shows the eight-year retention notice, and then removes the stored credential", async () => {
  await withPanel(
    { sensitive: true },
    async ({ panel, fake, requests, storage }) => {
      await panel.click("button", "Delete Account");
      expect(await panel.query("button", "Delete Account permanently")).toEqual(
        [],
      );
      await panel.click("button", "Send confirmation code");
      await panel.fill("textbox", "Six-digit code", codes.proof);
      await panel.click("button", "Confirm");
      await panel.waitForText("main", undefined, /kept for eight years/);
      const deleteButton = await panel.find(
        "button",
        "Delete Account permanently",
      );
      expect(
        await panel.call(deleteButton, "function() { return this.disabled; }"),
      ).toBe(true);
      await panel.click("checkbox", /billing records are kept for eight years/);
      await panel.click("button", "Delete Account permanently");
      await panel.waitForText("main", undefined, /Your Account was deleted/);
      // Local Account state is gone; Guest identity is untouched and not replaced.
      expect(await storage()).toEqual({ [guestKey]: guestId });
      const deletion = requests.find(
        (r) => r.method === "POST" && r.path.endsWith("/account/deletion"),
      );
      expect(deletion?.authorization).toBe(`Bearer ${secret}`);
      expect(requests.every((r) => !r.cookie)).toBe(true);
      expect(fake.state.live).toBe(false);
      expect(requests.some((r) => r.path.includes("guest-tokens"))).toBe(false);
    },
  );
});

test("a failed deletion keeps the stored credential and the signed-in panel", async () => {
  await withPanel({ sensitive: true }, async ({ panel, fake, storage }) => {
    fake.state.behavior = "fail";
    await panel.click("button", "Delete Account");
    await panel.click("button", "Send confirmation code");
    await panel.fill("textbox", "Six-digit code", codes.proof);
    await panel.click("button", "Confirm");
    await panel.click("checkbox", /billing records are kept for eight years/);
    await panel.click("button", "Delete Account permanently");
    await panel.waitForText("alert", undefined, /The Account was not deleted/);
    expect(await storage()).toEqual({
      [guestKey]: guestId,
      [sessionKey]: secret,
    });
    await panel.waitForText("main", undefined, account.email);
  });
});

test("a durable in-progress deletion removes the credential and does not turn the panel into Guest", async () => {
  await withPanel(
    { sensitive: true },
    async ({ panel, fake, requests, storage }) => {
      fake.state.behavior = "in-progress";
      await panel.click("button", "Delete Account");
      await panel.click("button", "Send confirmation code");
      await panel.fill("textbox", "Six-digit code", codes.proof);
      await panel.click("button", "Confirm");
      await panel.click("checkbox", /billing records are kept for eight years/);
      await panel.click("button", "Delete Account permanently");
      await panel.waitForText("main", undefined, /deletion is in progress/);
      expect(await storage()).toEqual({ [guestKey]: guestId });
      expect(requests.some((r) => r.path.includes("guest-tokens"))).toBe(false);
    },
  );
});
