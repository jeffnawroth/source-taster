// SPDX-License-Identifier: AGPL-3.0-or-later
// Published HTTP/SSE/download contracts; synthetic records, disposable PostgreSQL.
import { beforeAll, afterAll, expect, it } from "vitest";
import { ImportResponse } from "@source-taster/contract-verification/import";
import { BibliographyResponse } from "@source-taster/contract-verification/bibliography";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
import { startTestService } from "./support/service.ts";
let service: Awaited<ReturnType<typeof startTestService>>;
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
const headers = { "content-type": "application/json" };
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_IMPORTS_PORT ?? 3401),
    0,
    fixtures.env,
  );
});
afterAll(async () => {
  await service?.stop();
  await fixtures?.stop();
});
function post(path: string, body: unknown) {
  return fetch(`${service.apiUrl}/v2/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}
function exactText(response: Response) {
  return response
    .arrayBuffer()
    .then((bytes) =>
      new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes),
    );
}
const bib =
  "% Library comment\r\n@book{Müller,\r\n title = {Über {Research}},\r\n author={Müller, Anna and {Research Group}},\r\n year = 2020,\r\n isbn={9780306406157},\r\n customfield = {Keep ALL of this!}\r\n}\r\n\r\n";
it("imports BibTeX fields and exposes unsupported data without consuming Quota, then downloads the exact original record", async () => {
  const library = { format: "bibtex", text: bib };
  const response = await post("imports", library);
  expect(response.status).toBe(200);
  const preview = ImportResponse.parse(await response.json());
  expect(preview.data).toMatchObject({
    quotaConsumed: 0,
    rejected: [],
    references: [
      {
        originalText: bib,
        csl: {
          type: "book",
          title: "Über Research",
          author: [
            { family: "Müller", given: "Anna" },
            { literal: "Research Group" },
          ],
          issued: { literal: "2020" },
          ISBN: "9780306406157",
        },
        imported: {
          unsupported: [{ name: "customfield", value: "Keep ALL of this!" }],
        },
      },
    ],
  });
  const check = CheckResponse.parse(
    await (await post("checks", { library })).json(),
  ).data;
  const output = await post(`checks/${check.id}/export`, {
    format: "imported-format",
    mode: "original",
  });
  expect(output.status).toBe(200);
  expect(output.headers.get("content-disposition")).toContain('.bib"');
  expect(await output.text()).toBe(bib);
  await post(`checks/${check.id}/cancel`, {});
});
it("rejects malformed BibTeX records independently and routes accepted CSL types outside coverage", async () => {
  const text =
    "@book{broken, title={Unclosed\n@patent{Valid, title={Synthetic patent}, year={2024}, holder={Synthetic Holder}}\n@article{Another,title={Another record},year={2023}}\n";
  const response = await post("imports", { format: "bibtex", text });
  expect(response.status).toBe(200);
  const result = ImportResponse.parse(await response.json()).data;
  expect(result.references.map((r) => r.csl.type)).toEqual([
    "patent",
    "article-journal",
  ]);
  expect(result.rejected).toEqual([
    {
      originalText: "@book{broken, title={Unclosed\n",
      span: { start: 0, end: 30 },
      reason: "malformed-record",
    },
  ]);
  const check = CheckResponse.parse(
    await (
      await post("checks", {
        library: {
          format: "bibtex",
          text: "@patent{Valid,title={Synthetic patent},year={2024}}",
        },
      })
    ).json(),
  ).data;
  const stream = await fetch(`${service.apiUrl}/v2/checks/${check.id}/events`);
  for await (const frame of readSseFrames(stream.body!)) void frame;
  const final = CheckResponse.parse(
    await (await fetch(`${service.apiUrl}/v2/checks/${check.id}`)).json(),
  ).data;
  expect(final.references[0]!.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    reasons: ["outside-coverage"],
  });
});
it("imports RIS dialect continuations and full dates, preserves name particles and unknown tags, and round trips CRLF exactly", async () => {
  const text =
    "\uFEFFTY  - BOOK\r\nAU  - van Beethoven, Ludwig\r\nTI  - A synthetic title\r\n      with continuation\r\nPY  - 2020\r\nDA  - 2020/03/14\r\nSN  - 9780306406157\r\nZZ  - Unsupported\r\ncontinuation without indent\r\nER  - \r\n\r\nTY  - JOUR\r\nTI  - Missing end marker\r\nTY  - STAT\r\nTI  - Synthetic law\r\nER  - \r\n";
  const library = { format: "ris", text };
  const response = await post("imports", library);
  expect(response.status).toBe(200);
  const result = ImportResponse.parse(await response.json()).data;
  expect(result.references).toHaveLength(2);
  expect(result.rejected).toHaveLength(1);
  expect(result.references[0]).toMatchObject({
    csl: {
      type: "book",
      title: "A synthetic title with continuation",
      author: [
        {
          family: "Beethoven",
          "non-dropping-particle": "van",
          given: "Ludwig",
        },
      ],
      issued: { literal: "2020-03-14" },
      ISBN: "9780306406157",
    },
    imported: {
      unsupported: [
        { name: "ZZ", value: "Unsupported continuation without indent" },
      ],
    },
  });
  expect(result.references[1]!.csl.type).toBe("legislation");
  const check = CheckResponse.parse(
    await (await post("checks", { library })).json(),
  ).data;
  const output = await post(`checks/${check.id}/export`, {
    format: "imported-format",
    mode: "original",
  });
  expect(output.status).toBe(200);
  expect(output.headers.get("content-type")).toBe(
    "application/x-research-info-systems; charset=utf-8",
  );
  // Response.text() strips a leading BOM; the downloaded bytes must keep it.
  expect(await exactText(output)).toBe(
    result.references
      .map((r: { originalText: string }) => r.originalText)
      .join(""),
  );
  expect(
    (
      await post(`checks/${check.id}/export`, {
        format: "ris",
        mode: "original",
      })
    ).status,
  ).toBe(400);
  await post(`checks/${check.id}/cancel`, {});
});
async function finished(id: string) {
  const stream = await fetch(`${service.apiUrl}/v2/checks/${id}/events`);
  for await (const frame of readSseFrames(stream.body!)) void frame;
}
async function exportCorrected(id: string, slot: number) {
  const preview = BibliographyResponse.parse(
    await (
      await post(`checks/${id}/bibliography`, {
        style: "apa",
        includeBibliography: false,
      })
    ).json(),
  ).data;
  const entry = preview.entries.find((e: { slot: number }) => e.slot === slot)!;
  expect(entry.resultToken).toMatch(/^[a-f0-9]{64}$/u);
  return post(`checks/${id}/export`, {
    format: "imported-format",
    mode: "selected-corrections",
    corrections: [{ slot, resultToken: entry.resultToken! }],
  });
}
// The recorded Crossref Source (10.1038/nphys1170) is Markus Aspelmeyer, January 2009.
const untouchedBib =
  '@book{Other,\n  title = "Kept {Exactly}",\n  year = 1999\n}\n\n% between records\n';
const correctedBib =
  "% exact header\n@article{KeepKey,\n title = {Measured measurement}, % keep comment\n author = {Aspelmeyer, M.},\n year = {2008},\n journal={Nature Physics}, volume={5}, pages={12}, doi={10.1038/nphys1170},\n customfield = {Keep me} % trailing comment\n}\n";
it("patches only an applied correction into its imported BibTeX record and keeps every other byte", async () => {
  const text = correctedBib + untouchedBib;
  const check = CheckResponse.parse(
    await (
      await post("checks", { library: { format: "bibtex", text } })
    ).json(),
  ).data;
  await finished(check.id);
  const corrected = await exportCorrected(check.id, 1);
  expect(corrected.status).toBe(200);
  const output = await exactText(corrected);
  expect(output.slice(-untouchedBib.length)).toBe(untouchedBib);
  const record = output.slice(0, output.length - untouchedBib.length);
  expect(record).toContain(
    "% exact header\n@article{KeepKey,\n title = {Measured measurement}, % keep comment\n author = {Aspelmeyer, Markus},\n year = {2009},",
  );
  expect(record).toContain(
    "journal={Nature Physics}, volume={5}, pages={12}, doi={10.1038/nphys1170},",
  );
  expect(record).toContain("customfield = {Keep me}");
  expect(record).toContain("month = jan");
  const reimported = ImportResponse.parse(
    await (await post("imports", { format: "bibtex", text: output })).json(),
  ).data;
  expect(reimported.rejected).toEqual([]);
  expect(reimported.references[0]!.csl).toMatchObject({
    title: "Measured measurement",
    issued: { literal: "2009-01" },
    author: [{ family: "Aspelmeyer", given: "Markus" }],
    issue: "1",
  });
  expect(reimported.references[1]!.originalText).toBe(untouchedBib);
  const original = await post(`checks/${check.id}/export`, {
    format: "imported-format",
    mode: "original",
  });
  expect(await exactText(original)).toBe(text);
  await post(`checks/${check.id}/cancel`, {});
});
it("patches only an applied correction into its imported RIS record using RIS date conventions", async () => {
  const correctedRis =
    "TY  - JOUR\r\nTI  - Measured measurement\r\nAU  - Aspelmeyer, M.\r\nPY  - 2008\r\nJO  - Nature Physics\r\nVL  - 5\r\nSP  - 12\r\nDO  - 10.1038/nphys1170\r\nZZ  - Keep me\r\nER  - \r\n\r\n";
  const untouchedRis =
    "TY  - BOOK\r\nTI  - Kept exactly\r\nPY  - 1999\r\nER  - \r\n";
  const text = correctedRis + untouchedRis;
  const check = CheckResponse.parse(
    await (await post("checks", { library: { format: "ris", text } })).json(),
  ).data;
  await finished(check.id);
  const corrected = await exportCorrected(check.id, 1);
  expect(corrected.status).toBe(200);
  expect(corrected.headers.get("content-disposition")).toContain('.ris"');
  const output = await exactText(corrected);
  expect(output.endsWith(untouchedRis)).toBe(true);
  const record = output.slice(0, output.length - untouchedRis.length);
  expect(record).toContain(
    "TY  - JOUR\r\nTI  - Measured measurement\r\nAU  - Aspelmeyer, Markus\r\nPY  - 2009\r\nDA  - 2009/01//\r\nJO  - Nature Physics\r\nVL  - 5\r\nSP  - 12\r\n",
  );
  expect(record).toContain("ZZ  - Keep me\r\n");
  expect(record).toMatch(/\r\nER {2}- \r\n\r\n$/u);
  const reimported = ImportResponse.parse(
    await (await post("imports", { format: "ris", text: output })).json(),
  ).data;
  expect(reimported.rejected).toEqual([]);
  expect(reimported.references[0]!.csl).toMatchObject({
    issued: { literal: "2009-01" },
    author: [{ family: "Aspelmeyer", given: "Markus" }],
    issue: "1",
  });
  await post(`checks/${check.id}/cancel`, {});
});
it("refuses the imported-format download for a Check that was not imported", async () => {
  const check = CheckResponse.parse(
    await (
      await post("checks", {
        references: [
          { originalText: "Pasted text", fields: { title: "Pasted text" } },
        ],
      })
    ).json(),
  ).data;
  expect(
    (
      await post(`checks/${check.id}/export`, {
        format: "imported-format",
        mode: "original",
      })
    ).status,
  ).toBe(400);
  await post(`checks/${check.id}/cancel`, {});
});
it("maps duplicate BibTeX citation keys by record and resolves library string macros", async () => {
  const text =
    "@string{jnp = {Nature Physics}}\n@article{Dup, title={One}, journal=jnp, year=2008}\n@inproceedings{Dup, title={Two}, booktitle={Proceedings}, year=2009}\n";
  const result = ImportResponse.parse(
    await (await post("imports", { format: "bibtex", text })).json(),
  ).data;
  expect(result.rejected).toEqual([]);
  expect(result.references.map((r: { csl: object }) => r.csl)).toMatchObject([
    {
      type: "article-journal",
      title: "One",
      "container-title": "Nature Physics",
      issued: { literal: "2008" },
    },
    {
      type: "paper-conference",
      title: "Two",
      "container-title": "Proceedings",
      issued: { literal: "2009" },
    },
  ]);
  expect(
    result.references
      .map((r: { originalText: string }) => r.originalText)
      .join(""),
  ).toBe(text);
});
it("keeps every unmapped BibTeX field visible, including known library fields outside the canonical CSL projection", async () => {
  const text =
    "@book{Full,title={A title},year=2020,abstract={An abstract},keywords={alpha, beta},editor={Editor, Eve},customfield={Keep this}}\n";
  const result = ImportResponse.parse(
    await (await post("imports", { format: "bibtex", text })).json(),
  ).data;
  expect(result.rejected).toEqual([]);
  expect(result.references[0]!.imported!.unsupported).toEqual(
    expect.arrayContaining([
      { name: "abstract", value: "An abstract" },
      { name: "keywords", value: "alpha, beta" },
      { name: "editor", value: "Editor, Eve" },
      { name: "customfield", value: "Keep this" },
    ]),
  );
});
it("reports the Reference limit at the import preview without creating a Check", async () => {
  const text = Array.from(
    { length: 1001 },
    (_, i) => `@book{R${i},title={Book ${i}},year=2020}\n`,
  ).join("");
  const response = await post("imports", { format: "bibtex", text });
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({
    code: "reference-limit",
    limit: 1000,
    i18nKey: "problem_reference_limit",
  });
});
it("preserves BibTeX header comments containing example records without inventing a rejected record", async () => {
  const text =
    "% Mention @book{Example} in a comment\n@book{Real,title={Actual book},year=2020}\n";
  const result = ImportResponse.parse(
    await (await post("imports", { format: "bibtex", text })).json(),
  ).data;
  expect(result.rejected).toEqual([]);
  expect(result.references.map((reference) => reference.originalText)).toEqual([
    text,
  ]);
});
it("applies an explicitly selected Source type and full-date correction while retaining unsupported fields", async () => {
  const doi = "10.5555/import-correction";
  fixtures.respond(`/api/handles/${doi}`, 200, { responseCode: 1, handle: doi });
  fixtures.respond(`/works/${doi}`, 200, { message: {
    DOI: doi, type: "journal-article", title: ["Synthetic corrected title"],
    author: [{ family: "Author", given: "Anna" }], published: { "date-parts": [[2024, 5, 17]] },
    "article-number": "e1234",
  } });
  const text = `@book{Kept,title={Synthetic corrected title},author={Author, Anna},year=2023,doi={${doi}},note={Keep note}}\n`;
  const check = CheckResponse.parse(await (await post("checks", { library: { format: "bibtex", text } })).json()).data;
  await finished(check.id);
  const output = await exactText(await exportCorrected(check.id, 1));
  const result = ImportResponse.parse(await (await post("imports", { format: "bibtex", text: output })).json()).data;
  expect(result.references[0]!.csl).toMatchObject({ type: "article-journal", issued: { literal: "2024-05-17" }, "article-number": "e1234" });
  expect(output).toContain("note={Keep note}");
});
it("counts the 20 MB import limit in UTF-8 bytes and returns a clear limit message", async () => {
  const text = "ä".repeat(10 * 1024 * 1024 + 1);
  for (const [path, input] of [["imports", { format: "bibtex", text }], ["checks", { library: { format: "bibtex", text } }]] as const) {
    const response = await post(path, input);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "library-size", limit: 20, i18nKey: "problem_library_size" });
  }
});
