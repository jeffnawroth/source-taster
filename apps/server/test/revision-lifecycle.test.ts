// SPDX-License-Identifier: AGPL-3.0-or-later
// HTTP only. The owned test composition controls time; PostgreSQL and workers are real.
import { afterEach, beforeEach, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification/v2";
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
async function post(
  path: string,
  body: unknown = {},
  headers: Record<string, string> = {},
) {
  return fetch(`${service.apiUrl}/v2/checks${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
async function snapshot(id: string) {
  return CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${id}`)).json(),
  ).data;
}
async function create(dois = ["10.1038/nphys1170"]) {
  const res = await post("", {
    references: dois.map((DOI) => ({ originalText: DOI, fields: { DOI } })),
  });
  expect(res.status).toBe(201);
  return CheckResponse.parse(await res.json()).data;
}
it("retains the fixed end deadline across later slot runs and rejects expired Re-checks", async () => {
  const worker = service.worker();
  await worker.ready;
  const check = await create();
  await expect
    .poll(async () => (await snapshot(check.id)).references[0]!.outcome.kind)
    .toBe("verdict");
  await service.advance(23 * 60 * 60 * 1000);
  const rerun = await post(`/${check.id}/references/1/recheck`, {
    expectedRevision: 1,
  });
  expect(rerun.status).toBe(200);
  await expect
    .poll(async () => (await snapshot(check.id)).references[0]!.results.length)
    .toBe(2);
  await service.advance(2 * 60 * 60 * 1000);
  const expired = await post(`/${check.id}/references/1/recheck`, {
    expectedRevision: 1,
  });
  expect(expired.status).toBe(410);
  expect(await expired.json()).toMatchObject({ code: "check-expired" });
});
it("rejects exports and formatting of an expired Check", async () => {
  const worker = service.worker();
  await worker.ready;
  const check = await create();
  await expect
    .poll(async () => (await snapshot(check.id)).references[0]!.outcome.kind)
    .toBe("verdict");
  await service.advance(25 * 60 * 60 * 1000);
  for (const [path, body] of [
    ["export", { format: "csl-json", mode: "original" }],
    ["bibliography", { style: "apa", includeBibliography: true }],
  ] as const) {
    const response = await post(`/${check.id}/${path}`, body);
    expect(response.status).toBe(410);
    expect(await response.json()).toMatchObject({ code: "check-expired" });
  }
});
it("cancels a queued Re-check as a distinct run, preserves its previous Verdict, and keeps unbilled retries marked as new work", async () => {
  const worker = service.worker();
  await worker.ready;
  const check = await create();
  await expect
    .poll(async () => (await snapshot(check.id)).references[0]!.outcome.kind)
    .toBe("verdict");
  const previous = (await snapshot(check.id)).references[0]!.results;
  await worker.kill();
  expect(
    (await post(`/${check.id}/references/1/recheck`, { expectedRevision: 1 }))
      .status,
  ).toBe(200);
  const cancel = await post(`/${check.id}/cancel`);
  expect(cancel.status).toBe(200);
  const cancelled = CheckResponse.parse(await cancel.json()).data;
  expect(cancelled.references[0]).toMatchObject({
    outcome: { kind: "status", status: "cancelled" },
    quotaEffect: "free-recheck",
  });
  expect(cancelled.references[0]!.results[1]).toEqual(previous[0]);
  const unbilled = await create();
  expect((await post(`/${unbilled.id}/cancel`)).status).toBe(200);
  const retry = await post(`/${unbilled.id}/references/1/recheck`, {
    expectedRevision: 1,
  });
  expect(retry.status).toBe(200);
  expect(
    CheckResponse.parse(await retry.json()).data.references[0]!.quotaEffect,
  ).toBe("new-work");
});
it("enforces Owner scope and current creation permission for every field, run and list mutation", async () => {
  const check = await create();
  const paths = [
    {
      path: `/${check.id}/references/1/revisions`,
      body: {
        expectedRevision: 1,
        fields: { title: "forged" },
        recheck: false,
      },
    },
    {
      path: `/${check.id}/references/1/recheck`,
      body: { expectedRevision: 1 },
    },
    {
      path: `/${check.id}/references`,
      body: { expectedEventSeq: check.lastEventSeq, remove: [1], add: [] },
    },
  ];
  for (const request of paths) {
    expect(
      (await post(request.path, request.body, { "Test-Owner": "foreign" }))
        .status,
    ).toBe(404);
    expect(
      (await post(request.path, request.body, { "Test-Deny": "check:create" }))
        .status,
    ).toBe(403);
  }
  expect((await snapshot(check.id)).references[0]!.revision).toBe(1);
});
it("manual judgments enforce current permissions, ownership and the fixed content deadline", async () => {
  const worker = service.worker();
  await worker.ready;
  const check = await create();
  await expect
    .poll(async () => (await snapshot(check.id)).references[0]!.outcome.kind)
    .toBe("verdict");
  const before = (await snapshot(check.id)).references[0]!;
  const request = {
    expectedRevision: 1,
    resultId: before.results[0]!.id,
    expectedOverrideId: null,
    verdict: "correct",
  };
  const path = `/${check.id}/references/1/manual-override`;
  expect((await post(path, request, { "Test-Owner": "foreign" })).status).toBe(
    404,
  );
  expect(
    (await post(path, request, { "Test-Deny": "check:create" })).status,
  ).toBe(403);
  expect((await snapshot(check.id)).references[0]).toEqual(before);
  await service.advance(25 * 60 * 60 * 1000);
  expect((await post(path, request)).status).toBe(410);
});
