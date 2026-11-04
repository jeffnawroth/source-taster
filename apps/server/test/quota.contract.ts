// SPDX-License-Identifier: AGPL-3.0-or-later
// Both real programs: the verification web/worker and the private service with
// its Quota journal. Every observable below is public (HTTP) or the service's own
// journal; no verification payload is read across the seam.
import { afterEach, expect, test } from "vitest";
import {
  CheckResponse,
  QuotaResponse,
  type Check,
} from "@source-taster/contract-verification/v2";
import { bothPrograms, eventually } from "./support/both-programs.ts";
import { physicsReference } from "./support/doi-fixtures.ts";
import pg from "pg";
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((f) => f()));
});
const noDoi = (n: number) =>
  Array.from({ length: n }, (_, i) => `Doe, J. (2020). Plain title ${i}.`).join(
    "\n\n",
  );
type Both = Awaited<ReturnType<typeof bothPrograms>>;
const api = (both: Both, token: string) => {
  const headers = {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
  const call = (path: string, init?: RequestInit) =>
    fetch(`${both.apiUrl}${path}`, { headers, ...init });
  return {
    create: (text: string, query = "") =>
      call(`/v2/checks${query}`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    get: async (id: string) =>
      CheckResponse.parse(await (await call(`/v2/checks/${id}`)).json()),
    cancel: async (id: string) =>
      call(`/v2/checks/${id}/cancel`, { method: "POST" }),
    quota: async () => {
      const response = await call("/v2/quota");
      expect(response.status).toBe(200);
      const body = QuotaResponse.parse(await response.json());
      expect(body.data).toBeTruthy();
      return body.data as Exclude<typeof body.data, null | { status: string }>;
    },
    recheck: (check: Check, slot: number) =>
      call(`/v2/checks/${check.id}/references/${slot}/recheck`, {
        method: "POST",
        body: JSON.stringify({
          expectedRevision: check.references.find((r) => r.slot === slot)!
            .revision,
        }),
      }),
    finished: async (id: string) => {
      await eventually(
        async () =>
          (
            (await call(`/v2/checks/${id}`).then((r) => r.json())) as {
              data: Check;
            }
          ).data.state === "ended",
        30000,
      );
      return (
        (await (await call(`/v2/checks/${id}`)).json()) as { data: Check }
      ).data;
    },
  };
};
const journal = async (both: Both) => {
  const client = new pg.Client({ connectionString: both.urls[1] });
  await client.connect();
  try {
    return (
      await client.query<{ kind: string; n: number }>(
        "SELECT kind, count(*)::int AS n FROM service.quota_journal GROUP BY kind",
      )
    ).rows;
  } finally {
    await client.end();
  }
};

test("a Guest starts with 20 per day; a Check reserves up front, then bills each first Verdict once", async () => {
  const both = await bothPrograms();
  cleanup.push(both.stop);
  const guest = await both.issue();
  const client = api(both, guest.token);
  expect(await client.quota()).toMatchObject({
    granted: 20,
    remaining: 20,
    consumed: 0,
    warning: "none",
    features: ["check"],
  });
  const created = await client.create(
    [physicsReference, physicsReference, physicsReference].join("\n\n"),
  );
  expect(created.status).toBe(201);
  const check = CheckResponse.parse(await created.json());
  expect(check.data.references).toHaveLength(3);
  // Envelope Quota is the service's, not a placeholder.
  expect(check.quota).toMatchObject({ granted: 20 });
  await client.finished(check.data.id);
  await eventually(async () => (await client.quota()).consumed === 3, 20000);
  expect(await client.quota()).toMatchObject({
    consumed: 3,
    remaining: 17,
    reserved: 0,
  });
  // A settled slot is never debited twice; a same-slot Re-check is free.
  const done = await client.get(check.data.id);
  expect((await client.recheck(done.data, 1)).status).toBe(200);
  await client.finished(check.data.id);
  await new Promise((r) => setTimeout(r, 1500));
  expect(await client.quota()).toMatchObject({ consumed: 3, remaining: 17 });
  const kinds = Object.fromEntries(
    (await journal(both)).map((r) => [r.kind, r.n]),
  );
  expect(kinds.debit).toBe(3);
});

test("Statuses stay unbilled: Reference slots without a Verdict release their reservation", async () => {
  const both = await bothPrograms();
  cleanup.push(both.stop);
  const guest = await both.issue();
  const client = api(both, guest.token);
  const created = CheckResponse.parse(
    await (await client.create(noDoi(2))).json(),
  );
  await client.finished(created.data.id);
  await eventually(async () => (await client.quota()).reserved === 0, 20000);
  expect(await client.quota()).toMatchObject({ consumed: 0, remaining: 20 });
});

test("insufficient Quota offers the first N in input order; the rest end as not-checked and are free", async () => {
  const both = await bothPrograms();
  cleanup.push(both.stop);
  const guest = await both.issue();
  const client = api(both, guest.token);
  const text = Array.from({ length: 23 }, () => physicsReference).join("\n\n");
  // Preview: all 23 do not fit.
  const refused = await client.create(text);
  expect(refused.status).toBe(402);
  expect(await refused.json()).toMatchObject({
    code: "quota-insufficient",
    available: 20,
    required: 23,
  });
  expect(await client.quota()).toMatchObject({ reserved: 0, remaining: 20 });
  const first = await client.create(text, "?maxReferences=20");
  expect(first.status).toBe(201);
  const check = CheckResponse.parse(await first.json()).data;
  expect(check.references).toHaveLength(23);
  expect(check.references.slice(20).map((r) => r.outcome)).toEqual([
    { kind: "status", status: "not-checked" },
    { kind: "status", status: "not-checked" },
    { kind: "status", status: "not-checked" },
  ]);
  const finished = await client.finished(check.id);
  expect(finished.state).toBe("ended");
  await eventually(async () => (await client.quota()).consumed === 20, 30000);
  expect(await client.quota()).toMatchObject({
    remaining: 0,
    warning: "exhausted",
  });
  // Billed slots re-check for free even at zero balance; a new slot is refused.
  expect((await client.recheck(finished, 1)).status).toBe(200);
  expect((await client.recheck(finished, 23)).status).toBe(402);
  expect((await client.create(physicsReference)).status).toBe(402);
});

test("parallel Checks never oversell the Quota", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const client = api(both, guest.token);
  const text = Array.from({ length: 15 }, () => physicsReference).join("\n\n");
  const responses = await Promise.all([
    client.create(text),
    client.create(text),
  ]);
  expect(responses.map((r) => r.status).sort()).toEqual([201, 402]);
  expect(await client.quota()).toMatchObject({ reserved: 15, remaining: 5 });
});

test("cancelling a Check releases its unsettled reservation; warnings follow the balance", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const client = api(both, guest.token);
  const text = Array.from({ length: 16 }, () => physicsReference).join("\n\n");
  const created = CheckResponse.parse(await (await client.create(text)).json());
  expect(await client.quota()).toMatchObject({
    reserved: 16,
    warning: "eighty",
  });
  expect((await client.cancel(created.data.id)).status).toBe(200);
  // The release travels as a durable settlement intent drained by the worker.
  await both.worker().ready;
  await eventually(async () => (await client.quota()).reserved === 0, 20000);
  expect(await client.quota()).toMatchObject({
    consumed: 0,
    remaining: 20,
    warning: "none",
  });
});

test("an expired client lease releases the reservation without a Verdict", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const client = api(both, guest.token);
  CheckResponse.parse(await (await client.create(physicsReference)).json());
  expect(await client.quota()).toMatchObject({ reserved: 1 });
  await both.advance(80_000);
  // The worker's lifecycle maintenance expires the lease and drains the release.
  await both.worker().ready;
  const fresh = await both.issue(guest.guestId);
  await eventually(
    async () => (await api(both, fresh.token).quota()).reserved === 0,
    20000,
  );
  expect(await api(both, fresh.token).quota()).toMatchObject({ consumed: 0 });
});

test("a confirmed Account's personal Owner holds Free 100 per month, separate from the Guest", async () => {
  const both = await bothPrograms({ accounts: true });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const guestClient = api(both, guest.token);
  expect(await guestClient.quota()).toMatchObject({ granted: 20 });
  const account = await both.signIn();
  const client = api(both, account.token);
  expect(await client.quota()).toMatchObject({
    granted: 100,
    remaining: 100,
    features: ["check", "history"],
    grants: [{ kind: "free", granted: 100 }],
  });
  const created = await client.create(physicsReference);
  expect(created.status).toBe(201);
  const check = CheckResponse.parse(await created.json()).data;
  await client.finished(check.id);
  await eventually(async () => (await client.quota()).consumed === 1, 20000);
  expect(await guestClient.quota()).toMatchObject({
    consumed: 0,
    remaining: 20,
  });
});

test("a failed snapshot is reported as unavailable, never as an unimplemented Quota or an invented balance", async () => {
  const both = await bothPrograms();
  cleanup.push(both.stop);
  const guest = await both.issue();
  const client = api(both, guest.token);
  const created = CheckResponse.parse(
    await (await client.create(physicsReference)).json(),
  );
  await client.finished(created.data.id);
  // The service's own journal is held: authority still answers, the snapshot cannot.
  const lock = new pg.Client({ connectionString: both.urls[1] });
  await lock.connect();
  try {
    await lock.query("BEGIN");
    await lock.query(
      "LOCK TABLE service.quota_journal IN ACCESS EXCLUSIVE MODE",
    );
    const read = await fetch(`${both.apiUrl}/v2/checks/${created.data.id}`, {
      headers: { authorization: `Bearer ${guest.token}` },
    });
    expect(read.status).toBe(200);
    const body = CheckResponse.parse(await read.json());
    expect(body.data.id).toBe(created.data.id);
    expect(body.quota).toEqual({ status: "unavailable" });
    // The dedicated read fails closed instead of degrading.
    const quota = await fetch(`${both.apiUrl}/v2/quota`, {
      headers: { authorization: `Bearer ${guest.token}` },
    });
    expect(quota.status).toBe(503);
  } finally {
    await lock.query("ROLLBACK").catch(() => {});
    await lock.end();
  }
});
