// SPDX-License-Identifier: AGPL-3.0-or-later
// Synthetic independent worked examples at the public HTTP/SSE seam, not calibration.
import { afterAll, beforeAll, expect, it } from "vitest";
import {
  CheckEvent,
  CheckResponse,
} from "@source-taster/contract-verification/v2";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { startTestService } from "./support/service.ts";
import { guardWorkIsolation } from "./support/work-isolation.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
// One worker serves every test of this file: each must finish its own work and
// no worker may serve a Check an earlier test created (#150).
guardWorkIsolation({ appUrl: () => service.appUrl, mode: "serve" });
let sequence = 0;
const matching = (item: unknown): unknown =>
  expect.objectContaining(item) as unknown;
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_JOURNAL_PORT ?? 54876),
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
  const createdResponse = await fetch(`${service.apiUrl}/v2/checks`, {
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
    `${service.apiUrl}/v2/checks/${created.id}/events`,
    { signal: AbortSignal.timeout(15000) },
  );
  const events = [];
  for await (const frame of readSseFrames(response.body!))
    events.push(CheckEvent.parse(JSON.parse(frame.data)));
  const snapshot = CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${created.id}`)).json(),
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
it("scores a journal abbreviation from the pinned NLM snapshot without an extra request", async () => {
  fixtures.requests.length = 0;
  const { candidate, outcome } = await compare(
    { "container-title-short": "J. Biol. Chem." },
    { "container-title": ["The Journal of biological chemistry"] },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({
    score: { value: 100000000, fullAgreement: true },
    journalAbbreviation: {
      outcome: "match",
      attestations: [
        expect.objectContaining({
          source: "nlm",
          snapshotDate: "2026-10-29",
          nlmId: "2985121R",
          abbreviation: "J Biol Chem",
        }),
      ],
    },
  });
  expect(outcome.scoringRules.version).toContain("journal-76");
  expect(fixtures.requests.map((r) => r.path)).toEqual([
    expect.stringMatching(/^\/api\/handles\//u),
    expect.stringMatching(/^\/works\//u),
  ]);
});
it("identifies the Candidate journal by a received ISSN even when its full title is missing", async () => {
  const { candidate } = await compare(
    { "container-title-short": "J Biol Chem" },
    { ISSN: ["1083-351X"] },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({
    score: { value: 100000000, fullAgreement: true },
    journalAbbreviation: { outcome: "match" },
  });
});
it("scores a demonstrably different journal only when both journal abbreviations are attested", async () => {
  const { candidate } = await compare(
    { "container-title-short": "N Engl J Med" },
    { "container-title": ["The Journal of biological chemistry"] },
  );
  const field = candidate.fields.find((f) => f.field === "container-title");
  expect(field).toMatchObject({
    score: { value: 0, fullAgreement: false },
    journalAbbreviation: {
      outcome: "different",
      reason: "attested-other-journal",
      attestations: expect.arrayContaining([
        expect.objectContaining({
          source: "nlm",
          role: "candidate",
          nlmId: "2985121R",
        }),
        expect.objectContaining({
          source: "nlm",
          role: "reference",
          nlmId: "0255562",
        }),
      ]) as unknown,
    },
  });
  // Only the DOI (weight 10, full) and journal (weight 15, zero) participate.
  expect(candidate.score).toEqual({ value: 40000000, fullAgreement: false });
});
it("leaves an unattested abbreviation unscored and renormalizes while preserving DOI identity", async () => {
  const { candidate, outcome } = await compare(
    { "container-title-short": "Unknown Journal 76" },
    { "container-title": ["The Journal of biological chemistry"] },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({
    score: null,
    reason: "not-determinable",
    journalAbbreviation: {
      outcome: "not-determinable",
      reason: "no-attestation",
    },
  });
  expect(candidate.score).toEqual({ value: 100000000, fullAgreement: true });
  expect(outcome.identity.kind).toBe("supplied-doi");
});
it("uses every received Crossref abbreviation, ignores repeated full titles and never invents acronyms", async () => {
  const unknown = await compare(
    { "container-title-short": "JQ76" },
    {
      "container-title": ["Journal of Qualification 76"],
      "short-container-title": ["Journal of Qualification 76"],
    },
  );
  expect(
    unknown.candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({ score: null });
  for (const title of [
    "Journal of Qualification 76",
    "Another Journal of Qualification 76",
  ]) {
    const known = await compare(
      { "container-title-short": "JQ76" },
      { "container-title": [title], "short-container-title": [title, "JQ76"] },
    );
    expect(
      known.candidate.fields.find((f) => f.field === "container-title"),
    ).toMatchObject({
      score: { value: 100000000, fullAgreement: true },
      journalAbbreviation: {
        outcome: "match",
        attestations: [
          expect.objectContaining({ source: "crossref", abbreviation: "JQ76" }),
        ],
      },
    });
  }
});
it("keeps qualifiers and accepts an omitted qualifier only for the identified catalog journal", async () => {
  const known = await compare(
    { "container-title-short": "Ann. Med. Interne" },
    { "container-title": ["Annales de medecine interne"] },
  );
  expect(
    known.candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({ score: { value: 100000000, fullAgreement: true } });
  const wrong = await compare(
    { "container-title-short": "Ann Med Interne (Lond)" },
    { "container-title": ["Annales de medecine interne"] },
  );
  expect(
    wrong.candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({
    score: null,
    journalAbbreviation: { outcome: "not-determinable" },
  });
});
it("normalizes received abbreviations with both umlaut folds while preserving the full-title OSA profile", async () => {
  for (const supplied of ["Münch. J.", "Munch J", "Muench J"]) {
    const { candidate } = await compare(
      { "container-title-short": supplied },
      {
        "container-title": ["Synthetic Münchner Journal 76"],
        "short-container-title": ["Münch J"],
      },
    );
    expect(
      candidate.fields.find((f) => f.field === "container-title")?.score,
    ).toEqual({ value: 100000000, fullAgreement: true });
  }
  const { candidate } = await compare(
    { "container-title": "Jouranl" },
    { "container-title": ["Journal"] },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({ score: { value: 85714286, fullAgreement: false } });
  expect(
    candidate.fields.find((f) => f.field === "container-title"),
  ).not.toHaveProperty("journalAbbreviation");
});
it("requires journal identity when the catalog has homonymous journals with distinguishing qualifiers", async () => {
  const ambiguous = await compare(
    { "container-title-short": "Acta Ophthalmol" },
    { "container-title": ["Acta ophthalmologica"] },
  );
  expect(
    ambiguous.candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({
    score: null,
    journalAbbreviation: { outcome: "not-determinable" },
  });
  const identified = await compare(
    { "container-title-short": "Acta Ophthalmol" },
    { "container-title": ["Acta ophthalmologica"], ISSN: ["0001-639X"] },
  );
  expect(
    identified.candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({
    score: { value: 100000000, fullAgreement: true },
    journalAbbreviation: {
      outcome: "match",
      attestations: [expect.objectContaining({ nlmId: "0370347" })],
    },
  });
});
it("distinguishes homonymous journals when the received ISSN proves the other catalog identity", async () => {
  const { candidate } = await compare(
    { "container-title-short": "Acta Ophthalmol (Copenh)" },
    { "container-title": ["Acta ophthalmologica"], ISSN: ["1755-375X"] },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({
    score: { value: 0, fullAgreement: false },
    journalAbbreviation: { outcome: "different" },
  });
});
it("uses the full title to resolve a shared catalog ISSN without losing its attested abbreviation", async () => {
  const { candidate } = await compare(
    { "container-title-short": "Adv Enzymol Relat Areas Mol Biol" },
    {
      "container-title": [
        "Advances in enzymology and related areas of molecular biology",
      ],
      ISSN: ["0065-258X"],
    },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({
    score: { value: 100000000, fullAgreement: true },
    journalAbbreviation: {
      outcome: "match",
      attestations: [expect.objectContaining({ nlmId: "0337243" })],
    },
  });
});
it("keeps an ambiguous Candidate journal unscored even when an outside journal attests the same abbreviation", async () => {
  const { candidate } = await compare(
    { "container-title-short": "Biol Med" },
    { "container-title": ["Biologie medicale"] },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({
    score: null,
    reason: "not-determinable",
    journalAbbreviation: { outcome: "not-determinable" },
  });
});
it("applies provider cleanup once when comparing an abbreviation with an omitted qualifier", async () => {
  const { candidate } = await compare(
    { "container-title-short": "J &amp;amp; Q" },
    {
      "container-title": ["Journal of Qualification (Basel)"],
      "short-container-title": ["J &amp; Q (Basel)"],
    },
  );
  expect(
    candidate.fields.find((f) => f.field === "container-title"),
  ).toMatchObject({
    score: null,
    journalAbbreviation: { outcome: "not-determinable" },
  });
});
