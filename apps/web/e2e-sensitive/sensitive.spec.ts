// SPDX-License-Identifier: AGPL-3.0-or-later
// #102 public phase, web. The UI is exercised against the documented contract;
// fresh proof, session revocation and Owner tombstoning belong to the PRIVATE
// service and are NOT proven here (see docs/implementation/102-*.md).
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import {
  newAccount,
  startAccountApi,
} from "../../server/test/support/account-api.ts";
import { sensitiveService } from "../../server/test/support/sensitive-service.ts";

const secret = randomUUID();
const identity = { ...newAccount(), email: "reader@example.org" };
// A deleted Owner stays deleted, so every test signs in as a new Account.
let api: Awaited<ReturnType<typeof startAccountApi>>;
let fake: Awaited<ReturnType<typeof sensitiveService>>;
let enabled: { url: string; stop(): Promise<void> };
let gated: { url: string; stop(): Promise<void> };

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = (server.address() as { port: number }).port;
  await new Promise<void>((r) => server.close(() => r()));
  return port;
}
async function vite(flag: "enabled" | "disabled") {
  const port = await freePort();
  const child: ChildProcess = spawn(
    process.execPath,
    [
      new URL("../node_modules/vite/bin/vite.js", import.meta.url).pathname,
      "--config",
      new URL("./vite.config.ts", import.meta.url).pathname,
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: {
        PATH: process.env.PATH,
        NODE_ENV: "test",
        SOURCE_TASTER_API_URL: api.apiUrl,
        VITE_SOURCE_TASTER_MODE: "hosted",
        VITE_SOURCE_TASTER_SERVICE_URL: api.serviceUrl,
        VITE_SOURCE_TASTER_SENSITIVE_ACCOUNT_ACTIONS: flag,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  child.stderr!.on("data", (b) => (output += String(b)));
  const url = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 30000;
  for (;;) {
    if (child.exitCode !== null) throw new Error(output);
    if (
      await fetch(url).then(
        (r) => r.ok,
        () => false,
      )
    )
      break;
    if (Date.now() > deadline) throw new Error("Vite did not start");
    await new Promise((r) => setTimeout(r, 100));
  }
  return {
    url,
    stop: async () => {
      if (child.exitCode === null) {
        const exited = once(child, "exit");
        child.kill("SIGTERM");
        await exited;
      }
    },
  };
}
test.beforeAll(async () => {
  fake = await sensitiveService({
    prefix: "/v1",
    account: identity,
    secret,
    deleteOwner: (ownerId) => api.deleteOwner(ownerId),
    revoke: () => {
      api.state.allowed = false;
    },
  });
  api = await startAccountApi({
    worker: true,
    service: (request, tokens) => fake.handle(request, tokens),
  });
  enabled = await vite("enabled");
  gated = await vite("disabled");
});
test.afterAll(async () => {
  await enabled?.stop();
  await gated?.stop();
  await api?.stop();
  await fake?.stop();
});
test.beforeEach(() => {
  // Each test starts with a live session, no proof and the default behavior.
  Object.assign(identity, newAccount(), { email: "reader@example.org" });
  fake.reset();
  api.state.allowed = true;
});

for (const language of ["en", "de"] as const) {
  test(`Account management is a private-web link (${language})`, async ({
    page,
  }) => {
    await page.context().addCookies([
      {
        name: "st-fake",
        value: secret,
        url: api.serviceUrl,
        httpOnly: true,
        sameSite: "Strict",
      },
    ]);
    await page.goto(enabled.url);
    await expect(page.getByText(identity.email, { exact: true })).toBeVisible();
    await page
      .getByRole("combobox", { name: /Language|Sprache/ })
      .selectOption(language);
    const link = page.getByRole("link", {
      name: language === "de" ? "Kontosicherheit" : "Account security",
      exact: true,
    });
    await expect(link).toHaveAttribute(
      "href",
      `${api.serviceUrl}/account?language=${language}`,
    );
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(
      page.getByRole("button", { name: "Delete Account", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Change email address", exact: true }),
    ).toHaveCount(0);
  });
}
test("disabled Account management remains gated", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "st-fake",
      value: secret,
      url: api.serviceUrl,
      httpOnly: true,
      sameSite: "Strict",
    },
  ]);
  await page.goto(gated.url);
  await expect(page.getByText(identity.email, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Account security", exact: true }),
  ).toHaveCount(0);
});
