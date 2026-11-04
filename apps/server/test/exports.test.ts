// SPDX-License-Identifier: AGPL-3.0-or-later
// Published HTTP/download seam; real PostgreSQL and recorded external adapters.
import { afterAll, beforeAll, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { BibliographyResponse } from "@source-taster/contract-verification/bibliography";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
import { startTestService } from "./support/service.ts";
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
const headers = { "content-type": "application/json" };
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
const originalText = "My immutable Reference as written (2008), page 12";
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_EXPORTS_PORT ?? 3187),
    0,
    fixtures.env,
  );
});
afterAll(async () => {
  await service?.stop();
  await fixtures?.stop();
});
async function snapshot(id: string) {
  return CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${id}`)).json(),
  ).data;
}
async function checked() {
  const response = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers,
    body: JSON.stringify({ references: [{ originalText, fields }] }),
  });
  const check = CheckResponse.parse(await response.json()).data;
  const stream = await fetch(`${service.apiUrl}/v2/checks/${check.id}/events`);
  for await (const frame of readSseFrames(stream.body!)) void frame;
  return snapshot(check.id);
}
function download(
  id: string,
  request: unknown = { format: "csl-json", mode: "original" },
) {
  return fetch(`${service.apiUrl}/v2/checks/${id}/export`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });
}
it("downloads current canonical fields and immutable provenance as CSL-JSON without changing evidence", async () => {
  const check = await checked();
  const response = await download(check.id);
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe(
    "application/vnd.citationstyles.csl+json; charset=utf-8",
  );
  expect(response.headers.get("content-disposition")).toBe(
    'attachment; filename="source-taster-references.json"',
  );
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual([
    {
      ...fields,
      id: `${check.id}:1`,
      issued: { "date-parts": [[2008]] },
      custom: { originalText },
    },
  ]);
  expect(await snapshot(check.id)).toEqual(check);
});
it("applies only result-bound proven corrections to the chosen download, retaining valid cited pages", async () => {
  const check = await checked();
  const preview = await fetch(
    `${service.apiUrl}/v2/checks/${check.id}/bibliography`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ style: "apa", includeBibliography: false }),
    },
  );
  const rendered = BibliographyResponse.parse(await preview.json());
  const token = rendered.data.entries[0]!.resultToken!;
  expect(token).toMatch(/^[a-f0-9]{64}$/u);
  const selected = {
    format: "csl-json",
    mode: "selected-corrections",
    corrections: [{ slot: 1, resultToken: token }],
  };
  const response = await download(check.id, selected);
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject([
    {
      issued: { "date-parts": [[2009, 1]] },
      page: "12",
      custom: { originalText },
    },
  ]);
  expect(await (await download(check.id)).json()).toMatchObject([
    { issued: { "date-parts": [[2008]] } },
  ]);
  expect(
    (
      await download(check.id, {
        ...selected,
        corrections: [{ slot: 1, resultToken: "0".repeat(64) }],
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await download(check.id, {
        ...selected,
        corrections: [{ slot: 999, resultToken: token }],
      })
    ).status,
  ).toBe(400);
  const identical = await checked();
  expect((await download(identical.id, selected)).status).toBe(400);
  expect(await snapshot(check.id)).toEqual(check);
});
it("downloads traditional UTF-8 BibTeX, keeping imported keys and escaping only special characters", async () => {
  const raw =
    "@book{Müller2020, title={Old title}, stale={never write this back}}";
  const response = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      references: [
        {
          originalText: raw,
          fields: {
            type: "book",
            title: "Über A&B_50% {Research} #1 $cost \\ path ~ ^",
            author: [
              {
                family: "Beethoven",
                "non-dropping-particle": "van",
                given: "Ludwig",
              },
              { literal: "Research and Development" },
            ],
            issued: { literal: "2020-03" },
            publisher: "Verlag",
            "publisher-place": "Berlin",
            edition: "2",
            ISBN: "9780306406157",
          },
        },
      ],
    }),
  });
  const check = CheckResponse.parse(await response.json()).data;
  // Export is available while work is pending; it must not lose canonical fields.
  const exported = await download(check.id, {
    format: "bibtex",
    mode: "original",
  });
  expect(exported.status).toBe(200);
  expect(exported.headers.get("content-type")).toBe(
    "application/x-bibtex; charset=utf-8",
  );
  expect(exported.headers.get("content-disposition")).toContain(
    'filename="source-taster-references.bib"',
  );
  const text = await exported.text();
  expect(text).toContain("@book{Müller2020,");
  expect(text).toContain(
    "author = {van Beethoven, Ludwig and {Research and Development}}",
  );
  expect(text).toContain(
    "title = {{Über A\\&B\\_50\\% \\{Research\\} \\#1 \\$cost \\textbackslash{} path \\textasciitilde{} \\textasciicircum{}}}",
  );
  expect(text).toContain("year = {2020}");
  expect(text).toContain("month = {mar}");
  expect(text).toContain("address = {Berlin}");
  expect(text).not.toContain("stale");
  expect(text).not.toContain("Old title");
  await fetch(`${service.apiUrl}/v2/checks/${check.id}/cancel`, {
    method: "POST",
  });
});
it("rejects unsupported formats and ineligible corrections and exports pending or cancelled fields without fabricating evidence", async () => {
  const created = CheckResponse.parse(
    await (
      await fetch(`${service.apiUrl}/v2/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          references: [
            {
              originalText: "As written: synthetic legislation",
              fields: {
                type: "legislation",
                title: "Synthetic law",
                issued: { literal: "n.d." },
              },
            },
          ],
        }),
      })
    ).json(),
  ).data;
  await fetch(`${service.apiUrl}/v2/checks/${created.id}/cancel`, {
    method: "POST",
  });
  const check = await snapshot(created.id);
  for (const request of [
    { format: "ris", mode: "original" },
    { format: "csl-json", mode: "anything" },
    {
      format: "csl-json",
      mode: "original",
      corrections: [{ slot: 1, resultToken: "0".repeat(64) }],
    },
    {
      format: "csl-json",
      mode: "selected-corrections",
      corrections: [{ slot: 1, resultToken: "0".repeat(64) }],
    },
  ])
    expect((await download(check.id, request)).status).toBe(400);
  expect((await download("00000000-0000-4000-8000-000000000001")).status).toBe(
    404,
  );
  const output = await download(check.id);
  expect(await output.json()).toMatchObject([
    {
      title: "Synthetic law",
      issued: { literal: "n.d." },
      custom: { originalText: "As written: synthetic legislation" },
    },
  ]);
  expect(await snapshot(check.id)).toEqual(check);
});
it("exports the committed field revision, unbinds earlier corrections and omits removed slots", async () => {
  const check = await checked();
  const bibliography = (id: string) =>
    fetch(`${service.apiUrl}/v2/checks/${id}/bibliography`, {
      method: "POST",
      headers,
      body: JSON.stringify({ style: "apa", includeBibliography: true }),
    }).then(async (r) => BibliographyResponse.parse(await r.json()).data);
  const token = (await bibliography(check.id)).entries[0]!.resultToken!;
  const saved = await fetch(
    `${service.apiUrl}/v2/checks/${check.id}/references/1/revisions`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        expectedRevision: 1,
        fields: { ...fields, title: "Edited by the user" },
        recheck: false,
      }),
    },
  );
  expect(saved.status).toBe(200);
  expect(await (await download(check.id)).json()).toMatchObject([
    {
      id: `${check.id}:1`,
      title: "Edited by the user",
      custom: { originalText },
    },
  ]);
  expect(
    (
      await download(check.id, {
        format: "csl-json",
        mode: "selected-corrections",
        corrections: [{ slot: 1, resultToken: token }],
      })
    ).status,
  ).toBe(400);
  expect(
    (await bibliography(check.id)).entries[0]!.resultToken,
  ).toBeUndefined();
  expect((await bibliography(check.id)).bibliography?.text).toContain(
    "Edited by the user",
  );
  const edited = await fetch(
    `${service.apiUrl}/v2/checks/${check.id}/references`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        expectedEventSeq: (await snapshot(check.id)).lastEventSeq,
        remove: [1],
        add: [{ originalText: "Added by hand", fields: { title: "Added" } }],
      }),
    },
  );
  expect(edited.status).toBe(200);
  expect(await (await download(check.id)).json()).toMatchObject([
    {
      id: `${check.id}:2`,
      title: "Added",
      custom: { originalText: "Added by hand" },
    },
  ]);
  expect((await bibliography(check.id)).entries).toHaveLength(1);
});
it("keeps publisher metadata in traditional BibTeX thesis and report fields", async () => {
  const response = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      references: [
        {
          originalText: "Synthetic thesis",
          fields: {
            type: "thesis",
            title: "Synthetic thesis",
            publisher: "Test University",
            issued: { literal: "2024" },
          },
        },
        {
          originalText: "Synthetic report",
          fields: {
            type: "report",
            title: "Synthetic report",
            publisher: "Test Institute",
            issued: { literal: "2025" },
          },
        },
      ],
    }),
  });
  const check = CheckResponse.parse(await response.json()).data;
  const output = await download(check.id, {
    format: "bibtex",
    mode: "original",
  });
  expect(output.status).toBe(200);
  const text = await output.text();
  expect(text).toContain("@phdthesis{");
  expect(text).toContain("school = {Test University}");
  expect(text).toContain("@techreport{");
  expect(text).toContain("institution = {Test Institute}");
  await fetch(`${service.apiUrl}/v2/checks/${check.id}/cancel`, {
    method: "POST",
  });
});
it("uses a safe traditional fallback for unknown CSL types", async () => {
  const created = CheckResponse.parse(
    await (
      await fetch(`${service.apiUrl}/v2/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          references: [
            {
              originalText: "Unknown source type",
              fields: { type: "constructor", title: "Unknown source type" },
            },
          ],
        }),
      })
    ).json(),
  ).data;
  const response = await download(created.id, {
    format: "bibtex",
    mode: "original",
  });
  expect(response.status).toBe(200);
  expect(await response.text()).toMatch(/^@misc\{/u);
  await fetch(`${service.apiUrl}/v2/checks/${created.id}/cancel`, {
    method: "POST",
  });
});
