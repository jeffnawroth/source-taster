// SPDX-License-Identifier: AGPL-3.0-or-later
// Explicitly synthetic protocol witnesses; real PG and public HTTP/SSE only.
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import {
  CheckResponse,
  CheckEvent,
  type CreateCheckRequest,
} from "@source-taster/contract-verification/v2";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { startTestService } from "./support/service.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
let openalex: Awaited<ReturnType<typeof startDoiFixtures>>;
let crossref: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
const matching = (value: unknown): unknown =>
  expect.objectContaining(value) as unknown;
beforeAll(async () => {
  openalex = await startDoiFixtures();
  crossref = await startDoiFixtures();
  service = await startTestService(54777, 0, {
    ...crossref.env,
    SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
    SOURCE_TASTER_OPENALEX_ENABLED: "true",
    SOURCE_TASTER_OPENALEX_BASE_URL:
      openalex.env.SOURCE_TASTER_CROSSREF_BASE_URL,
  });
});
afterAll(async () => {
  await service?.stop();
  await openalex?.stop();
  await crossref?.stop();
});
beforeEach(() => {
  openalex.reset();
  crossref.reset();
  openalex.requests.length = 0;
  crossref.requests.length = 0;
});
it("identifies an article without a DOI in OpenAlex before querying Crossref", async () => {
  openalex.respond("/works", 200, {
    meta: { count: 1 },
    results: [
      {
        id: "https://openalex.org/W77",
        title: "Synthetic article",
        publication_year: 2021,
        authorships: [{ author: { display_name: "Alpha" } }],
        ids: {},
      },
    ],
  });
  crossref.respond("/works", 500, { sentinel: "must remain uncontacted" });
  const response = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      references: [
        {
          originalText: "Synthetic Alpha (2021). Synthetic article.",
          fields: {
            type: "article-journal",
            title: "Synthetic article",
            author: [{ family: "Alpha" }],
            issued: { literal: "2021" },
          },
        },
      ],
    }),
  });
  expect(response.status).toBe(201);
  const created = (await response.json()) as { data: { id: string } };
  const stream = await fetch(
    `${service.apiUrl}/v2/checks/${created.data.id}/events`,
  );
  const frames = [];
  for await (const frame of readSseFrames(stream.body!))
    frames.push(JSON.parse(frame.data) as unknown);
  const snapshot = (await (
    await fetch(`${service.apiUrl}/v2/checks/${created.data.id}`)
  ).json()) as {
    data: {
      references: {
        outcome: {
          verdict: string;
          candidates: {
            source: string;
            slot: number;
            score: { value: number };
          }[];
        };
      }[];
    };
  };
  expect(snapshot.data.references[0]!.outcome.verdict).toBe("correct");
  expect(snapshot.data.references[0]!.outcome.candidates).toMatchObject([
    { source: "openalex", slot: 1, score: { value: 100000000 } },
  ]);
  expect(frames).toContainEqual(
    expect.objectContaining({
      type: "reference.updated",
      reference: matching({
        outcome: snapshot.data.references[0]!.outcome,
      }),
    }),
  );
  expect(crossref.requests).toHaveLength(0);
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
      references: [{ originalText: "Synthetic protocol witness", fields }],
    }),
  });
  expect(response.status).toBe(201);
  const created = CheckResponse.parse(await response.json()).data;
  const stream = await fetch(
    `${service.apiUrl}/v2/checks/${created.id}/events`,
    { signal: AbortSignal.timeout(35000) },
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
      reference: matching({ outcome }),
    }),
  );
  return { outcome, snapshot };
}
const oa = (n: number, title = `Unrelated ${n}`, author = "Beta") => ({
  id: `https://openalex.org/W${n}`,
  title,
  authorships: [{ author: { display_name: author } }],
  publication_year: 2021,
});
it.each([
  ["PMC999", "exists-with-deviations"],
  ["https://pmc.ncbi.nlm.nih.gov/articles/PMC123/", "correct"],
  ["https://www.ncbi.nlm.nih.gov/pmc/articles/PMC123/", "correct"],
  ["pmcid: pmc123", "correct"],
])(
  "compares received PMCID with %s without a PMCID lookup",
  async (PMCID, verdict) => {
    const doi = "10.5555/received-pmcid";
    crossref.respond(`/api/handles/${doi}`, 200, {
      responseCode: 1,
      handle: doi,
    });
    openalex.respond(`/works/doi:${doi}`, 200, {
      ...oa(77123, "Synthetic article", "Alpha"),
      doi: `https://doi.org/${doi}`,
      ids: { pmcid: "https://pmc.ncbi.nlm.nih.gov/articles/PMC123/" },
    });
    const { outcome } = await run({
      DOI: doi,
      PMCID,
      title: "Synthetic article",
      author: [{ family: "Alpha" }],
      issued: { literal: "2021" },
    });
    expect(outcome.verdict).toBe(verdict);
    expect(outcome.searchStrategyVersion).toContain(
      "article-search-77-9-identity-evidence-",
    );
    // Article Verdict derivation is part of the recorded Scoring rules version.
    expect(outcome.scoringRules.version).toMatch(/-article-verdict-77-9$/u);
    expect(outcome.candidates[0]!.score).toEqual({
      value: 100000000,
      fullAgreement: true,
    });
    expect(outcome.candidates[0]!.csl.PMCID).toBe("PMC123");
    expect(
      outcome.candidates[0]!.fields.find((f) => f.field === "PMCID"),
    ).toMatchObject({
      reference: PMCID,
      candidate: "PMC123",
      reason: "unweighted",
      score: null,
    });
    expect(openalex.requests).toHaveLength(1);
    expect(crossref.requests).toHaveLength(1);
  },
);
it("retains an affirmative OpenAlex retraction on the Best match independently of a Correct Verdict", async () => {
  openalex.respond("/works", 200, {
    results: [
      { ...oa(77124, "Synthetic article", "Alpha"), is_retracted: true },
    ],
  });
  const { outcome } = await run({
    title: "Synthetic article",
    author: [{ family: "Alpha" }],
    issued: { literal: "2021" },
  });
  expect(outcome).toMatchObject({
    verdict: "correct",
    retraction: "retracted",
    retractionEvidence: [
      {
        source: "openalex",
        candidateId: "https://openalex.org/W77124",
        observedAt: outcome.candidates[0]!.retrievedAt,
      },
    ],
  });
  expect(outcome.candidates[0]!.raw).toMatchObject({ is_retracted: true });
  expect(openalex.requests).toHaveLength(1);
  expect(crossref.requests).toHaveLength(0);
});
it.each([false, undefined])(
  "keeps %s retraction data unknown instead of inventing a verified negative",
  async (is_retracted) => {
    openalex.respond("/works", 200, {
      results: [
        {
          ...oa(77125, "Synthetic article", "Alpha"),
          ...(is_retracted === undefined ? {} : { is_retracted }),
        },
      ],
    });
    const { outcome } = await run({
      title: "Synthetic article",
      author: [{ family: "Alpha" }],
      issued: { literal: "2021" },
    });
    expect(outcome).toMatchObject({
      verdict: "correct",
      retraction: "unknown",
    });
    expect(outcome.retractionEvidence).toBeUndefined();
  },
);
it("does not attach a different Source's retraction to the Best match", async () => {
  openalex.respondSequence("/works", [
    { status: 200, body: { results: [{ ...oa(77126), is_retracted: true }] } },
    {
      status: 200,
      body: { results: [oa(77127, "Synthetic article", "Alpha")] },
    },
  ]);
  const { outcome } = await run({
    title: "Synthetic article",
    author: [{ family: "Alpha" }],
    issued: { literal: "2021" },
  });
  expect(outcome).toMatchObject({
    bestMatchId: "https://openalex.org/W77127",
    verdict: "correct",
    retraction: "unknown",
  });
  expect(outcome.retractionEvidence).toBeUndefined();
});
it("retains a received Crossref retraction report without requesting enrichment", async () => {
  openalex.respond("/works", 200, { results: [] });
  crossref.respond("/works", 200, {
    message: {
      items: [
        {
          DOI: "10.5555/crossref-retracted",
          title: ["Synthetic article"],
          author: [{ family: "Alpha" }],
          published: { "date-parts": [[2021]] },
          "updated-by": [
            {
              type: "retraction",
              source: "retraction-watch",
              DOI: "10.5555/retraction-notice",
            },
          ],
        },
      ],
    },
  });
  const { outcome } = await run({
    title: "Synthetic article",
    author: [{ family: "Alpha" }],
    issued: { literal: "2021" },
  });
  expect(outcome).toMatchObject({
    verdict: "correct",
    retraction: "retracted",
    retractionEvidence: [
      {
        source: "crossref",
        candidateId: "crossref:10.5555/crossref-retracted",
        observedAt: outcome.candidates[0]!.retrievedAt,
      },
    ],
  });
  expect(crossref.requests).toHaveLength(1);
});
it.each([
  { "updated-by": [{ type: "correction", source: "publisher" }] },
  {
    "update-to": [
      { type: "retraction", source: "publisher", DOI: "10.5555/original" },
    ],
  },
])(
  "does not retract a correction or a notice's updated Source: %j",
  async (updates) => {
    openalex.respond("/works", 200, { results: [] });
    crossref.respond("/works", 200, {
      message: {
        items: [
          {
            DOI: "10.5555/not-retracted",
            title: ["Synthetic article"],
            author: [{ family: "Alpha" }],
            published: { "date-parts": [[2021]] },
            ...updates,
          },
        ],
      },
    });
    const { outcome } = await run({
      title: "Synthetic article",
      author: [{ family: "Alpha" }],
      issued: { literal: "2021" },
    });
    expect(outcome).toMatchObject({
      verdict: "correct",
      retraction: "unknown",
    });
    expect(outcome.retractionEvidence).toBeUndefined();
  },
);
it("retains retraction evidence in a received duplicate without evaluating the record twice", async () => {
  const doi = "10.5555/retraction-duplicate";
  openalex.respondSequence("/works", [
    {
      status: 200,
      body: {
        results: [{ ...oa(77128, "Synthetic article", "Andreas Alpha"), doi }],
      },
    },
    {
      status: 200,
      body: {
        results: [
          {
            ...oa(77128, "Synthetic article", "Andreas Alpha"),
            doi,
            is_retracted: true,
          },
          { ...oa(77129, "Synthetic article", "Anna Alpha"), doi },
        ],
      },
    },
  ]);
  const { outcome } = await run({
    title: "Synthetic article",
    author: [{ family: "Alpha", given: "Anna" }],
    issued: { literal: "2021" },
  });
  expect(outcome).toMatchObject({
    verdict: "correct",
    retraction: "retracted",
    retractionEvidence: [
      { source: "openalex", candidateId: "https://openalex.org/W77128" },
    ],
  });
  expect(outcome.candidates).toHaveLength(2);
  expect(outcome.evidence).toContainEqual(
    matching({
      source: "openalex",
      skippedDuplicates: ["https://openalex.org/W77128"],
    }),
  );
});
it.each([
  { partial: true, conflict: true },
  { partial: true, conflict: false },
  { partial: false, conflict: true },
  { partial: false, conflict: false },
])(
  "does not launder conflicting identities through a third record: %j",
  async ({ partial, conflict }) => {
    const title = partial ? "Synthetic article" : "a".repeat(20);
    const family = partial ? "Alpha" : "a".repeat(50);
    const doi = "10.5555/identity-bridge";
    const indexed = (n: number, pmid: string) => ({
      id: `https://openalex.org/W${n}`,
      title,
      doi,
      publication_year: 2021,
      ids: { pmid: `https://pubmed.ncbi.nlm.nih.gov/${pmid}` },
      ...(partial
        ? {}
        : {
            authorships: [
              { author: { display_name: "b".repeat(5) + "a".repeat(45) } },
            ],
          }),
    });
    openalex.respondSequence("/works", [
      { status: 200, body: { results: [indexed(77801, "111")] } },
      {
        status: 200,
        body: { results: [indexed(77802, conflict ? "222" : "111")] },
      },
      { status: 200, body: { results: [] } },
    ]);
    crossref.respond("/works", 200, {
      message: {
        items: [
          {
            DOI: doi,
            title: [partial ? title : "b" + "a".repeat(19)],
            author: [
              { family: partial ? family : "b".repeat(2) + "a".repeat(48) },
            ],
            published: { "date-parts": [[2021]] },
          },
        ],
      },
    });
    const { outcome } = await run({
      title,
      author: [{ family }],
      issued: { literal: "2021" },
    });
    // Complete fields: OA title/author=100/90; Crossref=95/96. Both weighted means are 96.428571%.
    expect(outcome.candidates.map((c) => c.score?.value)).toEqual(
      Array(3).fill(partial ? 100000000 : 96428571),
    );
    expect(outcome.verdict).toBe(
      conflict
        ? "not-verifiable"
        : partial
          ? "correct"
          : "exists-with-deviations",
    );
    if (conflict) {
      expect(outcome.identity.kind).toBe("unresolved");
      expect(outcome.reasons).toContain("ambiguous-identity");
    }
  },
);
it.each([{}, { publication_year: 1900 }])(
  "retains unavailable identity comparisons as insufficient evidence: %j",
  async (metadata) => {
    openalex.respond("/works", 200, {
      results: [{ id: "https://openalex.org/W77803", ...metadata }],
    });
    crossref.respond("/works", 200, { message: { items: [] } });
    const { outcome } = await run({
      title: "Synthetic article",
      author: [{ family: "Alpha" }],
      issued: { literal: "2021" },
    });
    expect(outcome).toMatchObject({
      verdict: "not-verifiable",
      reasons: ["insufficient-search"],
      identity: { kind: "unresolved" },
      failedSources: [],
    });
    expect(outcome.candidates).toHaveLength(1);
    if (Object.keys(metadata).length === 0)
      expect(outcome.bestMatchId).toBeNull();
  },
);
it.each([
  { title: "Unrelated metadata" },
  { authorships: [{ author: { display_name: "Zed" } }] },
])(
  "settles a sparse different Source by available counterevidence: %j",
  async (metadata) => {
    openalex.respond("/works", 200, {
      results: [{ id: "https://openalex.org/W77803", ...metadata }],
    });
    crossref.respond("/works", 200, { message: { items: [] } });
    const { outcome } = await run(article);
    expect(outcome).toMatchObject({
      verdict: "not-found",
      reasons: ["search-completed"],
      identity: { kind: "unresolved" },
    });
  },
);
it("identifies a strong match despite an author-less unrelated record", async () => {
  openalex.respondSequence("/works", [
    {
      status: 200,
      body: {
        results: [{ id: "https://openalex.org/W77810", title: "Maize yields" }],
      },
    },
    {
      status: 200,
      body: { results: [oa(77811, "Synthetic article", "Alpha")] },
    },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  expect(outcome).toMatchObject({
    verdict: "correct",
    bestMatchId: "https://openalex.org/W77811",
  });
});
it("does not let a conflict between unrelated records unsettle a strong match", async () => {
  openalex.respondSequence("/works", [
    {
      status: 200,
      body: {
        results: [{ ...oa(77812), doi: "10.5555/x", ids: { pmid: "1" } }],
      },
    },
    {
      status: 200,
      body: {
        results: [{ ...oa(77813), doi: "10.5555/x", ids: { pmid: "2" } }],
      },
    },
    {
      status: 200,
      body: { results: [oa(77814, "Synthetic article", "Alpha")] },
    },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  expect(outcome).toMatchObject({
    verdict: "correct",
    bestMatchId: "https://openalex.org/W77814",
  });
});
it("does not let a fully compared conflicting group unsettle a strong match", async () => {
  const medium = (n: number, doi: string) => ({
    ...oa(n, "Synthetic article review", "Alpha"),
    doi,
    ids: { pmid: "77" },
  });
  openalex.respondSequence("/works", [
    { status: 200, body: { results: [medium(77818, "10.5555/m1")] } },
    { status: 200, body: { results: [medium(77819, "10.5555/m2")] } },
    {
      status: 200,
      body: { results: [oa(77820, "Synthetic article", "Alpha")] },
    },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  const conflicting = outcome.candidates.filter((c) =>
    ["https://openalex.org/W77818", "https://openalex.org/W77819"].includes(
      c.id,
    ),
  );
  expect(conflicting).toHaveLength(2);
  // Both records are complete and neither carries counterevidence.
  for (const candidate of conflicting)
    for (const field of ["title", "author"])
      expect(
        candidate.fields.find((f) => f.field === field)?.score?.value,
      ).toBeGreaterThanOrEqual(50000000);
  expect(outcome).toMatchObject({
    verdict: "correct",
    bestMatchId: "https://openalex.org/W77820",
  });
});
it("attaches a retraction reported for a transitively equivalent record", async () => {
  const pmid = "https://pubmed.ncbi.nlm.nih.gov/77";
  const sparse = (n: number) => ({
    id: `https://openalex.org/W${n}`,
    title: "Synthetic article",
  });
  openalex.respondSequence("/works", [
    {
      status: 200,
      body: {
        results: [{ ...sparse(77817), ids: { pmid }, is_retracted: true }],
      },
    },
    {
      status: 200,
      body: {
        results: [{ ...sparse(77816), doi: "10.5555/r", ids: { pmid } }],
      },
    },
    {
      status: 200,
      body: {
        results: [
          { ...oa(77815, "Synthetic article", "Alpha"), doi: "10.5555/r" },
        ],
      },
    },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  // The Best match shares no identifier with the reported record directly.
  expect(outcome).toMatchObject({
    verdict: "correct",
    bestMatchId: "https://openalex.org/W77815",
    retraction: "retracted",
    retractionEvidence: [{ candidateId: "https://openalex.org/W77817" }],
  });
});
it.each([
  { completeFirst: false, lowerScore: false },
  { completeFirst: true, lowerScore: false },
  { completeFirst: false, lowerScore: true },
])(
  "uses complete same-Source evidence only at a tied highest Score: %j",
  async ({ completeFirst, lowerScore }) => {
    const sparseId = completeFirst ? 77831 : 77830;
    const completeId = completeFirst ? 77830 : 77831;
    const doi = "10.5555/same-source-tie";
    openalex.respondSequence("/works", [
      {
        status: 200,
        body: {
          results: [
            {
              id: `https://openalex.org/W${sparseId}`,
              title: "Synthetic article",
              publication_year: 2021,
              doi,
            },
          ],
        },
      },
      {
        status: 200,
        body: {
          results: [
            {
              ...oa(
                completeId,
                lowerScore ? "Synthetic articlf" : "Synthetic article",
                "Alpha",
              ),
              doi,
            },
          ],
        },
      },
      { status: 200, body: { results: [] } },
    ]);
    crossref.respond("/works", 200, { message: { items: [] } });
    const { outcome } = await run(article);
    expect(outcome.candidates).toHaveLength(2);
    if (lowerScore) {
      expect(outcome.candidates[0]!.score!.value).toBe(100000000);
      expect(outcome.candidates[1]!.score!.value).toBeLessThan(100000000);
      expect(outcome).toMatchObject({
        verdict: "not-verifiable",
        identity: { kind: "unresolved" },
        bestMatchId: `https://openalex.org/W${sparseId}`,
      });
    } else {
      expect(outcome.candidates.map((c) => c.score?.value)).toEqual([
        100000000, 100000000,
      ]);
      expect(outcome).toMatchObject({
        verdict: "correct",
        identity: {
          kind: "independent-bibliography",
          candidateId: `https://openalex.org/W${completeId}`,
        },
        bestMatchId: `https://openalex.org/W${completeId}`,
      });
      expect(openalex.requests).toHaveLength(2);
      expect(crossref.requests).toHaveLength(0);
    }
  },
);
it("does not manufacture a lead over a different Source with missing identity comparisons", async () => {
  openalex.respondSequence("/works", [
    { status: 200, body: { results: [{ id: "https://openalex.org/W77804" }] } },
    {
      status: 200,
      body: { results: [oa(77805, "Synthetic article", "Alpha")] },
    },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run({
    title: "Synthetic article",
    author: [{ family: "Alpha" }],
    issued: { literal: "2021" },
  });
  expect(outcome).toMatchObject({
    verdict: "not-verifiable",
    reasons: ["insufficient-search"],
    identity: { kind: "unresolved" },
  });
  expect(outcome.candidates.map((c) => c.score?.value ?? null)).toEqual([
    100000000,
    null,
  ]);
});
it.each(["unknown", "same-source", "transitive"] as const)(
  "does not manufacture Mixed citation from incomplete or bridged records: %s",
  async (scenario) => {
    const first = {
      ...oa(77806, "Synthetic article", "Beta"),
      doi: "10.5555/title-component",
    };
    const second = {
      ...oa(77807, "ZZZZZZZZZZ", "Alpha"),
      ...(scenario === "transitive"
        ? { ids: { pmid: "https://pubmed.ncbi.nlm.nih.gov/111" } }
        : { doi: "10.5555/author-component" }),
    };
    const third = {
      id: "https://openalex.org/W77808",
      ...(scenario === "unknown" ? {} : { doi: "10.5555/title-component" }),
      ...(scenario === "transitive"
        ? {
            ids: { pmid: "https://pubmed.ncbi.nlm.nih.gov/111" },
            publication_year: 2021,
          }
        : {}),
    };
    openalex.respondSequence(
      "/works",
      [first, second, third].map((record) => ({
        status: 200,
        body: { results: [record] },
      })),
    );
    crossref.respond("/works", 200, { message: { items: [] } });
    const { outcome } = await run({
      title: "Synthetic article",
      author: [{ family: "Alpha" }],
      issued: { literal: "2021" },
    });
    expect(outcome.verdict).toBe(
      scenario === "same-source" ? "mixed-citation" : "not-verifiable",
    );
  },
);
it("shares five evaluated unique slots across combined, title and author queries in provider order", async () => {
  openalex.respondSequence("/works", [
    { status: 200, body: { results: [oa(1), oa(9)] } },
    { status: 200, body: { results: [oa(1), oa(2), oa(3), oa(8)] } },
    { status: 200, body: { results: [oa(2), oa(4), oa(5), oa(7)] } },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run({
    title: "Synthetic article",
    author: [{ family: "Alpha" }],
    issued: { literal: "2021" },
  });
  expect(
    outcome.candidates
      .toSorted((a, b) => a.slot - b.slot)
      .map((c) => [c.id, c.slot, c.origin]),
  ).toEqual([
    ["https://openalex.org/W1", 1, "combined"],
    ["https://openalex.org/W2", 2, "title"],
    ["https://openalex.org/W4", 3, "authors-year"],
    ["https://openalex.org/W3", 4, "title"],
    ["https://openalex.org/W5", 5, "authors-year"],
  ]);
  expect(outcome.evidence).toContainEqual(
    expect.objectContaining({
      source: "openalex",
      operation: "title",
      skippedDuplicates: ["https://openalex.org/W1"],
    }),
  );
});
it("does not call a known existent DOI Not found when both metadata indexes lack its record", async () => {
  const doi = "10.5555/known-existence";
  crossref.respond(`/api/handles/${doi}`, 200, {
    responseCode: 1,
    handle: doi,
  });
  crossref.respond(`/works/${doi}`, 404, {});
  openalex.respond(`/works/doi:${doi}`, 404, {});
  openalex.respond("/works", 200, { results: [] });
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run({
    DOI: doi,
    title: "Synthetic unknown",
    author: [{ family: "Zed" }],
    issued: { literal: "2021" },
  });
  expect(outcome.verdict).toBe("not-verifiable");
  expect(outcome.reasons).toContain("identity-unresolved");
});
for (const count of [1, 2])
  it(`allocates the remaining bibliographic slots after ${count} distinct supported identifier records`, async () => {
    const doi = `10.5555/slots-${count}`;
    crossref.respond(`/api/handles/${doi}`, 200, {
      responseCode: 1,
      handle: doi,
    });
    crossref.respond(`/works/${doi}`, 404, {});
    openalex.respond(`/works/doi:${doi}`, 200, {
      ...oa(101),
      doi: `https://doi.org/${doi}`,
    });
    openalex.respond("/works/pmid:77002", 200, {
      ...oa(102),
      ids: { pmid: "https://pubmed.ncbi.nlm.nih.gov/77002" },
    });
    openalex.respondSequence("/works", [
      { status: 200, body: { results: [oa(104)] } },
      { status: 200, body: { results: [oa(105), oa(106)] } },
      { status: 200, body: { results: [oa(107), oa(108)] } },
    ]);
    crossref.respond("/works", 200, { message: { items: [] } });
    const { outcome } = await run({
      DOI: doi,
      ...(count > 1 ? { PMID: "77002" } : {}),
      title: "Synthetic article",
      author: [{ family: "Alpha" }],
      issued: { literal: "2021" },
    });
    const candidates = outcome.candidates
      .filter((c) => c.source === "openalex")
      .toSorted((a, b) => a.slot - b.slot);
    expect(candidates.map((c) => c.origin)).toEqual(
      count === 1
        ? ["doi", "combined", "title", "authors-year", "title"]
        : ["doi", "pmid", "combined", "title", "authors-year"],
    );
    expect(candidates.map((c) => c.slot)).toEqual([1, 2, 3, 4, 5]);
    expect(candidates[0]!.identifiers).toEqual([`doi:${doi}`]);
  });
it("carries unused combined capacity into title results without another request or page", async () => {
  openalex.respondSequence("/works", [
    { status: 200, body: { results: [] } },
    {
      status: 200,
      body: { results: [oa(10), oa(11), oa(12), oa(13), oa(14)] },
    },
    { status: 200, body: { results: [] } },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const began = openalex.requests.length;
  const { outcome } = await run({
    title: "Synthetic article",
    author: [{ family: "Alpha" }],
    issued: { literal: "2021" },
  });
  expect(
    outcome.candidates
      .toSorted((a, b) => a.slot - b.slot)
      .map((c) => [c.slot, c.origin]),
  ).toEqual([
    [1, "title"],
    [2, "title"],
    [3, "title"],
    [4, "title"],
  ]);
  expect(outcome.evidence).toContainEqual(
    expect.objectContaining({
      source: "openalex",
      operation: "combined",
      unusedSlots: 1,
    }),
  );
  expect(openalex.requests.slice(began)).toHaveLength(3);
});
it("deduplicates identifiers already carried by an evaluated record and preserves all identifier provenance", async () => {
  const doi = "10.5555/carried";
  crossref.respond(`/api/handles/${doi}`, 200, {
    responseCode: 1,
    handle: doi,
  });
  crossref.respond(`/works/${doi}`, 404, {});
  openalex.respond(`/works/doi:${doi}`, 200, {
    ...oa(110),
    doi,
    ids: {
      pmid: "https://pubmed.ncbi.nlm.nih.gov/77002",
    },
  });
  openalex.respond("/works", 200, { results: [] });
  crossref.respond("/works", 200, { message: { items: [] } });
  const began = openalex.requests.length;
  const { outcome } = await run({
    DOI: doi,
    PMID: "77002",
    title: "Synthetic article",
    author: [{ family: "Alpha" }],
    issued: { literal: "2021" },
  });
  expect(outcome.candidates).toHaveLength(1);
  expect(outcome.candidates[0]!.identifiers).toEqual([
    `doi:${doi}`,
    "pmid:77002",
  ]);
  expect(
    openalex.requests
      .slice(began)
      .some((r) => /\/works\/(pmid|pmcid):/u.test(r.path)),
  ).toBe(false);
});
it("does not infer nonexistence from high Scores with missing identity fields", async () => {
  openalex.respond("/works", 200, {
    results: [{ id: "https://openalex.org/W999", publication_year: 2021 }],
  });
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run({
    title: "Synthetic unknown",
    author: [{ family: "Zed" }],
    issued: { literal: "2021" },
  });
  expect(outcome.candidates[0]!.score?.value).toBe(100000000);
  expect(outcome.verdict).toBe("not-verifiable");
  expect(outcome.reasons).toContain("insufficient-search");
});
const article = {
  title: "Synthetic article",
  author: [{ family: "Alpha" }],
  issued: { literal: "2021" },
};
const cr = (doi: string, title = "Synthetic article", author = "Alpha") => ({
  DOI: doi,
  title: [title],
  author: [{ family: author }],
  published: { "date-parts": [[2021]] },
});
it("reaches Mixed citation from independently opposing title and author components", async () => {
  openalex.respondSequence("/works", [
    {
      status: 200,
      body: { results: [oa(201, "Synthetic article", "Zzzzzz")] },
    },
    {
      status: 200,
      body: { results: [oa(201, "Synthetic article", "Zzzzzz")] },
    },
    { status: 200, body: { results: [oa(202, "ZZZZZZZZZZZZZZZZZ", "Alpha")] } },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  expect(outcome.verdict).toBe("mixed-citation");
  expect(outcome.reasons).toEqual(["mixed-components"]);
  expect(outcome.candidates.map((c) => c.score?.value)).toEqual([
    64285714, 57142857,
  ]);
  expect(
    outcome.candidates[0]!.fields.find((f) => f.field === "title"),
  ).toMatchObject({
    reference: "Synthetic article",
    candidate: "Synthetic article",
    score: { value: 100000000 },
  });
});
it("does not build Mixed citation from a conflicting identity group", async () => {
  // The author component shares a DOI with a complete record but conflicts on PMID.
  const author = {
    ...oa(77825, "ZZZZZZZZZZZZZZZZZ", "Alpha"),
    doi: "10.5555/author-component",
    ids: { pmid: "5" },
  };
  const conflicting = {
    id: "https://openalex.org/W77824",
    title: "Synthetic article review",
    authorships: [
      { author: { display_name: "Alpha" } },
      { author: { display_name: "Beta" } },
    ],
    publication_year: 2015,
    doi: "10.5555/author-component",
    ids: { pmid: "6" },
  };
  openalex.respondSequence(
    "/works",
    [oa(77823, "Synthetic article", "Zzzzzz"), conflicting, author].map(
      (record) => ({ status: 200, body: { results: [record] } }),
    ),
  );
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  // The conflicting record is complete and carries no counterevidence.
  const record = outcome.candidates.find(
    (c) => c.id === "https://openalex.org/W77824",
  )!;
  for (const field of ["title", "author"])
    expect(
      record.fields.find((f) => f.field === field)?.score?.value,
    ).toBeGreaterThanOrEqual(50000000);
  expect(outcome).toMatchObject({
    verdict: "not-verifiable",
    reasons: ["ambiguous-identity"],
  });
});
it.each([
  [77826, 77827, 77828],
  [77829, 77827, 77828],
])(
  "keeps an equal top Score tie with a conflicting group ambiguous regardless of order: W%i",
  async (consistent, first, second) => {
    // Identical complete metadata, so all three Scores tie; only the IDs differ.
    const record = (n: number, doi: string, pmid?: string) => ({
      id: `https://openalex.org/W${n}`,
      title: "Synthetic article review",
      authorships: [
        { author: { display_name: "Alpha" } },
        { author: { display_name: "Beta" } },
      ],
      publication_year: 2015,
      doi,
      ...(pmid ? { ids: { pmid } } : {}),
    });
    openalex.respondSequence(
      "/works",
      [
        record(consistent, "10.5555/consistent"),
        record(first, "10.5555/conflict", "1"),
        record(second, "10.5555/conflict", "2"),
      ].map((r) => ({ status: 200, body: { results: [r] } })),
    );
    crossref.respond("/works", 200, { message: { items: [] } });
    const { outcome } = await run(article);
    expect(new Set(outcome.candidates.map((c) => c.score?.value)).size).toBe(1);
    expect(outcome).toMatchObject({
      verdict: "not-verifiable",
      reasons: ["ambiguous-identity"],
    });
  },
);
it("keeps mandatory DOI failure ahead of independently received Mixed evidence", async () => {
  const doi = "10.5555/mandatory";
  crossref.respond(`/api/handles/${doi}`, 503, {});
  crossref.respond(`/works/${doi}`, 404, {});
  openalex.respond(`/works/doi:${doi}`, 404, {});
  openalex.respondSequence("/works", [
    {
      status: 200,
      body: { results: [oa(201, "Synthetic article", "Zzzzzz")] },
    },
    {
      status: 200,
      body: { results: [oa(201, "Synthetic article", "Zzzzzz")] },
    },
    { status: 200, body: { results: [oa(202, "ZZZZZZZZZZZZZZZZZ", "Alpha")] } },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run({ ...article, DOI: doi });
  expect(outcome.verdict).toBe("not-verifiable");
  expect(outcome.reasons).toEqual(["mandatory-resolution-incomplete"]);
  expect(outcome.candidates).toHaveLength(2);
  expect(outcome.failedSources).toContain("doi.org");
});
it("keeps confirmed DOI nonexistence ahead of Mixed evidence", async () => {
  const doi = "10.5555/nonexistent";
  crossref.respond(`/api/handles/${doi}`, 404, {
    responseCode: 100,
    handle: doi,
  });
  crossref.respond(`/works/${doi}`, 404, {});
  openalex.respond(`/works/doi:${doi}`, 404, {});
  openalex.respondSequence("/works", [
    {
      status: 200,
      body: { results: [oa(201, "Synthetic article", "Zzzzzz")] },
    },
    {
      status: 200,
      body: { results: [oa(201, "Synthetic article", "Zzzzzz")] },
    },
    { status: 200, body: { results: [oa(202, "ZZZZZZZZZZZZZZZZZ", "Alpha")] } },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run({ ...article, DOI: doi });
  expect(outcome.verdict).toBe("doi-conflict");
  expect(outcome.reasons).toEqual(["doi-nonexistent"]);
  expect(outcome.candidates).toHaveLength(2);
});
it("establishes an intended different Source independently before reporting a foreign DOI", async () => {
  const doi = "10.5555/foreign";
  crossref.respond(`/api/handles/${doi}`, 200, {
    responseCode: 1,
    handle: doi,
  });
  openalex.respond(`/works/doi:${doi}`, 200, {
    ...oa(203, "ZZZZZZZZZZZZZZZZZ", "Zzzzzz"),
    doi,
  });
  crossref.respond(`/works/${doi}`, 404, {});
  openalex.respond("/works", 200, {
    results: [
      { ...oa(204, "Synthetic article", "Alpha"), doi: "10.5555/intended" },
    ],
  });
  const { outcome } = await run({ ...article, DOI: doi });
  expect(outcome.verdict).toBe("doi-conflict");
  expect(outcome.reasons).toEqual(["foreign-doi"]);
  expect(outcome.bestMatchId).toBe("https://openalex.org/W204");
});
it("continues to Crossref after an OpenAlex failure and distinguishes that failure from authority loss", async () => {
  openalex.respond("/works", 503, {});
  crossref.respond("/works", 200, {
    message: { items: [cr("10.5555/crossref-match")] },
  });
  const { outcome } = await run(article);
  expect(outcome.verdict).toBe("correct");
  expect(outcome.failedSources).toEqual(["openalex"]);
  expect(outcome.candidates).toMatchObject([
    {
      source: "crossref",
      id: "crossref:10.5555/crossref-match",
      score: { value: 100000000 },
    },
  ]);
  expect(
    outcome.evidence
      .filter((e) => e.source === "openalex")
      .every((e) => e.outcome === "unavailable" && e.attempts === 2),
  ).toBe(true);
});
it("requires completed searches in both explicitly enabled development indexes for Not found", async () => {
  openalex.respond("/works", 200, { results: [] });
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  expect(outcome.verdict).toBe("not-found");
  expect(outcome.reasons).toEqual(["search-completed"]);
  expect(
    outcome.evidence.filter((e) => e.outcome === "no-record"),
  ).toHaveLength(6);
  expect(openalex.requests).toHaveLength(3);
  expect(crossref.requests).toHaveLength(3);
});
it("does not present malformed completed metadata as a successful empty search", async () => {
  openalex.respond("/works", 200, {
    results: [{ title: "invalid without record ID" }],
  });
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  expect(outcome.verdict).toBe("not-verifiable");
  expect(outcome.failedSources).toEqual(["openalex"]);
  expect(outcome.evidence[0]).toMatchObject({
    outcome: "unavailable",
    reason: "invalid-metadata",
    raw: { results: [{ title: "invalid without record ID" }] },
  });
});
it("leaves equal top Scores for different Sources ambiguous", async () => {
  openalex.respondSequence("/works", [
    {
      status: 200,
      body: {
        results: [
          {
            id: "https://openalex.org/W301",
            title: "Synthetic article",
            doi: "10.5555/one",
          },
        ],
      },
    },
    {
      status: 200,
      body: {
        results: [
          { ...oa(302, "Synthetic article", "Alpha"), doi: "10.5555/two" },
        ],
      },
    },
    { status: 200, body: { results: [] } },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  expect(outcome.candidates.map((c) => c.score?.value)).toEqual([
    100000000, 100000000,
  ]);
  expect(outcome.verdict).toBe("not-verifiable");
  expect(outcome.reasons).toEqual(["ambiguous-identity"]);
});
it("keeps a low equal Score tie with missing identity comparisons insufficient", async () => {
  openalex.respondSequence("/works", [
    {
      status: 200,
      body: {
        results: [
          {
            id: "https://openalex.org/W303",
            title: "Synthetic article review",
            doi: "10.5555/three",
          },
        ],
      },
    },
    {
      status: 200,
      body: {
        results: [
          {
            id: "https://openalex.org/W304",
            title: "Synthetic article review",
            doi: "10.5555/four",
          },
        ],
      },
    },
    { status: 200, body: { results: [] } },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  const [first, second] = outcome.candidates.map((c) => c.score?.value);
  expect(first).toBe(second);
  // Between the synthetic 50% counterevidence and 85% overall thresholds.
  expect(first).toBeGreaterThanOrEqual(50000000);
  expect(first).toBeLessThan(85000000);
  expect(outcome.verdict).toBe("not-verifiable");
  expect(outcome.reasons).toEqual(["insufficient-search"]);
});
it("does not contact another source when exact identifier identity is settled, and compares remaining supplied identifiers", async () => {
  const doi = "10.5555/identifier-stop";
  crossref.respond(`/api/handles/${doi}`, 200, {
    responseCode: 1,
    handle: doi,
  });
  openalex.respond(`/works/doi:${doi}`, 200, {
    ...oa(303, "Synthetic article", "Alpha"),
    doi,
    ids: { pmid: "https://pubmed.ncbi.nlm.nih.gov/123" },
  });
  const { outcome } = await run({ ...article, DOI: doi, PMID: "999" });
  expect(outcome.verdict).toBe("exists-with-deviations");
  expect(outcome.identity.kind).toBe("supplied-doi");
  expect(openalex.requests).toHaveLength(1);
  expect(crossref.requests).toHaveLength(1);
  expect(
    outcome.candidates[0]!.fields.find((f) => f.field === "PMID"),
  ).toMatchObject({ reference: "999", candidate: "123", reason: "unweighted" });
});
it("preserves frozen /v1 creates, snapshots and numeric SSE while /v2 reads stored legacy results", async () => {
  const { CheckResponse: frozen } =
    await import("./fixtures/verification-client-74/dist/contract-verification/src/index.js");
  const response = await fetch(`${service.apiUrl}/v1/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
    }),
  });
  const created = frozen.parse(await response.json()).data;
  const stream = await fetch(
    `${service.apiUrl}/v1/checks/${created.id}/events`,
    { headers: { "last-event-id": "0001" } },
  );
  const { CheckEvent: oldEvent } =
    await import("./fixtures/verification-client-74/dist/contract-verification/src/index.js");
  for await (const frame of readSseFrames(stream.body!)) {
    expect(frame.id).toMatch(/^\d+$/u);
    oldEvent.parse(JSON.parse(frame.data));
  }
  const legacy = frozen.parse(
    await (await fetch(`${service.apiUrl}/v1/checks/${created.id}`)).json(),
  ).data;
  const modern = CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${created.id}`)).json(),
  ).data;
  expect(frozen.parse({ data: modern, quota: null }).data).toEqual(legacy);
  expect(openalex.requests).toHaveLength(0);
});
it("keeps /v2-only results out of frozen /v1 routes", async () => {
  openalex.respond("/works", 200, {
    results: [oa(304, "Synthetic article", "Alpha")],
  });
  const { snapshot } = await run(article);
  for (const [suffix, method] of [
    ["", "GET"],
    ["/events", "GET"],
    ["/cancel", "POST"],
    ["/lease", "POST"],
  ])
    expect(
      (
        await fetch(`${service.apiUrl}/v1/checks/${snapshot.id}${suffix}`, {
          method,
        })
      ).status,
    ).toBe(404);
});
it("does not collapse conflicting known identifiers just because another identifier agrees", async () => {
  openalex.respondSequence("/works", [
    {
      status: 200,
      body: {
        results: [
          {
            id: "https://openalex.org/W402",
            title: "Synthetic article",
            doi: "10.5555/shared",
            ids: { pmid: "https://pubmed.ncbi.nlm.nih.gov/111" },
          },
        ],
      },
    },
    {
      status: 200,
      body: {
        results: [
          {
            ...oa(401, "Synthetic article", "Alpha"),
            doi: "10.5555/shared",
            ids: { pmid: "https://pubmed.ncbi.nlm.nih.gov/222" },
          },
        ],
      },
    },
    { status: 200, body: { results: [] } },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  expect(outcome.verdict).toBe("not-verifiable");
  expect(outcome.reasons).toEqual(["ambiguous-identity"]);
});
it("publishes separate OpenAPI majors with the frozen v1 source and cap", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const version of [1, 2]) {
    const actual: unknown = await (
      await fetch(`${service.apiUrl}/v${version}/openapi.json`)
    ).json();
    const expected: unknown = JSON.parse(
      await readFile(
        new URL(
          `../../../packages/contract-verification/openapi${version === 2 ? "-v2" : ""}.json`,
          import.meta.url,
        ),
        "utf8",
      ),
    );
    expect(actual).toEqual(expected);
  }
});
it("records supplied PMID identity separately from independent bibliographic proof", async () => {
  openalex.respond("/works/pmid:77002", 200, {
    ...oa(501, "Synthetic article", "Alpha"),
    ids: { pmid: "https://pubmed.ncbi.nlm.nih.gov/77002" },
  });
  const { outcome } = await run({ ...article, PMID: "77002" });
  expect(outcome).toMatchObject({
    verdict: "correct",
    identity: {
      kind: "supplied-identifier",
      candidateId: "https://openalex.org/W501",
    },
  });
  expect(openalex.requests).toHaveLength(1);
  expect(crossref.requests).toHaveLength(0);
});
it("records unsupported PMCID capability without inventing a lookup or negative evidence", async () => {
  openalex.respond("/works", 200, { results: [] });
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run({ ...article, PMCID: "PMC5815332" });
  expect(outcome.verdict).toBe("not-verifiable");
  expect(outcome.failedSources).toEqual([]);
  expect(outcome.evidence).toContainEqual(
    expect.objectContaining({
      source: "openalex",
      operation: "pmcid",
      outcome: "unsupported",
      attempts: 0,
    }),
  );
  expect(openalex.requests.some((r) => r.path.includes("/works/pmcid:"))).toBe(
    false,
  );
});
it("does not resolve competing identity using a Score with an excluded resource-limited comparison", async () => {
  openalex.respondSequence("/works", [
    { status: 200, body: { results: [oa(601, "Z".repeat(120000), "Zzzzzz")] } },
    { status: 200, body: { results: [oa(602, "Synthetic article", "Alpha")] } },
    { status: 200, body: { results: [] } },
  ]);
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run(article);
  expect(
    outcome.candidates.find((c) => c.id === "https://openalex.org/W601")
      ?.fields,
  ).toContainEqual(
    expect.objectContaining({
      field: "title",
      reason: "resource-limit",
      score: null,
    }),
  );
  expect(outcome.verdict).toBe("not-verifiable");
  expect(outcome.reasons).toContain("development-route-incomplete");
});
it("normalizes a supplied PMID URL while preserving the raw field and exact Score", async () => {
  openalex.respond("/works/pmid:77002", 200, {
    ...oa(701, "Synthetic article", "Alpha"),
    ids: { pmid: "https://pubmed.ncbi.nlm.nih.gov/77002" },
  });
  const { outcome } = await run({
    ...article,
    PMID: "https://pubmed.ncbi.nlm.nih.gov/77002/",
  });
  expect(outcome.verdict).toBe("correct");
  expect(outcome.candidates[0]!.score?.value).toBe(100000000);
  expect(outcome.candidates[0]!.fields).toContainEqual(
    expect.objectContaining({
      field: "PMID",
      reference: "https://pubmed.ncbi.nlm.nih.gov/77002/",
      candidate: "77002",
    }),
  );
});
it("logs a repeated source record reached by different identifiers without evaluating it twice", async () => {
  const doi = "10.5555/repeated-record";
  crossref.respond(`/api/handles/${doi}`, 200, {
    responseCode: 1,
    handle: doi,
  });
  openalex.respond(`/works/doi:${doi}`, 200, { ...oa(801), doi });
  openalex.respond("/works/pmid:77002", 200, {
    ...oa(801),
    doi,
    ids: { pmid: "https://pubmed.ncbi.nlm.nih.gov/77002" },
  });
  openalex.respond("/works", 200, { results: [] });
  crossref.respond("/works", 200, { message: { items: [] } });
  const { outcome } = await run({ ...article, DOI: doi, PMID: "77002" });
  expect(outcome.candidates).toHaveLength(1);
  expect(outcome.candidates[0]!.identifiers).toEqual([
    `doi:${doi}`,
    "pmid:77002",
  ]);
  expect(outcome.evidence).toContainEqual(
    expect.objectContaining({
      source: "openalex",
      operation: "pmid",
      skippedDuplicates: ["https://openalex.org/W801"],
    }),
  );
});
