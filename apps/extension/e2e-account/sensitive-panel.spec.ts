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
import type { ServiceReply } from "../../server/test/support/account-api.ts";
import { extensionFixtureToken } from "../../server/test/support/extension-api.ts";
import { sensitiveService } from "../../server/test/support/sensitive-service.ts";
import {
  guestTokenReply,
  quotaReply,
  structuringReply,
} from "../../server/test/support/guest-start-stub.ts";

const secret = "extension-session-" + "s".repeat(43);
const sessionKey = "source-taster-extension-session-v1";
const guestKey = "source-taster-guest-id-v1";
const guestId = "44444444-4444-4444-8444-444444444444";
const servicePort = Number(
  process.env.SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT ?? 4902,
);
const apiPort = Number(process.env.SOURCE_TASTER_ACCOUNT_TEST_API_PORT ?? 4901);
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
    fake: Awaited<ReturnType<typeof sensitiveService>>;
    requests: {
      method: string;
      path: string;
      authorization?: string;
      cookie?: string;
    }[];
    /** Verification API requests (Quota reads, Check creation). */
    apiRequests: { method: string; path: string; authorization?: string }[];
    storage: () => Promise<Record<string, unknown>>;
  }) => Promise<void>,
) {
  const requests: {
    method: string;
    path: string;
    authorization?: string;
    cookie?: string;
  }[] = [];
  const apiRequests: {
    method: string;
    path: string;
    authorization?: string;
  }[] = [];
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers":
      "authorization, content-type, x-source-taster-client",
    "access-control-allow-methods": "GET, POST, OPTIONS",
  };
  // Stand-in verification API: only structuring and the Quota read are answered. Anything else
  // (such as Check creation) is refused, so no Check ever starts here.
  const api: Server = createServer((req, res) => {
    for (const [name, value] of Object.entries(cors))
      res.setHeader(name, value);
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      return void res.end();
    }
    apiRequests.push({
      method: req.method!,
      path: req.url!,
      authorization: req.headers.authorization,
    });
    res.setHeader("content-type", "application/json");
    if (req.method === "GET" && req.url === "/v2/quota")
      return void res.end(JSON.stringify(quotaReply()));
    if (req.method === "POST" && req.url === "/v2/structurings")
      return void res.end(JSON.stringify(structuringReply("Planck 1901")));
    res.statusCode = 503;
    res.end(JSON.stringify({ title: "Unavailable", status: 503 }));
  });
  api.listen(apiPort, "127.0.0.1");
  await once(api, "listening");
  const fake = await sensitiveService({
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
      // Guest token issuance, as the public service documents it.
      const guestToken = req.url === "/v1/guest-tokens";
      const reply: ServiceReply | undefined = guestToken
        ? req.method === "OPTIONS"
          ? { status: 204, headers: cors }
          : {
              status: 200,
              headers: { ...cors, "content-type": "application/json" },
              body: guestTokenReply(),
            }
        : await fake.handle(
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
  server.listen(servicePort, "127.0.0.1");
  await once(server, "listening");
  const profile = await mkdtemp(join(tmpdir(), "st102-profile-"));
  const build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_API_URL: `http://127.0.0.1:${apiPort}`,
    SOURCE_TASTER_EXTENSION_SERVICE_URL: `http://127.0.0.1:${servicePort}`,
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: `http://127.0.0.1:${apiPort}`,
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
      await run({
        panel,
        fake,
        requests,
        apiRequests,
        storage: () => browser.storage(),
      });
    } finally {
      panel.detach();
    }
  } finally {
    await browser.close();
    await fake.stop();
    await build.remove();
    await rm(profile, { recursive: true, force: true });
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
    api.closeAllConnections();
    await new Promise<void>((r) => api.close(() => r()));
  }
}

test("Account management links to private web without sending the extension credential", async () => {
  await withPanel({ sensitive: true }, async ({ panel, requests }) => {
    await panel.find("link", "Account security");
    expect(await panel.query("button", "Delete account")).toEqual([]);
    expect(await panel.query("button", "Change email address")).toEqual([]);
    expect(requests.some((r) => r.path.includes("/account/"))).toBe(false);
  });
});
test("the private-web Account link retains its host gate", async () => {
  await withPanel({ sensitive: false }, async ({ panel }) => {
    expect(await panel.query("link", "Account security")).toEqual([]);
  });
});
