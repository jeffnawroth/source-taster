// SPDX-License-Identifier: AGPL-3.0-or-later
// Approved seam: real PostgreSQL + public HTTP/SSE; only upstream HTTP is held.
import { afterAll, beforeAll, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification";
import { startTestService } from "./support/service.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_CONCURRENT_PORT ?? 54181),
    0,
    fixtures.env,
  );
});
afterAll(async () => {
  await service?.stop();
  await fixtures?.stop();
});
async function create(dois: string[]) {
  const response = await fetch(`${service.apiUrl}/v1/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      references: dois.map((doi) => ({
        originalText: doi,
        fields: { DOI: doi },
      })),
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
it("runs References concurrently and keeps stable slots when the second finishes first", async () => {
  const first = fixtures.hold("/api/handles/10.5555/held-first");
  const second = fixtures.hold("/api/handles/10.5555/held-second");
  const check = await create(["10.5555/held-first", "10.5555/held-second"]);
  try {
    await Promise.race([
      Promise.all([first.arrived, second.arrived]),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("References did not overlap at the adapter edge")),
          1500,
        ),
      ),
    ]);
    second.release();
    await expect
      .poll(async () => (await snapshot(check.id)).references[1]!.outcome.kind)
      .toBe("verdict");
    expect((await snapshot(check.id)).references[0]!.outcome).toEqual({
      kind: "status",
      status: "running",
    });
  } finally {
    first.release();
    second.release();
  }
  await expect.poll(async () => (await snapshot(check.id)).state).toBe("ended");
  expect((await snapshot(check.id)).references.map((r) => r.slot)).toEqual([
    1, 2,
  ]);
});
it("cancels only unfinished References, keeps committed evidence and ignores late output or repeated cancel", async () => {
  const held = fixtures.hold("/api/handles/10.5555/cancel-held");
  const check = await create(["10.1038/nphys1170", "10.5555/cancel-held"]);
  await held.arrived;
  await expect
    .poll(async () => (await snapshot(check.id)).references[0]!.outcome.kind)
    .toBe("verdict");
  const finished = (await snapshot(check.id)).references[0];
  const cancel = async () => {
    const response = await fetch(
      `${service.apiUrl}/v1/checks/${check.id}/cancel`,
      { method: "POST" },
    );
    expect(response.status).toBe(200);
    return CheckResponse.parse(await response.json()).data;
  };
  try {
    const cancelled = await cancel();
    expect(cancelled.state).toBe("ended");
    expect(cancelled.references[0]).toEqual(finished);
    expect(cancelled.references[1]!.outcome).toEqual({
      kind: "status",
      status: "cancelled",
    });
    held.release();
    expect(await cancel()).toEqual(cancelled);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(await snapshot(check.id)).toEqual(cancelled);
  } finally {
    held.release();
  }
});
