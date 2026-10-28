// SPDX-License-Identifier: AGPL-3.0-or-later
// Real workers, PG, public HTTP/SSE; only external source responses and time controlled.
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  CheckResponse,
  CheckEvent,
} from "@source-taster/contract-verification/v2";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { lifecycleService } from "./support/lifecycle-service.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
let openalex: Awaited<ReturnType<typeof startDoiFixtures>>;
let crossref: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof lifecycleService>>;
beforeEach(async () => {
  openalex = await startDoiFixtures();
  crossref = await startDoiFixtures();
  openalex.respond("/works", 200, { results: [] });
  crossref.respond("/works", 200, { message: { items: [] } });
  service = await lifecycleService({
    ...crossref.env,
    SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
    SOURCE_TASTER_OPENALEX_ENABLED: "true",
    SOURCE_TASTER_OPENALEX_BASE_URL:
      openalex.env.SOURCE_TASTER_CROSSREF_BASE_URL,
    TEST_CLIENT_LEASE_MS: "75000",
    TEST_WORKER_CLAIM_MS: "45000",
  });
});
afterEach(async () => {
  await service?.stop();
  await openalex?.stop();
  await crossref?.stop();
});
async function create() {
  const response = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      references: [
        {
          originalText: "Synthetic clock witness",
          fields: {
            title: "Synthetic article",
            author: [{ family: "Alpha" }],
            issued: { literal: "2021" },
          },
        },
      ],
    }),
  });
  return CheckResponse.parse(await response.json()).data;
}
async function snapshot(id: string) {
  return CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${id}`)).json(),
  ).data;
}
it("names sources unfinished at the original hard deadline without sending later queries", async () => {
  const held = openalex.hold("/works", true);
  const worker = service.worker();
  await worker.ready;
  const created = await create();
  await held.arrived;
  await service.advance(30001);
  held.release();
  await expect
    .poll(async () => (await snapshot(created.id)).state)
    .toBe("ended");
  const outcome = (await snapshot(created.id)).references[0]!.outcome;
  expect(outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    failedSources: ["openalex", "crossref"],
  });
  if (outcome.kind !== "verdict") throw new Error("Expected Verdict");
  expect(
    outcome.evidence
      .filter((e) => e.source === "crossref")
      .every((e) => e.attempts === 0 && e.reason === "deadline"),
  ).toBe(true);
  expect(crossref.requests).toHaveLength(0);
});
it("shares OpenAlex permits and actual-send pacing across workers and all query kinds", async () => {
  const a = service.worker(),
    b = service.worker();
  await Promise.all([a.ready, b.ready]);
  const first = await create(),
    second = await create();
  await expect
    .poll(async () => (await snapshot(first.id)).state, { timeout: 15000 })
    .toBe("ended");
  await expect
    .poll(async () => (await snapshot(second.id)).state, { timeout: 15000 })
    .toBe("ended");
  expect(openalex.requests).toHaveLength(6);
  for (let i = 1; i < openalex.requests.length; i++) {
    expect(
      openalex.requests[i]!.at - openalex.requests[i - 1]!.at,
    ).toBeGreaterThanOrEqual(995);
    expect(openalex.requests[i - 1]!.completedAt).toBeLessThanOrEqual(
      openalex.requests[i]!.at,
    );
  }
  expect(
    openalex.requests.some(
      (r) =>
        r.path.includes("title.search") && !r.path.includes("raw_author_name"),
    ),
  ).toBe(true);
  expect(
    openalex.requests.some(
      (r) =>
        !r.path.includes("title.search") && r.path.includes("raw_author_name"),
    ),
  ).toBe(true);
});
it("cancels a held bibliographic response and replay never resurrects its late Candidate", async () => {
  const held = openalex.hold("/works", true);
  openalex.respond("/works", 200, {
    results: [
      {
        id: "https://openalex.org/W77",
        title: "Synthetic article",
        authorships: [{ author: { display_name: "Alpha" } }],
      },
    ],
  });
  await service.worker().ready;
  const created = await create();
  await held.arrived;
  const cancelled = CheckResponse.parse(
    await (
      await fetch(`${service.apiUrl}/v2/checks/${created.id}/cancel`, {
        method: "POST",
      })
    ).json(),
  ).data;
  held.release();
  expect(cancelled.references[0]!.outcome).toEqual({
    kind: "status",
    status: "cancelled",
  });
  const response = await fetch(
    `${service.apiUrl}/v2/checks/${created.id}/events`,
    { headers: { "last-event-id": `${created.id}:0` } },
  );
  const events = [];
  for await (const frame of readSseFrames(response.body!))
    events.push(CheckEvent.parse(JSON.parse(frame.data)));
  expect(
    events.filter(
      (e) =>
        e.type === "reference.updated" &&
        e.reference.outcome.kind === "verdict",
    ),
  ).toHaveLength(0);
  expect((await snapshot(created.id)).references[0]!.outcome).toEqual(
    cancelled.references[0]!.outcome,
  );
});
