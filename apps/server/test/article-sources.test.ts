// SPDX-License-Identifier: AGPL-3.0-or-later
// #78 article Data sources. Real PG and public HTTP/SSE only; every provider
// is a loopback fixture. Recorded payloads are listed in
// fixtures/article-sources/README.md; all other bodies are synthetic witnesses.
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import {
  CheckResponse,
  CheckEvent,
  type CreateCheckRequest,
} from "@source-taster/contract-verification/v2";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { startTestService } from "./support/service.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
type Fixture = Awaited<ReturnType<typeof startDoiFixtures>>;
let openalex: Fixture,
  crossref: Fixture,
  europepmc: Fixture,
  semanticscholar: Fixture,
  arxiv: Fixture;
let service: Awaited<ReturnType<typeof startTestService>>;
const fixture = (name: string) =>
  readFile(
    new URL(`fixtures/article-sources/${name}`, import.meta.url),
    "utf8",
  );
const epmcSearch = "/europepmc/webservices/rest/search";
const sourceEnv = () => ({
  ...crossref.env,
  SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
  SOURCE_TASTER_OPENALEX_ENABLED: "true",
  SOURCE_TASTER_OPENALEX_BASE_URL: openalex.env.SOURCE_TASTER_CROSSREF_BASE_URL,
  SOURCE_TASTER_EUROPEPMC_ENABLED: "true",
  SOURCE_TASTER_EUROPEPMC_BASE_URL:
    europepmc.env.SOURCE_TASTER_CROSSREF_BASE_URL,
  SOURCE_TASTER_SEMANTICSCHOLAR_ENABLED: "true",
  SOURCE_TASTER_SEMANTICSCHOLAR_BASE_URL:
    semanticscholar.env.SOURCE_TASTER_CROSSREF_BASE_URL,
  SOURCE_TASTER_ARXIV_ENABLED: "true",
  SOURCE_TASTER_ARXIV_BASE_URL: arxiv.env.SOURCE_TASTER_CROSSREF_BASE_URL,
});
beforeAll(async () => {
  [openalex, crossref, europepmc, semanticscholar, arxiv] = await Promise.all([
    startDoiFixtures(),
    startDoiFixtures(),
    startDoiFixtures(),
    startDoiFixtures(),
    startDoiFixtures(),
  ]);
  service = await startTestService(54878, 0, sourceEnv());
});
afterAll(async () => {
  await service?.stop();
  await Promise.all(
    [openalex, crossref, europepmc, semanticscholar, arxiv].map((f) =>
      f?.stop(),
    ),
  );
});
beforeEach(() => {
  for (const f of [openalex, crossref, europepmc, semanticscholar, arxiv]) {
    f.reset();
    f.requests.length = 0;
  }
});
type Fields = Extract<
  CreateCheckRequest,
  { references: unknown }
>["references"][number]["fields"];
async function run(fields: Fields) {
  const response = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      references: [{ originalText: "Article source witness", fields }],
    }),
  });
  expect(response.status).toBe(201);
  const created = CheckResponse.parse(await response.json()).data;
  const stream = await fetch(
    `${service.apiUrl}/v2/checks/${created.id}/events`,
    { signal: AbortSignal.timeout(40000) },
  );
  const events = [];
  for await (const frame of readSseFrames(stream.body!))
    events.push(CheckEvent.parse(JSON.parse(frame.data)));
  const snapshot = CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${created.id}`)).json(),
  ).data;
  const outcome = snapshot.references[0]!.outcome;
  if (outcome.kind !== "verdict") throw new Error("Expected Verdict");
  expect(events).toContainEqual(
    expect.objectContaining({
      type: "reference.updated",
      reference: expect.objectContaining({ outcome }) as unknown,
    }),
  );
  const progress = events.flatMap((e) =>
    e.type === "reference.updated" ? [e.reference.progress] : [],
  );
  return { outcome, progress };
}
// Reference fields as cited from the recorded Europe PMC record.
const stateOfOa = {
  type: "article-journal",
  title:
    "The state of OA: a large-scale analysis of the prevalence and impact of Open Access articles",
  author: [
    ["Piwowar", "Heather"],
    ["Priem", "Jason"],
    ["Larivière", "Vincent"],
    ["Alperin", "Juan Pablo"],
    ["Matthias", "Lisa"],
    ["Norlander", "Bree"],
    ["Farley", "Ashley"],
    ["West", "Jevin"],
    ["Haustein", "Stefanie"],
  ].map(([family, given]) => ({ family: family!, given: given! })),
  issued: { literal: "2018" },
  "container-title": "PeerJ",
  volume: "6",
  page: "e4375",
} satisfies Fields;

it("identifies a PMCID through Europe PMC, the responsible identifier source", async () => {
  const record = await fixture("europepmc-pmc5815332.json");
  europepmc.route((url) =>
    url.pathname === epmcSearch &&
    url.searchParams.get("query") === "PMCID:PMC5815332"
      ? { status: 200, body: JSON.parse(record) as unknown }
      : undefined,
  );
  const { outcome, progress } = await run({
    ...stateOfOa,
    PMCID: "PMC5815332",
  });
  expect(outcome).toMatchObject({
    verdict: "correct",
    reasons: ["identified"],
    identity: { kind: "supplied-identifier" },
    failedSources: [],
    // No affirmative report was received: unknown, never "not retracted".
    retraction: "unknown",
  });
  expect(outcome.retractionEvidence).toBeUndefined();
  expect(outcome.candidates).toMatchObject([
    {
      source: "europepmc",
      origin: "pmcid",
      id: "MED:29456894",
      identifiers: ["pmcid:PMC5815332"],
      csl: { PMID: "29456894", PMCID: "PMC5815332", DOI: "10.7717/peerj.4375" },
    },
  ]);
  expect(outcome.evidence).toContainEqual(
    expect.objectContaining({
      source: "europepmc",
      operation: "pmcid",
      outcome: "candidate",
    }),
  );
  expect(progress).toContain("europepmc");
  // Early termination: no bibliographic search anywhere after identification.
  expect(europepmc.requests).toHaveLength(1);
  for (const other of [openalex, crossref, semanticscholar, arxiv])
    expect(other.requests).toHaveLength(0);
});

it("handles a supplied DOI before the PMCID and arXiv routes", async () => {
  const doi = "10.7717/peerj.4375";
  crossref.respond(`/api/handles/${doi}`, 200, {
    responseCode: 1,
    handle: doi,
  });
  // Synthetic OpenAlex DOI record for the recorded Europe PMC article.
  openalex.respond(`/works/doi:${doi}`, 200, {
    id: "https://openalex.org/W78000001",
    doi: `https://doi.org/${doi}`,
    title: stateOfOa.title,
    publication_year: 2018,
    ids: { pmcid: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5815332" },
    authorships: stateOfOa.author.map((a) => ({
      author: { display_name: `${a.given} ${a.family}` },
    })),
  });
  const { outcome } = await run({
    ...stateOfOa,
    DOI: doi,
    PMCID: "PMC5815332",
    arXiv: "1706.03762",
  });
  expect(outcome).toMatchObject({
    identity: { kind: "supplied-doi" },
    failedSources: [],
  });
  expect(outcome.evidence[0]).toMatchObject({
    source: "doi.org",
    operation: "doi",
    outcome: "exists",
  });
  expect(crossref.requests.map((r) => r.path)).toEqual([`/api/handles/${doi}`]);
  expect(openalex.requests).toHaveLength(1);
  expect(crossref.requests[0]!.at).toBeLessThanOrEqual(
    openalex.requests[0]!.at,
  );
  for (const other of [europepmc, semanticscholar, arxiv])
    expect(other.requests).toHaveLength(0);
});

// Synthetic Semantic Scholar witness (no live payload is committed; see README).
const attention = {
  type: "article-journal",
  title: "Attention Is All You Need",
  author: [
    ["Vaswani", "Ashish"],
    ["Shazeer", "Noam"],
    ["Parmar", "Niki"],
    ["Uszkoreit", "Jakob"],
    ["Jones", "Llion"],
    ["Gomez", "Aidan N."],
    ["Kaiser", "Lukasz"],
    ["Polosukhin", "Illia"],
  ].map(([family, given]) => ({ family: family!, given: given! })),
  issued: { literal: "2017" },
} satisfies Fields;
const s2Paper = {
  paperId: "s2-synthetic-attention",
  externalIds: { ArXiv: "1706.03762", DBLP: "journals/corr/VaswaniSPUJGKP17" },
  title: "Attention Is All You Need",
  authors: attention.author.map((a) => ({ name: `${a.given} ${a.family}` })),
  year: 2017,
  venue: "Neural Information Processing Systems",
  publicationDate: "2017-06-12",
  journal: null,
};

it("identifies an arXiv identifier through the Semantic Scholar index before arXiv itself", async () => {
  semanticscholar.route((url) =>
    url.pathname === "/graph/v1/paper/batch"
      ? { status: 200, body: [s2Paper] }
      : undefined,
  );
  const { outcome, progress } = await run({
    ...attention,
    arXiv: "arXiv:1706.03762v5",
  });
  expect(outcome).toMatchObject({
    verdict: "correct",
    reasons: ["identified"],
    identity: { kind: "supplied-identifier" },
    failedSources: [],
  });
  expect(outcome.candidates).toMatchObject([
    {
      source: "semanticscholar",
      origin: "arxiv",
      id: "S2:s2-synthetic-attention",
      identifiers: ["arxiv:1706.03762"],
      csl: { arXiv: "1706.03762", title: "Attention Is All You Need" },
    },
  ]);
  expect(outcome.reference.csl.arXiv).toBe("arXiv:1706.03762v5");
  expect(progress).toContain("semanticscholar");
  expect(semanticscholar.requests).toMatchObject([
    { method: "POST", body: { ids: ["ARXIV:1706.03762"] } },
  ]);
  for (const other of [openalex, crossref, europepmc, arxiv])
    expect(other.requests).toHaveLength(0);
});

it("falls back to the arXiv API, identifier only, when the index has no record", async () => {
  const atom = await fixture("arxiv-1706.03762.xml");
  // The batch endpoint lists null for an identifier without a record.
  semanticscholar.route((url) =>
    url.pathname === "/graph/v1/paper/batch"
      ? { status: 200, body: [null] }
      : undefined,
  );
  arxiv.route((url) =>
    url.pathname === "/api/query" &&
    url.searchParams.get("id_list") === "1706.03762"
      ? { status: 200, body: atom, contentType: "application/atom+xml" }
      : undefined,
  );
  const { outcome, progress } = await run({
    ...attention,
    arXiv: "https://arxiv.org/abs/1706.03762v7",
  });
  expect(outcome).toMatchObject({
    verdict: "correct",
    reasons: ["identified"],
    identity: { kind: "supplied-identifier" },
    failedSources: [],
  });
  expect(outcome.candidates).toMatchObject([
    {
      source: "arxiv",
      origin: "arxiv",
      id: "arXiv:1706.03762",
      identifiers: ["arxiv:1706.03762"],
      csl: { arXiv: "1706.03762", issued: { literal: "2017-06-12" } },
    },
  ]);
  expect(
    outcome.evidence.map((e) => [e.source, e.operation, e.outcome]),
  ).toEqual(
    expect.arrayContaining([
      ["semanticscholar", "arxiv", "no-record"],
      ["arxiv", "arxiv", "candidate"],
    ]),
  );
  expect(progress).toEqual(
    expect.arrayContaining(["semanticscholar", "arxiv"]),
  );
  expect(arxiv.requests).toHaveLength(1);
  for (const other of [openalex, crossref, europepmc])
    expect(other.requests).toHaveLength(0);
});

// Synthetic arXiv records for the batching witness.
const preprints: Record<string, [string, string, string]> = {
  "0704.0001": ["Synthetic primer preprint", "Ada Primer", "2007-04-02"],
  "1706.03762": ["Synthetic batched preprint one", "Ben First", "2017-06-12"],
  "1810.04805": ["Synthetic batched preprint two", "Cleo Second", "2018-10-11"],
};
const preprint = (id: string) => {
  const [title, name, published] = preprints[id]!;
  const [given, family] = name.split(" ");
  return {
    type: "article-journal",
    title,
    author: [{ family: family!, given: given! }],
    issued: { literal: published.slice(0, 4) },
    arXiv: id,
  } satisfies Fields;
};
const feed = (ids: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom">${ids
    .map((id) => {
      const [title, name, published] = preprints[id]!;
      return `<entry><id>http://arxiv.org/abs/${id}v1</id><title>${title}</title><published>${published}T00:00:00Z</published><author><name>${name}</name></author></entry>`;
    })
    .join("")}</feed>`;

it("sends arXiv lookups collected across Checks in one id_list request", async () => {
  // Direct arXiv lookups only; the first request is held long enough for the
  // next Checks' lookups to collect behind its permit.
  await service.restart({
    SOURCE_TASTER_SEMANTICSCHOLAR_ENABLED: "false",
    SOURCE_TASTER_SEARCH_SETTINGS: JSON.stringify({
      sources: { arxiv: { requestTimeoutMs: 10000 } },
    }),
  });
  const held = arxiv.hold("/api/query?id_list=0704.0001&max_results=1");
  arxiv.route((url) =>
    url.pathname === "/api/query"
      ? {
          status: 200,
          contentType: "application/atom+xml",
          body: feed(url.searchParams.get("id_list")!.split(",")),
        }
      : undefined,
  );
  try {
    const primer = run(preprint("0704.0001"));
    await held.arrived;
    const batched = Promise.all([
      run(preprint("1706.03762")),
      run(preprint("1810.04805")),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    held.release();
    await primer;
    const outcomes = (await batched).map((r) => r.outcome);
    const queries = arxiv.requests.map(
      (r) => new URL(r.path, "http://fixture").searchParams,
    );
    expect(queries).toHaveLength(2);
    expect(queries[1]!.get("id_list")!.split(",").sort()).toEqual([
      "1706.03762",
      "1810.04805",
    ]);
    expect(queries[1]!.get("max_results")).toBe("2");
    // Demultiplexed: each run receives only its own record.
    for (const [index, id] of ["1706.03762", "1810.04805"].entries()) {
      expect(
        outcomes[index]!.candidates.filter((c) => c.source === "arxiv"),
      ).toMatchObject([{ id: `arXiv:${id}`, csl: { arXiv: id } }]);
      expect(outcomes[index]!.evidence).toContainEqual(
        expect.objectContaining({
          source: "arxiv",
          operation: "arxiv",
          outcome: "candidate",
        }),
      );
      expect(JSON.stringify(outcomes[index])).not.toContain(
        id === "1706.03762" ? "1810.04805" : "1706.03762",
      );
    }
  } finally {
    held.release();
    await service.restart({
      SOURCE_TASTER_SEMANTICSCHOLAR_ENABLED: "true",
      SOURCE_TASTER_SEARCH_SETTINGS: "",
    });
  }
});

// Synthetic Semantic Scholar search witness for the recorded Europe PMC record.
const s2StateOfOa = {
  paperId: "s2-synthetic-state-of-oa",
  externalIds: {
    DOI: "10.7717/peerj.4375",
    PubMed: "29456894",
    PubMedCentral: "5815332",
  },
  title: stateOfOa.title,
  authors: stateOfOa.author.map((a) => ({ name: `${a.given} ${a.family}` })),
  year: 2018,
  venue: "PeerJ",
  publicationDate: "2018-02-13",
  journal: { name: "PeerJ", volume: "6", pages: "e4375" },
};

it("continues past a failing, a timed-out and a rate-limited source and names each", async () => {
  openalex.respond("/works", 500, { sentinel: "error" });
  const held = crossref.hold("/works");
  europepmc.respond(epmcSearch, 429, {}, { "retry-after": "3" });
  semanticscholar.route((url) =>
    url.pathname === "/graph/v1/paper/search"
      ? { status: 200, body: { total: 1, data: [s2StateOfOa] } }
      : undefined,
  );
  try {
    const { outcome } = await run(stateOfOa);
    expect(outcome).toMatchObject({
      verdict: "correct",
      reasons: ["identified"],
      identity: {
        kind: "independent-bibliography",
        candidateId: "S2:s2-synthetic-state-of-oa",
      },
    });
    expect(outcome.failedSources).toEqual([
      "openalex",
      "crossref",
      "europepmc",
    ]);
    const failures = outcome.evidence.filter((e) => e.attempts > 0);
    expect(failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "openalex",
          outcome: "unavailable",
          reason: "http-error",
          status: 500,
          attempts: 2,
        }),
        expect.objectContaining({
          source: "crossref",
          outcome: "unavailable",
          reason: "timeout",
          attempts: 2,
        }),
        expect.objectContaining({
          source: "europepmc",
          outcome: "unavailable",
          reason: "rate-budget",
          status: 429,
          attempts: 1,
        }),
      ]),
    );
    // An HTTP error is retried once per call; each later search kind of that
    // source is still asked (ADR-0007). A timed-out or rate-limited source is
    // not asked again for this Reference.
    expect(openalex.requests).toHaveLength(6);
    expect(
      outcome.evidence.filter(
        (e) => e.source === "openalex" && e.reason === "after-source-failure",
      ),
    ).toEqual([]);
    expect(crossref.requests).toHaveLength(2);
    expect(europepmc.requests).toHaveLength(1);
    expect(semanticscholar.requests).toHaveLength(1);
  } finally {
    held.release();
  }
});

it("blocks Not found while one responsible source has failed", async () => {
  openalex.respond("/works", 200, { meta: { count: 0 }, results: [] });
  crossref.respond("/works", 200, { message: { items: [] } });
  europepmc.respond(epmcSearch, 503, {});
  semanticscholar.respond("/graph/v1/paper/search", 200, { total: 0 });
  const { outcome } = await run(stateOfOa);
  expect(outcome).toMatchObject({
    verdict: "not-verifiable",
    reasons: ["insufficient-search"],
    failedSources: ["europepmc"],
  });
});

it("is Not verifiable naming every source when all responsible sources fail", async () => {
  openalex.respond("/works", 500, {});
  crossref.respond("/works", 502, {});
  europepmc.respond(epmcSearch, 503, {});
  semanticscholar.respond("/graph/v1/paper/search", 500, {});
  const { outcome } = await run(stateOfOa);
  expect(outcome).toMatchObject({
    verdict: "not-verifiable",
    reasons: ["sources-unavailable"],
    failedSources: ["openalex", "crossref", "europepmc", "semanticscholar"],
  });
});

it("does not count malformed metadata as a failed source", async () => {
  openalex.respond("/works", 500, {});
  // Answered, but without a usable record (no DOI): a data finding.
  crossref.respond("/works", 200, {
    message: { items: [{ title: ["Malformed"] }] },
  });
  europepmc.respond(epmcSearch, 503, {});
  semanticscholar.respond("/graph/v1/paper/search", 500, {});
  const { outcome } = await run(stateOfOa);
  expect(outcome).toMatchObject({
    verdict: "not-verifiable",
    reasons: ["insufficient-search"],
    failedSources: ["openalex", "europepmc", "semanticscholar"],
  });
  expect(outcome.evidence).toContainEqual(
    expect.objectContaining({
      source: "crossref",
      outcome: "unavailable",
      reason: "invalid-metadata",
    }),
  );
});

it("does not name a source as failed for an identifier mismatch", async () => {
  const record = await fixture("europepmc-pmid29456894.json");
  openalex.respond("/works/pmid:29456895", 404, {});
  openalex.respond("/works", 200, { meta: { count: 0 }, results: [] });
  crossref.respond("/works", 200, { message: { items: [] } });
  europepmc.route((url) =>
    url.pathname !== epmcSearch
      ? undefined
      : url.searchParams.get("query") === "EXT_ID:29456895 AND SRC:MED"
        ? { status: 200, body: JSON.parse(record) as unknown }
        : { status: 200, body: { hitCount: 0, resultList: { result: [] } } },
  );
  semanticscholar.respond("/graph/v1/paper/search", 200, { total: 0 });
  const { outcome } = await run({ ...stateOfOa, PMID: "29456895" });
  expect(outcome).toMatchObject({
    verdict: "not-verifiable",
    reasons: ["insufficient-search"],
    failedSources: [],
  });
  expect(outcome.evidence).toContainEqual(
    expect.objectContaining({
      source: "europepmc",
      operation: "pmid",
      outcome: "unavailable",
      reason: "identifier-mismatch",
    }),
  );
});

it("reaches Not found only when every enabled search source completed", async () => {
  openalex.respond("/works", 200, { meta: { count: 0 }, results: [] });
  crossref.respond("/works", 200, { message: { items: [] } });
  europepmc.respond(epmcSearch, 200, {
    hitCount: 0,
    resultList: { result: [] },
  });
  semanticscholar.respond("/graph/v1/paper/search", 200, { total: 0 });
  const { outcome } = await run(stateOfOa);
  expect(outcome).toMatchObject({
    verdict: "not-found",
    reasons: ["search-completed"],
    failedSources: [],
  });
  for (const source of ["openalex", "crossref", "europepmc", "semanticscholar"])
    expect(outcome.evidence).toContainEqual(
      expect.objectContaining({ source, outcome: "no-record" }),
    );
});

it("records a Europe PMC retraction report already received, without an extra request", async () => {
  // Synthetic variant of the recorded record: MEDLINE publication type added.
  const record = JSON.parse(await fixture("europepmc-pmc5815332.json")) as {
    resultList: { result: { pubTypeList: { pubType: string[] } }[] };
  };
  record.resultList.result[0]!.pubTypeList.pubType.push(
    "Retracted Publication",
  );
  europepmc.route((url) =>
    url.pathname === epmcSearch &&
    url.searchParams.get("query") === "PMCID:PMC5815332"
      ? { status: 200, body: record }
      : undefined,
  );
  const { outcome } = await run({ ...stateOfOa, PMCID: "PMC5815332" });
  // The hook is independent of the Verdict.
  expect(outcome).toMatchObject({
    verdict: "correct",
    retraction: "retracted",
    retractionEvidence: [{ source: "europepmc", candidateId: "MED:29456894" }],
  });
  expect(europepmc.requests).toHaveLength(1);
  for (const other of [openalex, crossref, semanticscholar, arxiv])
    expect(other.requests).toHaveLength(0);
});

it("versions the Operator's search operating settings with the Search strategy", async () => {
  const record = await fixture("europepmc-pmc5815332.json");
  const identify = async () => {
    europepmc.route((url) =>
      url.pathname === epmcSearch
        ? { status: 200, body: JSON.parse(record) as unknown }
        : undefined,
    );
    return (await run({ ...stateOfOa, PMCID: "PMC5815332" })).outcome;
  };
  const initial = await identify();
  // Initial operating values, recorded with every article result. The
  // scheduling mode is recorded but is not a setting: there is only one.
  expect(initial.searchConfiguration).toMatchObject({
    "settings.maxRetries": 1,
    "settings.retryAfterMaxMs": 2000,
    "settings.activeReferencesPerCheck": 10,
    "settings.doi.org.requestTimeoutMs": 3000,
    "settings.crossref.requestTimeoutMs": 3000,
    "settings.openalex.requestTimeoutMs": 3000,
    "settings.europepmc.requestTimeoutMs": 3000,
    "settings.europepmc.intervalMs": 100,
    "settings.semanticscholar.requestTimeoutMs": 3000,
    "settings.semanticscholar.intervalMs": 1000,
    "settings.semanticscholar.concurrency": 1,
    "settings.arxiv.requestTimeoutMs": 3000,
    "settings.arxiv.intervalMs": 3000,
    "settings.arxiv.concurrency": 1,
    // ADR-0007 identifier batching.
    "settings.semanticscholar.batchSize": 500,
    "settings.semanticscholar.batchWindowMs": 200,
    "settings.arxiv.batchSize": 100,
    "settings.arxiv.batchWindowMs": 0,
    identifierBatching:
      "process-local;semanticscholar-window-then-permit;arxiv-until-permit-latest-deadline-carrier;arxiv-record-form-only;entry-demultiplexed-2",
    maxActiveReferencesPerCheck: 10,
    scheduling: "owner-then-check-round-robin-3",
  });
  expect(Object.keys(initial.searchConfiguration)).not.toContain(
    "settings.requestTimeoutMs",
  );
  expect(Object.keys(initial.searchConfiguration)).not.toContain(
    "settings.fairness",
  );
  await service.restart({
    SOURCE_TASTER_SEARCH_SETTINGS: JSON.stringify({
      activeReferencesPerCheck: 7,
      sources: {
        crossref: { requestTimeoutMs: 400 },
        europepmc: { maxWaitMs: 5000 },
      },
    }),
  });
  try {
    const changed = await identify();
    // What runs is what is recorded.
    expect(changed.searchConfiguration).toMatchObject({
      "settings.activeReferencesPerCheck": 7,
      maxActiveReferencesPerCheck: 7,
      "settings.crossref.requestTimeoutMs": 400,
      "settings.openalex.requestTimeoutMs": 3000,
      "settings.europepmc.maxWaitMs": 5000,
      "settings.europepmc.intervalMs": 100,
    });
    expect(changed.searchStrategyVersion).not.toBe(
      initial.searchStrategyVersion,
    );
    // The per-source timeout applies to that source only: two 400 ms
    // attempts instead of two 3 s attempts.
    openalex.respond("/works", 200, { meta: { count: 0 }, results: [] });
    const held = crossref.hold("/works");
    europepmc.respond(epmcSearch, 200, {
      hitCount: 0,
      resultList: { result: [] },
    });
    semanticscholar.respond("/graph/v1/paper/search", 200, { total: 0 });
    try {
      const { outcome } = await run(stateOfOa);
      const timedOut = outcome.evidence.find(
        (e) => e.source === "crossref" && e.reason === "timeout",
      );
      expect(timedOut).toMatchObject({ outcome: "unavailable", attempts: 2 });
      expect(timedOut!.durationMs).toBeLessThan(2500);
      expect(outcome.failedSources).toEqual(["crossref"]);
    } finally {
      held.release();
    }
  } finally {
    await service.restart({ SOURCE_TASTER_SEARCH_SETTINGS: "" });
  }
  expect((await identify()).searchStrategyVersion).toBe(
    initial.searchStrategyVersion,
  );
});

it.each([
  { sources: { openalex: { requestTimeoutMs: 0 } } },
  // Timeouts are per source; there is no global request timeout.
  { requestTimeoutMs: 3000 },
  // A permit wait or a request cannot outlast the Reference deadline.
  { sources: { crossref: { maxWaitMs: 30001 } } },
  { sources: { crossref: { requestTimeoutMs: 30001 } } },
  // ADR-0007: at most one retry, honouring a Retry-After of at most 2 s.
  { maxRetries: 2 },
  { retryAfterMaxMs: 2001 },
  { sources: { arxiv: { concurrency: 0 } } },
  { sources: { unknown: { intervalMs: 1 } } },
  // ADR-0007: Semantic Scholar collects for at most 200 ms, 500 identifiers;
  // only the batching sources have batch settings.
  { sources: { semanticscholar: { batchWindowMs: 201 } } },
  { sources: { semanticscholar: { batchSize: 501 } } },
  { sources: { arxiv: { batchSize: 0 } } },
  { sources: { crossref: { batchSize: 2 } } },
  // One scheduling mode; it is not an Operator setting.
  { fairness: "first-come" },
])(
  "refuses invalid search operating settings %j at startup",
  async (settings) => {
    const { startProcess } = await import("./support/processes.ts");
    const process = startProcess(
      "worker",
      {
        SOURCE_TASTER_MODE: "standalone",
        DATABASE_URL: "postgres://unused:unused@127.0.0.1:1/unused",
        SOURCE_TASTER_DOI_PREVIEW: "uncalibrated",
        SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
        SOURCE_TASTER_SEARCH_SETTINGS: JSON.stringify(settings),
      },
      { inheritEnv: false },
    );
    try {
      expect(await process.exited).toBe(78);
    } finally {
      await process.stop();
    }
  },
);
