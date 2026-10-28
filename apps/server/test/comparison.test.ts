// SPDX-License-Identifier: AGPL-3.0-or-later
// Synthetic independent worked examples at the public HTTP/SSE seam, not calibration.
import { afterAll, beforeAll, expect, it } from "vitest";
import {
  CheckEvent,
  CheckResponse,
} from "@source-taster/contract-verification";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { startTestService } from "./support/service.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
let sequence = 0;
const matching = (item: unknown): unknown =>
  expect.objectContaining(item) as unknown;
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_COMPARISON_PORT ?? 54572),
    0,
    fixtures.env,
  );
});
afterAll(async () => {
  await service?.stop();
  await fixtures?.stop();
});
async function compare(
  reference: object,
  candidate: object,
  authorsTruncated = false,
) {
  const doi = `10.5555/comparison-${++sequence}`;
  fixtures.respond(`/api/handles/${doi}`, 200, {
    responseCode: 1,
    handle: doi,
  });
  fixtures.respond(`/works/${doi}`, 200, {
    message: { DOI: doi, ...candidate },
  });
  fixtures.respond("/works", 200, { message: { items: [] } });
  const createdResponse = await fetch(`${service.apiUrl}/v1/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      references: [
        {
          originalText: `Synthetic comparison ${sequence}`,
          fields: { DOI: doi, ...reference },
          authorsTruncated,
        },
      ],
    }),
  });
  expect(createdResponse.status).toBe(201);
  const created = CheckResponse.parse(await createdResponse.json()).data;
  const response = await fetch(
    `${service.apiUrl}/v1/checks/${created.id}/events`,
    { signal: AbortSignal.timeout(15000) },
  );
  const events = [];
  for await (const frame of readSseFrames(response.body!))
    events.push(CheckEvent.parse(JSON.parse(frame.data)));
  const snapshot = CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v1/checks/${created.id}`)).json(),
  ).data;
  const outcome = snapshot.references[0]!.outcome;
  if (outcome?.kind !== "verdict")
    throw new Error("Expected immutable Verdict");
  expect(events).toContainEqual(
    matching({
      type: "reference.updated",
      reference: matching({ outcome }),
    }),
  );
  return { outcome, candidate: outcome.candidates[0]!, snapshot };
}
it("assigns crossed author names one-to-one and applies the exact Kendall penalty", async () => {
  // Each exact surname contributes 1. Three pairs, one discordance: 1*(1-1/3)=2/3.
  const { candidate } = await compare(
    { author: [{ family: "Alpha" }, { family: "Beta" }, { family: "Gamma" }] },
    { author: [{ family: "Beta" }, { family: "Alpha" }, { family: "Gamma" }] },
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 66666667,
    fullAgreement: false,
  });
  // Stored author integer, not its exact pre-storage rational: (25*66666667+10*100000000)/35.
  expect(candidate.score).toEqual({ value: 76190476, fullAgreement: false });
});
it("rounds author arithmetic once after exact name components, list sum and order penalty", async () => {
  // Name 1: surname 2/3, given 1 => (3*2/3+1)/4=3/4.
  // Name 2: surname 4/7, given 1 => (3*4/7+1)/4=19/28.
  // In order: (3/4+19/28)/2 = 5/7, stored 71.428571%.
  const { candidate } = await compare(
    {
      author: [
        { family: "abc", given: "A" },
        { family: "abcdefg", given: "B" },
      ],
    },
    {
      author: [
        { family: "abd", given: "Anna" },
        { family: "abcdxyz", given: "Ben" },
      ],
    },
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 71428571,
    fullAgreement: false,
  });
});
it("does not turn the journal's ordinary qualifier into an acronym or full agreement", async () => {
  const { candidate } = await compare(
    { "container-title": "Cells" },
    { "container-title": ["Cells (Basel)"] },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title")?.score
      ?.fullAgreement,
  ).toBe(false);
});
it("compares leading-zero date components numerically and does not score in-press dates", async () => {
  const { candidate } = await compare(
    { issued: { literal: "2021-06-05" } },
    { published: { "date-parts": [[2021, 6, 5]] } },
  );
  expect(candidate.fields.find((f) => f.field === "issued")?.score).toEqual({
    value: 100000000,
    fullAgreement: true,
  });
  const missing = await compare(
    { issued: { literal: "in press (2021)" } },
    { published: { "date-parts": [[2021]] } },
  );
  expect(
    missing.candidate.fields.find((f) => f.field === "issued"),
  ).toMatchObject({
    score: null,
    reason: "not-determinable",
    reference: { literal: "in press (2021)" },
  });
});
const names = (...family: string[]) => family.map((family) => ({ family }));
it("maximizes the exact pair-score sum before considering list order", async () => {
  // Straight sum: 1/2+3/4=5/4; crossed: 1+1/2=3/2. Primary optimum must cross,
  // even though the synthetic p=1 then reduces the field to zero.
  const { candidate } = await compare(
    { author: names("aabc", "aacc") },
    { author: names("aaaa", "aabc") },
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 0,
    fullAgreement: false,
  });
});
it("resolves equal maximum sums in favour of the assignment with least discordance", async () => {
  // Every edge is 3/4; both assignments have sum 3/2.
  // Equal primary optima: only straight has d=0, yielding 3/4.
  const { candidate } = await compare(
    { author: names("aaaa", "aabb") },
    { author: names("aaab", "aaba") },
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 75000000,
    fullAgreement: false,
  });
});
it("does not let one Candidate name satisfy duplicate Reference names", async () => {
  const { candidate } = await compare(
    { author: names("Alpha", "Alpha") },
    { author: names("Alpha") },
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 50000000,
    fullAgreement: false,
  });
});
it("ignores below-threshold pairs for order and still counts unassigned names in N", async () => {
  const { candidate } = await compare(
    { author: names("Alpha", "QQQQQ", "Gamma") },
    { author: names("Alpha", "ZZZZZ", "Gamma") },
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 66666667,
    fullAgreement: false,
  });
});
it("compares particles both ways, positional hyphenated initials, and full given names by OSA", async () => {
  const agreed = await compare(
    {
      author: [
        { family: "Beethoven", "non-dropping-particle": "van", given: "H.-P." },
      ],
    },
    { author: [{ family: "van Beethoven", given: "Hans-Peter" }] },
  );
  expect(
    agreed.candidate.fields.find((f) => f.field === "author")?.score,
  ).toEqual({ value: 100000000, fullAgreement: true });
  const deviates = await compare(
    { author: [{ family: "Muller", given: "Anna" }] },
    { author: [{ family: "Müller", given: "Andrea" }] },
  );
  // Anna / Andrea = 1/2, so (3*1+1/2)/4 = 7/8.
  expect(
    deviates.candidate.fields.find((f) => f.field === "author")?.score,
  ).toEqual({ value: 87500000, fullAgreement: false });
});
it("compares corporate names as whole names and corporate/person as zero", async () => {
  const corporate = await compare(
    { author: [{ literal: "Jouranl" }] },
    { author: [{ name: "Journal" }] },
  );
  expect(
    corporate.candidate.fields.find((f) => f.field === "author")?.score,
  ).toEqual({ value: 85714286, fullAgreement: false });
  const person = await compare(
    { author: [{ literal: "Alpha" }] },
    { author: names("Alpha") },
  );
  expect(
    person.candidate.fields.find((f) => f.field === "author")?.score,
  ).toEqual({ value: 0, fullAgreement: false });
});
it("frees only trailing omissions after an explicit truncation marker", async () => {
  const trailing = await compare(
    { author: names("Alpha", "Gamma") },
    { author: names("Alpha", "Gamma", "Delta") },
    true,
  );
  expect(
    trailing.candidate.fields.find((f) => f.field === "author")?.score,
  ).toEqual({ value: 100000000, fullAgreement: true });
  const intervening = await compare(
    { author: names("Alpha", "Gamma") },
    { author: names("Alpha", "Beta", "Gamma", "Delta") },
    true,
  );
  expect(
    intervening.candidate.fields.find((f) => f.field === "author")?.score,
  ).toEqual({ value: 66666667, fullAgreement: false });
  const unmarked = await compare(
    { author: names("Alpha", "Gamma") },
    { author: names("Alpha", "Gamma", "Delta") },
  );
  expect(
    unmarked.candidate.fields.find((f) => f.field === "author")?.score,
  ).toEqual({ value: 66666667, fullAgreement: false });
});
it("uses optimal assignment at 100 Reference names even with a longer Candidate list, and positional assignment at 101", async () => {
  const reference = Array.from({ length: 100 }, (_, i) => ({
    literal: String.fromCodePoint(0x4e00 + i),
  }));
  const candidate = reference.map((n) => ({ name: n.literal }));
  [candidate[0], candidate[1]] = [candidate[1]!, candidate[0]!];
  candidate.push(
    ...Array.from({ length: 900 }, () => ({ name: "Extraneous" })),
  );
  const optimum = await compare({ author: reference }, { author: candidate });
  expect(
    optimum.candidate.fields.find((f) => f.field === "author")?.score,
  ).toEqual({ value: 9997980, fullAgreement: false });
  const longer = Array.from({ length: 101 }, (_, i) => ({
    literal: String.fromCodePoint(0x4e00 + i),
  }));
  const fallback = await compare(
    { author: longer },
    { author: longer.toReversed().map((n) => ({ name: n.literal })) },
  );
  // Only the middle position agrees: 1/101, no assigned-pair discordance.
  expect(
    fallback.candidate.fields.find((f) => f.field === "author")?.score,
  ).toEqual({ value: 990099, fullAgreement: false });
});

it("uses the approved final Candidate-position tie only after the earlier priorities tie", async () => {
  const { candidate } = await compare(
    { author: names("Alpha") },
    { author: names("Alpha", "Alpha") },
    true,
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 100000000,
    fullAgreement: true,
  });
});
it.each([
  { minimumName: 0 },
  { minimumName: 100000001 },
  { orderPenalty: 0 },
  { orderPenalty: 100000001 },
  { surnameWeight: 1, givenWeight: 1 },
  { surnameWeight: 3.5 },
  { monthWeight: 100000000 },
  { dayWeight: 100000000 },
  { metric: "Levenshtein" },
  { optimalReferenceNames: 101 },
  { yearWeight: 8 },
  { titleWeight: 20 },
  { calibration: "approved" },
])(
  "rejects fixed rules or invalid free parameters %j at startup",
  async (parameters) => {
    const { startProcess } = await import("./support/processes.ts");
    const process = startProcess(
      "worker",
      {
        SOURCE_TASTER_MODE: "standalone",
        DATABASE_URL: "postgres://unused:unused@127.0.0.1:1/unused",
        SOURCE_TASTER_COMPARISON_PARAMETERS: JSON.stringify(parameters),
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
it("compares the written day before English or German month names and excludes n.d. with incidental years", async () => {
  for (const literal of ["15 June 2021", "15. Juni 2021", "June 15, 2021"]) {
    const { candidate } = await compare(
      { issued: { literal } },
      { published: { "date-parts": [[2021, 6, 15]] } },
    );
    expect(candidate.fields.find((f) => f.field === "issued")?.score).toEqual({
      value: 100000000,
      fullAgreement: true,
    });
  }
  const { candidate } = await compare(
    { issued: { literal: "n.d. (accessed 2021)" } },
    { published: { "date-parts": [[2021]] } },
  );
  expect(candidate.fields.find((f) => f.field === "issued")).toMatchObject({
    score: null,
    reason: "not-determinable",
  });
});
it.each([
  "15 June – 16 July 2021",
  "June 15–July 16, 2021",
  "15.–17. Juni 2021",
  "June 15–17, 2021",
  "15 June to 16 July 2021",
  "15. Juni bis 16. Juli 2021",
  "June–July 2021",
  "2021-06-15/2021-07-16",
])("compares only the year of the date range %s", async (literal) => {
  const { candidate } = await compare(
    { issued: { literal } },
    { published: { "date-parts": [[2021, 6, 17]] } },
  );
  expect(candidate.fields.find((f) => f.field === "issued")).toMatchObject({
    reference: { literal },
    score: { value: 100000000, fullAgreement: true },
  });
});
it("applies normalization in the fixed order on Unicode code points and preserves both raw values", async () => {
  const cases = [
    ["<i>M&Atilde;&frac14;ller</i>", "Muller", 100000000],
    ["Straße — CAFÉ", "STRASSE cafe", 100000000],
    ["ＡＢＣ", "abc", 100000000],
    ["Müller", "Mueller", 100000000],
    ["Mueller", "Muller", 85714286],
    ["𐐀a", "𐐀b", 50000000],
    ["Ä°stanbul", "İstanbul", 100000000],
  ] as const;
  for (const [raw, metadata, value] of cases) {
    const { candidate } = await compare({ title: raw }, { title: [metadata] });
    expect(candidate.fields.find((f) => f.field === "title")).toMatchObject({
      reference: raw,
      candidate: metadata,
      score: { value, fullAgreement: value === 100000000 },
    });
  }
});

it("records a changed parameter set under a new version and replays older immutable evidence across restart", async () => {
  const before = await compare(
    { author: names("Alpha", "Beta", "Gamma") },
    { author: names("Beta", "Alpha", "Gamma") },
  );
  expect(
    before.candidate.fields.find((f) => f.field === "author")?.score,
  ).toEqual({ value: 66666667, fullAgreement: false });
  await service.restart({
    SOURCE_TASTER_COMPARISON_PARAMETERS: JSON.stringify({
      orderPenalty: 50000000,
    }),
  });
  try {
    const persisted = CheckResponse.parse(
      await (
        await fetch(`${service.apiUrl}/v1/checks/${before.snapshot.id}`)
      ).json(),
    ).data;
    expect(persisted).toEqual(before.snapshot);
    const replay = await fetch(
      `${service.apiUrl}/v1/checks/${before.snapshot.id}/events`,
      {
        headers: { "last-event-id": `${before.snapshot.id}:0` },
        signal: AbortSignal.timeout(15000),
      },
    );
    const events = [];
    for await (const frame of readSseFrames(replay.body!))
      events.push(CheckEvent.parse(JSON.parse(frame.data)));
    expect(events).toContainEqual(
      matching({
        type: "reference.updated",
        reference: matching({ outcome: before.outcome }),
      }),
    );
    const after = await compare(
      { author: names("Alpha", "Beta", "Gamma") },
      { author: names("Beta", "Alpha", "Gamma") },
    );
    expect(
      after.candidate.fields.find((f) => f.field === "author")?.score,
    ).toEqual({ value: 83333333, fullAgreement: false });
    expect(after.outcome.scoringRules).toMatchObject({
      calibration: "uncalibrated",
      profile: { orderPenalty: 50000000 },
    });
    expect(after.outcome.scoringRules.version).not.toBe(
      before.outcome.scoringRules.version,
    );
    const repeated = await compare(
      { author: names("Alpha", "Beta", "Gamma") },
      { author: names("Beta", "Alpha", "Gamma") },
    );
    expect(repeated.candidate.score).toEqual(after.candidate.score);
    expect(repeated.outcome.scoringRules).toEqual(after.outcome.scoringRules);
  } finally {
    await service.restart({ SOURCE_TASTER_COMPARISON_PARAMETERS: "{}" });
  }
});
it.each([
  ["125–126", "123–128", 100000000],
  ["127–130", "123–128", 50000000],
  ["123–8", "123–128", 100000000],
  ["199–02", "199–202", 100000000],
  ["xii–xv", "x–xiv", 75000000],
  ["S12–S15", "s10–s14", 75000000],
  ["S12–15", "T12–15", 0],
  ["11–12", "13–14", 0],
])(
  "compares inclusive page coverage %s / %s",
  async (reference, metadata, value) => {
    const { candidate } = await compare(
      { page: reference },
      { page: metadata },
    );
    expect(candidate.fields.find((f) => f.field === "page")?.score).toEqual({
      value,
      fullAgreement: value === 100000000,
    });
  },
);
it.each([
  [{ page: "xii–xv" }, { page: "12–15" }],
  [{ page: "S12–15" }, { page: "12–15" }],
  [{ "article-number": "e123" }, { page: "123–128" }],
  [{ page: "123–128" }, { "article-number": "e123" }],
  [{ page: "unrecognized a" }, { page: "unrecognized b" }],
])(
  "excludes not-determinable page/article pairs and retains both raw fields %j / %j",
  async (reference, metadata) => {
    const { candidate } = await compare(reference, metadata);
    expect(candidate.fields.find((f) => f.field === "page")).toMatchObject({
      score: null,
      reason: "not-determinable",
    });
    expect(candidate.score).toEqual({ value: 100000000, fullAgreement: true });
  },
);
it("compares normalized article numbers and nonnumeric volumes by equality, with issue unweighted", async () => {
  const { candidate } = await compare(
    { "article-number": "E-123", volume: "Supplement", issue: "3" },
    { "article-number": "e 123", volume: "SUPPLEMENT", issue: "4" },
  );
  expect(candidate.fields.find((f) => f.field === "page")?.score).toEqual({
    value: 100000000,
    fullAgreement: true,
  });
  expect(candidate.fields.find((f) => f.field === "volume")?.score).toEqual({
    value: 100000000,
    fullAgreement: true,
  });
  expect(candidate.fields.find((f) => f.field === "issue")).toMatchObject({
    reference: "3",
    candidate: "4",
    reason: "unweighted",
    score: null,
  });
});
it.each([
  ["2021", [2021, 6, 15], 100000000],
  ["2020", [2021], 50000000],
  ["2019", [2021], 0],
  ["2021-06", [2021, 7, 15], 88888889],
  ["2021-06-15", [2021, 6, 16], 90000000],
  ["Summer 2021", [2021, 7, 15], 100000000],
  ["2021–2022", [2021, 12, 31], 100000000],
  ["June 2021", [2021, 6, 15], 100000000],
  ["2021 June", [2021, 6, 15], 100000000],
])(
  "compares only shared date components %s / %j",
  async (literal, parts, value) => {
    const { candidate } = await compare(
      { issued: { literal } },
      { published: { "date-parts": [parts] } },
    );
    expect(candidate.fields.find((f) => f.field === "issued")?.score).toEqual({
      value,
      fullAgreement: value === 100000000,
    });
  },
);
it("preserves all missing fields and their exclusion directions without inventing zero scores", async () => {
  const { candidate } = await compare(
    { title: "Reference only" },
    { author: names("Alpha") },
  );
  expect(candidate.fields.find((f) => f.field === "title")).toMatchObject({
    reference: "Reference only",
    candidate: null,
    score: null,
    reason: "missing-candidate",
  });
  expect(candidate.fields.find((f) => f.field === "author")).toMatchObject({
    reference: null,
    candidate: names("Alpha"),
    score: null,
    reason: "missing-reference",
  });
  expect(candidate.fields.find((f) => f.field === "issued")).toMatchObject({
    reference: null,
    candidate: null,
    score: null,
    reason: "missing-reference",
  });
});
it("refuses an exhausted exact assignment budget without approximating or inferring identity from the remaining Score", async () => {
  const { candidate, outcome } = await compare(
    { author: Array.from({ length: 100 }, () => ({ literal: "A" })) },
    { author: Array.from({ length: 10000 }, () => ({ name: "A" })) },
    true,
  );
  expect(candidate.fields.find((f) => f.field === "author")).toMatchObject({
    score: null,
    reason: "resource-limit",
  });
  expect(outcome).toMatchObject({
    verdict: "not-verifiable",
    identity: { kind: "unresolved" },
    reasons: ["development-route-incomplete"],
    searchConfiguration: {
      optimalReferenceNames: 100,
      assignmentMaxSteps: 30000000,
    },
  });
});
it("keeps positional assignment above 100 Reference names even for long Candidate lists", async () => {
  const { candidate } = await compare(
    { author: Array.from({ length: 101 }, () => ({ literal: "Alpha" })) },
    { author: Array.from({ length: 10000 }, () => ({ name: "Alpha" })) },
    true,
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 100000000,
    fullAgreement: true,
  });
});
it("normalizes punctuation before splitting positional given-name components", async () => {
  const { candidate } = await compare(
    { author: [{ family: "Müller", given: "Anna/Barbara" }] },
    { author: [{ family: "Mueller", given: "Anna Barbara" }] },
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 100000000,
    fullAgreement: true,
  });
});
it("strips only a valid final journal acronym with matching brackets, keeping mixed-case qualifiers", async () => {
  const { candidate } = await compare(
    { "container-title": "Journal [JOT)" },
    { "container-title": ["Journal"] },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title")?.score
      ?.fullAgreement,
  ).toBe(false);
});

it("uses shorter Reference-position prefixes before Candidate-position ties and versions the rule", async () => {
  // Exact sum 1 / Kendall 0 ties: [R1-C2] precedes [R1-C1,R2-C2].
  // N = 2 Reference names + 1 preceding unassigned Candidate = 3.
  const { candidate, outcome } = await compare(
    { author: names("ab", "bb") },
    { author: names("aa", "ab") },
    true,
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 33333333,
    fullAgreement: false,
  });
  expect(candidate.score).toEqual({ value: 52380952, fullAgreement: false });
  expect(outcome.scoringRules.version).toContain(
    "comparison-75-3-date-ranges-20261028",
  );
});
it("scores only received attested journal abbreviations and respects canonical qualifier evidence", async () => {
  const abbreviated = await compare(
    { "container-title-short": "J. Test. (JT)" },
    {
      "container-title": ["Journal of Testing"],
      "short-container-title": ["J Test"],
    },
  );
  expect(
    abbreviated.candidate.fields.find((f) => f.field === "container-title")
      ?.score,
  ).toEqual({ value: 100000000, fullAgreement: true });
  const qualified = await compare(
    { "container-title-short": "J Cells" },
    {
      "container-title": ["Journal of Cells (Basel)"],
      "short-container-title": ["J Cells (Basel)"],
    },
  );
  expect(
    qualified.candidate.fields.find((f) => f.field === "container-title")
      ?.score,
  ).toEqual({ value: 100000000, fullAgreement: true });
  const wrongQualifier = await compare(
    { "container-title-short": "J Cells" },
    {
      "container-title": ["Journal of Cells (Lond)"],
      "short-container-title": ["J Cells (Basel)"],
    },
  );
  expect(
    wrongQualifier.candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({ score: null, reason: "not-determinable" });
  const fullRepeated = await compare(
    { "container-title-short": "Journal of Testing" },
    {
      "container-title": ["Journal of Testing"],
      "short-container-title": ["Journal of Testing"],
    },
  );
  expect(
    fullRepeated.candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({ score: null, reason: "not-determinable" });
  const unknown = await compare(
    { "container-title-short": "Unknown J." },
    {
      "container-title": ["Journal of Testing"],
      "short-container-title": ["J Test"],
    },
  );
  expect(
    unknown.candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({ score: null, reason: "not-determinable" });
});
it("preserves the specification's compatible extra initial components as full author agreement", async () => {
  const { candidate } = await compare(
    { author: [{ family: "Müller", given: "A. B." }] },
    { author: [{ family: "Muller", given: "Anna" }] },
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 100000000,
    fullAgreement: true,
  });
});
it("takes the maximum surname agreement across complete particle prefixes", async () => {
  for (const family of ["van der Meer", "von der Meer"]) {
    const { candidate } = await compare(
      { author: [{ family }] },
      { author: [{ family: "Meer" }] },
    );
    expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
      value: 100000000,
      fullAgreement: true,
    });
  }
  const { candidate } = await compare(
    { author: [{ family: "Cruz", "non-dropping-particle": "de la" }] },
    { author: [{ family: "Cruz" }] },
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 100000000,
    fullAgreement: true,
  });
});
it("normalizes compatibility characters and provider markup before reading numeric volume and page formats", async () => {
  const volume = await compare(
    { volume: "Ｖｏｌ． １２ (３)" },
    { volume: "12" },
  );
  expect(
    volume.candidate.fields.find((f) => f.field === "volume")?.score,
  ).toEqual({ value: 100000000, fullAgreement: true });
  const pages = await compare(
    { page: "<i>１２５–１２６</i>" },
    { page: "123–128" },
  );
  expect(pages.candidate.fields.find((f) => f.field === "page")?.score).toEqual(
    { value: 100000000, fullAgreement: true },
  );
  const roman = await compare({ page: "Ⅻ–ⅩⅤ" }, { page: "Ⅹ–ⅩⅣ" });
  expect(roman.candidate.fields.find((f) => f.field === "page")?.score).toEqual(
    { value: 75000000, fullAgreement: false },
  );
});
it("applies the minimum to the exact rational rather than a rounded name-pair value", async () => {
  await service.restart({
    SOURCE_TASTER_COMPARISON_PARAMETERS: JSON.stringify({
      surnameWeight: 100000000,
      givenWeight: 99999999,
    }),
  });
  try {
    // Surname 0, given 1: 99,999,999 / 199,999,999 is below 1/2,
    // although prematurely rounding its percentage would produce 50,000,000.
    const { candidate } = await compare(
      { author: [{ family: "Alpha", given: "Anna" }] },
      { author: [{ family: "ZZZZZ", given: "Anna" }] },
    );
    expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
      value: 0,
      fullAgreement: false,
    });
  } finally {
    await service.restart({ SOURCE_TASTER_COMPARISON_PARAMETERS: "{}" });
  }
});
it("retains the independent author deviation flag when a tiny nonzero order penalty rounds toward 100", async () => {
  await service.restart({
    SOURCE_TASTER_COMPARISON_PARAMETERS: JSON.stringify({ orderPenalty: 1 }),
  });
  try {
    const authors = Array.from({ length: 100 }, (_, i) => ({
      literal: String.fromCodePoint(0x4e00 + i),
    }));
    const metadata = authors.map((n) => ({ name: n.literal }));
    [metadata[0], metadata[1]] = [metadata[1]!, metadata[0]!];
    // d=1/4950, p=1/100,000,000. The exact percentage differs from 100
    // by only 1/4,950,000,000, but it is still a deviation at storage/display.
    const { candidate } = await compare(
      { author: authors },
      { author: metadata },
    );
    expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
      value: 99999999,
      fullAgreement: false,
    });
    expect(candidate.score).toEqual({ value: 99999999, fullAgreement: false });
  } finally {
    await service.restart({ SOURCE_TASTER_COMPARISON_PARAMETERS: "{}" });
  }
});

it("refuses an oversized exact author graph before allocation and retains the entire Candidate list", async () => {
  const { candidate, outcome } = await compare(
    { author: Array.from({ length: 100 }, () => ({ literal: "A" })) },
    { author: Array.from({ length: 10001 }, () => ({ name: "A" })) },
    true,
  );
  expect(candidate.fields.find((f) => f.field === "author")).toMatchObject({
    score: null,
    reason: "resource-limit",
  });
  expect(candidate.csl.author).toHaveLength(10001);
  expect(outcome).toMatchObject({
    verdict: "not-verifiable",
    identity: { kind: "unresolved" },
    searchConfiguration: { assignmentMaxPairs: 1000000 },
  });
});
it("uses fixed normalization before attested abbreviation equality and journal acronym handling", async () => {
  for (const supplied of ["Ｊ． Ｔｅｓｔ．", "J&period;Test&period;"]) {
    const { candidate } = await compare(
      { "container-title-short": supplied },
      {
        "container-title": ["Journal of Testing"],
        "short-container-title": ["JTest"],
      },
    );
    expect(
      candidate.fields.find((f) => f.field === "container-title")?.score,
    ).toEqual({ value: 100000000, fullAgreement: true });
  }
  const { candidate } = await compare(
    { "container-title": "<i>Journal of Testing (JOT)</i>" },
    { "container-title": ["Journal of Testing"] },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title")?.score,
  ).toEqual({ value: 100000000, fullAgreement: true });
});
it("recognizes an initial after Unicode case folding and diacritic removal", async () => {
  const { candidate } = await compare(
    { author: [{ family: "Alpha", given: "İ." }] },
    { author: [{ family: "Alpha", given: "İbrahim" }] },
  );
  expect(candidate.fields.find((f) => f.field === "author")?.score).toEqual({
    value: 100000000,
    fullAgreement: true,
  });
});
it("refuses excessive total author text-comparison work without switching algorithms", async () => {
  const { candidate, outcome } = await compare(
    { author: Array.from({ length: 2 }, () => ({ literal: "a".repeat(600) })) },
    { author: Array.from({ length: 50 }, () => ({ name: "b".repeat(600) })) },
  );
  expect(candidate.fields.find((f) => f.field === "author")).toMatchObject({
    score: null,
    reason: "resource-limit",
  });
  expect(outcome).toMatchObject({
    verdict: "not-verifiable",
    identity: { kind: "unresolved" },
    searchConfiguration: { authorComparisonMaxWork: 30000000 },
  });
});
