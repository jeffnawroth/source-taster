// SPDX-License-Identifier: AGPL-3.0-or-later
// HTTP contract seam from #70: real service/PG, recorded Data source edge.
import { afterAll, beforeAll, expect, it } from "vitest";
import { readSseFrames } from "@source-taster/contract-verification/client";
import {
  CheckResponse,
  type CreateCheckRequest,
} from "@source-taster/contract-verification/v2";
import {
  BibliographyResponse,
  CitationStyle,
  type BibliographyRequest,
} from "@source-taster/contract-verification/bibliography";
import { startDoiFixtures, physicsReference } from "./support/doi-fixtures.ts";
import { startBibliographicFixtures } from "./support/bibliographic-fixtures.ts";
import { startTestService } from "./support/service.ts";
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let bibliography: Awaited<ReturnType<typeof startBibliographicFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  bibliography = await startBibliographicFixtures();
  fixtures.respond("/works", 200, { message: { items: [] } });
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_CORRECTIONS_PORT ?? 54886),
    0,
    { ...fixtures.env, ...bibliography.env },
  );
});
afterAll(async () => {
  await service?.stop();
  await fixtures?.stop();
  await bibliography?.stop();
});
const headers = { "content-type": "application/json" };
async function snapshot(id: string) {
  return CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${id}`)).json(),
  ).data;
}
async function checked(text: string | CreateCheckRequest = physicsReference) {
  const response = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers,
    body: JSON.stringify(typeof text === "string" ? { text } : text),
  });
  const check = CheckResponse.parse(await response.json()).data;
  const stream = await fetch(`${service.apiUrl}/v2/checks/${check.id}/events`);
  for await (const frame of readSseFrames(stream.body!)) void frame;
  return snapshot(check.id);
}
function postBibliography(id: string, request: unknown) {
  return fetch(`${service.apiUrl}/v2/checks/${id}/bibliography`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });
}
async function formatted(
  id: string,
  request: BibliographyRequest = { style: "apa" },
) {
  const response = await postBibliography(id, request);
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  const data = BibliographyResponse.parse(await response.json()).data;
  if (!data.bibliography) throw new Error("Expected a full bibliography");
  return { ...data, bibliography: data.bibliography };
}
it("renders a proven APA Correction suggestion without changing the Check", async () => {
  const check = await checked();
  const data = await formatted(check.id);
  expect(data.entries[0]?.suggestion?.text).toBe(
    "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5(1), 11–12. https://doi.org/10.1038/nphys1170",
  );
  expect(await snapshot(check.id)).toEqual(check);
});
it("keeps a valid cited page and replaces an invalid location only in the selected export", async () => {
  const fields = {
    type: "article-journal",
    title: "Measured measurement",
    author: [{ family: "Aspelmeyer", given: "M." }],
    issued: { literal: "2008" },
    "container-title": "Nature Physics",
    volume: "5",
    page: "12",
    DOI: "10.1038/nphys1170",
  };
  const check = await checked({
    references: [{ originalText: "As written, cited page 12", fields }],
  });
  const data = await formatted(check.id, { style: "apa", applySlots: [1] });
  expect(data.entries[0]?.suggestion?.csl.page).toBe("12");
  expect(data.entries[0]?.suggestion?.text).toContain("5(1), 12.");
  expect(data.bibliography.text).toContain("(2009)");
  expect(data.bibliography.text).not.toContain("2008");
  expect(data.entries[0]?.applied).toBe(true);
  expect(await snapshot(check.id)).toEqual(check);
  const invalid = await checked({
    references: [
      {
        originalText: "As written, invalid page 99",
        fields: { ...fields, page: "99" },
      },
    ],
  });
  const original = await formatted(invalid.id);
  expect(original.entries[0]?.suggestion?.csl.page).toBe("11-12");
  expect(original.bibliography.text).toContain("99");
});
it("renders all eleven pinned styles, keeping standalone suggestions unnumbered", async () => {
  const check = await checked();
  for (const style of CitationStyle.options) {
    const data = await formatted(check.id, { style });
    expect(data.style).toBe(style);
    expect(data.rendererVersion).toBe(
      "citeproc-2.4.63:styles-d2cc4207b65000f5c2bdc0c44d7a26ed18ab6606:locales-8bef426f89f38c0789223c50e53ec2197bc50bb3:adapter-2",
    );
    const suggestion = data.entries[0]?.suggestion;
    expect(suggestion?.text, style).toMatch(/Aspelmeyer/iu);
    expect(suggestion?.text, style).toMatch(/Measured measurement/iu);
    expect(suggestion?.text, style).toContain("2009");
    expect(suggestion?.text, style).not.toMatch(/^(?:\[1\]|1[.)]|\(1\))\s/u);
    expect(suggestion?.text, style).not.toMatch(/2009[a-z]/u);
    expect(data.bibliography.rtf, style).toMatch(/^\{\\rtf1/u);
    expect(data.bibliography.rtf, style).toMatch(/Aspelmeyer/iu);
    expect(suggestion?.html, style).not.toMatch(/<(?:a|img|script)\b/iu);
  }
});
it("rejects unknown styles and slots without changing the Check", async () => {
  const check = await checked();
  for (const request of [
    { style: "unknown" },
    { style: "apa", applySlots: [999] },
    { style: "apa", applySlots: [-1] },
  ])
    expect((await postBibliography(check.id, request)).status).toBe(400);
  expect(
    (
      await postBibliography("00000000-0000-4000-8000-000000000001", {
        style: "apa",
      })
    ).status,
  ).toBe(404);
  expect(await snapshot(check.id)).toEqual(check);
});
it.each([
  [
    "Beta, B. (2009). Measured measurement. Nature Physics, 5, 11–12.",
    "mixed-citation",
  ],
  [
    "Zed, Z. (2021). Entirely synthetic missing article. Synthetic Journal, 1, 1–2.",
    "not-found",
  ],
  [
    "Alpha, A. (2021). Synthetic ambiguous article. Synthetic Journal, 1, 1–2.",
    "not-verifiable",
  ],
])("offers no invented replacement for %s", async (text, verdict) => {
  const check = await checked(text);
  expect(check.references[0]?.outcome).toMatchObject({
    kind: "verdict",
    verdict,
  });
  expect(
    (await formatted(check.id, { style: "apa", applySlots: [1] })).entries,
  ).toEqual([{ slot: 1, suggestion: null, applied: false }]);
});
it("offers a DOI-conflict suggestion only for an independently established Source", async () => {
  const doi = "10.5555/correction-foreign";
  fixtures.respond(`/api/handles/${doi}`, 200, {
    responseCode: 1,
    handle: doi,
  });
  fixtures.respond(`/works/${doi}`, 404, {});
  const check = await checked(
    physicsReference.replace("10.1038/nphys1170", doi),
  );
  expect(check.references[0]?.outcome).toMatchObject({
    kind: "verdict",
    verdict: "doi-conflict",
    identity: { kind: "independent-bibliography" },
  });
  const data = await formatted(check.id, { style: "apa", applySlots: [1] });
  expect(data.entries[0]?.suggestion?.csl.DOI).toBe("10.1038/nphys1170");
  expect(data.bibliography.text).not.toContain(doi);
});
it("renders proven article numbers without turning them into cited page locations", async () => {
  const doi = "10.5555/correction-article-number";
  fixtures.respond(`/api/handles/${doi}`, 200, {
    responseCode: 1,
    handle: doi,
  });
  fixtures.respond(`/works/${doi}`, 200, {
    message: {
      DOI: doi,
      type: "journal-article",
      title: ["Synthetic article number"],
      author: [{ family: "Alpha", given: "A." }],
      published: { "date-parts": [[2021]] },
      "container-title": ["Journal of Testing"],
      volume: "5",
      "article-number": "e1234",
    },
  });
  const check = await checked({
    references: [
      {
        originalText: "Synthetic article-number Reference",
        fields: {
          type: "article-journal",
          title: "Synthetic article number",
          author: [{ family: "Alpha", given: "A." }],
          issued: { literal: "2021" },
          DOI: doi,
          "article-number": "e9999",
        },
      },
    ],
  });
  const data = await formatted(check.id, { style: "apa", applySlots: [1] });
  expect(data.entries[0]?.suggestion?.text).toContain("Article e1234");
  expect(data.entries[0]?.suggestion?.csl.page).toBeUndefined();
  expect(data.bibliography.text).not.toContain("e9999");
});
it("retains APA paragraph layout and inline IEEE labels in rich exports", async () => {
  const check = await checked();
  const apa = await formatted(check.id, { style: "apa", applySlots: [1] });
  expect(apa.bibliography.rtf).toContain("\\li720\\fi-720");
  expect(apa.bibliography.rtf).toContain("\\sl480\\slmult1");
  expect(apa.bibliography.html).toContain("text-indent:-0.5in;line-height:2");
  const ieee = await formatted(check.id, { style: "ieee", applySlots: [1] });
  expect(ieee.bibliography.html).toMatch(/<span[^>]*>\[1\]<\/span><span>/u);
  expect(ieee.bibliography.rtf).toContain("\\tab");
  const preview = await postBibliography(check.id, {
    style: "apa",
    suggestionSlots: [1],
    includeBibliography: false,
  });
  const data = BibliographyResponse.parse(await preview.json()).data;
  expect(data.bibliography).toBeNull();
  expect(data.entries[0]?.suggestion?.text).toContain("Aspelmeyer");
});
it("renders a larger bibliography without delaying the API or cross-entry changes to standalone suggestions", async () => {
  const check = await checked(
    Array.from({ length: 12 }, () => physicsReference).join("\n"),
  );
  const rendering = formatted(check.id, {
    style: "chicago",
    applySlots: check.references.map((reference) => reference.slot),
  });
  await new Promise((resolve) => setTimeout(resolve, 50));
  const start = performance.now();
  expect((await fetch(`${service.apiUrl}/health`)).status).toBe(200);
  expect(performance.now() - start).toBeLessThan(1000);
  const data = await rendering;
  expect(data.entries).toHaveLength(12);
  for (const entry of data.entries) {
    expect(entry.suggestion?.text).toContain("Aspelmeyer");
    expect(entry.suggestion?.text).not.toMatch(/2009[a-z]|——/u);
  }
}, 60000);
