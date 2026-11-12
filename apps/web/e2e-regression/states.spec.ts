// SPDX-License-Identifier: AGPL-3.0-or-later
// #216 integrated state evidence, hosted web: Guest and authenticated, pending,
// failure, retry, lease expiry and token expiry against the real verification
// API, worker and PostgreSQL. The private service is only its established HTTP
// edge (see apps/server/test/support/account-api.ts); this is public-client
// contract evidence, not both-program proof and not a conformance claim.
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { expect, test, type Page } from "@playwright/test";
import {
  newAccount,
  newGuest,
  startAccountApi,
  type GuestIdentity,
} from "../../server/test/support/account-api.ts";

let api: Awaited<ReturnType<typeof startAccountApi>>, vite: ChildProcess;
const port = process.env.SOURCE_TASTER_REGRESSION_WEB_PORT ?? "5617";
const url = `http://127.0.0.1:${port}`;
const account = { ...newAccount(), email: "regression@example.invalid" };
const guests = new Map<string, GuestIdentity>();
const behaviour: {
  failReserve: number;
  guestIssued: number;
  tokensIssued: number;
  guestAuthority: number;
} = { failReserve: 0, guestIssued: 0, tokensIssued: 0, guestAuthority: 0 };
const aspelmeyer =
  "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
const cookie = "st-regression=existing-account-test-session";

test.beforeAll(async () => {
  api = await startAccountApi({
    worker: false,
    service: (request, tokens) => {
      const headers = {
        "content-type": "application/json",
        "access-control-allow-origin": url,
        "access-control-allow-credentials": "true",
        "access-control-allow-headers": "content-type",
        "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
      };
      const ok = (data: unknown) => ({
        status: 200,
        headers,
        body: { data, quota: { status: "not-implemented" } },
      });
      if (request.url === "/internal/guest-authority") {
        behaviour.guestAuthority += 1;
        return { status: 200, body: { allowed: true, version: 1 } };
      }
      if (
        request.url === "/internal/quota/reserve" &&
        behaviour.failReserve > 0
      ) {
        behaviour.failReserve -= 1;
        return { status: 500, body: {} };
      }
      if (!request.url.startsWith("/v1/")) return undefined;
      if (request.method === "OPTIONS") return { status: 204, headers };
      const signedIn = String(request.headers.cookie ?? "").includes(cookie);
      const unauthenticated = {
        status: 401,
        headers,
        body: {
          type: "about:blank",
          status: 401,
          title: "Sign in required",
          code: "unauthenticated",
          i18nKey: "problem_unauthenticated",
        },
      };
      if (request.url === "/v1/guest-tokens") {
        const guestId = String(request.body.guestId);
        let guest = guests.get(guestId);
        if (!guest) {
          guest = newGuest(guestId);
          guests.set(guestId, guest);
        }
        behaviour.guestIssued += 1;
        behaviour.tokensIssued += 1;
        return ok({
          accessToken: tokens.guestToken(guest),
          tokenType: "Bearer",
          expiresIn: 300,
          expiresAt: new Date(api.now() + 300_000).toISOString(),
        });
      }
      if (
        request.url === "/v1/session" ||
        request.url === "/v1/session/activity"
      )
        return signedIn
          ? ok({
              accountId: account.accountId,
              ownerId: account.ownerId,
              email: account.email,
            })
          : unauthenticated;
      if (request.url === "/v1/preferences")
        return signedIn
          ? ok({ language: "en", citationStyle: "apa" })
          : unauthenticated;
      if (request.url === "/v1/account-tokens") {
        if (signedIn) behaviour.tokensIssued += 1;
        return signedIn
          ? ok({
              accessToken: tokens.token(account),
              tokenType: "Bearer",
              expiresIn: 300,
              expiresAt: new Date(api.now() + 300_000).toISOString(),
            })
          : unauthenticated;
      }
      return undefined;
    },
  });
  vite = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--config",
      "e2e-sensitive/vite.config.ts",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: {
        PATH: process.env.PATH,
        SOURCE_TASTER_API_URL: api.apiUrl,
        VITE_SOURCE_TASTER_MODE: "hosted",
        VITE_SOURCE_TASTER_SERVICE_URL: api.serviceUrl,
      },
      stdio: "pipe",
    },
  );
  await expect
    .poll(
      () =>
        fetch(url).then(
          (r) => r.ok,
          () => false,
        ),
      { timeout: 30000 },
    )
    .toBe(true);
});
test.afterAll(async () => {
  if (vite?.exitCode === null) {
    const done = once(vite, "exit");
    vite.kill();
    await done;
  }
  await api?.stop();
});

type Kind = "guest" | "account";
async function enter(page: Page, kind: Kind, worker = true) {
  if (worker) await api.startWorker();
  if (kind === "account")
    await page.context().addCookies([
      {
        name: "st-regression",
        value: "existing-account-test-session",
        url: api.serviceUrl,
        httpOnly: true,
        sameSite: "Strict",
      },
    ]);
  account.ownerId = newAccount().ownerId;
  account.accountId = newAccount().accountId;
  behaviour.failReserve = 0;
  behaviour.guestIssued = 0;
  behaviour.tokensIssued = 0;
  behaviour.guestAuthority = 0;
  api.state.quotaCalls.length = 0;
  const requests: { method: string; path: string }[] = [];
  page.on("request", (request) => {
    const target = new URL(request.url());
    if (target.origin === url && /^\/v[12]\//.test(target.pathname))
      requests.push({ method: request.method(), path: target.pathname });
  });
  await page.goto(url);
  const input = page.getByRole("textbox", { name: "Reference", exact: true });
  await expect(input).toBeVisible();
  return { input, requests };
}
/** Holds the client's Reference-processing requests so the Check stays genuinely pending. */
function holdBibliography(page: Page) {
  let arrived!: () => void, release!: () => void;
  const arrival = new Promise<void>((r) => (arrived = r));
  const gate = new Promise<"continue" | "abort">(
    (r) => (release = () => r("continue")),
  );
  let drop!: () => void;
  const dropped = new Promise<"abort">((r) => (drop = () => r("abort")));
  void page.route("**/v2/checks/*/bibliography", async (route) => {
    arrived();
    const outcome = await Promise.race([gate, dropped]);
    if (outcome === "abort") await route.abort().catch(() => undefined);
    else await route.continue().catch(() => undefined);
  });
  return { arrived: arrival, release, drop };
}
const start = (page: Page) =>
  page.getByRole("button", { name: "Check reference", exact: true });

const quotaCount = (suffix: string) =>
  api.state.quotaCalls.filter((call) => call.path.endsWith(suffix)).length;
async function ownerRows(ownerId: string) {
  const db = await api.database();
  try {
    const one = async (sql: string) =>
      Number((await db.query<{ n: number }>(sql, [ownerId])).rows[0]!.n);
    return {
      checks: await one(
        "select count(*)::int n from verification.checks where owner_id=$1",
      ),
      slots: await one(
        "select count(*)::int n from verification.reference_slots s join verification.checks c on c.id=s.check_id where c.owner_id=$1",
      ),
      results: await one(
        "select count(*)::int n from verification.reference_results r join verification.checks c on c.id=r.check_id where c.owner_id=$1",
      ),
      ended: await one(
        "select count(*)::int n from verification.checks where owner_id=$1 and ended_at is not null",
      ),
    };
  } finally {
    await db.end();
  }
}
/** The Owner the verification API sees for this browser. */
async function ownerOf(page: Page, kind: Kind) {
  if (kind === "account") return account.ownerId;
  const id = await page.evaluate(() =>
    localStorage.getItem("source-taster-guest-id-v1"),
  );
  return guests.get(id!)!.ownerId;
}

const correct = (page: Page, count = 1) =>
  page.getByRole("button", { name: `Correct: ${count}`, exact: true });
const checkIds = (requests: { path: string }[]) => [
  ...new Set(
    requests
      .map((r) => r.path.match(/\/checks\/([0-9a-f-]{36})/)?.[1])
      .filter((id): id is string => id !== undefined),
  ),
];
const posts = (requests: { method: string; path: string }[], suffix: RegExp) =>
  requests.filter((r) => r.method === "POST" && suffix.test(r.path)).length;
async function slotIds(ownerId: string) {
  const db = await api.database();
  try {
    return (
      await db.query(
        "select (c.id::text || ':' || s.position::text || ':' || s.revision::text) id from verification.reference_slots s join verification.checks c on c.id=s.check_id where c.owner_id=$1 order by s.position",
        [ownerId],
      )
    ).rows.map((row: { id: string }) => row.id);
  } finally {
    await db.end();
  }
}
/** Everything the page could have persisted: no Check content, no bearer token. */
async function persisted(page: Page) {
  const inPage = await page.evaluate(async () => {
    const databases = (await indexedDB.databases?.()) ?? [];
    const idb: unknown[] = [];
    for (const { name } of databases) {
      if (!name) continue;
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const open = indexedDB.open(name);
        open.onsuccess = () => resolve(open.result);
        open.onerror = () => reject(new Error("indexedDB open failed"));
      });
      for (const store of Array.from(db.objectStoreNames)) {
        idb.push(
          await new Promise((resolve, reject) => {
            const read = db
              .transaction(store, "readonly")
              .objectStore(store)
              .getAll();
            read.onsuccess = () => resolve([name, store, read.result]);
            read.onerror = () => reject(new Error("indexedDB read failed"));
          }),
        );
      }
      db.close();
    }
    return {
      local: { ...localStorage },
      session: { ...sessionStorage },
      idb,
      caches: await caches.keys(),
      workers: (await navigator.serviceWorker?.getRegistrations())?.length ?? 0,
      cookie: document.cookie,
    };
  });
  return inPage;
}
async function expectNothingPersisted(page: Page, kind: Kind) {
  const found = await persisted(page);
  expect(Object.keys(found.local)).toEqual(
    kind === "guest" ? ["source-taster-guest-id-v1"] : [],
  );
  expect(found.session).toEqual({});
  expect(found.caches).toEqual([]);
  expect(found.workers).toBe(0);
  const everything = JSON.stringify([found.idb, found.local, found.session]);
  for (const secret of [
    "Aspelmeyer",
    "nphys1170",
    "Measured measurement",
    "eyJ",
  ])
    expect(everything).not.toContain(secret);
  const cookies = JSON.stringify(await page.context().cookies());
  expect(cookies).not.toContain("Aspelmeyer");
  expect(cookies).not.toContain("eyJ");
}
const cancelled = (page: Page) =>
  page
    .getByRole("grid", { name: "References", exact: true })
    .getByText("Cancelled", { exact: true });
const cancelButton = (page: Page) =>
  page.getByRole("button", { name: "Cancel check", exact: true });

// Ordering note: the worker is started lazily and stays up, so the one test
// that proves settlement after Cancel without any worker runs first.
for (const kind of ["guest", "account"] as const) {
  test(`${kind}: a pending Check keeps its ID through Cancel and settles Quota once`, async ({
    page,
  }) => {
    const { input, requests } = await enter(page, kind, false);
    const hold = holdBibliography(page);
    await input.fill(aspelmeyer);
    await start(page).click();
    await hold.arrived;
    await expect(cancelButton(page)).toBeVisible();
    const owner = await ownerOf(page, kind);
    expect(await ownerRows(owner)).toEqual({
      checks: 1,
      slots: 1,
      results: 0,
      ended: 0,
    });
    const [id] = checkIds(requests);
    const slots = await slotIds(owner);
    await cancelButton(page).click();
    await expect(cancelled(page)).toBeVisible();
    hold.drop();
    expect(checkIds(requests)).toEqual([id]);
    expect(posts(requests, /\/v2\/checks$/)).toBe(1);
    expect(posts(requests, /\/cancel$/)).toBe(1);
    expect(requests.find((r) => r.path.endsWith("/cancel"))!.path).toContain(
      id!,
    );
    expect((await ownerRows(owner)).ended).toBe(1);
    expect(await slotIds(owner)).toEqual(slots);
    expect(quotaCount("/reserve")).toBe(1);
    await expect(input).toHaveValue(aspelmeyer);
    await expectNothingPersisted(page, kind);
    // The outbox settles the reservation exactly once when a worker runs.
    await api.startWorker();
    await expect
      .poll(() => quotaCount("/settle") + quotaCount("/release"), {
        timeout: 30000,
      })
      .toBe(1);
    await page.waitForTimeout(2500);
    expect(quotaCount("/reserve")).toBe(1);
    expect(quotaCount("/settle") + quotaCount("/release")).toBe(1);
  });
}

for (const kind of ["guest", "account"] as const) {
  test(`${kind}: a completed Check has one effect and leaves nothing in the browser`, async ({
    page,
  }) => {
    const { input, requests } = await enter(page, kind);
    await input.fill(aspelmeyer);
    await start(page).click();
    await expect(correct(page)).toBeVisible({ timeout: 20000 });
    const owner = await ownerOf(page, kind);
    expect(posts(requests, /\/v2\/checks$/)).toBe(1);
    expect(checkIds(requests)).toHaveLength(1);
    expect(await ownerRows(owner)).toEqual({
      checks: 1,
      slots: 1,
      results: 1,
      ended: 1,
    });
    await expect.poll(() => quotaCount("/settle"), { timeout: 30000 }).toBe(1);
    expect(quotaCount("/reserve")).toBe(1);
    expect(behaviour.guestIssued).toBe(kind === "guest" ? 1 : 0);
    await expectNothingPersisted(page, kind);
    await page.reload();
    await expect(
      page.getByRole("textbox", { name: "Reference", exact: true }),
    ).toHaveValue("");
    await expectNothingPersisted(page, kind);
  });

  test(`${kind}: a failed start keeps the text, and the retry has exactly one effect`, async ({
    page,
  }) => {
    const { input, requests } = await enter(page, kind);
    behaviour.failReserve = 1;
    await input.fill(aspelmeyer);
    await start(page).click();
    await expect(page.getByRole("alert").first()).toBeVisible({
      timeout: 15000,
    });
    const owner = await ownerOf(page, kind);
    await expect(input).toHaveValue(aspelmeyer);
    expect(await ownerRows(owner)).toEqual({
      checks: 0,
      slots: 0,
      results: 0,
      ended: 0,
    });
    expect(quotaCount("/reserve")).toBe(0);
    await start(page).click();
    await expect(correct(page)).toBeVisible({ timeout: 20000 });
    expect(posts(requests, /\/v2\/checks$/)).toBe(2);
    expect(checkIds(requests)).toHaveLength(1);
    expect(await ownerRows(owner)).toEqual({
      checks: 1,
      slots: 1,
      results: 1,
      ended: 1,
    });
    await expect.poll(() => quotaCount("/settle"), { timeout: 30000 }).toBe(1);
    expect(quotaCount("/reserve")).toBe(1);
    await expectNothingPersisted(page, kind);
  });

  test(`${kind}: an expired lease ends the same Check in place, announced, without a second one`, async ({
    page,
  }) => {
    const { input, requests } = await enter(page, kind);
    const hold = holdBibliography(page);
    await input.fill(aspelmeyer);
    await start(page).click();
    await hold.arrived;
    await expect(cancelButton(page)).toBeVisible();
    const owner = await ownerOf(page, kind);
    const [id] = checkIds(requests);
    const slots = await slotIds(owner);
    expect((await ownerRows(owner)).results).toBe(0);
    await api.advance(90_000);
    const notice = page
      .getByRole("status", { name: "Your check", exact: true })
      .getByText("The connection was not renewed in time", { exact: false });
    await expect(notice).toBeVisible({ timeout: 40000 });
    await expect(cancelled(page)).toBeVisible();
    await expect(cancelButton(page)).toHaveCount(0);
    expect(await page.getByRole("alert").count()).toBe(0);
    hold.drop();
    expect(checkIds(requests)).toEqual([id]);
    expect(posts(requests, /\/v2\/checks$/)).toBe(1);
    expect(await slotIds(owner)).toEqual(slots);
    expect((await ownerRows(owner)).checks).toBe(1);
    expect((await ownerRows(owner)).ended).toBe(1);
    await expect
      .poll(() => quotaCount("/settle") + quotaCount("/release"), {
        timeout: 30000,
      })
      .toBe(1);
    expect(quotaCount("/reserve")).toBe(1);
    await expect(input).toHaveValue(aspelmeyer);
    await expectNothingPersisted(page, kind);
  });

  test(`${kind}: an expired access token is renewed once and the next Check runs once`, async ({
    page,
  }) => {
    // Browser and API clocks start together: earlier tests moved the API clock.
    await page.clock.install({ time: api.now() });
    const { input, requests } = await enter(page, kind);
    await input.fill(aspelmeyer);
    await start(page).click();
    await expect(correct(page)).toBeVisible({ timeout: 20000 });
    const first = behaviour.tokensIssued;
    expect(first).toBe(1);
    await api.advance(301_000);
    await page.clock.fastForward(301_000);
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await input.fill(aspelmeyer);
    await start(page).click();
    await expect(correct(page)).toBeVisible({ timeout: 20000 });
    expect(await page.getByRole("alert").count()).toBe(0);
    expect(behaviour.tokensIssued).toBe(2);
    expect(posts(requests, /\/v2\/checks$/)).toBe(2);
    expect(checkIds(requests)).toHaveLength(2);
    const owner = await ownerOf(page, kind);
    expect(await ownerRows(owner)).toEqual({
      checks: 2,
      slots: 2,
      results: 2,
      ended: 2,
    });
    await expect.poll(() => quotaCount("/settle"), { timeout: 30000 }).toBe(2);
    expect(quotaCount("/reserve")).toBe(2);
    await expectNothingPersisted(page, kind);
  });
}
