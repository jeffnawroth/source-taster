// SPDX-License-Identifier: AGPL-3.0-or-later
// #102 public phase, web. The UI is exercised against the documented contract;
// fresh proof, session revocation and Owner tombstoning belong to the PRIVATE
// service and are NOT proven here (see docs/implementation/102-*.md).
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  newAccount,
  startAccountApi,
} from "../../server/test/support/account-api.ts";
import { physicsReference } from "../../server/test/support/doi-fixtures.ts";
import {
  codes,
  sensitiveService,
} from "../../server/test/support/sensitive-service.ts";

const secret = randomUUID();
const identity = { ...newAccount(), email: "reader@example.org" };
// A deleted Owner stays deleted, so every test signs in as a new Account.
let api: Awaited<ReturnType<typeof startAccountApi>>;
let fake: ReturnType<typeof sensitiveService>;
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
  fake = sensitiveService({
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
});
test.beforeEach(() => {
  // Each test starts with a live session, no proof and the default behavior.
  Object.assign(identity, newAccount(), { email: "reader@example.org" });
  fake.reset();
  api.state.allowed = true;
});

const text = {
  en: {
    security: "Account security",
    changeEmail: "Change email address",
    deleteAccount: "Delete Account",
    sendProof: "Send confirmation code",
    code: "Six-digit code",
    confirm: "Confirm",
    check: "Check Reference",
    deleteForever: "Delete Account permanently",
    retention: /kept for eight years/,
    ack: /billing records are kept for eight years/,
    deleted: /Your Account was deleted/,
    invalid: /The code is invalid, expired or already used/,
    notDeleted: /The Account was not deleted\. You are still signed in/,
    proofRequired: /A fresh confirmation is required/,
    unavailable: /This action is not available yet/,
  },
  de: {
    security: "Kontosicherheit",
    changeEmail: "E-Mail-Adresse ändern",
    deleteAccount: "Konto löschen",
    sendProof: "Bestätigungscode senden",
    code: "Sechsstelliger Code",
    confirm: "Bestätigen",
    check: "Referenz prüfen",
    deleteForever: "Konto endgültig löschen",
    retention: /acht Jahre aufbewahrt/,
    ack: /Abrechnungsdaten acht Jahre aufbewahrt werden/,
    deleted: /Ihr Konto wurde gelöscht/,
    invalid: /Der Code ist ungültig, abgelaufen oder bereits verwendet/,
    notDeleted:
      /Das Konto wurde nicht gelöscht\. Sie sind weiterhin angemeldet/,
    proofRequired: /Eine frische Bestätigung ist erforderlich/,
    unavailable: /Diese Aktion ist noch nicht verfügbar/,
  },
} as const;
type Language = keyof typeof text;

async function open(page: Page, language: Language, runCheck = false) {
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
  if (runCheck) {
    await page.locator("textarea").fill(physicsReference);
    await page
      .getByRole("button", { name: text[language].check, exact: true })
      .click();
    await expect(page.locator("#results-title")).toBeVisible();
  }
}
async function prove(page: Page, language: Language, action: string) {
  const t = text[language];
  await page.getByRole("button", { name: action, exact: true }).click();
  await page.getByRole("button", { name: t.sendProof, exact: true }).click();
  await page.getByLabel(t.code).fill(codes.proof);
  await page.getByRole("button", { name: t.confirm, exact: true }).click();
}
const owned = async () => {
  const db = await api.database();
  try {
    const result = await db.query(
      "SELECT owner_id FROM verification.owner_tombstones WHERE owner_id=$1",
      [identity.ownerId],
    );
    return result.rows as { owner_id: string }[];
  } finally {
    await db.end();
  }
};

for (const language of ["en", "de"] as const) {
  test.describe(language, () => {
    test.use({ locale: language });
    test("deletion first asks for fresh proof, then shows the retention notice, and a wrong code stays on the prompt", async ({
      page,
    }) => {
      const t = text[language];
      await open(page, language, true);
      await page
        .getByRole("button", { name: t.deleteAccount, exact: true })
        .click();
      // Before proof: the prompt names the address; no destructive control exists.
      await expect(page.getByText(identity.email).first()).toBeVisible();
      await expect(
        page.getByRole("button", { name: t.deleteForever, exact: true }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: t.sendProof, exact: true })
        .click();
      await page.getByLabel(t.code).fill("000000");
      await page.getByRole("button", { name: t.confirm, exact: true }).click();
      await expect(page.getByRole("alert")).toContainText(t.invalid);
      await expect(
        page.getByRole("button", { name: t.deleteForever, exact: true }),
      ).toHaveCount(0);
      await page.getByLabel(t.code).fill(codes.proof);
      await page.getByRole("button", { name: t.confirm, exact: true }).click();
      const notice = page.getByTestId("deletion-notice");
      await expect(notice).toContainText(t.retention);
      // The remaining Quota comes from the existing Quota read.
      await expect(notice).toContainText(/\b20\b/);
      const button = page.getByRole("button", {
        name: t.deleteForever,
        exact: true,
      });
      await expect(button).toBeDisabled();
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.getByLabel(t.ack).check();
      await expect(button).toBeEnabled();
      // Nothing destructive happened by only opening the dialog.
      expect(fake.state.calls.some((c) => c.endsWith("/deletion"))).toBe(false);
      expect(await owned()).toEqual([]);
    });
  });
}

test("a failed deletion keeps the session, the page and every Check", async ({
  page,
}) => {
  const t = text.en;
  await open(page, "en", true);
  await prove(page, "en", t.deleteAccount);
  fake.state.behavior = "fail";
  await page.getByLabel(t.ack).check();
  await page
    .getByRole("button", { name: t.deleteForever, exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(t.notDeleted);
  await expect(page.getByText(identity.email, { exact: true })).toBeVisible();
  await expect(page.locator("#results-title")).toBeVisible();
  expect(fake.state.live).toBe(true);
  expect(await owned()).toEqual([]);
  // Still signed in: a reload keeps the session.
  await page.reload();
  await expect(page.getByText(identity.email, { exact: true })).toBeVisible();
});

test("a proof the service no longer accepts sends the user back to proving without deleting", async ({
  page,
}) => {
  const t = text.en;
  await open(page, "en");
  await prove(page, "en", t.deleteAccount);
  await page.getByLabel(t.ack).check();
  // The browser still shows a valid window; the service's clock disagrees.
  fake.advance(6 * 60_000);
  await page
    .getByRole("button", { name: t.deleteForever, exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(t.proofRequired);
  await expect(
    page.getByRole("button", { name: t.sendProof, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: t.deleteForever, exact: true }),
  ).toHaveCount(0);
  expect(await owned()).toEqual([]);
  expect(fake.state.live).toBe(true);
});

test("the displayed proof window ends by itself and asks again", async ({
  page,
}) => {
  const t = text.en;
  await page.clock.install();
  await open(page, "en");
  await prove(page, "en", t.deleteAccount);
  await expect(page.getByTestId("deletion-notice")).toBeVisible();
  await page.clock.fastForward(5 * 60_000 + 2000);
  await expect(page.getByText(/The confirmation expired/)).toBeVisible();
  await expect(page.getByTestId("deletion-notice")).toHaveCount(0);
});

for (const language of ["en", "de"] as const)
  test(`a confirmed deletion ends the Account everywhere it can be seen (${language})`, async ({
    browser,
  }) => {
    const t = text[language];
    const context = await browser.newContext({ locale: language });
    const page = await context.newPage();
    try {
      await open(page, language, true);
      const checks = await api.database().then(async (db) => {
        try {
          return (
            await db.query(
              "SELECT id FROM verification.checks WHERE owner_id=$1",
              [identity.ownerId],
            )
          ).rows as { id: string }[];
        } finally {
          await db.end();
        }
      });
      expect(checks.length).toBeGreaterThan(0);
      const stale = api.token(identity);
      await prove(page, language, t.deleteAccount);
      await page.getByLabel(t.ack).check();
      const tokenCalls = () =>
        fake.state.calls.filter((c) => c.endsWith("/account-tokens")).length;
      await page
        .getByRole("button", { name: t.deleteForever, exact: true })
        .click();
      await expect(page.getByText(t.deleted)).toBeVisible();
      // Client Account state is gone and the workspace restarted empty.
      await expect(page.getByText(identity.email)).toHaveCount(0);
      await expect(page.locator("#results-title")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: t.deleteAccount, exact: true }),
      ).toHaveCount(0);
      const calls = tokenCalls();
      // Public half: tombstone exists, content is purged, the old token is refused.
      expect(await owned()).toEqual([{ owner_id: identity.ownerId }]);
      const response = await fetch(`${api.apiUrl}/v1/checks/${checks[0]!.id}`, {
        headers: { authorization: `Bearer ${stale}` },
      });
      expect(response.status).toBe(403);
      // No Account request is made afterwards, and a reload shows a plain Guest.
      await page.reload();
      await expect(page.getByText(identity.email)).toHaveCount(0);
      expect(tokenCalls()).toBe(calls);
      expect(fake.state.live).toBe(false);
    } finally {
      await context.close();
    }
  });

test("durable in-progress deletion blocks access and never falls back to Guest", async ({
  page,
}) => {
  const t = text.en;
  await open(page, "en");
  await prove(page, "en", t.deleteAccount);
  fake.state.behavior = "in-progress";
  await page.getByLabel(t.ack).check();
  await page
    .getByRole("button", { name: t.deleteForever, exact: true })
    .click();
  await expect(
    page.getByText(/Your Account deletion is in progress/),
  ).toBeVisible();
  await expect(page.getByText(identity.email)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toHaveCount(0);
  const guestCalls = fake.state.calls.filter((c) => c.includes("guest-tokens"));
  expect(guestCalls).toEqual([]);
});

test("changing the email needs proof, confirms the new address and keeps Checks", async ({
  page,
}) => {
  const t = text.en;
  await open(page, "en", true);
  await prove(page, "en", t.changeEmail);
  await page.getByLabel("New email address").fill("new@example.org");
  await page
    .getByRole("button", { name: "Send code to new address", exact: true })
    .click();
  // The previous address proves control; only the new address receives the second code.
  expect(fake.state.mail.map((m) => `${m.kind}:${m.to}`)).toEqual([
    `proof:${identity.email}`,
    "replacement:new@example.org",
  ]);
  await page.getByLabel("Code for the new address").fill("000000");
  await page
    .getByRole("button", { name: "Confirm new address", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(/cannot be used/);
  await expect(page.getByText(identity.email, { exact: true })).toBeVisible();
  await page.getByLabel("Code for the new address").fill(codes.replacement);
  await page
    .getByRole("button", { name: "Confirm new address", exact: true })
    .click();
  await expect(
    page.getByText("new@example.org", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Your email address is now new@example.org/),
  ).toBeVisible();
  // Same Account, same Owner: the open Check workspace is not restarted.
  await expect(page.locator("#results-title")).toBeVisible();
  expect(fake.state.email).toBe("new@example.org");
});

test("an address the service cannot use looks exactly like any other until the code is entered", async ({
  page,
}) => {
  const t = text.en;
  await open(page, "en");
  await prove(page, "en", t.changeEmail);
  await page.getByLabel("New email address").fill("taken@example.org");
  await page
    .getByRole("button", { name: "Send code to new address", exact: true })
    .click();
  await expect(
    page.getByText(/If this address can be used, a code is on its way/),
  ).toBeVisible();
  await page.getByLabel("Code for the new address").fill(codes.replacement);
  await page
    .getByRole("button", { name: "Confirm new address", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(/cannot be used/);
  await expect(page.getByText(identity.email, { exact: true })).toBeVisible();
  expect(fake.state.email).toBe(identity.email);
});

test("a stale proof during email change returns to proving and changes nothing", async ({
  page,
}) => {
  const t = text.en;
  await open(page, "en");
  await prove(page, "en", t.changeEmail);
  fake.advance(6 * 60_000);
  await page.getByLabel("New email address").fill("new@example.org");
  await page
    .getByRole("button", { name: "Send code to new address", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(t.proofRequired);
  await expect(
    page.getByRole("button", { name: t.sendProof, exact: true }),
  ).toBeVisible();
  expect(fake.state.email).toBe(identity.email);
});

test("three wrong proof codes are reported as exhausted", async ({ page }) => {
  const t = text.en;
  await open(page, "en");
  await page
    .getByRole("button", { name: t.deleteAccount, exact: true })
    .click();
  await page.getByRole("button", { name: t.sendProof, exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page.getByLabel(t.code).fill("000000");
    await page.getByRole("button", { name: t.confirm, exact: true }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  }
  await expect(page.getByRole("alert")).toContainText(/Too many wrong codes/);
});

test("without private support the actions say so and change nothing", async ({
  page,
}) => {
  const t = text.en;
  await open(page, "en");
  fake.state.behavior = "unavailable";
  await page
    .getByRole("button", { name: t.deleteAccount, exact: true })
    .click();
  await page.getByRole("button", { name: t.sendProof, exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(t.unavailable);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: t.deleteAccount, exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText(identity.email, { exact: true })).toBeVisible();
  expect(await owned()).toEqual([]);
});

test("the controls do not exist unless the host enabled them", async ({
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
  await page.goto(gated.url);
  await expect(page.getByText(identity.email, { exact: true })).toBeVisible();
  await expect(page.getByText(text.en.security)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: text.en.deleteAccount, exact: true }),
  ).toHaveCount(0);
});
