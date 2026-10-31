// SPDX-License-Identifier: AGPL-3.0-or-later
// Confirmed seam: published HTTP/SSE with disposable PostgreSQL and HTTP fixtures.
import { afterAll, beforeAll, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { startTestService } from "./support/service.ts";
import { startDoiFixtures, physicsReference } from "./support/doi-fixtures.ts";
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_REVISIONS_PORT ?? 54183),
    0,
    fixtures.env,
  );
});
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
it("commits a user field revision without rewriting original input or earlier evidence", async () => {
  const check = await create();
  const response = await post(`/${check.id}/references/1/revisions`, {
    expectedRevision: 1,
    fields: { DOI: "10.1038/nphys1170", title: "Corrected title" },
    recheck: false,
  });
  expect(response.status).toBe(200);
  const edited = CheckResponse.parse(await response.json()).data.references[0]!;
  expect(edited).toMatchObject({
    originalText: physicsReference,
    revision: 2,
    fields: { title: "Corrected title" },
    outcome: { kind: "status", status: "not-checked" },
  });
  expect(edited.revisions).toHaveLength(2);
  expect(edited.revisions[0]).toMatchObject({
    revision: 1,
    reference: {
      originalText: physicsReference,
      csl: { title: "Measured measurement" },
    },
  });
  expect(edited.revisions[1]).toMatchObject({
    revision: 2,
    provenance: "user",
    reference: { structuring: { path: "user" } },
  });
  expect(edited.results).toEqual(check.references[0]!.results);
  const stale = await post(`/${check.id}/references/1/revisions`, {
    expectedRevision: 1,
    fields: { title: "stale" },
    recheck: false,
  });
  expect(stale.status).toBe(409);
  expect((await snapshot(check.id)).references[0]).toEqual(edited);
});
it("re-checks only the corrected slot for free, streaming its current status and appending revision-bound evidence", async () => {
  const check = await create();
  const earlier = check.references[0]!.results;
  const gate = fixtures.hold("/api/handles/10.5555/revision-held");
  try {
    const response = await post(`/${check.id}/references/1/revisions`, {
      expectedRevision: 1,
      fields: { DOI: "10.5555/revision-held" },
      recheck: true,
    });
    expect(response.status).toBe(200);
    const running = CheckResponse.parse(await response.json()).data;
    expect(running).toMatchObject({
      state: "ended",
      references: [
        {
          revision: 2,
          quotaEffect: "free-recheck",
          outcome: { kind: "status", status: "running" },
        },
      ],
    });
    await gate.arrived;
    expect(
      (
        await post(`/${check.id}/references/1/revisions`, {
          expectedRevision: 2,
          fields: {},
          recheck: false,
        })
      ).status,
    ).toBe(409);
    expect((await snapshot(check.id)).references[0]!.results).toEqual(earlier);
    gate.release();
    await expect
      .poll(
        async () => (await snapshot(check.id)).references[0]!.results.length,
      )
      .toBe(2);
    const finished = await snapshot(check.id);
    expect(finished.references[0]!.results[0]).toMatchObject({
      revision: 2,
      outcome: {
        kind: "verdict",
        reference: { csl: { DOI: "10.5555/revision-held" } },
      },
    });
    expect(finished.references[0]!.results[1]).toEqual(earlier[0]);
    expect(finished.endReason).toBe(check.endReason);
    const replay = await fetch(
      `${service.apiUrl}/v2/checks/${check.id}/events`,
      {
        headers: { "last-event-id": running.lastEventCursor },
        signal: AbortSignal.timeout(5000),
      },
    );
    const text = await replay.text();
    expect(text).toContain('"revision":2');
    expect(text).toContain('"status":"running"');
    expect(text).toContain('"kind":"verdict"');
  } finally {
    gate.release();
  }
});
it("previews and applies list changes against a current snapshot, with new work in a new stable slot", async () => {
  const check = await create();
  const response = await post(`/${check.id}/references`, {
    expectedEventSeq: check.lastEventSeq,
    remove: [1],
    add: [
      {
        originalText: "Added by hand",
        fields: { DOI: "10.1038/nphys1170", title: "Added title" },
      },
    ],
  });
  expect(response.status).toBe(200);
  const changed = CheckResponse.parse(await response.json()).data;
  expect(changed.references).toHaveLength(1);
  expect(changed.references[0]).toMatchObject({
    slot: 2,
    originalText: "Added by hand",
    revision: 1,
    quotaEffect: "new-work",
  });
  expect(
    (
      await post(`/${check.id}/references`, {
        expectedEventSeq: check.lastEventSeq,
        remove: [2],
        add: [],
      })
    ).status,
  ).toBe(409);
  await expect
    .poll(async () => (await snapshot(check.id)).references[0]!.outcome.kind)
    .toBe("verdict");
  const finished = await snapshot(check.id);
  expect(finished.references[0]!.results).toHaveLength(1);
  const recheck = await post(`/${check.id}/references/2/recheck`, {
    expectedRevision: 1,
  });
  expect(recheck.status).toBe(200);
  expect(
    CheckResponse.parse(await recheck.json()).data.references[0]!.quotaEffect,
  ).toBe("free-recheck");
  await expect
    .poll(async () => (await snapshot(check.id)).references[0]!.results.length)
    .toBe(2);
  expect((await snapshot(check.id)).references.map((r) => r.slot)).toEqual([2]);
});
it("keeps idle slots editable while another runs, but rejects membership changes and concurrent stale saves", async () => {
  const gate = fixtures.hold("/api/handles/10.5555/other-running");
  try {
    const response = await post("", {
      references: [
        { originalText: "first", fields: { DOI: "10.1038/nphys1170" } },
        { originalText: "second", fields: { DOI: "10.5555/other-running" } },
      ],
    });
    const check = CheckResponse.parse(await response.json()).data;
    await gate.arrived;
    await expect
      .poll(async () => (await snapshot(check.id)).references[0]!.outcome.kind)
      .toBe("verdict");
    expect(
      (
        await post(`/${check.id}/references/2/revisions`, {
          expectedRevision: 1,
          fields: { title: "running edit" },
          recheck: false,
        })
      ).status,
    ).toBe(409);
    const idle = await post(`/${check.id}/references/1/revisions`, {
      expectedRevision: 1,
      fields: { title: "Idle edit" },
      recheck: false,
    });
    expect(idle.status).toBe(200);
    const current = CheckResponse.parse(await idle.json()).data;
    expect(
      (
        await post(`/${check.id}/references`, {
          expectedEventSeq: current.lastEventSeq,
          remove: [1],
          add: [],
        })
      ).status,
    ).toBe(409);
    const competing = await Promise.all(
      ["one", "two"].map((title) =>
        post(`/${check.id}/references/1/revisions`, {
          expectedRevision: 2,
          fields: { title },
          recheck: false,
        }),
      ),
    );
    expect(competing.map((r) => r.status).sort()).toEqual([200, 409]);
    const saved = (await snapshot(check.id)).references[0]!;
    expect(saved.revisions).toHaveLength(3);
    expect(saved.originalText).toBe("first");
    expect(
      (
        await post(`/${check.id}/references/1/revisions`, {
          expectedRevision: 3,
          fields: {},
          originalText: "replacement",
          recheck: false,
        })
      ).status,
    ).toBe(400);
    expect((await snapshot(check.id)).references[0]).toEqual(saved);
  } finally {
    gate.release();
  }
});
it("a same-slot Re-check never reruns the other finished Reference", async () => {
  const response = await post("", {
    references: [1, 2].map((i) => ({
      originalText: `Reference ${i}`,
      fields: { DOI: "10.1038/nphys1170" },
    })),
  });
  const check = CheckResponse.parse(await response.json()).data;
  await expect.poll(async () => (await snapshot(check.id)).state).toBe("ended");
  const other = (await snapshot(check.id)).references[1];
  expect(
    (await post(`/${check.id}/references/1/recheck`, { expectedRevision: 1 }))
      .status,
  ).toBe(200);
  await expect
    .poll(async () => (await snapshot(check.id)).references[0]!.results.length)
    .toBe(2);
  expect((await snapshot(check.id)).references[1]).toEqual(other);
});
