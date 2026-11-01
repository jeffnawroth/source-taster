// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  CheckResponse,
  HistoryResponse,
} from "@source-taster/contract-verification/v2";
import { backup } from "./support/backup.ts";
import { afterEach, expect, test } from "vitest";
import { startAccountApi, newAccount } from "./support/account-api.ts";
const checkData = async (response: Response) =>
  CheckResponse.parse(await response.json()).data;
const historyData = async (response: Response) =>
  HistoryResponse.parse(await response.json()).data;
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
});
test("History is off until the Account opts in, then keeps and deletes an ended Check", async () => {
  const api = await startAccountApi({ worker: true });
  cleanup.push(api.stop);
  const account = newAccount();
  const request = (path: string, method = "GET", body?: unknown) =>
    fetch(`${api.apiUrl}/v2/${path}`, {
      method,
      headers: {
        authorization: `Bearer ${api.token(account)}`,
        "content-type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  const off = await request("history");
  expect(off.status).toBe(200);
  expect(await historyData(off)).toEqual({ enabled: false, entries: [] });
  expect((await request("history", "PUT", { enabled: true })).status).toBe(200);
  const created = await request("checks", "POST", {
    references: [
      {
        originalText: "A retained Reference",
        fields: { DOI: "10.1038/nphys1170" },
      },
    ],
  });
  expect(created.status).toBe(201);
  const id = (await checkData(created)).id;
  await expect
    .poll(
      async () => (await historyData(await request("history"))).entries.length,
    )
    .toBe(1);
  expect(
    (await historyData(await request("history"))).entries[0]!,
  ).toMatchObject({ id, locked: false });
  expect((await request(`history/${id}`, "DELETE")).status).toBe(200);
  expect((await request(`checks/${id}`)).status).toBe(410);
  expect((await historyData(await request("history"))).entries).toEqual([]);
});

const DAY = 86_400_000;
async function historyApi(options: Parameters<typeof startAccountApi>[0] = {}) {
  const api = await startAccountApi({ worker: true, ...options });
  cleanup.push(api.stop);
  const account = newAccount();
  const request = (
    path: string,
    method = "GET",
    body?: unknown,
    identity = account,
  ) =>
    fetch(`${api.apiUrl}/v2/${path}`, {
      method,
      headers: {
        authorization: `Bearer ${api.token(identity)}`,
        "content-type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  const history = async () => {
    const r = await request("history");
    expect(r.status).toBe(200);
    return historyData(r);
  };
  const create = async (text = "History original") => {
    const r = await request("checks", "POST", {
      references: [
        { originalText: text, fields: { DOI: "10.1038/nphys1170" } },
      ],
    });
    expect(r.status).toBe(201);
    const check = await checkData(r);
    await expect
      .poll(
        async () =>
          (await checkData(await request(`checks/${check.id}`))).state,
        { timeout: 15000 },
      )
      .toBe("ended");
    return check.id;
  };
  const paid = () => {
    api.state.quota.features = ["check", "extended-history"];
    api.state.quota.history.extendedUntil = new Date(
      api.now() + 120 * DAY,
    ).toISOString();
  };
  return { api, account, request, history, create, paid };
}
test("Free keeps only the last five Checks; deadlines stay fixed through upgrades and Re-checks", async () => {
  const { api, request, history, create, paid } = await historyApi();
  await request("history", "PUT", { enabled: true });
  const ids: string[] = [];
  for (let i = 0; i < 6; i++) {
    ids.push(await create());
    await api.advance(1000);
  }
  const entries = (await history()).entries;
  expect(entries.map((e: { id: string }) => e.id)).toEqual(
    ids.slice(1).reverse(),
  );
  expect((await request(`checks/${ids[0]}`)).status).toBe(410);
  const deadline = entries[0]!.expiresAt;
  paid();
  await history();
  const current = await checkData(await request(`checks/${ids[5]}`));
  const recheck = await request(
    `checks/${ids[5]}/references/1/recheck`,
    "POST",
    { expectedRevision: current.references[0]!.revision },
  );
  expect(recheck.status).toBe(200);
  await api.advance(29 * DAY);
  expect((await request(`checks/${ids[5]}`)).status).toBe(200);
  expect((await history()).entries[0]!.expiresAt).toBe(deadline);
  await api.advance(DAY);
  expect((await request(`checks/${ids[5]}`)).status).toBe(410);
  expect((await history()).entries).toEqual([]);
});

test("paid History survives daily key deletion; downgrade locks excess and old entries without changing their deadlines", async () => {
  const { api, request, history, create, paid } = await historyApi();
  paid();
  await request("history", "PUT", { enabled: true });
  const ids: string[] = [];
  for (let i = 0; i < 6; i++) {
    ids.push(await create());
    await api.advance(1000);
  }
  const original = (await history()).entries;
  api.state.quota.features = ["check"];
  api.state.quota.history.extendedUntil = null;
  const downgraded = (await history()).entries;
  expect(downgraded.filter((e: { locked: boolean }) => !e.locked)).toHaveLength(
    5,
  );
  expect(downgraded.find((e: { id: string }) => e.id === ids[0])?.locked).toBe(
    true,
  );
  expect((await request(`checks/${ids[0]}`)).status).toBe(403);
  expect((await request(`checks/${ids[0]}/events`)).status).toBe(403);
  expect((await request(`history/${ids[0]}/restart`, "POST")).status).toBe(403);
  await api.advance(30 * DAY);
  expect(
    (await history()).entries.every((e: { locked: boolean }) => e.locked),
  ).toBe(true);
  paid();
  const upgraded = (await history()).entries;
  expect(upgraded.map((e: { expiresAt: string }) => e.expiresAt)).toEqual(
    original.map((e: { expiresAt: string }) => e.expiresAt),
  );
  expect(upgraded.every((e: { locked: boolean }) => !e.locked)).toBe(true);
  expect((await request(`checks/${ids[0]}`)).status).toBe(200);
  await api.advance(60 * DAY);
  expect((await request(`checks/${ids[0]}`)).status).toBe(410);
  expect((await history()).entries).toEqual([]);
});

test("restart copies current fields and provenance to new billable slots, without results or manual judgments", async () => {
  const { api, request, history, create } = await historyApi();
  await request("history", "PUT", { enabled: true });
  const id = await create("Immutable History original");
  let old = await checkData(await request(`checks/${id}`));
  const judgment = await request(
    `checks/${id}/references/1/manual-override`,
    "POST",
    {
      expectedRevision: 1,
      resultId: old.references[0]!.results[0]!.id,
      expectedOverrideId: null,
      verdict: "correct",
    },
  );
  expect(judgment.status).toBe(200);
  const edited = await request(`checks/${id}/references/1/revisions`, "POST", {
    expectedRevision: 1,
    fields: { ...old.references[0]!.fields, title: "User's current title" },
    recheck: false,
  });
  expect(edited.status).toBe(200);
  old = await checkData(edited);
  expect(old.references[0]!.results[0]!.manualOverride).not.toBeNull();
  const restarted = await request(`history/${id}/restart`, "POST");
  expect(restarted.status).toBe(201);
  const next = await checkData(restarted);
  expect(next.id).not.toBe(id);
  expect(next.references[0]!).toMatchObject({
    originalText: "Immutable History original",
    fields: { title: "User's current title" },
    quotaEffect: "new-work",
    results: [],
    manualOverride: null,
  });
  expect(next.references[0]!.revisions[0]!.reference).toEqual(
    old.references[0]!.revisions.at(-1)?.reference,
  );
  expect(
    api.state.quotaCalls.filter(
      (c) => c.path.endsWith("/reserve") && c.body.checkId === next.id,
    ),
  ).toHaveLength(1);
  expect(await checkData(await request(`checks/${id}`))).toEqual(old);
  expect(
    (await history()).entries.some((e: { id: string }) => e.id === id),
  ).toBe(true);
});

test("revoking History purges every retained Check, including locked entries and their replay", async () => {
  const { api, request, history, create, paid } = await historyApi();
  paid();
  await request("history", "PUT", { enabled: true });
  const first = await create();
  await api.advance(31 * DAY);
  api.state.quota.features = ["check"];
  api.state.quota.history.extendedUntil = null;
  expect((await history()).entries[0]!.locked).toBe(true);
  const second = await create();
  const revoked = await request("history", "PUT", { enabled: false });
  expect(revoked.status).toBe(200);
  expect(await historyData(revoked)).toEqual({ enabled: false, entries: [] });
  for (const id of [first, second]) {
    expect((await request(`checks/${id}`)).status).toBe(410);
    expect((await request(`checks/${id}/events`)).status).toBe(410);
  }
  await request("history", "PUT", { enabled: true });
  await create();
});

test("downgrade locks a Free-stored entry displaced during a paid period rather than deleting it early", async () => {
  const { api, request, history, create, paid } = await historyApi();
  await request("history", "PUT", { enabled: true });
  const freeId = await create();
  await api.advance(1000);
  paid();
  for (let i = 0; i < 5; i++) {
    await create();
    await api.advance(1000);
  }
  api.state.quota.features = ["check"];
  api.state.quota.history.extendedUntil = null;
  const entries = (await history()).entries;
  expect(entries).toHaveLength(6);
  expect(entries.find((e: { id: string }) => e.id === freeId)).toMatchObject({
    locked: true,
  });
  paid();
  await history();
  expect((await request(`checks/${freeId}`)).status).toBe(200);
});

test("opening a stored Check and Re-checking a billed slot is free at zero Quota, while restarting is refused", async () => {
  const { api, request, create } = await historyApi();
  await request("history", "PUT", { enabled: true });
  const id = await create();
  api.state.quota.remaining = 0;
  expect((await request(`checks/${id}`)).status).toBe(200);
  const count = api.state.quotaCalls.filter((c) =>
    c.path.endsWith("/reserve"),
  ).length;
  const recheck = await request(`checks/${id}/references/1/recheck`, "POST", {
    expectedRevision: 1,
  });
  expect(recheck.status).toBe(200);
  expect(
    api.state.quotaCalls.filter((c) => c.path.endsWith("/reserve")),
  ).toHaveLength(count);
  const denied = await request(`history/${id}/restart`, "POST");
  expect(denied.status).toBe(402);
  expect(await denied.json()).toMatchObject({
    code: "quota-insufficient",
    required: 1,
    available: 0,
  });
});

test("without consent the fixed 24-hour deadline remains; enabling History never adopts an earlier ended Check", async () => {
  const { api, request, history, create } = await historyApi();
  const id = await create();
  await request("history", "PUT", { enabled: true });
  expect((await history()).entries).toEqual([]);
  await api.advance(23 * 60 * 60 * 1000);
  expect((await request(`checks/${id}`)).status).toBe(200);
  await api.advance(60 * 60 * 1000);
  expect((await request(`checks/${id}`)).status).toBe(410);
});

test("Account deletion purges retained History and content; no other Owner can open, restart or delete it", async () => {
  const { api, account, request, create } = await historyApi();
  await request("history", "PUT", { enabled: true });
  const id = await create();
  const other = newAccount();
  for (const [path, method] of [
    [`checks/${id}`, "GET"],
    [`history/${id}/restart`, "POST"],
    [`history/${id}`, "DELETE"],
  ])
    expect((await request(path!, method, undefined, other)).status).toBe(404);
  expect((await api.deleteOwner(account.ownerId)).status).toBe(200);
  expect((await request("history")).status).toBe(403);
  expect((await request(`checks/${id}`)).status).toBe(403);
});

test("paid feature text alone cannot extend retention without the service's bounded grant", async () => {
  const { api, request, history, create } = await historyApi();
  api.state.quota.features = ["check", "extended-history"];
  await request("history", "PUT", { enabled: true });
  await create();
  const entry = (await history()).entries[0]!;
  expect(Date.parse(entry.expiresAt) - Date.parse(entry.storedAt)).toBe(
    30 * DAY,
  );
});

test("an operator backup restores consented History without transient keys, with the fixed expiry fence applied before serving", async () => {
  let api = await startAccountApi({ worker: true, maintainOnStart: true });
  const account = newAccount();
  const request = (path: string, method = "GET", body?: unknown) =>
    fetch(`${api.apiUrl}/v2/${path}`, {
      method,
      headers: {
        authorization: `Bearer ${api.token(account)}`,
        "content-type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  try {
    await request("history", "PUT", { enabled: true });
    const created = await request("checks", "POST", {
      references: [
        {
          originalText: "History backup sentinel",
          fields: { DOI: "10.1038/nphys1170" },
        },
      ],
    });
    const id = (await checkData(created)).id;
    await expect
      .poll(
        async () =>
          (await historyData(await request("history"))).entries.length,
        { timeout: 15000 },
      )
      .toBe(1);
    const dump = await backup(api.adminUrl, api.appUrl, {
      unloggedData: false,
    });
    try {
      expect((await dump.text()).includes("History backup sentinel")).toBe(
        false,
      );
      await api.stop();
      api = await startAccountApi({
        database: await dump.restore(),
        maintainOnStart: true,
      });
      const restored = await request(`checks/${id}`);
      expect(restored.status).toBe(200);
      expect(await restored.text()).toContain("History backup sentinel");
      await api.advance(30 * DAY);
      await api.restartWeb();
      expect((await request(`checks/${id}`)).status).toBe(410);
      expect((await historyData(await request("history"))).entries).toEqual([]);
    } finally {
      await dump.discard();
    }
  } finally {
    await api.stop();
  }
}, 120000);

test("a History list held at the service edge cannot publish content after consent is revoked", async () => {
  let snapshots = 0,
    holdAt = Infinity;
  let arrived!: () => void, release!: () => void;
  const arrival = new Promise<void>((r) => {
    arrived = r;
  });
  const held = new Promise<void>((r) => {
    release = r;
  });
  const { request, create } = await historyApi({
    service: async (req) => {
      if (req.url === "/internal/quota/snapshot" && ++snapshots === holdAt) {
        arrived();
        await held;
      }
      return undefined;
    },
  });
  await request("history", "PUT", { enabled: true });
  await create("Must not escape after revocation");
  holdAt = snapshots + 2; // authorization snapshot, then response-envelope snapshot
  const pending = request("history");
  try {
    await arrival;
    expect((await request("history", "PUT", { enabled: false })).status).toBe(
      200,
    );
  } finally {
    release();
  }
  const response = await pending;
  expect(response.status).toBe(200);
  expect(await historyData(response)).toEqual({ enabled: false, entries: [] });
});

test("restart omits removed slots, offers first-N new work and refuses an empty bibliography", async () => {
  const { api, request } = await historyApi();
  await request("history", "PUT", { enabled: true });
  const created = await request("checks", "POST", {
    references: ["First", "Removed", "Third"].map((originalText) => ({
      originalText,
      fields: { DOI: "10.1038/nphys1170" },
    })),
  });
  const id = (await checkData(created)).id;
  let old = await checkData(await request(`checks/${id}`));
  await expect
    .poll(
      async () => {
        old = await checkData(await request(`checks/${id}`));
        return old.state;
      },
      { timeout: 15000 },
    )
    .toBe("ended");
  expect(
    (
      await request(`checks/${id}/references`, "POST", {
        expectedEventSeq: old.lastEventSeq,
        add: [],
        remove: [2],
      })
    ).status,
  ).toBe(200);
  api.state.quota.remaining = 1;
  expect((await request(`history/${id}/restart`, "POST")).status).toBe(402);
  const partial = await request(
    `history/${id}/restart?maxReferences=1`,
    "POST",
  );
  expect(partial.status).toBe(201);
  const next = await checkData(partial);
  expect(
    next.references.map((r: { originalText: string }) => r.originalText),
  ).toEqual(["First", "Third"]);
  expect(next.references[1]!.outcome).toEqual({
    kind: "status",
    status: "not-checked",
  });
  expect(
    api.state.quotaCalls.find(
      (c) => c.path.endsWith("/reserve") && c.body.checkId === next.id,
    )?.body.slots,
  ).toEqual([{ position: 1, generation: 0 }]);
  old = await checkData(await request(`checks/${id}`));
  expect(
    (
      await request(`checks/${id}/references`, "POST", {
        expectedEventSeq: old.lastEventSeq,
        add: [],
        remove: [1, 3],
      })
    ).status,
  ).toBe(200);
  expect((await request(`history/${id}/restart`, "POST")).status).toBe(400);
});

test("a delayed paid-grant snapshot cannot undo a newer downgrade", async () => {
  let capture = false;
  let arrived!: () => void, release!: () => void;
  const arrival = new Promise<void>((r) => {
    arrived = r;
  });
  const held = new Promise<void>((r) => {
    release = r;
  });
  const { api, request, create, paid, history } = await historyApi({
    service: async (req) => {
      if (req.url === "/internal/quota/snapshot" && capture) {
        capture = false;
        arrived();
        await held;
        return { status: 200, body: { outcome: "granted", quota: oldQuota } };
      }
      return undefined;
    },
  });
  paid();
  await request("history", "PUT", { enabled: true });
  await create();
  await api.advance(31 * DAY);
  const oldQuota = structuredClone(api.state.quota);
  capture = true;
  const pending = request("history");
  try {
    await arrival;
    api.state.quota.features = ["check"];
    api.state.quota.history.extendedUntil = null;
    api.state.quota.history.authorityVersion = 2;
    expect((await history()).entries[0]!.locked).toBe(true);
  } finally {
    release();
  }
  expect((await historyData(await pending)).entries[0]!.locked).toBe(true);
});

test("entry deletion and consent revocation do not depend on Quota availability", async () => {
  let unavailable = false;
  const { request, create } = await historyApi({
    service: (req) =>
      unavailable && req.url === "/internal/quota/snapshot"
        ? { status: 503 }
        : undefined,
  });
  await request("history", "PUT", { enabled: true });
  const first = await create();
  unavailable = true;
  expect((await request(`history/${first}`, "DELETE")).status).toBe(200);
  unavailable = false;
  expect((await request(`checks/${first}`)).status).toBe(410);
  const second = await create();
  unavailable = true;
  expect((await request("history", "PUT", { enabled: false })).status).toBe(
    200,
  );
  unavailable = false;
  expect((await request(`checks/${second}`)).status).toBe(410);
});

test("Free keeps the last five stored Checks in storage order when the injected clock does not advance", async () => {
  const { request, history, create } = await historyApi();
  await request("history", "PUT", { enabled: true });
  const ids: string[] = [];
  for (let i = 0; i < 6; i++) ids.push(await create());
  expect((await history()).entries.map((entry) => entry.id)).toEqual(
    ids.slice(1).reverse(),
  );
  expect((await request(`checks/${ids[0]}`)).status).toBe(410);
});

test("a signed downgrade fence locks History publication even while an earlier Quota reply is in flight", async () => {
  let snapshots = 0,
    holdAt = Infinity;
  let arrived!: () => void, release!: () => void;
  const arrival = new Promise<void>((r) => {
    arrived = r;
  });
  const held = new Promise<void>((r) => {
    release = r;
  });
  const { api, account, request, create, paid } = await historyApi({
    service: async (req) => {
      if (req.url === "/internal/quota/snapshot" && ++snapshots === holdAt) {
        arrived();
        await held;
        return { status: 200, body: { outcome: "granted", quota: oldQuota } };
      }
      return undefined;
    },
  });
  paid();
  await request("history", "PUT", { enabled: true });
  await create();
  await api.advance(31 * DAY);
  const oldQuota = structuredClone(api.state.quota);
  holdAt = snapshots + 2;
  const pending = request("history");
  try {
    await arrival;
    api.state.quota.features = ["check"];
    api.state.quota.history.extendedUntil = null;
    api.state.quota.history.authorityVersion = 2;
    expect((await api.invalidateOwner(account, 2)).status).toBe(200);
  } finally {
    release();
  }
  const entry = (await historyData(await pending)).entries[0]!;
  expect(entry.locked).toBe(true);
  expect(entry.label).toBeUndefined();
});

test("PDF reports respect History downgrade locks, entry deletion and revocation", async () => {
  const { api, request, create, paid } = await historyApi();
  paid();
  api.state.quota.features.push("verification-report");
  await request("history", "PUT", { enabled: true });
  const id = await create();
  await api.advance(31 * DAY);
  const reportPath = `checks/${id}/reports`;
  const created = await request(reportPath, "POST", {
    language: "en",
    style: "apa",
  });
  expect(created.status).toBe(202);
  const job = (await created.json()).data;
  const path = `${reportPath}/${job.id}`;
  await expect
    .poll(async () => (await (await request(path)).json()).data?.state, {
      timeout: 15000,
    })
    .toBe("ready");
  expect((await request(`${path}/file`)).status).toBe(200);
  api.state.quota.history.extendedUntil = null;
  api.state.quota.history.authorityVersion++;
  for (const suffix of ["", "/file"])
    expect((await request(`${path}${suffix}`)).status).toBe(403);
  expect(
    (await request(reportPath, "POST", { language: "en", style: "apa" }))
      .status,
  ).toBe(403);
  paid();
  api.state.quota.features.push("verification-report");
  expect((await request(`${path}/file`)).status).toBe(200);
  expect((await request(`history/${id}`, "DELETE")).status).toBe(200);
  expect((await request(`${path}/file`)).status).toBe(410);
  const second = await create();
  const next = await request(`checks/${second}/reports`, "POST", {
    language: "en",
    style: "apa",
  });
  expect(next.status).toBe(202);
  const nextJob = (await next.json()).data;
  await request("history", "PUT", { enabled: false });
  expect(
    (await request(`checks/${second}/reports/${nextJob.id}/file`)).status,
  ).toBe(410);
});

test("a signed downgrade during report authorization refuses creation for locked History", async () => {
  let snapshots = 0,
    holdAt = Infinity;
  let arrived!: () => void, release!: () => void;
  const arrival = new Promise<void>((r) => {
    arrived = r;
  });
  const held = new Promise<void>((r) => {
    release = r;
  });
  const { api, account, request, create, paid } = await historyApi({
    service: async (req) => {
      if (req.url === "/internal/quota/snapshot" && ++snapshots === holdAt) {
        arrived();
        await held;
        return { status: 200, body: { outcome: "granted", quota: oldQuota } };
      }
      return undefined;
    },
  });
  paid();
  api.state.quota.features.push("verification-report");
  await request("history", "PUT", { enabled: true });
  const id = await create();
  await api.advance(31 * DAY);
  const oldQuota = structuredClone(api.state.quota);
  holdAt = snapshots + 2;
  const pending = request(`checks/${id}/reports`, "POST", {
    language: "en",
    style: "apa",
  });
  try {
    await arrival;
    api.state.quota.history.extendedUntil = null;
    api.state.quota.history.authorityVersion = 2;
    expect((await api.invalidateOwner(account, 2)).status).toBe(200);
  } finally {
    release();
  }
  expect((await pending).status).toBe(403);
});
