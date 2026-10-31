// SPDX-License-Identifier: AGPL-3.0-or-later
// #102 public phase. Real verification web/worker + PostgreSQL; the private
// service exists only as an HTTP edge fixture. This proves the verification
// program's half of Account deletion (ADR-0003 step 1, ADR-0013 revocation),
// not the private Owner tombstoning trigger or any both-program behavior.
import { afterEach, expect, test } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification";
import { readSseFrames } from "@source-taster/contract-verification/client";
import {
  newAccount,
  startAccountApi,
  type AccountIdentity,
} from "./support/account-api.ts";
import { physicsReference } from "./support/doi-fixtures.ts";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((f) => f()));
});
type Api = Awaited<ReturnType<typeof startAccountApi>>;
const headers = (api: Api, account: AccountIdentity) => ({
  authorization: `Bearer ${api.token(account)}`,
  "content-type": "application/json",
});
async function create(api: Api, account: AccountIdentity) {
  const response = await fetch(`${api.apiUrl}/v1/checks`, {
    method: "POST",
    headers: headers(api, account),
    body: JSON.stringify({ text: physicsReference }),
  });
  expect(response.status).toBe(201);
  return CheckResponse.parse(await response.json()).data;
}
const read = (api: Api, account: AccountIdentity, id: string) =>
  fetch(`${api.apiUrl}/v1/checks/${id}`, { headers: headers(api, account) });
async function rows(
  api: Api,
  sql: string,
  values: unknown[] = [],
): Promise<Record<string, unknown>[]> {
  const db = await api.database();
  try {
    return (await db.query(sql, values)).rows;
  } finally {
    await db.end();
  }
}

test("only the private service's signed, purpose- and path-bound assertion may delete an Owner", async () => {
  const api = await startAccountApi();
  cleanup.push(api.stop);
  const account = newAccount();
  const check = await create(api, account);
  for (const attempt of [
    api.deleteOwner(account.ownerId, { unsigned: true }),
    api.deleteOwner(account.ownerId, { purpose: "authority-invalidation" }),
    api.deleteOwner(account.ownerId, { path: "/internal/owners/other" }),
    api.deleteOwner(account.ownerId, { method: "POST" }),
    fetch(`${api.apiUrl}/internal/owners/${account.ownerId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${api.token(account)}` },
    }),
  ])
    expect((await attempt).status).toBe(401);
  expect(
    (await rows(api, "SELECT 1 FROM verification.owner_tombstones")).length,
  ).toBe(0);
  expect((await read(api, account, check.id)).status).toBe(200);
});

test("deleting an Owner tombstones it, purges its content and denies every still-signed token even while the service still allows it", async () => {
  const api = await startAccountApi();
  cleanup.push(api.stop);
  const account = newAccount();
  const other = newAccount();
  const check = await create(api, account);
  const bystander = await create(api, other);

  const stream = await fetch(`${api.apiUrl}/v1/checks/${check.id}/events`, {
    headers: headers(api, account),
    signal: AbortSignal.timeout(20000),
  });
  expect(stream.status).toBe(200);
  const reader = readSseFrames(stream.body!)[Symbol.asyncIterator]();
  await reader.next();

  const deleted = await api.deleteOwner(account.ownerId);
  expect(deleted.status).toBe(200);
  // IDs only: no content, no History claim, no count of anything private.
  expect(await deleted.json()).toEqual({
    ownerId: account.ownerId,
    tombstoned: true,
  });

  // The fake service still answers allowed:true, so denial is the public half's.
  expect(api.state.allowed).toBe(true);
  expect((await read(api, account, check.id)).status).toBe(403);
  expect(
    (
      await fetch(`${api.apiUrl}/v1/checks`, {
        method: "POST",
        headers: headers(api, account),
        body: JSON.stringify({ text: physicsReference }),
      })
    ).status,
  ).toBe(403);
  // The open stream stops delivering within its next authority recheck.
  const outcome = await Promise.race([
    (async () => {
      try {
        for (;;) if ((await reader.next()).done) return "closed";
      } catch {
        return "closed";
      }
    })(),
    new Promise((r) => setTimeout(() => r("open"), 10000)),
  ]);
  expect(outcome).toBe("closed");

  expect(
    await rows(
      api,
      "SELECT owner_id FROM verification.owner_tombstones ORDER BY owner_id",
    ),
  ).toEqual([{ owner_id: account.ownerId }]);
  const content = await rows(
    api,
    `SELECT c.document IS NULL AS no_document, c.deleted_at IS NOT NULL AS deleted,
       (SELECT count(*)::int FROM verification.reference_slots WHERE check_id=c.id) AS slots,
       (SELECT count(*)::int FROM verification.check_events WHERE check_id=c.id) AS events,
       (SELECT count(*)::int FROM verification.reference_results WHERE check_id=c.id) AS results
     FROM verification.checks c WHERE c.owner_id=$1`,
    [account.ownerId],
  );
  expect(content).toEqual([
    { no_document: true, deleted: true, slots: 0, events: 0, results: 0 },
  ]);

  // Repeating the call is an idempotent no-op; another Owner is untouched.
  expect((await api.deleteOwner(account.ownerId)).status).toBe(200);
  expect(
    (await rows(api, "SELECT 1 FROM verification.owner_tombstones")).length,
  ).toBe(1);
  expect((await read(api, other, bystander.id)).status).toBe(200);
});

test("a queued job of a deleted Owner never runs", async () => {
  const api = await startAccountApi();
  cleanup.push(api.stop);
  const account = newAccount();
  const check = await create(api, account);
  expect((await api.deleteOwner(account.ownerId)).status).toBe(200);
  await api.startWorker();
  await new Promise((r) => setTimeout(r, 3000));
  expect(api.fixtures.requests.length).toBe(0);
  expect(
    await rows(
      api,
      "SELECT count(*)::int AS n FROM verification.reference_results WHERE check_id=$1",
      [check.id],
    ),
  ).toEqual([{ n: 0 }]);
});

test("in-flight work that was authorized before deletion cannot publish afterwards, and unfinished Quota holds are still released", async () => {
  const api = await startAccountApi({ worker: true });
  cleanup.push(api.stop);
  const account = newAccount();
  const held = api.holdAuthority("work");
  const check = await create(api, account);
  await held.arrived;
  // The worker is mid-dispatch; the Owner is deleted before it may continue.
  expect((await api.deleteOwner(account.ownerId)).status).toBe(200);
  held.release();
  await new Promise((r) => setTimeout(r, 2000));
  expect(
    await rows(
      api,
      "SELECT count(*)::int AS n FROM verification.reference_results WHERE check_id=$1",
      [check.id],
    ),
  ).toEqual([{ n: 0 }]);
  expect((await read(api, account, check.id)).status).toBe(403);
  // The reservation taken at creation is returned through the normal journal
  // path; deletion neither bills a Verdict nor silently drops the settlement.
  await expect
    .poll(
      () =>
        api.state.quotaCalls.filter(
          (call) =>
            call.path === "/internal/quota/settle" &&
            call.body.outcome === "release" &&
            call.body.checkId === check.id,
        ).length,
      { timeout: 15000 },
    )
    .toBeGreaterThan(0);
  expect(
    api.state.quotaCalls.some(
      (call) =>
        call.path === "/internal/quota/settle" &&
        call.body.outcome === "verdict",
    ),
  ).toBe(false);
});

test("a restart re-applies a tombstone to content that came back with a restore, before serving", async () => {
  const api = await startAccountApi({ maintainOnStart: true });
  cleanup.push(api.stop);
  const account = newAccount();
  const check = await create(api, account);
  // A restore can bring a Check back that predates its Owner's tombstone: the
  // tombstone table is re-applied from the service's durable list.
  const db = await api.database();
  try {
    await db.query(
      "INSERT INTO verification.owner_tombstones(owner_id) VALUES ($1)",
      [account.ownerId],
    );
  } finally {
    await db.end();
  }
  await api.restartWeb();
  const stored = await rows(
    api,
    "SELECT deleted_at IS NOT NULL AS deleted, document IS NULL AS empty FROM verification.checks WHERE id=$1",
    [check.id],
  );
  expect(stored).toEqual([{ deleted: true, empty: true }]);
  expect((await read(api, account, check.id)).status).toBe(403);
});
