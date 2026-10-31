// SPDX-License-Identifier: AGPL-3.0-or-later
// Replay edge of the load harness (#117, ADR-0007): Data source responses and
// their recorded latencies are replayed only at the HTTP edge of the adapters.
// Real loopback HTTP; no live provider is contacted.
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  classify,
  loadRecording,
  recordedPolicy,
  requestKey,
  startReplay,
  syntheticPolicy,
  syntheticWorkload,
  type Recording,
  type ReplayPolicy,
} from "../scripts/load/replay.ts";

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
});
async function replay(policy: ReplayPolicy) {
  const server = await startReplay({ port: 0, policy });
  cleanups.push(server.stop);
  return server;
}

describe("replay server", () => {
  it("waits the recorded latency before it answers", async () => {
    const server = await replay(() => ({
      status: 200,
      body: { results: [] },
      latencyMs: 300,
    }));
    const start = performance.now();
    const response = await fetch(`${server.url}/works?filter=title.search:x`);
    const elapsed = performance.now() - start;
    expect(response.status).toBe(200);
    expect(elapsed).toBeGreaterThanOrEqual(290);
    expect(elapsed).toBeLessThan(1500);
  });

  it("keeps a latency beyond the request timeout a real timeout", async () => {
    const server = await replay(() => ({
      status: 200,
      body: { results: [] },
      latencyMs: 600,
    }));
    const abort = AbortSignal.timeout(150);
    await expect(
      fetch(`${server.url}/works?filter=title.search:x`, { signal: abort }),
    ).rejects.toThrow();
  });

  it("replays rate-limit and outage statuses with their headers", async () => {
    const server = await replay((request) =>
      request.url.pathname === "/works"
        ? {
            status: 429,
            headers: { "retry-after": "1" },
            body: { error: "slow down" },
            latencyMs: 0,
          }
        : { status: 503, body: {}, latencyMs: 0 },
    );
    const limited = await fetch(`${server.url}/works?filter=title.search:x`);
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("1");
    const down = await fetch(
      `${server.url}/europepmc/webservices/rest/search?query=x`,
    );
    expect(down.status).toBe(503);
  });

  it("counts requests per Data source and answers an unrecorded one as unmatched", async () => {
    const server = await replay((request) =>
      request.source === "openalex"
        ? { status: 200, body: { results: [] }, latencyMs: 0 }
        : undefined,
    );
    await fetch(`${server.url}/works?filter=title.search:a`);
    await fetch(`${server.url}/works?filter=title.search:b`);
    const missing = await fetch(`${server.url}/works?query.title=b&rows=5`);
    expect(missing.status).toBe(404);
    expect(server.stats()).toMatchObject({
      requests: { openalex: 2, crossref: 1 },
      unmatched: 1,
    });
    // The report holds the Data source and category, never the request text.
    expect(JSON.stringify(server.stats())).not.toContain("query.title=b");
  });

  it("counts a request to a path no adapter uses as unmatched", async () => {
    const server = await replay(() => undefined);
    await fetch(`${server.url}/something/else`);
    expect(server.stats().unmatched).toBe(1);
    expect(server.stats().requests).toMatchObject({ unknown: 1 });
  });

  it("does not count the bare root as a request", async () => {
    // Editor port detection and health probes are no Data source request.
    const server = await replay(() => undefined);
    await fetch(`${server.url}/`);
    expect(server.stats().unmatched).toBe(0);
  });
});

describe("Data source classification", () => {
  const base = "http://127.0.0.1:4502";
  it.each([
    ["/works?filter=title.search:x&per_page=5", "openalex"],
    ["/works/doi%3A10.1000%2Fx", "openalex"],
    ["/works?query.bibliographic=x&rows=5", "crossref"],
    ["/works/10.1038%2Fnphys1170", "crossref"],
    ["/api/handles/10.1038%2Fnphys1170", "doi.org"],
    ["/europepmc/webservices/rest/search?query=x", "europepmc"],
    ["/graph/v1/paper/search?query=x", "semanticscholar"],
    ["/api/query?id_list=1", "arxiv"],
    ["/search.json?title=x", "openlibrary"],
    ["/books/v1/volumes?q=x", "googlebooks"],
  ])("%s is %s", (path, source) => {
    expect(classify(new URL(base + path))).toBe(source);
  });
});

describe("recorded replay", () => {
  const recording: Recording = {
    authorization: "operator-approved recording 2026-10",
    entries: [
      {
        source: "openalex",
        key: requestKey(
          "openalex",
          new URL("http://x/works?filter=title.search:Foo&per_page=5"),
        ),
        status: 200,
        body: { results: [{ id: "W1" }] },
        latencyMs: 120,
      },
    ],
    workload: [
      {
        id: "ref-1",
        category: "findable",
        originalText: "Private text",
        fields: { title: "Foo" },
      },
    ],
  };

  it("matches the exact request regardless of query parameter order", () => {
    const policy = recordedPolicy(recording);
    const answer = policy({
      source: "openalex",
      url: new URL("http://x/works?per_page=5&filter=title.search:Foo"),
      method: "GET",
    });
    expect(answer).toMatchObject({ status: 200, latencyMs: 120 });
    expect(
      policy({
        source: "openalex",
        url: new URL("http://x/works?filter=title.search:Bar&per_page=5"),
        method: "GET",
      }),
    ).toBeUndefined();
  });

  it("loads a private recording with its digest and authorization", async () => {
    const directory = await mkdtemp(join(tmpdir(), "st-load-replay-"));
    cleanups.push(() => rm(directory, { recursive: true, force: true }));
    const file = join(directory, "recording.json");
    await writeFile(file, JSON.stringify(recording));
    const loaded = await loadRecording(file);
    expect(loaded.digest).toMatch(/^sha256:[a-f0-9]{64}$/u);
    expect(loaded.recording.authorization).toBe(recording.authorization);
    expect(loaded.recording.workload).toHaveLength(1);
  });

  it("refuses a recording without authorization metadata", async () => {
    const directory = await mkdtemp(join(tmpdir(), "st-load-replay-"));
    cleanups.push(() => rm(directory, { recursive: true, force: true }));
    const file = join(directory, "recording.json");
    await writeFile(
      file,
      JSON.stringify({ entries: recording.entries, workload: [] }),
    );
    await expect(loadRecording(file)).rejects.toThrow(/authorization/iu);
  });
});

describe("synthetic latency witness", () => {
  const witness = {
    findableLatencyMs: 40,
    notFindableLatencyMs: 70,
  };
  const workload = syntheticWorkload({
    checks: 2,
    referencesPerCheck: 10,
    notFindableShare: 0.2,
  });

  it("builds fixed lists with the stated findable share per Check", () => {
    expect(workload).toHaveLength(2);
    for (const list of workload) {
      expect(list).toHaveLength(10);
      expect(list.filter((r) => r.category === "not-findable")).toHaveLength(2);
    }
    // Reference text is synthetic and unique across all Checks.
    const titles = workload.flat().map((r) => r.fields.title);
    expect(new Set(titles).size).toBe(20);
  });

  it("identifies a findable Reference on its first query and finds nothing for the others", () => {
    const policy = syntheticPolicy(witness);
    const findable = workload[0]!.find((r) => r.category === "findable")!;
    const missing = workload[0]!.find((r) => r.category === "not-findable")!;
    const query = (title: string) =>
      new URL(
        `http://x/works?${new URLSearchParams({ filter: `title.search:${title},publication_year:2021`, per_page: "5" })}`,
      );
    const hit = policy({
      source: "openalex",
      url: query(findable.fields.title),
      method: "GET",
    });
    expect(hit).toMatchObject({ status: 200, latencyMs: 40 });
    expect(JSON.stringify(hit!.body)).toContain(findable.fields.title);
    const miss = policy({
      source: "openalex",
      url: query(missing.fields.title),
      method: "GET",
    });
    expect(miss).toMatchObject({
      status: 200,
      latencyMs: 70,
      body: { results: [] },
    });
  });

  it("answers every other Data source with its empty result shape", () => {
    const policy = syntheticPolicy(witness);
    expect(
      policy({
        source: "crossref",
        url: new URL("http://x/works?query.title=Witness&rows=5"),
        method: "GET",
      })?.body,
    ).toEqual({ status: "ok", message: { items: [] } });
    expect(
      policy({
        source: "europepmc",
        url: new URL("http://x/europepmc/webservices/rest/search?query=x"),
        method: "GET",
      })?.body,
    ).toEqual({ hitCount: 0, resultList: { result: [] } });
  });
});
