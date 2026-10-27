// SPDX-License-Identifier: AGPL-3.0-or-later
// HTTP/SSE only, real PG + real child workers. IPC controls time, never app state.
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  CheckResponse,
  CheckEvent,
} from "@source-taster/contract-verification";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { lifecycleService } from "./support/lifecycle-service.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof lifecycleService>>;
beforeEach(async () => {
  fixtures = await startDoiFixtures();
  service = await lifecycleService(fixtures.env);
});
afterEach(async () => {
  await service?.stop();
  await fixtures?.stop();
});
async function create(dois = ["10.5555/recovery"]) {
  const response = await fetch(`${service.apiUrl}/v1/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      references: dois.map((DOI) => ({ originalText: DOI, fields: { DOI } })),
    }),
  });
  expect(response.status).toBe(201);
  return CheckResponse.parse(await response.json()).data;
}
async function snapshot(id: string) {
  return CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v1/checks/${id}`)).json(),
  ).data;
}
async function post(
  id: string,
  action: string,
  headers: Record<string, string> = {},
) {
  return fetch(`${service.apiUrl}/v1/checks/${id}/${action}`, {
    method: "POST",
    headers,
  });
}
async function stream(
  id: string,
  cursor = "0",
  controller = new AbortController(),
) {
  return fetch(`${service.apiUrl}/v1/checks/${id}/events`, {
    headers: { "last-event-id": cursor },
    signal: controller.signal,
  });
}
it("disconnect is not cancel, another live attachment sustains the lease, and expiry ends the whole Check irreversibly", async () => {
  const created = await create(["10.5555/lease-one", "10.5555/lease-two"]);
  const first = new AbortController(),
    second = new AbortController();
  const a = await stream(created.id, "0", first);
  const b = await stream(created.id, "0", second);
  expect(a.status).toBe(200);
  expect(b.status).toBe(200);
  first.abort();
  await service.advance(6_000);
  expect((await post(created.id, "lease")).status).toBe(200);
  expect((await snapshot(created.id)).state).toBe("running");
  await service.advance(6_000);
  expect((await post(created.id, "lease")).status).toBe(200);
  expect((await snapshot(created.id)).state).toBe("running");
  second.abort();
  await service.advance(6_000);
  expect((await snapshot(created.id)).state).toBe("running");
  const reconnect = new AbortController();
  const reopened = await snapshot(created.id);
  const resumed = await stream(created.id, reopened.lastEventCursor, reconnect);
  expect(resumed.status).toBe(200);
  reconnect.abort();
  await service.advance(10_001);
  const expired = await snapshot(created.id);
  expect(expired).toMatchObject({ state: "ended", endReason: "lease-expired" });
  expect(expired.references.map((r) => r.outcome)).toEqual([
    { kind: "status", status: "cancelled" },
    { kind: "status", status: "cancelled" },
  ]);
  expect(
    CheckResponse.parse(await (await post(created.id, "lease")).json()).data,
  ).toEqual(expired);
  expect(
    CheckResponse.parse(await (await post(created.id, "cancel")).json()).data,
  ).toEqual(expired);
});
it("scopes lifecycle mutations to the Owner and distinct permissions", async () => {
  const created = await create();
  for (const action of ["cancel", "lease"]) {
    expect(
      (await post(created.id, action, { "Test-Owner": "foreign" })).status,
    ).toBe(404);
    expect(
      (
        await post(created.id, action, {
          "Test-Deny": action === "cancel" ? "check:cancel" : "check:renew",
        })
      ).status,
    ).toBe(403);
  }
  expect((await snapshot(created.id)).state).toBe("running");
});
it("recovers a killed worker without waiting for client lease expiry", async () => {
  const gate = fixtures.hold("/api/handles/10.5555/recovery");
  const worker = service.worker();
  await worker.ready;
  const created = await create();
  await gate.arrived;
  await worker.kill();
  await service.advance(2_001);
  gate.release();
  const replacement = service.worker();
  await replacement.ready;
  await expect
    .poll(async () => (await snapshot(created.id)).state)
    .toBe("ended");
  const ended = await snapshot(created.id);
  expect(ended.endReason).toBe("completed");
  expect(ended.references[0]!.outcome.kind).toBe("verdict");
  const replay = await stream(created.id);
  const terminal: CheckEvent[] = [];
  for await (const frame of readSseFrames(replay.body!)) {
    const event = CheckEvent.parse(JSON.parse(frame.data));
    if (
      event.type === "reference.updated" &&
      event.reference.outcome.kind === "verdict"
    )
      terminal.push(event);
  }
  expect(terminal).toHaveLength(1);
});
it("bounds a Check to ten active References across workers and admits other Checks fairly", async () => {
  const aDois = Array.from({ length: 12 }, (_, i) => `10.5555/fair-a${i + 1}`);
  const bDois = ["10.5555/fair-b1", "10.5555/fair-b2"];
  const gates = [...aDois, ...bDois].map((doi) =>
    fixtures.hold(`/api/handles/${doi}`),
  );
  const a = await create(aDois),
    b = await create(bDois);
  const first = service.worker(),
    second = service.worker();
  try {
    await Promise.all([first.ready, second.ready]);
    await expect
      .poll(
        () =>
          fixtures.requests.filter((r) => r.path.startsWith("/api/handles/"))
            .length,
        { timeout: 2500 },
      )
      .toBe(12);
    const snap = await snapshot(a.id);
    expect(snap.references.filter((r) => r.progress !== "queued")).toHaveLength(
      10,
    );
    expect(
      snap.references.filter((r) => r.progress === "queued").map((r) => r.slot),
    ).toEqual([11, 12]);
    expect(
      (await snapshot(b.id)).references.every((r) => r.progress !== "queued"),
    ).toBe(true);
  } finally {
    await Promise.all([post(a.id, "cancel"), post(b.id, "cancel")]);
    for (const gate of gates) gate.release();
  }
});
it("fences a superseded live worker and replay stays unchanged after its late response", async () => {
  const gate = fixtures.hold("/api/handles/10.5555/recovery");
  const old = service.worker();
  await old.ready;
  const created = await create();
  await gate.arrived;
  old.child.kill("SIGSTOP");
  try {
    await service.advance(2_001, [old]);
    gate.release();
    const next = service.worker();
    await next.ready;
    await expect
      .poll(async () => (await snapshot(created.id)).state)
      .toBe("ended");
    const ended = await snapshot(created.id);
    old.child.kill("SIGCONT");
    await service.advance(0);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(await snapshot(created.id)).toEqual(ended);
    const response = await stream(created.id, ended.lastEventCursor);
    expect(await response.text()).toBe("");
  } finally {
    old.child.kill("SIGCONT");
    gate.release();
  }
});
it("repeated worker crashes become internal failed Status, while source failures retain incomplete evidence", async () => {
  const gate = fixtures.hold("/api/handles/10.5555/recovery");
  const created = await create();
  for (let attempt = 1; attempt <= 3; attempt++) {
    const worker = service.worker();
    await worker.ready;
    await expect
      .poll(
        () =>
          fixtures.requests.filter(
            (r) => r.path === "/api/handles/10.5555/recovery",
          ).length,
      )
      .toBe(attempt);
    await worker.kill();
    await service.advance(2_001);
  }
  gate.release();
  const recovery = service.worker();
  await recovery.ready;
  await expect
    .poll(async () => (await snapshot(created.id)).state)
    .toBe("ended");
  expect((await snapshot(created.id)).references[0]!.outcome).toEqual({
    kind: "status",
    status: "failed",
  });
  fixtures.respond(
    "/api/handles/10.5555/outage",
    503,
    {},
    { "retry-after": "10" },
  );
  fixtures.respond("/works/10.5555/outage", 503, {}, { "retry-after": "10" });
  const incomplete = await create(["10.5555/outage"]);
  await expect
    .poll(async () => (await snapshot(incomplete.id)).state, { timeout: 5000 })
    .toBe("ended");
  expect((await snapshot(incomplete.id)).references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
  });
});
it("takes a consistent snapshot/cursor cut during cancellation and drains replay beyond one page", async () => {
  const created = await create(
    Array.from({ length: 120 }, (_, i) => `10.5555/replay-${i}`),
  );
  const foreign = await create();
  expect((await stream(created.id, foreign.lastEventCursor)).status).toBe(400);
  expect((await stream(created.id, `${created.id}:999999`)).status).toBe(400);
  const cuts = await Promise.all([
    snapshot(created.id),
    snapshot(created.id),
    post(created.id, "cancel").then(
      async (response) => CheckResponse.parse(await response.json()).data,
    ),
    snapshot(created.id),
  ]);
  const final = await snapshot(created.id);
  for (const cut of [created, ...cuts]) {
    let rebuilt = cut;
    const response = await stream(created.id, cut.lastEventCursor);
    for await (const frame of readSseFrames(response.body!)) {
      const event = CheckEvent.parse(JSON.parse(frame.data));
      expect(event.seq).toBe(rebuilt.lastEventSeq + 1);
      rebuilt = {
        ...rebuilt,
        lastEventSeq: event.seq,
        lastEventCursor: frame.id!,
      };
      if (event.type === "check.updated")
        rebuilt = {
          ...rebuilt,
          state: event.state,
          endReason: event.endReason,
        };
      else
        rebuilt = {
          ...rebuilt,
          references: rebuilt.references.map((reference) =>
            reference.slot === event.reference.slot
              ? { ...reference, ...event.reference }
              : reference,
          ),
        };
    }
    expect(rebuilt).toEqual(final);
  }
});
it("a source deadline yields incomplete evidence, not Check cancellation or a late negative DOI observation", async () => {
  await service.stop();
  service = await lifecycleService({
    ...fixtures.env,
    TEST_CLIENT_LEASE_MS: "100000",
    TEST_WORKER_CLAIM_MS: "45000",
  });
  const path = "/api/handles/10.5555/deadline";
  const gate = fixtures.hold(path);
  fixtures.respond(path, 404, {
    responseCode: 100,
    handle: "10.5555/deadline",
  });
  const worker = service.worker();
  await worker.ready;
  const created = await create(["10.5555/deadline"]);
  await gate.arrived;
  await service.advance(31_000);
  gate.release();
  await expect
    .poll(async () => (await snapshot(created.id)).state)
    .toBe("ended");
  const final = await snapshot(created.id);
  expect(final.endReason).toBe("completed");
  const outcome = final.references[0]!.outcome;
  expect(outcome).toMatchObject({ kind: "verdict", verdict: "not-verifiable" });
  if (outcome.kind !== "verdict")
    throw new Error("Expected incomplete Verdict evidence");
  expect(outcome.evidence).toContainEqual(
    expect.objectContaining({
      source: "doi.org",
      outcome: "unavailable",
      reason: "deadline",
    }),
  );
});
it("shares the Crossref public pool across workers and honors cooldown across Checks", async () => {
  const path = "/works/10.1038/nphys1170";
  const gate = fixtures.hold(path);
  const first = service.worker(),
    second = service.worker();
  await Promise.all([first.ready, second.ready]);
  const a = await create(["10.1038/nphys1170"]),
    b = await create(["10.1038/nphys1170"]);
  await gate.arrived;
  await new Promise((resolve) => setTimeout(resolve, 250));
  expect(fixtures.requests.filter((r) => r.path === path)).toHaveLength(1);
  gate.release();
  await expect
    .poll(async () => [
      (await snapshot(a.id)).state,
      (await snapshot(b.id)).state,
    ])
    .toEqual(["ended", "ended"]);
  const initial = fixtures.requests.filter((r) => r.path === path).length;
  fixtures.respond(path, 429, {}, { "retry-after": "1" });
  const c = await create(["10.1038/nphys1170"]);
  await expect
    .poll(() => fixtures.requests.filter((r) => r.path === path).length)
    .toBe(initial + 1);
  const cooldownAt = fixtures.requests
    .filter((r) => r.path === path)
    .at(-1)!.at;
  fixtures.reset();
  const d = await create(["10.1038/nphys1170"]);
  await expect
    .poll(
      async () => [(await snapshot(c.id)).state, (await snapshot(d.id)).state],
      { timeout: 5000 },
    )
    .toEqual(["ended", "ended"]);
  const after = fixtures.requests
    .filter((r) => r.path === path)
    .slice(initial + 1);
  expect(after.length).toBeGreaterThanOrEqual(2);
  expect(after.every((request) => request.at - cooldownAt >= 950)).toBe(true);
});
it("server heartbeats without client acknowledgements cannot keep a paused attachment alive indefinitely", async () => {
  const created = await create();
  const controller = new AbortController();
  await stream(created.id, "0", controller);
  try {
    await service.advance(6_000);
    await new Promise((resolve) => setTimeout(resolve, 150));
    await service.advance(4_001);
    expect(await snapshot(created.id)).toMatchObject({
      state: "ended",
      endReason: "lease-expired",
    });
  } finally {
    controller.abort();
  }
});
it("can cancel the configured maximum Check without stranding queued References", async () => {
  const created = await create(
    Array.from({ length: 1000 }, (_, i) => `10.5555/bounded-${i}`),
  );
  const response = await post(created.id, "cancel");
  expect(response.status).toBe(200);
  const cancelled = CheckResponse.parse(await response.json()).data;
  expect(cancelled.references).toHaveLength(1000);
  expect(
    cancelled.references.every(
      (reference) =>
        reference.outcome.kind === "status" &&
        reference.outcome.status === "cancelled",
    ),
  ).toBe(true);
  expect(
    CheckResponse.parse(await (await post(created.id, "cancel")).json()).data,
  ).toEqual(cancelled);
}, 40000);
