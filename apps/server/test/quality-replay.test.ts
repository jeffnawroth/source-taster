// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 Data source replay edge. Entries are synthetic protocol witnesses.
import { afterEach, expect, it } from "vitest";
import { startReplay } from "../scripts/quality/replay.ts";
import type { FixtureEntry } from "../scripts/quality/dataset.ts";

let replay: Awaited<ReturnType<typeof startReplay>> | undefined;
afterEach(async () => {
  await replay?.stop();
  replay = undefined;
});
const entry = (overrides: Partial<FixtureEntry>): FixtureEntry => ({
  source: "crossref",
  method: "GET",
  path: "/works?query.title=Synthetic&rows=5",
  status: 200,
  headers: { "content-type": "application/json" },
  body: '{"message":{"items":[]}}',
  delayMs: 0,
  license: "synthetic",
  ...overrides,
});

it("serves each Data source from its own loopback origin, matching the query in any order", async () => {
  replay = await startReplay([
    entry({}),
    entry({ source: "openalex", path: "/works/doi%3A10.5555%2Fx", body: '{"id":"W1"}' }),
  ]);
  const crossref = replay.env.SOURCE_TASTER_CROSSREF_BASE_URL!;
  const openalex = replay.env.SOURCE_TASTER_OPENALEX_BASE_URL!;
  expect(new URL(crossref).hostname).toBe("127.0.0.1");
  expect(crossref).not.toBe(openalex);
  const response = await fetch(`${crossref}/works?rows=5&query.title=Synthetic`);
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("application/json");
  expect(await response.json()).toEqual({ message: { items: [] } });
  expect(await (await fetch(`${openalex}/works/doi%3A10.5555%2Fx`)).json()).toEqual({ id: "W1" });
  expect(replay.misses()).toEqual([]);
});

it("answers an unrecorded request with a server error and counts the miss, never an empty answer", async () => {
  replay = await startReplay([entry({})]);
  const response = await fetch(
    `${replay.env.SOURCE_TASTER_CROSSREF_BASE_URL}/works?query.title=Other&rows=5`,
  );
  expect(response.status).toBe(503);
  expect(replay.misses()).toEqual([
    { source: "crossref", method: "GET", path: "/works?query.title=Other&rows=5" },
  ]);
});

it("matches a recorded request body and replays recorded latency", async () => {
  replay = await startReplay([
    entry({
      source: "semanticscholar",
      method: "POST",
      path: "/graph/v1/paper/batch?fields=title",
      requestBody: '{"ids":["ARXIV:2101.00001"]}',
      body: "[null]",
      delayMs: 120,
    }),
  ]);
  const base = replay.env.SOURCE_TASTER_SEMANTICSCHOLAR_BASE_URL!;
  const started = performance.now();
  const hit = await fetch(`${base}/graph/v1/paper/batch?fields=title`, {
    method: "POST",
    body: '{"ids":["ARXIV:2101.00001"]}',
  });
  expect(await hit.json()).toEqual([null]);
  expect(performance.now() - started).toBeGreaterThanOrEqual(110);
  const other = await fetch(`${base}/graph/v1/paper/batch?fields=title`, {
    method: "POST",
    body: '{"ids":["ARXIV:2101.00002"]}',
  });
  expect(other.status).toBe(503);
  expect(replay.misses()).toHaveLength(1);
});

it("routes web page and archive requests through the web fixture origin", async () => {
  replay = await startReplay([
    entry({ source: "web", path: "/page", body: "<title>x</title>", headers: { "content-type": "text/html" } }),
  ]);
  expect(replay.env.SOURCE_TASTER_WEB_FIXTURE_BASE_URL).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
  const page = await fetch(`${replay.env.SOURCE_TASTER_WEB_FIXTURE_BASE_URL}/page`);
  expect(await page.text()).toBe("<title>x</title>");
});
