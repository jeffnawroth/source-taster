// SPDX-License-Identifier: AGPL-3.0-or-later
// Public /v2 seam: real processes/PostgreSQL, external HTTP fixtures only.
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import {
  CheckResponse,
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
let ol: Awaited<ReturnType<typeof startDoiFixtures>>;
let gb: typeof ol;
let oa: typeof ol;
let cr: typeof ol;
let service: Awaited<ReturnType<typeof startTestService>>;
let recorded: unknown;
beforeAll(async () => {
  [ol, gb, oa, cr] = await Promise.all([
    startDoiFixtures(),
    startDoiFixtures(),
    startDoiFixtures(),
    startDoiFixtures(),
  ]);
  recorded = JSON.parse(
    await readFile(
      new URL(
        "./fixtures/books/openlibrary-9780131103627.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_BOOK_PORT ?? 54879),
    0,
    {
      ...cr.env,
      SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
      SOURCE_TASTER_OPENALEX_ENABLED: "true",
      SOURCE_TASTER_OPENALEX_BASE_URL: oa.env.SOURCE_TASTER_CROSSREF_BASE_URL,
      SOURCE_TASTER_OPENLIBRARY_ENABLED: "true",
      SOURCE_TASTER_OPENLIBRARY_BASE_URL:
        ol.env.SOURCE_TASTER_CROSSREF_BASE_URL,
      SOURCE_TASTER_GOOGLEBOOKS_ENABLED: "true",
      SOURCE_TASTER_GOOGLEBOOKS_BASE_URL:
        gb.env.SOURCE_TASTER_CROSSREF_BASE_URL,
    },
  );
});
afterAll(async () => {
  await service?.stop();
  await Promise.all([ol, gb, oa, cr].map((s) => s?.stop()));
});
beforeEach(() => {
  for (const source of [ol, gb, oa, cr]) {
    source.reset();
    source.requests.length = 0;
  }
  ol.respond("/api/books", 200, {});
  ol.respond("/search.json", 200, { docs: [] });
  gb.respond("/books/v1/volumes", 200, { totalItems: 0 });
  oa.respond("/works", 200, { results: [] });
  cr.respond("/works", 200, { message: { items: [] } });
});
const book: Csl = {
  type: "book",
  title: "The C Programming Language",
  author: [{ family: "Kernighan" }, { family: "Ritchie" }],
  issued: { literal: "1988" },
  ISBN: "978-0-13-110362-7",
  publisher: "Prentice Hall",
};
async function run(fields: Csl): Promise<VerdictResult> {
  const response = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      references: [{ originalText: "Book route witness", fields }],
    }),
  });
  expect(response.status).toBe(201);
  const check = CheckResponse.parse(await response.json()).data;
  const stream = await fetch(`${service.apiUrl}/v2/checks/${check.id}/events`, {
    signal: AbortSignal.timeout(35000),
  });
  for await (const frame of readSseFrames(stream.body!)) JSON.parse(frame.data);
  const snapshot = CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${check.id}`)).json(),
  ).data;
  const outcome = snapshot.references[0]!.outcome;
  if (outcome.kind !== "verdict") throw new Error("Expected Verdict");
  return outcome;
}
it("identifies a book by its exact ISBN from the recorded Open Library edition and stops", async () => {
  ol.respond("/api/books", 200, recorded);
  const result = await run(book);
  expect(result.verdict).toBe("correct");
  expect(result.identity.kind).toBe("supplied-identifier");
  expect(result.candidates).toMatchObject([
    {
      source: "openlibrary",
      origin: "isbn",
      slot: 1,
      identifiers: ["isbn:9780131103627"],
      csl: { title: "The C Programming Language" },
    },
  ]);
  expect(gb.requests).toHaveLength(0);
  expect(oa.requests).toHaveLength(0);
  expect(cr.requests).toHaveLength(0);
});
// Synthetic Google Books success response; the live recording returned 429.
const googleVolume = {
  id: "book79",
  volumeInfo: {
    title: "The C Programming Language",
    authors: ["Brian W. Kernighan", "Dennis M. Ritchie"],
    publishedDate: "1988",
    publisher: "Prentice Hall",
    industryIdentifiers: [{ type: "ISBN_13", identifier: "9780131103627" }],
  },
};
it("falls back from an absent Open Library ISBN to Google Books and explains differing fields", async () => {
  gb.respond("/books/v1/volumes", 200, {
    totalItems: 1,
    items: [googleVolume],
  });
  const result = await run({ ...book, issued: { literal: "1989" } });
  expect(result.verdict).toBe("exists-with-deviations");
  expect(result.candidates).toMatchObject([
    {
      source: "googlebooks",
      origin: "isbn",
      slot: 1,
      csl: { ISBN: "9780131103627" },
    },
  ]);
  expect(result.candidates[0]!.fields).toContainEqual(
    expect.objectContaining({
      field: "issued",
      reference: { literal: "1989" },
      candidate: { literal: "1988" },
    }),
  );
  expect(
    result.evidence.map((e) => [e.source, e.operation, e.outcome]),
  ).toEqual([
    ["openlibrary", "isbn", "no-record"],
    ["googlebooks", "isbn", "candidate"],
    ["openalex", "combined", "skipped"],
    ["crossref", "combined", "skipped"],
  ]);
  expect(oa.requests).toHaveLength(0);
  expect(cr.requests).toHaveLength(0);
});
it("verifies a chapter bibliographically after ISBN catalogs return only its containing book", async () => {
  ol.respond("/api/books", 200, recorded);
  const title = "Pointers and Arrays";
  cr.respond("/works", 200, {
    message: {
      items: [
        {
          DOI: "10.5555/chapter79",
          type: "book-chapter",
          title: [title],
          author: [{ family: "Kernighan" }, { family: "Ritchie" }],
          published: { "date-parts": [[1988]] },
          "container-title": ["The C Programming Language"],
          ISBN: ["9780131103627"],
          publisher: "Prentice Hall",
          page: "93-124",
        },
      ],
    },
  });
  const result = await run({
    ...book,
    type: "chapter",
    title,
    "container-title": "The C Programming Language",
    page: "93-124",
  });
  expect(result.verdict).toBe("correct");
  expect(result.identity.kind).toBe("independent-bibliography");
  expect(
    result.candidates.find((c) => c.id === result.bestMatchId)?.csl,
  ).toMatchObject({
    type: "chapter",
    ISBN: "9780131103627",
    publisher: "Prentice Hall",
    page: "93-124",
  });
  expect(
    result.evidence
      .filter((e) => e.attempts > 0)
      .map((e) => [e.source, e.operation]),
  ).toEqual([
    ["openlibrary", "isbn"],
    ["googlebooks", "isbn"],
    ["openalex", "combined"],
    ["openalex", "title"],
    ["openalex", "authors-year"],
    ["crossref", "combined"],
  ]);
});
it("searches books without ISBN bibliographically through the indexes and recorded Open Library search", async () => {
  const search: unknown = JSON.parse(
    await readFile(
      new URL("./fixtures/books/openlibrary-search.json", import.meta.url),
      "utf8",
    ),
  );
  ol.respond("/search.json", 200, search);
  const { ISBN: _isbn, ...fields } = book;
  const result = await run(fields);
  expect(result.verdict).toBe("correct");
  expect(result.identity.kind).toBe("independent-bibliography");
  expect(result.candidates).toMatchObject([
    { source: "openlibrary", origin: "combined" },
  ]);
  expect(
    result.evidence
      .filter((e) => e.attempts > 0)
      .map((e) => [e.source, e.operation]),
  ).toEqual([
    ["openalex", "combined"],
    ["openalex", "title"],
    ["openalex", "authors-year"],
    ["crossref", "combined"],
    ["crossref", "title"],
    ["crossref", "authors-year"],
    ["openlibrary", "combined"],
  ]);
  expect(gb.requests).toHaveLength(0);
});
it("does not use a containing book ISBN to prove a chapter even with matching title and authors", async () => {
  ol.respond("/api/books", 200, recorded);
  const result = await run({ ...book, type: "chapter" });
  expect(result.verdict).toBe("not-verifiable");
  expect(result.identity.kind).toBe("unresolved");
});
it("keeps multiple exact Google Books ISBN editions ambiguous and logs unevaluated alternatives", async () => {
  gb.respond("/books/v1/volumes", 200, {
    totalItems: 2,
    items: [googleVolume, { ...googleVolume, id: "otherEdition79" }],
  });
  const result = await run(book);
  expect(result.verdict).toBe("not-verifiable");
  expect(result.reasons).toContain("ambiguous-identity");
  expect(result.evidence).toContainEqual(
    expect.objectContaining({
      source: "googlebooks",
      operation: "isbn",
      identifierAmbiguity: ["googlebooks:otherEdition79"],
    }),
  );
  expect(result.candidates.filter((c) => c.origin === "isbn")).toHaveLength(1);
});
it("continues after the recorded Google Books 429 and names the failed Data source", async () => {
  const failure: unknown = JSON.parse(
    await readFile(
      new URL("./fixtures/books/googlebooks-rate-limit.json", import.meta.url),
      "utf8",
    ),
  );
  gb.respond("/books/v1/volumes", 429, failure, { "retry-after": "3" });
  oa.respond("/works", 200, {
    results: [
      {
        id: "https://openalex.org/W79001",
        title: book.title,
        publication_year: 1988,
        authorships: [
          { author: { display_name: "Brian W. Kernighan" } },
          { author: { display_name: "Dennis M. Ritchie" } },
        ],
      },
    ],
  });
  const result = await run(book);
  expect(result.verdict).toBe("correct");
  expect(result.failedSources).toEqual(["googlebooks"]);
  expect(result.evidence).toContainEqual(
    expect.objectContaining({
      source: "googlebooks",
      outcome: "unavailable",
      reason: "rate-budget",
      attempts: 1,
    }),
  );
  expect(gb.requests).toHaveLength(1);
});
it("returns Not verifiable and names every Data source when all responsible sources fail", async () => {
  ol.respond("/api/books", 503, {});
  gb.respond("/books/v1/volumes", 503, {});
  oa.respond("/works", 503, {});
  cr.respond("/works", 503, {});
  const result = await run(book);
  expect(result.verdict).toBe("not-verifiable");
  expect(result.reasons).toEqual(["sources-unavailable"]);
  expect(result.failedSources).toEqual([
    "openlibrary",
    "googlebooks",
    "openalex",
    "crossref",
  ]);
  expect(result.evidence.filter((e) => e.attempts > 0)).toHaveLength(4);
  expect(
    result.evidence
      .filter((e) => e.outcome === "unavailable")
      .every((e) => e.attempts === 2),
  ).toBe(true);
});
it("never treats one catalog outage as a completed negative search", async () => {
  ol.respond("/api/books", 503, {});
  const result = await run(book);
  expect(result.verdict).toBe("not-verifiable");
  expect(result.failedSources).toEqual(["openlibrary"]);
  expect(result.evidence).toContainEqual(
    expect.objectContaining({
      source: "openlibrary",
      operation: "combined",
      outcome: "skipped",
      reason: "after-source-failure",
      attempts: 0,
    }),
  );
});
it("shares five deduplicated Candidate slots across each source's bibliographic queries", async () => {
  const rows = Array.from({ length: 6 }, (_, i) => ({
    title: `ZZZZ unrelated ${i}`,
    author: "Other",
    year: 1970,
    i,
  }));
  oa.respond("/works", 200, {
    results: rows.map((r) => ({
      id: `https://openalex.org/W7901${r.i}`,
      title: r.title,
      publication_year: r.year,
      authorships: [{ author: { display_name: r.author } }],
    })),
  });
  cr.respond("/works", 200, {
    message: {
      items: rows.map((r) => ({
        DOI: `10.5555/book79-${r.i}`,
        title: [r.title],
        author: [{ family: r.author }],
        published: { "date-parts": [[r.year]] },
      })),
    },
  });
  ol.respond("/search.json", 200, {
    docs: rows.map((r) => ({
      key: `/works/OL79${r.i}W`,
      title: r.title,
      author_name: [r.author],
      publish_year: [r.year],
    })),
  });
  gb.respond("/books/v1/volumes", 200, {
    totalItems: 6,
    items: rows.map((r) => ({
      id: `google79${r.i}`,
      volumeInfo: {
        title: r.title,
        authors: [r.author],
        publishedDate: String(r.year),
      },
    })),
  });
  const result = await run({
    type: "book",
    title: "Wanted book",
    author: [{ family: "Wanted" }],
    issued: { literal: "2020" },
  });
  expect(result.verdict).toBe("not-found");
  expect(result.candidates).toHaveLength(20);
  for (const source of ["openalex", "crossref", "openlibrary", "googlebooks"]) {
    const candidates = result.candidates.filter((c) => c.source === source);
    expect(candidates.map((c) => c.slot).sort()).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(candidates.map((c) => c.id)).size).toBe(5);
  }
});
it("resolves a supplied DOI before the book's ISBN and stops after its unambiguous metadata", async () => {
  const doi = "10.5555/doi-book79";
  cr.respond(`/api/handles/${doi}`, 200, { responseCode: 1, handle: doi });
  oa.respond(`/works/doi:${doi}`, 404, {});
  cr.respond(`/works/${doi}`, 200, {
    message: {
      DOI: doi,
      type: "book",
      title: [book.title],
      ISBN: ["0131103628"],
      author: [{ family: "Kernighan" }, { family: "Ritchie" }],
      published: { "date-parts": [[1988]] },
    },
  });
  const result = await run({ ...book, DOI: doi });
  expect(result.verdict).toBe("correct");
  expect(result.identity.kind).toBe("supplied-doi");
  expect(
    result.evidence
      .filter((e) => e.attempts > 0)
      .map((e) => [e.source, e.operation]),
  ).toEqual([
    ["doi.org", "doi"],
    ["openalex", "doi"],
    ["crossref", "doi"],
  ]);
  expect(ol.requests).toHaveLength(0);
  expect(gb.requests).toHaveLength(0);
});
it("includes an ISBN Candidate in the same five slots as Google Books bibliographic Candidates", async () => {
  const unrelated = Array.from({ length: 6 }, (_, i) => ({
    id: `slots79${i}`,
    volumeInfo: {
      title: `ZZZZZZ ${i}`,
      authors: ["Other"],
      publishedDate: "1970",
    },
  }));
  gb.respond(
    "/books/v1/volumes?q=isbn:9780131103627&maxResults=5&printType=books",
    200,
    {
      totalItems: 1,
      items: [
        {
          ...googleVolume,
          volumeInfo: {
            ...googleVolume.volumeInfo,
            title: "ZZZZ foreign book",
            authors: ["Other"],
          },
        },
      ],
    },
  );
  gb.respond("/books/v1/volumes", 200, { totalItems: 6, items: unrelated });
  const result = await run(book);
  expect(result.verdict).toBe("not-found");
  const candidates = result.candidates
    .filter((c) => c.source === "googlebooks")
    .sort((a, b) => a.slot - b.slot);
  expect(candidates.map((c) => [c.slot, c.origin])).toEqual([
    [1, "isbn"],
    [2, "combined"],
    [3, "title"],
    [4, "authors-year"],
    [5, "title"],
  ]);
  expect(
    result.evidence.filter((e) => e.source === "googlebooks" && e.attempts > 0),
  ).toHaveLength(4);
});
it("records Operator catalog rate changes in a new Search strategy version", async () => {
  ol.respond("/api/books", 200, recorded);
  const initial = await run(book);
  try {
    await service.restart({
      SOURCE_TASTER_OPENLIBRARY_REQUESTS_PER_SECOND: "2",
    });
    const changed = await run(book);
    expect(changed.searchConfiguration.openlibraryRequestsPerSecond).toBe(2);
    expect(initial.searchConfiguration.openlibraryRequestsPerSecond).toBe(3);
    expect(changed.searchStrategyVersion).not.toBe(
      initial.searchStrategyVersion,
    );
  } finally {
    await service.restart({
      SOURCE_TASTER_OPENLIBRARY_REQUESTS_PER_SECOND: "3",
    });
  }
});
it("excludes Operator-disabled catalogs from failures without inventing complete negative coverage", async () => {
  try {
    await service.restart({ SOURCE_TASTER_GOOGLEBOOKS_ENABLED: "false" });
    const result = await run(book);
    expect(result.verdict).toBe("not-verifiable");
    expect(result.failedSources).toEqual([]);
    expect(result.evidence).toContainEqual(
      expect.objectContaining({
        source: "googlebooks",
        outcome: "disabled",
        reason: "operator-disabled",
      }),
    );
    expect(gb.requests).toHaveLength(0);
  } finally {
    await service.restart({ SOURCE_TASTER_GOOGLEBOOKS_ENABLED: "true" });
  }
});
it("marks a confirmed wrong ISBN as a field deviation when bibliography independently identifies the intended book", async () => {
  cr.respond("/works", 200, {
    message: {
      items: [
        {
          DOI: "10.5555/intended-book79",
          type: "book",
          title: [book.title],
          ISBN: ["9780131103627"],
          author: [{ family: "Kernighan" }, { family: "Ritchie" }],
          published: { "date-parts": [[1988]] },
        },
      ],
    },
  });
  const result = await run({ ...book, ISBN: "9780262033848" });
  expect(result.verdict).toBe("exists-with-deviations");
  expect(result.identity.kind).toBe("independent-bibliography");
  expect(
    result.candidates.find((c) => c.id === result.bestMatchId)?.fields,
  ).toContainEqual(
    expect.objectContaining({
      field: "ISBN",
      reference: "9780262033848",
      candidate: "9780131103627",
      agreement: false,
    }),
  );
});
it("does not identify an article as a book merely because title and authors agree", async () => {
  oa.respond("/works", 200, {
    results: [
      {
        id: "https://openalex.org/W79999",
        type: "article",
        title: book.title,
        publication_year: 1988,
        authorships: [
          { author: { display_name: "Brian W. Kernighan" } },
          { author: { display_name: "Dennis M. Ritchie" } },
        ],
      },
    ],
  });
  const { ISBN: _isbn, ...fields } = book;
  const result = await run(fields);
  expect(result.verdict).toBe("not-verifiable");
  expect(result.identity.kind).toBe("unresolved");
});
