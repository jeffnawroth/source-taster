// SPDX-License-Identifier: AGPL-3.0-or-later
// HTTP contract seam from #70: real service/PG, recorded Data source edge.
import { afterAll, beforeAll, expect, it } from "vitest";
import { readSseFrames } from "@source-taster/contract-verification/client";
import {
  CheckResponse,
  type CreateCheckRequest,
} from "@source-taster/contract-verification/v2";
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
async function checked(text: string | CreateCheckRequest = physicsReference) {
  const response = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(typeof text === "string" ? { text } : text),
  });
  const check = CheckResponse.parse(await response.json()).data;
  const stream = await fetch(`${service.apiUrl}/v2/checks/${check.id}/events`);
  for await (const frame of readSseFrames(stream.body!)) void frame;
  return CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${check.id}`)).json(),
  ).data;
}
it("renders a proven APA Correction suggestion without changing the Check", async () => {
  const check = await checked();
  const response = await fetch(
    `${service.apiUrl}/v2/checks/${check.id}/bibliography`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ style: "apa", applySlots: [] }),
    },
  );
  expect(response.status).toBe(200);
  const body = (await response.json()) as {
    data: { entries: { slot: number; suggestion: { text: string } }[] };
  };
  expect(body.data.entries[0]?.suggestion.text).toBe(
    "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5(1), 11–12. https://doi.org/10.1038/nphys1170",
  );
  expect(
    CheckResponse.parse(
      await (await fetch(`${service.apiUrl}/v2/checks/${check.id}`)).json(),
    ).data,
  ).toEqual(check);
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
  const response = await fetch(
    `${service.apiUrl}/v2/checks/${check.id}/bibliography`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ style: "apa", applySlots: [1] }),
    },
  );
  expect(response.status).toBe(200);
  const { BibliographyResponse } =
    await import("@source-taster/contract-verification/bibliography");
  const data = BibliographyResponse.parse(await response.json()).data;
  expect(data.entries[0]?.suggestion?.csl.page).toBe("12");
  expect(data.entries[0]?.suggestion?.text).toContain("5(1), 12.");
  expect(data.bibliography.text).toContain("(2009)");
  expect(data.bibliography.text).not.toContain("2008");
  expect(data.entries[0]?.applied).toBe(true);
  expect(
    CheckResponse.parse(
      await (await fetch(`${service.apiUrl}/v2/checks/${check.id}`)).json(),
    ).data,
  ).toEqual(check);
  const invalid = await checked({
    references: [
      {
        originalText: "As written, invalid page 99",
        fields: { ...fields, page: "99" },
      },
    ],
  });
  const rendered = await fetch(
    `${service.apiUrl}/v2/checks/${invalid.id}/bibliography`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ style: "apa", applySlots: [] }),
    },
  );
  const original = BibliographyResponse.parse(await rendered.json()).data;
  expect(original.entries[0]?.suggestion?.csl.page).toBe("11-12");
  expect(original.bibliography.text).toContain("99");
});

it("renders all eleven pinned styles, keeping standalone suggestions unnumbered", async () => {
  const check = await checked();
  const { CitationStyle, BibliographyResponse } =
    await import("@source-taster/contract-verification/bibliography");
  for (const style of CitationStyle.options) {
    const response = await fetch(
      `${service.apiUrl}/v2/checks/${check.id}/bibliography`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "accept-language": "de",
        },
        body: JSON.stringify({ style }),
      },
    );
    expect(response.status, style).toBe(200);
    const data = BibliographyResponse.parse(await response.json()).data;
    expect(data.style).toBe(style);
    expect(data.rendererVersion).toBe(
      "citeproc-2.4.63:styles-d2cc4207b65000f5c2bdc0c44d7a26ed18ab6606:locales-8bef426f89f38c0789223c50e53ec2197bc50bb3:adapter-1",
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
  for (const body of [
    { style: "unknown" },
    { style: "apa", applySlots: [999] },
    { style: "apa", applySlots: [-1] },
  ]) {
    const response = await fetch(
      `${service.apiUrl}/v2/checks/${check.id}/bibliography`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    expect(response.status).toBe(400);
  }
  const missing = await fetch(
    `${service.apiUrl}/v2/checks/00000000-0000-4000-8000-000000000001/bibliography`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ style: "apa" }),
    },
  );
  expect(missing.status).toBe(404);
  expect(
    CheckResponse.parse(
      await (await fetch(`${service.apiUrl}/v2/checks/${check.id}`)).json(),
    ).data,
  ).toEqual(check);
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
  const response = await fetch(
    `${service.apiUrl}/v2/checks/${check.id}/bibliography`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ style: "apa", applySlots: [1] }),
    },
  );
  const { BibliographyResponse } =
    await import("@source-taster/contract-verification/bibliography");
  const data = BibliographyResponse.parse(await response.json()).data;
  expect(data.entries).toEqual([{ slot: 1, suggestion: null, applied: false }]);
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
  const response = await fetch(
    `${service.apiUrl}/v2/checks/${check.id}/bibliography`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ style: "apa", applySlots: [1] }),
    },
  );
  const { BibliographyResponse } =
    await import("@source-taster/contract-verification/bibliography");
  const data = BibliographyResponse.parse(await response.json()).data;
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
  const response = await fetch(
    `${service.apiUrl}/v2/checks/${check.id}/bibliography`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ style: "apa", applySlots: [1] }),
    },
  );
  const { BibliographyResponse } =
    await import("@source-taster/contract-verification/bibliography");
  const data = BibliographyResponse.parse(await response.json()).data;
  expect(data.entries[0]?.suggestion?.text).toContain("Article e1234");
  expect(data.entries[0]?.suggestion?.csl.page).toBeUndefined();
  expect(data.bibliography.text).not.toContain("e9999");
});
