// SPDX-License-Identifier: AGPL-3.0-or-later
// #102 public phase: exact contract/client adapter-edge behavior of the five
// sensitive-action calls for both transports, plus the typed failure mapping.
// The server here is a recording HTTP edge, not the private service.
import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { once } from "node:events";
import * as clients from "@source-taster/contract-service/client";
import * as contract from "@source-taster/contract-service";
import { routes } from "@source-taster/contract-service/routes";

const port = 4902;
const base = `http://127.0.0.1:${port}`;
const credential = "s".repeat(43);
const account = {
  accountId: "11111111-1111-4111-8111-111111111111",
  ownerId: "22222222-2222-4222-8222-222222222222",
  email: "new@example.org",
};
const challengeId = "33333333-3333-4333-8333-333333333333";

async function edge(
  answer: (path: string) => { status: number; body: unknown },
) {
  const seen: {
    method: string;
    path: string;
    authorization?: string;
    cookie?: string;
    body: unknown;
  }[] = [];
  const server = createServer((req, res) => {
    void (async () => {
      let body = "";
      for await (const chunk of req) body += String(chunk);
      seen.push({
        method: req.method!,
        path: req.url!,
        authorization: req.headers.authorization,
        cookie: req.headers.cookie,
        body: body ? JSON.parse(body) : null,
      });
      const reply = answer(req.url!);
      res.statusCode = reply.status;
      res.setHeader(
        "content-type",
        reply.status === 200 ? "application/json" : "application/problem+json",
      );
      res.end(JSON.stringify(reply.body));
    })().catch(() => {
      res.statusCode = 500;
      res.end("{}");
    });
  });
  server.listen(port, "127.0.0.1");
  await once(server, "listening");
  return {
    seen,
    close: () => new Promise<void>((r) => server.close(() => r())),
  };
}
const ok = (data: unknown) => ({
  status: 200,
  body: { data, quota: { status: "not-implemented" } },
});
function success(path: string) {
  if (path.endsWith("/fresh-proof/challenges"))
    return ok({
      challengeId,
      action: "account-deletion",
      expiresIn: 300,
      resendAfter: 60,
    });
  if (path.endsWith("/fresh-proof/confirm"))
    return ok({
      action: "account-deletion",
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      expiresIn: 300,
    });
  if (path.endsWith("/email-change/challenges"))
    return ok({ challengeId, expiresIn: 300, resendAfter: 60 });
  if (path.endsWith("/email-change/confirm")) return ok(account);
  return ok({ status: "deleted" });
}

test("web calls are cookie-only, exact and carry neither tokens nor URLs", async () => {
  const server = await edge(success);
  try {
    const web = clients.accountSessionClient({
      baseUrl: base,
      fetch: async (url, init) => {
        expect(init?.credentials).toBe("include");
        expect(init?.redirect).toBe("error");
        expect(init?.cache).toBe("no-store");
        expect(new Headers(init?.headers).has("authorization")).toBe(false);
        return fetch(url, init);
      },
    });
    const challenge = await web.sensitive.freshProofChallenge({
      action: "account-deletion",
      language: "de",
    });
    expect(challenge).toEqual({
      challengeId,
      action: "account-deletion",
      expiresIn: 300,
      resendAfter: 60,
    });
    const proof = await web.sensitive.freshProofConfirm({
      challengeId,
      code: "123456",
    });
    expect(proof.action).toBe("account-deletion");
    expect(proof).not.toHaveProperty("accessToken");
    await web.sensitive.emailChangeChallenge({
      newEmail: "new@example.org",
      language: "en",
    });
    expect(
      await web.sensitive.emailChangeConfirm({ challengeId, code: "654321" }),
    ).toEqual(account);
    expect(
      await web.sensitive.deleteAccount({
        billingRetentionAcknowledged: true,
        billingRetentionYears: 8,
      }),
    ).toEqual({ status: "deleted" });
    expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual([
      "POST /v1/account/fresh-proof/challenges",
      "POST /v1/account/fresh-proof/confirm",
      "POST /v1/account/email-change/challenges",
      "POST /v1/account/email-change/confirm",
      "POST /v1/account/deletion",
    ]);
    expect(server.seen.map((r) => r.body)).toEqual([
      { action: "account-deletion", language: "de" },
      { challengeId, code: "123456" },
      { newEmail: "new@example.org", language: "en" },
      { challengeId, code: "654321" },
      { billingRetentionAcknowledged: true, billingRetentionYears: 8 },
    ]);
    // Nothing in any URL: no query, no fragment, no code or token.
    expect(server.seen.every((r) => !/[?#]/.test(r.path))).toBe(true);
  } finally {
    await server.close();
  }
});

test("extension calls use only the extension session bearer and never cookies", async () => {
  const server = await edge(success);
  try {
    const client = clients.extensionSessionClient({
      baseUrl: base,
      fetch: async (url, init) => {
        expect(init?.credentials).toBe("omit");
        expect(init?.redirect).toBe("error");
        expect(init?.cache).toBe("no-store");
        return fetch(url, init);
      },
    });
    await client.sensitive.freshProofChallenge(credential, {
      action: "email-change",
      language: "en",
    });
    await client.sensitive.freshProofConfirm(credential, {
      challengeId,
      code: "123456",
    });
    await client.sensitive.emailChangeChallenge(credential, {
      newEmail: "new@example.org",
      language: "de",
    });
    expect(
      await client.sensitive.emailChangeConfirm(credential, {
        challengeId,
        code: "654321",
      }),
    ).toEqual(account);
    await client.sensitive.deleteAccount(credential, {
      billingRetentionAcknowledged: true,
      billingRetentionYears: 8,
    });
    expect(server.seen.map((r) => r.path)).toEqual([
      "/v1/extension/account/fresh-proof/challenges",
      "/v1/extension/account/fresh-proof/confirm",
      "/v1/extension/account/email-change/challenges",
      "/v1/extension/account/email-change/confirm",
      "/v1/extension/account/deletion",
    ]);
    expect(
      server.seen.every(
        (r) => r.authorization === `Bearer ${credential}` && !r.cookie,
      ),
    ).toBe(true);
    // A malformed session credential never leaves the process.
    await expect(
      client.sensitive.deleteAccount("short", {
        billingRetentionAcknowledged: true,
        billingRetentionYears: 8,
      }),
    ).rejects.toThrow();
    expect(server.seen).toHaveLength(5);
  } finally {
    await server.close();
  }
});

test("the destructive request cannot be built without the exact retention acknowledgement", async () => {
  const web = clients.accountSessionClient({ baseUrl: base });
  const bad = [
    { billingRetentionAcknowledged: false, billingRetentionYears: 8 },
    { billingRetentionAcknowledged: true, billingRetentionYears: 7 },
    { billingRetentionAcknowledged: true },
    { billingRetentionAcknowledged: true, billingRetentionYears: 8, x: 1 },
  ];
  for (const input of bad)
    await expect(web.sensitive.deleteAccount(input as never)).rejects.toThrow();
  expect(
    contract.AccountDeletionRequest.safeParse({
      billingRetentionAcknowledged: true,
      billingRetentionYears: 8,
    }).success,
  ).toBe(true);
  // Proof is never a value the client could hold: the response schema is strict.
  expect(
    contract.FreshProofResponse.safeParse({
      data: {
        action: "account-deletion",
        expiresAt: new Date().toISOString(),
        expiresIn: 300,
        proof: "token",
      },
    }).success,
  ).toBe(false);
  expect(
    contract.FreshProofChallengeResponse.safeParse({
      data: {
        challengeId,
        action: "email-change",
        expiresIn: 301,
        resendAfter: 60,
      },
    }).success,
  ).toBe(false);
});

test("failures are typed and a missing private implementation is unavailable, never success", async () => {
  const cases: [number, string | undefined, clients.SensitiveFailure][] = [
    [403, "fresh-proof-required", "proof-required"],
    [403, "forbidden", "session-ended"],
    [401, "unauthenticated", "session-ended"],
    [400, "fresh-proof-invalid", "proof-invalid"],
    [429, "fresh-proof-exhausted", "proof-exhausted"],
    [400, "email-change-invalid", "email-code-invalid"],
    [429, "rate-limited", "rate-limited"],
    [404, undefined, "unavailable"],
    [501, undefined, "unavailable"],
    [503, "authority-unavailable", "temporarily-unavailable"],
    [418, "other", "unknown"],
  ];
  for (const [status, code, kind] of cases) {
    const server = await edge(() => ({
      status,
      body: code
        ? {
            type: "about:blank",
            title: "x",
            status,
            code,
            i18nKey: `problem_${code.replaceAll("-", "_")}`,
          }
        : {},
    }));
    try {
      const web = clients.accountSessionClient({ baseUrl: base });
      const failure = await web.sensitive
        .deleteAccount({
          billingRetentionAcknowledged: true,
          billingRetentionYears: 8,
        })
        .then(
          () => "success" as const,
          (error: unknown) => clients.sensitiveFailure(error),
        );
      expect(failure, `${status} ${code}`).toBe(kind);
    } finally {
      await server.close();
    }
  }
  expect(clients.sensitiveFailure(new Error("network"))).toBe("unknown");
});

test("both transports are described by the generated route list", () => {
  const paths = routes.map((route) => `${route.method} ${route.path}`);
  for (const prefix of ["/v1", "/v1/extension"])
    for (const tail of [
      "fresh-proof/challenges",
      "fresh-proof/confirm",
      "email-change/challenges",
      "email-change/confirm",
      "deletion",
    ])
      expect(paths).toContain(`post ${prefix}/account/${tail}`);
});
