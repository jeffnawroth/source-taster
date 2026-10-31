// SPDX-License-Identifier: AGPL-3.0-or-later
// Confirmed seam: published HTTP/SSE, real PostgreSQL, fixture Data sources.
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { BibliographyResponse } from "@source-taster/contract-verification/bibliography";
import { startTestService } from "./support/service.ts";
import { startDoiFixtures, physicsReference } from "./support/doi-fixtures.ts";
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_OVERRIDES_PORT ?? 54884),
    0,
    fixtures.env,
  );
});
afterEach(() => fixtures.reset());
afterAll(async () => {
  await service?.stop();
  await fixtures?.stop();
});
async function post(path: string, body: unknown) {
  return fetch(`${service.apiUrl}/v2/checks${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
async function snapshot(id: string) {
  return CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${id}`)).json(),
  ).data;
}
async function create() {
  const response = await post("", { text: physicsReference });
  expect(response.status).toBe(201);
  const check = CheckResponse.parse(await response.json()).data;
  await expect.poll(async () => (await snapshot(check.id)).state).toBe("ended");
  return snapshot(check.id);
}
it("confirms a specific immutable result with a separate manual layer and replays it without changing evidence", async () => {
  const check = await create();
  const reference = check.references[0]!;
  const result = reference.results[0]!;
  const response = await post(`/${check.id}/references/1/manual-override`, {
    expectedRevision: 1,
    resultId: result.id,
    expectedOverrideId: null,
    verdict: "correct",
  });
  expect(response.status).toBe(200);
  const updated = CheckResponse.parse(await response.json()).data;
  expect(updated.references[0]).toMatchObject({
    manualOverride: { resultId: result.id, verdict: "correct" },
    results: [
      {
        id: result.id,
        manualOverride: { resultId: result.id, verdict: "correct" },
      },
    ],
  });
  expect(updated.references[0]!.outcome).toEqual(reference.outcome);
  expect(updated.references[0]!.results[0]!.outcome).toEqual(result.outcome);
  expect(updated.references[0]!.revisions).toEqual(reference.revisions);
  const replay = await fetch(`${service.apiUrl}/v2/checks/${check.id}/events`, {
    headers: { "last-event-id": check.lastEventCursor },
    signal: AbortSignal.timeout(5000),
  });
  const events = await replay.text();
  expect(events).toContain(updated.references[0]!.manualOverride!.id);
  expect(await snapshot(check.id)).toEqual(updated);
});
it("rejects stale concurrent judgments and old result IDs, visibly resets on Re-check, and retains the historical override", async () => {
  const check = await create();
  const result = check.references[0]!.results[0]!;
  const path = `/${check.id}/references/1/manual-override`;
  const request = {
    expectedRevision: 1,
    resultId: result.id,
    expectedOverrideId: null,
    verdict: "not-found",
  };
  const competing = await Promise.all([
    post(path, request),
    post(path, { ...request, verdict: "mixed-citation" }),
  ]);
  expect(competing.map((r) => r.status).sort()).toEqual([200, 409]);
  const overridden = (await snapshot(check.id)).references[0]!;
  expect(overridden.manualOverride).toBeTruthy();
  expect(overridden.outcome).toEqual(result.outcome);
  const running = CheckResponse.parse(
    await (
      await post(`/${check.id}/references/1/recheck`, { expectedRevision: 1 })
    ).json(),
  ).data;
  expect(running.references[0]).toMatchObject({
    outcome: { kind: "status", status: "running" },
    manualOverride: null,
    manualOverrideReset: true,
    results: [{ manualOverride: overridden.manualOverride }],
  });
  expect(
    (
      await post(path, {
        ...request,
        expectedOverrideId: overridden.manualOverride!.id,
      })
    ).status,
  ).toBe(409);
  await expect
    .poll(async () => (await snapshot(check.id)).references[0]!.results.length)
    .toBe(2);
  const finished = (await snapshot(check.id)).references[0]!;
  expect(finished).toMatchObject({
    manualOverride: null,
    manualOverrideReset: true,
  });
  expect(finished.results[1]).toEqual(overridden.results[0]);
  expect(
    (
      await post(path, {
        ...request,
        expectedOverrideId: overridden.manualOverride!.id,
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await post(path, {
        ...request,
        resultId: finished.results[0]!.id,
        verdict: "not-verifiable",
      })
    ).status,
  ).toBe(200);
  expect((await snapshot(check.id)).references[0]).toMatchObject({
    manualOverrideReset: false,
    manualOverride: { verdict: "not-verifiable" },
  });
});
it("does not apply a manual judgment to unverified field revisions, another slot or a removed slot", async () => {
  const check = await create();
  const result = check.references[0]!.results[0]!;
  const request = {
    expectedRevision: 1,
    resultId: result.id,
    expectedOverrideId: null,
    verdict: "correct",
  };
  expect(
    (await post(`/${check.id}/references/2/manual-override`, request)).status,
  ).toBe(404);
  expect(
    (
      await post(`/${check.id}/references/1/manual-override`, {
        ...request,
        verdict: "invented",
      })
    ).status,
  ).toBe(400);
  const saved = await post(`/${check.id}/references/1/revisions`, {
    expectedRevision: 1,
    fields: { title: "Unverified" },
    recheck: false,
  });
  expect(saved.status).toBe(200);
  expect(
    (
      await post(`/${check.id}/references/1/manual-override`, {
        ...request,
        expectedRevision: 2,
      })
    ).status,
  ).toBe(409);
  const current = await snapshot(check.id);
  expect(
    (
      await post(`/${check.id}/references`, {
        expectedEventSeq: current.lastEventSeq,
        add: [],
        remove: [1],
      })
    ).status,
  ).toBe(200);
  expect(
    (await post(`/${check.id}/references/1/manual-override`, request)).status,
  ).toBe(404);
});
it("manual Correct cannot manufacture identity, evidence, or an eligible Correction suggestion", async () => {
  // A perfect Candidate whose mandatory DOI resolution fails stays unresolved.
  fixtures.respond("/api/handles/10.1038/nphys1170", 503, {
    error: "synthetic-outage",
  });
  const response = await post("", { text: physicsReference });
  const id = CheckResponse.parse(await response.json()).data.id;
  await expect.poll(async () => (await snapshot(id)).state).toBe("ended");
  const before = (await snapshot(id)).references[0]!;
  expect(before.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    identity: { kind: "unresolved" },
  });
  expect(
    (
      await post(`/${id}/references/1/manual-override`, {
        expectedRevision: 1,
        resultId: before.results[0]!.id,
        expectedOverrideId: null,
        verdict: "correct",
      })
    ).status,
  ).toBe(200);
  expect((await snapshot(id)).references[0]!.outcome).toEqual(before.outcome);
  const bibliography = await post(`/${id}/bibliography`, {
    style: "apa",
    includeBibliography: true,
  });
  expect(bibliography.status).toBe(200);
  expect(await bibliography.json()).toMatchObject({
    data: { entries: [{ suggestion: null }] },
  });
});
it("a manual downgrade leaves an existing eligible suggestion and its source identity unchanged", async () => {
  const response = await post("", {
    references: [
      {
        originalText: "Typo",
        fields: { DOI: "10.1038/nphys1170", title: "Measured measurment" },
      },
    ],
  });
  const check = CheckResponse.parse(await response.json()).data;
  await expect.poll(async () => (await snapshot(check.id)).state).toBe("ended");
  const reference = (await snapshot(check.id)).references[0]!;
  const path = `/${check.id}/bibliography`;
  const input = { style: "apa", includeBibliography: true };
  const render = async () =>
    BibliographyResponse.parse(await (await post(path, input)).json()).data;
  const before = await render();
  expect(before.entries[0]!.suggestion).not.toBeNull();
  expect(
    (
      await post(`/${check.id}/references/1/manual-override`, {
        expectedRevision: 1,
        resultId: reference.results[0]!.id,
        expectedOverrideId: null,
        verdict: "not-found",
      })
    ).status,
  ).toBe(200);
  expect(await render()).toEqual(before);
  expect((await snapshot(check.id)).references[0]!.outcome).toEqual(
    reference.outcome,
  );
});
it("announces the reset only for the Re-check that replaced the overridden result", async () => {
  const check = await create();
  const path = `/${check.id}/references/1`;
  expect(
    (
      await post(`${path}/manual-override`, {
        expectedRevision: 1,
        resultId: check.references[0]!.results[0]!.id,
        expectedOverrideId: null,
        verdict: "not-found",
      })
    ).status,
  ).toBe(200);
  for (const [run, reset] of [
    [2, true],
    [3, false],
  ] as const) {
    expect(
      (await post(`${path}/recheck`, { expectedRevision: 1 })).status,
    ).toBe(200);
    await expect
      .poll(async () => {
        const reference = (await snapshot(check.id)).references[0]!;
        return reference.outcome.kind === "verdict"
          ? reference.results.length
          : 0;
      })
      .toBe(run);
    expect((await snapshot(check.id)).references[0]).toMatchObject({
      manualOverride: null,
      manualOverrideReset: reset,
    });
  }
});
