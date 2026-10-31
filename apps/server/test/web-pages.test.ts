// SPDX-License-Identifier: AGPL-3.0-or-later
// Published HTTP/SSE boundary, real PostgreSQL/processes; only external HTTP is replaced.
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import {
  CheckResponse,
  CheckEvent,
  type CreateCheckRequest,
  type VerdictResult,
} from "@source-taster/contract-verification/v2";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { startTestService } from "./support/service.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
type Csl = Extract<
  CreateCheckRequest,
  { references: unknown }
>["references"][number]["fields"];
let edge: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
let pageFixture: string;
let archiveFixture: unknown;
beforeAll(async () => {
  edge = await startDoiFixtures();
  pageFixture = await readFile(
    new URL("./fixtures/web/synthetic-page.html", import.meta.url),
    "utf8",
  );
  archiveFixture = JSON.parse(
    await readFile(
      new URL("./fixtures/web/synthetic-available.json", import.meta.url),
      "utf8",
    ),
  );
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_WEB_PORT ?? 3180),
    0,
    {
      ...edge.env,
      SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
      SOURCE_TASTER_URL_ENABLED: "true",
      SOURCE_TASTER_INTERNETARCHIVE_ENABLED: "true",
      SOURCE_TASTER_WEB_FIXTURE_BASE_URL:
        edge.env.SOURCE_TASTER_CROSSREF_BASE_URL,
    },
  );
});
afterAll(async () => {
  await service?.stop();
  await edge?.stop();
});
beforeEach(() => {
  edge.reset();
  edge.requests.length = 0;
  edge.respond("/works", 200, { message: { items: [] } });
  edge.respond("/wayback/available", 200, { archived_snapshots: {} });
});
const page: Csl = {
  type: "webpage",
  title: "Web route witness",
  URL: "https://example.com/page",
};
function html(
  path: string,
  title: string,
  status = 200,
  headers?: Record<string, string>,
) {
  edge.route((url) =>
    url.pathname === path
      ? {
          status,
          body: `<html><head><title>${title}</title></head><body>Evidence</body></html>`,
          contentType: "text/html",
          headers,
        }
      : undefined,
  );
}
async function run(fields: Csl): Promise<VerdictResult> {
  const response = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      references: [{ originalText: "Web Reference", fields }],
    }),
  });
  expect(response.status).toBe(201);
  const check = CheckResponse.parse(await response.json()).data;
  const stream = await fetch(`${service.apiUrl}/v2/checks/${check.id}/events`, {
    signal: AbortSignal.timeout(40000),
  });
  let streamed: unknown;
  for await (const frame of readSseFrames(stream.body!)) {
    const event = CheckEvent.parse(JSON.parse(frame.data));
    if (
      event.type === "reference.updated" &&
      event.reference.outcome.kind === "verdict"
    )
      streamed = event.reference.outcome;
  }
  const snapshot = CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${check.id}`)).json(),
  ).data;
  const outcome = snapshot.references[0]!.outcome;
  if (outcome.kind !== "verdict")
    throw new Error(`Expected Verdict, got ${JSON.stringify(outcome)}`);
  expect(outcome).toEqual(streamed);
  return outcome;
}
it("identifies a live URL by its matching title and stops before the Internet Archive", async () => {
  edge.route((url) =>
    url.pathname === "/page"
      ? { status: 200, body: pageFixture, contentType: "text/html" }
      : undefined,
  );
  const result = await run(page);
  expect(result.verdict).toBe("correct");
  expect(result.identity.kind).toBe("web-url");
  expect(result.candidates).toMatchObject([
    { source: "url", csl: { title: "Web route witness", URL: page.URL } },
  ]);
  expect(edge.requests.map((r) => r.path)).toEqual(["/page"]);
});
it("identifies an archived page as a deviation and retains original URL and archive provenance", async () => {
  html("/page", "Gone", 410);
  edge.respond("/wayback/available", 200, archiveFixture);
  html("/web/20260102030405id_/https://example.com/page", "Web route witness");
  const result = await run(page);
  expect(result.verdict).toBe("exists-with-deviations");
  expect(result.identity.kind).toBe("web-archive");
  expect(result.reasons).toContain("web-original-unavailable");
  expect(result.reference.csl.URL).toBe(page.URL);
  expect(result.candidates).toMatchObject([
    {
      source: "internetarchive",
      raw: {
        originalUrl: page.URL,
        timestamp: "20260102030405",
        archiveUrl:
          "https://web.archive.org/web/20260102030405id_/https://example.com/page",
      },
    },
  ]);
});
it("reports Not found only after a definitive dead URL and a completed empty archive lookup", async () => {
  html("/page", "Gone", 404);
  const result = await run(page);
  expect(result.verdict).toBe("not-found");
  expect(result.reasons).toEqual(["search-completed"]);
  expect(result.evidence).toMatchObject([
    { source: "url", outcome: "nonexistent", status: 404 },
    { source: "internetarchive", outcome: "no-record" },
  ]);
});
it("refuses a private destination without disclosing it to the Internet Archive", async () => {
  const result = await run({ ...page, URL: "http://127.0.0.1/private" });
  expect(result.verdict).toBe("not-verifiable");
  expect(result.evidence).toContainEqual(
    expect.objectContaining({
      source: "url",
      outcome: "unavailable",
      reason: "unsafe-destination",
    }),
  );
  expect(edge.requests).toHaveLength(0);
});
it("takes the DOI path before the web route and accepts consistent identifier metadata", async () => {
  edge.respond("/api/handles/10.5555/web80", 200, {
    responseCode: 1,
    handle: "10.5555/web80",
  });
  edge.respond("/works/10.5555/web80", 200, {
    message: {
      DOI: "10.5555/web80",
      title: ["Web route witness"],
      URL: page.URL,
    },
  });
  const result = await run({ ...page, DOI: "10.5555/web80" });
  expect(result.verdict).toBe("correct");
  expect(result.identity.kind).toBe("supplied-doi");
  expect(result.evidence[0]).toMatchObject({
    source: "doi.org",
    outcome: "exists",
  });
  expect(edge.requests.map((r) => r.path)).toEqual([
    "/api/handles/10.5555/web80",
    "/works/10.5555/web80",
  ]);
});
it("verifies the supplied web URL after mandatory DOI identity when metadata uses another URL", async () => {
  edge.respond("/api/handles/10.5555/web80", 200, {
    responseCode: 1,
    handle: "10.5555/web80",
  });
  edge.respond("/works/10.5555/web80", 200, {
    message: {
      DOI: "10.5555/web80",
      title: ["Web route witness"],
      URL: "https://example.com/canonical",
    },
  });
  html("/page", "Web route witness");
  const result = await run({ ...page, DOI: "10.5555/web80" });
  expect(result.verdict).toBe("correct");
  expect(result.identity.kind).toBe("supplied-doi");
  expect(
    result.evidence
      .map((e) => e.source)
      .filter((s) => s === "doi.org" || s === "url"),
  ).toEqual(["doi.org", "url"]);
});
it.each([403, 429, 500])(
  "keeps HTTP %i incomplete rather than treating it as invention",
  async (status) => {
    html(
      "/page",
      "Web route witness",
      status,
      status === 429 ? { "retry-after": "3" } : undefined,
    );
    const result = await run(page);
    expect(result.verdict).toBe("not-verifiable");
    expect(result.reasons).toContain("url-verification-incomplete");
  },
);
it.each(["", "A completely unrelated heading", "404 Page not found"])(
  "does not identify a 200 page from insufficient or soft-404 title %j",
  async (title) => {
    html("/page", title);
    expect((await run(page)).verdict).toBe("not-verifiable");
  },
);
it("verifies a redirect target and preserves its provenance", async () => {
  html("/page", "Redirect", 302, { location: "/canonical" });
  html("/canonical", "Web route witness");
  const result = await run(page);
  expect(result.verdict).toBe("correct");
  expect(result.candidates[0]?.csl.URL).toBe("https://example.com/canonical");
  expect(result.evidence[0]?.raw).toMatchObject({
    originalUrl: page.URL,
    redirectTarget: "https://example.com/canonical",
    status: 302,
  });
});
it.each([
  "http://127.1/private",
  "http://[::1]/private",
  "http://[::ffff:127.0.0.1]/private",
  "http://169.254.169.254/latest",
  "http://10.0.0.1/private",
  "http://100.64.0.1/private",
  "http://localhost./private",
  "file:///etc/passwd",
  "https://user:password@example.com/page",
])("refuses unsafe URL %s", async (URL) => {
  const result = await run({ ...page, URL });
  expect(result.verdict).toBe("not-verifiable");
  expect(edge.requests).toHaveLength(0);
});
it("refuses a redirect to private addresses and does not disclose its target to the archive", async () => {
  html("/page", "Redirect", 302, { location: "http://192.168.1.1/private" });
  const result = await run(page);
  expect(result.verdict).toBe("not-verifiable");
  expect(edge.requests.map((r) => r.path)).toEqual(["/page"]);
});
it("stops a redirect loop after five redirects", async () => {
  html("/page", "Redirect", 302, { location: "/page" });
  const result = await run(page);
  expect(result.verdict).toBe("not-verifiable");
  expect(edge.requests.filter((r) => r.path === "/page")).toHaveLength(6);
  expect(result.evidence).toContainEqual(
    expect.objectContaining({ reason: "redirect-limit" }),
  );
});
it("bounds a streamed response without Content-Length", async () => {
  edge.route((url) =>
    url.pathname === "/page"
      ? {
          status: 200,
          body: `<title>Web route witness</title>${"x".repeat(5 * 1024 * 1024)}`,
          contentType: "text/html",
        }
      : undefined,
  );
  const result = await run(page);
  expect(result.verdict).toBe("not-verifiable");
  expect(result.evidence).toContainEqual(
    expect.objectContaining({ source: "url", reason: "response-size" }),
  );
});
it.each([
  "unavailable",
  "malformed",
  "wrong-original",
  "wrong-title",
  "availability-only",
])(
  "does not infer invention or archive identity from %s archive evidence",
  async (mode) => {
    html("/page", "Gone", 404);
    if (mode === "unavailable") edge.respond("/wayback/available", 503, {});
    else if (mode === "malformed")
      edge.respond("/wayback/available", 200, { ignored: true });
    else {
      edge.respond("/wayback/available", 200, {
        archived_snapshots: {
          closest: {
            available: true,
            status: "200",
            timestamp: "20260102030405",
            url: `https://web.archive.org/web/20260102030405/https://example.com/${mode === "wrong-original" ? "other" : "page"}`,
          },
        },
      });
      if (mode !== "availability-only")
        html(
          "/web/20260102030405id_/https://example.com/page",
          mode === "wrong-title" ? "Unrelated heading" : "Web route witness",
        );
    }
    expect((await run(page)).verdict).toBe("not-verifiable");
  },
);
it.each([
  "legislation",
  "bill",
  "regulation",
  "treaty",
  "hearing",
  "legal_case",
  "standard",
  "patent",
  "manuscript",
  "collection",
  "personal_communication",
  "interview",
  "speech",
  "broadcast",
  "motion_picture",
  "song",
  "musical_score",
  "performance",
  "event",
  "graphic",
  "figure",
  "map",
])(
  "applies outside-coverage precedence to %s before DOI and URL",
  async (type) => {
    const result = await run({
      ...page,
      type,
      DOI: "10.5555/nonexistent",
      URL: "http://127.0.0.1/private",
    });
    expect(result.verdict).toBe("not-verifiable");
    expect(result.reasons).toEqual(["outside-coverage"]);
    expect(edge.requests).toHaveLength(0);
  },
);
it("keeps confirmed DOI non-existence ahead of positive web evidence", async () => {
  edge.respond("/api/handles/10.5555/nonexistent", 404, {
    responseCode: 100,
    handle: "10.5555/nonexistent",
  });
  edge.respond("/works/10.5555/nonexistent", 404, {});
  html("/page", "Web route witness");
  const result = await run({ ...page, DOI: "10.5555/nonexistent" });
  expect(result.verdict).toBe("doi-conflict");
  expect(result.reasons).toEqual(["doi-nonexistent"]);
  expect(edge.requests.some((r) => r.path === "/page")).toBe(false);
});
it("keeps an unavailable DOI resolver incomplete despite matching web evidence", async () => {
  edge.respond("/api/handles/10.5555/web80", 503, {});
  edge.respond("/works/10.5555/web80", 200, {
    message: {
      DOI: "10.5555/web80",
      title: ["Web route witness"],
      URL: page.URL,
    },
  });
  html("/page", "Web route witness");
  const result = await run({ ...page, DOI: "10.5555/web80" });
  expect(result.verdict).toBe("not-verifiable");
  expect(result.reasons).toContain("mandatory-resolution-incomplete");
});
it("decodes the observed HTML title for comparison, display and correction metadata", async () => {
  html("/page", "Evidence &amp; identity");
  const result = await run({ ...page, title: "Evidence & identity" });
  expect(result.verdict).toBe("correct");
  expect(result.candidates[0]?.csl.title).toBe("Evidence & identity");
});

it("bounds decompressed bytes even when a gzip body is small on the wire", async () => {
  edge.route((url) =>
    url.pathname === "/page"
      ? {
          status: 200,
          body: gzipSync(
            Buffer.from(
              `<title>Web route witness</title>${"x".repeat(5 * 1024 * 1024)}`,
            ),
          ),
          headers: { "content-encoding": "gzip" },
          contentType: "text/html",
        }
      : undefined,
  );
  const result = await run(page);
  expect(result.verdict).toBe("not-verifiable");
  expect(result.evidence).toContainEqual(
    expect.objectContaining({ source: "url", reason: "response-size" }),
  );
});
it("bounds response time through body completion and names the URL failure", async () => {
  const held = edge.hold("/page", true);
  try {
    const result = await run(page);
    expect(result.verdict).toBe("not-verifiable");
    expect(result.failedSources).toContain("url");
    expect(result.evidence).toContainEqual(
      expect.objectContaining({
        source: "url",
        reason: "timeout",
        attempts: 2,
      }),
    );
  } finally {
    held.release();
  }
});
it("names both failed web Data sources without treating their outage as invention", async () => {
  html("/page", "Failure", 503);
  edge.respond("/wayback/available", 503, {});
  const result = await run(page);
  expect(result.verdict).toBe("not-verifiable");
  expect(result.failedSources).toEqual(["url", "internetarchive"]);
});
it("keeps foreign DOI proof ahead of the web route", async () => {
  edge.respond("/api/handles/10.5555/foreign80", 200, {
    responseCode: 1,
    handle: "10.5555/foreign80",
  });
  edge.respond("/works/10.5555/foreign80", 200, {
    message: {
      DOI: "10.5555/foreign80",
      title: ["A completely unrelated source"],
      author: [{ family: "Beta" }],
      published: { "date-parts": [[2021]] },
    },
  });
  edge.respond("/works", 200, {
    message: {
      items: [
        {
          DOI: "10.5555/intended80",
          title: ["Web route witness"],
          author: [{ family: "Alpha" }],
          published: { "date-parts": [[2021]] },
        },
      ],
    },
  });
  html("/page", "Web route witness");
  const result = await run({
    ...page,
    author: [{ family: "Alpha" }],
    issued: { literal: "2021" },
    DOI: "10.5555/foreign80",
  });
  expect(result.verdict).toBe("doi-conflict");
  expect(result.reasons).toEqual(["foreign-doi"]);
  expect(edge.requests.some((r) => r.path === "/page")).toBe(false);
});
it("keeps DOI identity and explains its dead supplied URL rather than returning Not found", async () => {
  edge.respond("/api/handles/10.5555/web80", 200, {
    responseCode: 1,
    handle: "10.5555/web80",
  });
  edge.respond("/works/10.5555/web80", 200, {
    message: {
      DOI: "10.5555/web80",
      title: ["Web route witness"],
      URL: "https://example.com/canonical",
    },
  });
  html("/page", "Gone", 410);
  const result = await run({ ...page, DOI: "10.5555/web80" });
  expect(result.verdict).toBe("exists-with-deviations");
  expect(result.identity.kind).toBe("supplied-doi");
  expect(result.reasons).toEqual(["url-unavailable"]);
});
it("records both Operator-disabled web Data sources without reporting an outage and versions enablement", async () => {
  html("/page", "Web route witness");
  const enabled = await run(page);
  await service.restart({
    SOURCE_TASTER_URL_ENABLED: "false",
    SOURCE_TASTER_INTERNETARCHIVE_ENABLED: "false",
  });
  try {
    const result = await run(page);
    expect(result.verdict).toBe("not-verifiable");
    expect(result.failedSources).toEqual([]);
    expect(result.evidence).toMatchObject([
      { source: "url", outcome: "disabled" },
      { source: "internetarchive", outcome: "disabled" },
    ]);
    expect(result.searchStrategyVersion).not.toBe(
      enabled.searchStrategyVersion,
    );
  } finally {
    await service.restart({
      SOURCE_TASTER_URL_ENABLED: "true",
      SOURCE_TASTER_INTERNETARCHIVE_ENABLED: "true",
    });
  }
});
it("reads a declared HTML character encoding before comparing its title", async () => {
  edge.route((url) =>
    url.pathname === "/page"
      ? {
          status: 200,
          body: Buffer.from("<title>\u00dcberpr\u00fcfung</title>", "latin1"),
          contentType: "text/html; charset=iso-8859-1",
        }
      : undefined,
  );
  const result = await run({ ...page, title: "\u00dcberpr\u00fcfung" });
  expect(result.verdict).toBe("correct");
  expect(result.candidates[0]?.csl.title).toBe("\u00dcberpr\u00fcfung");
});
