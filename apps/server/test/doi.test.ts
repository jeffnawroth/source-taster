// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { startTestService } from "./support/service.ts";
import { physicsReference, startDoiFixtures } from "./support/doi-fixtures.ts";
const containing = (items: unknown[]): unknown =>
  expect.arrayContaining(items) as unknown;
const matching = (item: unknown): unknown =>
  expect.objectContaining(item) as unknown;
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_DOI_PORT ?? 54174),
    0,
    fixtures.env,
  );
});
afterAll(async () => {
  await service?.stop();
  await fixtures?.stop();
});
async function check(input: string | object) {
  const response = await fetch(`${service.apiUrl}/v1/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(typeof input === "string" ? { text: input } : input),
  });
  expect(response.status).toBe(201);
  const created = CheckResponse.parse(await response.json()).data;
  const stream = await fetch(
    `${service.apiUrl}/v1/checks/${created.id}/events`,
    { signal: AbortSignal.timeout(15000) },
  );
  const events: unknown[] = [];
  for await (const frame of readSseFrames(stream.body!))
    events.push(JSON.parse(frame.data));
  const snapshot = CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v1/checks/${created.id}`)).json(),
  ).data;
  return { created, snapshot, events };
}
it("streams and persists a Correct DOI result with independent resolution, raw Candidate and versioned scores", async () => {
  const { snapshot, events } = await check(physicsReference);
  expect(snapshot.references[0]).toMatchObject({
    originalText: physicsReference,
    outcome: {
      kind: "verdict",
      verdict: "correct",
      scoringRules: { calibration: "uncalibrated" },
      candidates: [
        {
          source: "crossref",
          score: { value: 100000000, fullAgreement: true },
        },
      ],
      identity: { kind: "supplied-doi" },
      evidence: containing([
        matching({ source: "doi.org", outcome: "exists" }),
      ]),
    },
  });
  expect(events).toContainEqual(
    matching({
      type: "reference.updated",
      reference: {
        slot: 1,
        outcome: snapshot.references[0]!.outcome,
        progress: "ended",
      },
    }),
  );
});

it("does not accept a nonexistent response for a different Handle as DOI nonexistence", async () => {
  fixtures.respond("/api/handles/10.5555/wrong-handle", 404, {
    responseCode: 100,
    handle: "10.5555/another",
  });
  fixtures.respond("/works/10.5555/wrong-handle", 404, {});
  const { snapshot } = await check("doi:10.5555/wrong-handle");
  expect(snapshot.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    reasons: ["mandatory-resolution-incomplete"],
  });
});

it("confirms a foreign DOI only with independent bibliographic evidence for the intended different Source", async () => {
  const record = JSON.parse(
    await readFile(
      new URL("./fixtures/doi/crossref-171737a0.json", import.meta.url),
      "utf8",
    ),
  ) as { message: unknown };
  fixtures.respond("/works", 200, { message: { items: [record.message] } });
  const { snapshot } = await check({
    references: [
      {
        originalText: "Synthetic wrong DOI on public Watson and Crick metadata",
        fields: {
          DOI: "10.1038/nphys1170",
          title:
            "Molecular Structure of Nucleic Acids: A Structure for Deoxyribose Nucleic Acid",
          author: [
            { family: "Watson", given: "J. D." },
            { family: "Crick", given: "F. H. C." },
          ],
          issued: { literal: "1953" },
        },
      },
    ],
  });
  expect(snapshot.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "doi-conflict",
    reasons: ["foreign-doi"],
    identity: {
      kind: "independent-bibliography",
      candidateId: "10.1038/171737a0",
    },
    bestMatchId: "10.1038/171737a0",
  });
});
it("treats Crossref 404 as metadata absence while the neutral resolver confirms a valid DOI", async () => {
  fixtures.respond("/api/handles/10.5555/non-crossref", 200, {
    responseCode: 1,
    handle: "10.5555/non-crossref",
  });
  fixtures.respond("/works/10.5555/non-crossref", 404, {});
  const { snapshot } = await check("doi:10.5555/non-crossref");
  expect(snapshot.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    reasons: ["metadata-unavailable"],
    evidence: containing([
      matching({ source: "crossref", outcome: "no-record" }),
    ]),
  });
});
it("retains a perfect Candidate Score but refuses identity when mandatory resolution is unavailable", async () => {
  fixtures.respond("/api/handles/10.1038/nphys1170", 503, {
    error: "synthetic-outage",
  });
  const { snapshot } = await check(physicsReference);
  expect(snapshot.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    identity: { kind: "unresolved" },
    reasons: ["mandatory-resolution-incomplete"],
    failedSources: ["doi.org"],
    candidates: [{ score: { value: 100000000, fullAgreement: true } }],
    evidence: containing([matching({ source: "doi.org", attempts: 2 })]),
  });
  fixtures.respond("/api/handles/10.1038/nphys1170", 200, {
    responseCode: 1,
    handle: "10.1038/nphys1170",
  });
});
it("uses confirmed neutral nonexistence for a covered DOI conflict", async () => {
  const response = JSON.parse(
    await readFile(
      new URL("./fixtures/doi/handle-nonexistent.json", import.meta.url),
      "utf8",
    ),
  ) as unknown;
  fixtures.respond(
    "/api/handles/10.5555/source-taster-fixture-nonexistent",
    404,
    response,
  );
  fixtures.respond("/works/10.5555/source-taster-fixture-nonexistent", 404, {});
  const { snapshot } = await check(
    "doi:10.5555/source-taster-fixture-nonexistent",
  );
  expect(snapshot.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "doi-conflict",
    reasons: ["doi-nonexistent"],
    identity: { kind: "unresolved" },
  });
});
it.each([
  "legislation",
  "legal_case",
  "standard",
  "patent",
  "personal_communication",
  "map",
  "song",
  "manuscript",
])(
  "applies coverage first to known unsupported CSL type %s even with a DOI",
  async (type) => {
    const { snapshot } = await check({
      references: [
        {
          originalText: "Synthetic unsupported type",
          fields: { type, DOI: "10.5555/outside" },
        },
      ],
    });
    expect(snapshot.references[0]!.outcome).toMatchObject({
      kind: "verdict",
      verdict: "not-verifiable",
      reasons: ["outside-coverage"],
      evidence: [],
      candidates: [],
    });
  },
);
it("names differing and missing fields with both raw values while comparing only shared fields", async () => {
  const { snapshot } = await check({
    references: [
      {
        originalText: "Synthetic year deviation",
        fields: {
          DOI: "10.1038/nphys1170",
          title: "Measured measurement",
          issued: { literal: "2008" },
          issue: "2",
        },
      },
    ],
  });
  expect(snapshot.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "exists-with-deviations",
    reference: {
      originalText: "Synthetic year deviation",
      csl: { issued: { literal: "2008" } },
      structuring: { path: "user" },
    },
    candidates: [
      {
        fields: containing([
          {
            field: "issued",
            reference: { literal: "2008" },
            candidate: { literal: "2009-01" },
            score: { value: 50000000, fullAgreement: false },
            reason: "compared",
          },
          {
            field: "author",
            reference: null,
            candidate: [{ family: "Aspelmeyer", given: "Markus" }],
            score: null,
            reason: "missing-reference",
          },
          {
            field: "issue",
            reference: "2",
            candidate: "1",
            score: null,
            reason: "unweighted",
          },
        ]),
        score: { value: 86363636, fullAgreement: false },
      },
    ],
  });
});
const arithmeticCases = [
  // Independently worked ADR-0025 examples, not a calibration corpus.
  {
    field: "title",
    supplied: "Jouranl",
    metadata: "Journal",
    value: 85714286,
    overall: 89285715,
  },
  {
    field: "title",
    supplied: "ABC",
    metadata: "ABD",
    value: 66666667,
    overall: 75000000,
  },
  {
    field: "title",
    supplied: "Müller",
    metadata: "Mueller",
    value: 100000000,
    overall: 100000000,
  },
  {
    field: "title",
    supplied: "Mueller",
    metadata: "Muller",
    value: 85714286,
    overall: 89285715,
  },
  {
    field: "title",
    supplied: "MÃ¼ller",
    metadata: "Muller",
    value: 100000000,
    overall: 100000000,
  },
  {
    field: "page",
    supplied: "125–126",
    metadata: "123–128",
    value: 100000000,
    overall: 100000000,
  },
  {
    field: "page",
    supplied: "127–130",
    metadata: "123–128",
    value: 50000000,
    overall: 91666667,
  },
  {
    field: "page",
    supplied: "123–8",
    metadata: "123–128",
    value: 100000000,
    overall: 100000000,
  },
  // 199,999,999 / 200,000,000 rounds to 100 at storage precision, but
  // one absent cited page must retain the independent deviation flag and cap.
  {
    field: "page",
    supplied: "1–200000000",
    metadata: "1–199999999",
    value: 99999999,
    overall: 99999999,
  },
  {
    field: "volume",
    supplied: "Vol. 12 (3)",
    metadata: "12",
    value: 100000000,
    overall: 100000000,
  },
  {
    field: "container-title",
    supplied: "Journal of Testing (JOT)",
    metadata: "Journal of Testing",
    value: 100000000,
    overall: 100000000,
  },
];
it.each(arithmeticCases)(
  "replays the fixed $field example $supplied / $metadata through HTTP with exact integer arithmetic",
  async (c) => {
    fixtures.respond("/api/handles/10.5555/arithmetic", 200, {
      responseCode: 1,
      handle: "10.5555/arithmetic",
    });
    fixtures.respond("/works/10.5555/arithmetic", 200, {
      message: {
        DOI: "10.5555/arithmetic",
        [c.field]:
          c.field === "title" || c.field === "container-title"
            ? [c.metadata]
            : c.metadata,
      },
    });
    const { snapshot } = await check({
      references: [
        {
          originalText: `Synthetic arithmetic ${c.supplied}`,
          fields: { DOI: "10.5555/arithmetic", [c.field]: c.supplied },
        },
      ],
    });
    expect(snapshot.references[0]!.outcome).toMatchObject({
      kind: "verdict",
      candidates: [
        {
          score: { value: c.overall },
          fields: containing([
            matching({
              field: c.field,
              score: { value: c.value, fullAgreement: c.value === 100000000 },
            }),
          ]),
        },
      ],
    });
  },
);
it.each(["web", "worker"] as const)(
  "refuses uncalibrated activation in the production %s process",
  async (entry) => {
    const { startProcess, testDatabase } =
      await import("./support/processes.ts");
    const process = startProcess(
      entry,
      {
        SOURCE_TASTER_MODE: "standalone",
        DATABASE_URL: testDatabase().appUrl,
        SOURCE_TASTER_DOI_PREVIEW: "uncalibrated",
        NODE_ENV: "production",
      },
      { inheritEnv: false },
    );
    expect(await process.exited).toBe(78);
    expect(process.output()).toContain(
      "Uncalibrated DOI rules cannot be released or activated",
    );
  },
);
it("does not retry or invent a conflict when provider Retry-After exceeds the permitted retry window", async () => {
  fixtures.respond(
    "/api/handles/10.5555/cooldown",
    429,
    { responseCode: 2 },
    { "retry-after": "3" },
  );
  fixtures.respond("/works/10.5555/cooldown", 404, {});
  const { snapshot } = await check("doi:10.5555/cooldown");
  expect(snapshot.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    reasons: ["mandatory-resolution-incomplete"],
    evidence: containing([
      matching({
        source: "doi.org",
        attempts: 1,
        status: 429,
        reason: "rate-budget",
      }),
    ]),
  });
});
it("keeps identity unresolved when contradictory metadata has no independent intended Source", async () => {
  fixtures.respond("/works", 200, { message: { items: [] } });
  const { snapshot } = await check({
    references: [
      {
        originalText: "Synthetic contradictory fields",
        fields: {
          DOI: "10.1038/nphys1170",
          title: "A wholly different book of botany",
          author: [{ family: "Darwin", given: "Charles" }],
        },
      },
    ],
  });
  expect(snapshot.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    identity: { kind: "unresolved" },
    reasons: ["identity-unresolved", "development-route-incomplete"],
  });
});
it("refuses an oversized comparison honestly instead of running unbounded work or inferring identity from the remaining DOI Score", async () => {
  fixtures.respond("/api/handles/10.5555/resource-bound", 200, {
    responseCode: 1,
    handle: "10.5555/resource-bound",
  });
  fixtures.respond("/works/10.5555/resource-bound", 200, {
    message: { DOI: "10.5555/resource-bound", title: ["a".repeat(1600)] },
  });
  const { snapshot } = await check({
    references: [
      {
        originalText: "Synthetic comparison resource bound",
        fields: {
          DOI: "10.5555/resource-bound",
          title: "a".repeat(1599) + "b",
        },
      },
    ],
  });
  expect(snapshot.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    identity: { kind: "unresolved" },
    reasons: ["development-route-incomplete"],
    candidates: [
      {
        fields: containing([
          matching({ field: "title", score: null, reason: "resource-limit" }),
        ]),
      },
    ],
  });
});
it("keeps a differing supplied URL unverified instead of claiming a confirmed URL deviation", async () => {
  const { snapshot } = await check({
    references: [
      {
        originalText: "Synthetic unverified article URL",
        fields: {
          DOI: "10.1038/nphys1170",
          title: "Measured measurement",
          URL: "https://example.invalid/source",
        },
      },
    ],
  });
  expect(snapshot.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    reasons: ["url-verification-incomplete"],
  });
});

it("the actual pre-lifecycle /v1 client parses DOI Verdict frames and resumes numeric cursors", async () => {
  const { snapshot } = await check(physicsReference);
  const { watchCheckEvents, readSseFrames: legacyFrames } =
    await import("./fixtures/verification-client-74/dist/contract-verification/src/client.js");
  const seen: unknown[] = [];
  await watchCheckEvents(snapshot.id, {
    baseUrl: service.apiUrl,
    lastEventSeq: 1,
    signal: AbortSignal.timeout(10000),
    onEvent: (event) => seen.push(event),
  });
  expect(seen).toContainEqual(
    expect.objectContaining({
      type: "reference.updated",
      reference: expect.objectContaining({
        outcome: expect.objectContaining({
          kind: "verdict",
          verdict: "correct",
        }),
      }),
    }),
  );
  const response = await fetch(
    `${service.apiUrl}/v1/checks/${snapshot.id}/events`,
  );
  for await (const frame of legacyFrames(response.body!))
    expect(Number(frame.id)).toBe(JSON.parse(frame.data).seq);
});
