// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { once } from "node:events";
import * as clients from "@source-taster/contract-service/client";

test("extension session transport omits cookies and keeps credentials scoped to extension routes", async () => {
  const servicePort = Number(
    process.env.SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT ?? 4602,
  );
  const seen: { path: string; authorization?: string; body: unknown }[] = [];
  const account = {
    accountId: "11111111-1111-4111-8111-111111111111",
    ownerId: "22222222-2222-4222-8222-222222222222",
    email: "reader@example.org",
  };
  const credential = "s".repeat(43);
  const transactionCredential = "t".repeat(43);
  const server = createServer((req, res) => {
    void (async () => {
      let body = "";
      for await (const chunk of req) body += String(chunk);
      seen.push({
        path: req.url!,
        authorization: req.headers.authorization,
        body: body ? JSON.parse(body) : null,
      });
      const data = req.url?.endsWith("/challenges")
        ? {
            challengeId: "33333333-3333-4333-8333-333333333333",
            expiresIn: 300,
            resendAfter: 60,
            transactionCredential,
          }
        : req.url?.endsWith("/confirm")
          ? { session: account, sessionCredential: credential }
          : req.url?.endsWith("/sign-out")
            ? { signedOut: true }
            : req.url?.endsWith("/account-tokens")
              ? {
                  accessToken: "memory-only",
                  tokenType: "Bearer",
                  expiresIn: 300,
                  expiresAt: new Date(Date.now() + 300000).toISOString(),
                }
              : account;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ data, quota: { status: "not-implemented" } }));
    })().catch(() => {
      res.statusCode = 500;
      res.end("{}");
    });
  });
  server.listen(servicePort, "127.0.0.1");
  await once(server, "listening");
  try {
    const client = clients.extensionSessionClient({
      baseUrl: `http://127.0.0.1:${servicePort}`,
      fetch: async (url, init) => {
        expect(init?.credentials).toBe("omit");
        expect(init?.redirect).toBe("error");
        expect(init?.cache).toBe("no-store");
        return fetch(url, init);
      },
    });
    const challenge = await client.challenge({
      email: account.email,
      language: "en",
    });
    const confirmed = await client.confirm({
      challengeId: challenge.challengeId,
      code: "123456",
      transactionCredential: challenge.transactionCredential,
    });
    expect(confirmed.session).toEqual(account);
    expect(await client.session(confirmed.sessionCredential)).toEqual(account);
    expect((await client.token(credential)).accessToken).toBe("memory-only");
    await client.activity(credential);
    await client.signOut(credential, false);
    await client.signOut(credential, true);
    expect(seen.map((r) => r.path)).toEqual([
      "/v1/extension/sign-in/challenges",
      "/v1/extension/sign-in/confirm",
      "/v1/extension/session",
      "/v1/extension/account-tokens",
      "/v1/extension/session/activity",
      "/v1/extension/sign-out",
      "/v1/extension/sign-out",
    ]);
    expect(seen.slice(0, 2).map((r) => r.authorization)).toEqual([
      undefined,
      undefined,
    ]);
    expect(
      seen.slice(2).every((r) => r.authorization === `Bearer ${credential}`),
    ).toBe(true);
    expect(seen.slice(-2).map((r) => r.body)).toEqual([
      { everywhere: false },
      { everywhere: true },
    ]);
    const web = clients.accountSessionClient({
      baseUrl: `http://127.0.0.1:${servicePort}`,
      fetch: async (url, init) => {
        expect(init?.credentials).toBe("include");
        expect(new Headers(init?.headers).has("authorization")).toBe(false);
        return fetch(url, init);
      },
    });
    expect(await web.session()).toEqual(account);
    expect(seen.at(-1)?.path).toBe("/v1/session");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
