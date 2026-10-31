// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { once } from "node:events";
import {
  accountSessionClient,
  extensionSessionClient,
} from "@source-taster/contract-service/client";

test("Account Preferences use partial validated writes and isolated web/extension credentials", async () => {
  const seen: { path: string; method: string; body: unknown; auth?: string }[] =
    [];
  const server = createServer((req, res) => {
    void (async () => {
      let raw = "";
      for await (const chunk of req) raw += String(chunk);
      seen.push({
        path: req.url!,
        method: req.method!,
        body: raw ? JSON.parse(raw) : null,
        auth: req.headers.authorization,
      });
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          data: { language: "de", citationStyle: "ieee" },
          quota: { status: "not-implemented" },
        }),
      );
    })();
  });
  server.listen(4802, "127.0.0.1");
  await once(server, "listening");
  try {
    const web = accountSessionClient({
      baseUrl: "http://127.0.0.1:4802",
      fetch: (url, init) => {
        expect(init?.credentials).toBe("include");
        expect(new Headers(init?.headers).has("authorization")).toBe(false);
        return fetch(url, init);
      },
    });
    expect(await web.preferences()).toEqual({
      language: "de",
      citationStyle: "ieee",
    });
    await web.updatePreferences({ language: "de" });
    const extension = extensionSessionClient({
      baseUrl: "http://127.0.0.1:4802",
      fetch: (url, init) => {
        expect(init?.credentials).toBe("omit");
        expect(init?.cache).toBe("no-store");
        expect(init?.redirect).toBe("error");
        return fetch(url, init);
      },
    });
    const secret = "s".repeat(43);
    await extension.preferences(secret);
    await extension.updatePreferences(secret, { citationStyle: "ieee" });
    await expect(web.updatePreferences({})).rejects.toThrow();
    await expect(
      web.updatePreferences({ language: undefined }),
    ).rejects.toThrow();
    // Runtime validation protects callers without TypeScript too.
    await expect(
      web.updatePreferences({ language: "fr" } as never),
    ).rejects.toThrow();
    await expect(
      web.updatePreferences({ citationStyle: "removed" } as never),
    ).rejects.toThrow();
    await expect(
      web.updatePreferences({ language: "en", guestId: "never" } as never),
    ).rejects.toThrow();
    expect(seen).toEqual([
      { path: "/v1/preferences", method: "GET", body: null, auth: undefined },
      {
        path: "/v1/preferences",
        method: "PATCH",
        body: { language: "de" },
        auth: undefined,
      },
      {
        path: "/v1/extension/preferences",
        method: "GET",
        body: null,
        auth: `Bearer ${secret}`,
      },
      {
        path: "/v1/extension/preferences",
        method: "PATCH",
        body: { citationStyle: "ieee" },
        auth: `Bearer ${secret}`,
      },
    ]);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
