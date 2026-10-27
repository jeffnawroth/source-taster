// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFile } from "node:fs/promises";
import {
  StructuringResponse,
  ProblemDetails,
} from "@source-taster/contract-verification";
import { expect, inject, it } from "vitest";

const api = inject("apiUrl");
function structure(text: string) {
  return fetch(`${api}/v1/structurings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

it("structures the recorded APA bibliography through HTTP, preserving text and every field's evidence", async () => {
  const fixture = JSON.parse(
    await readFile(
      new URL("./fixtures/structuring/apa.json", import.meta.url),
      "utf8",
    ),
  ) as { text: string; expected: unknown[] };
  const response = await structure(fixture.text);
  expect(response.status).toBe(200);
  const { data, quota } = StructuringResponse.parse(await response.json());
  expect(quota).toBeNull();
  expect(data.quotaConsumed).toBe(0);
  expect(data.references.map((reference) => reference.csl)).toEqual(
    fixture.expected,
  );
  expect(data.rejected).toEqual([]);
  expect(data.references[0]).toMatchObject({
    originalText:
      "Doe, J. (2020). A study of things.\n  Journal of Studies, 12(3), 45–67. https://doi.org/10.1234/EXAMPLE",
    span: { start: 2, end: 104 },
    fieldSources: {
      title: { raw: "A study of things", span: { start: 18, end: 35 } },
      DOI: { raw: "10.1234/EXAMPLE", normalized: "10.1234/example" },
    },
    structuring: { path: "parser", version: "author-date/1" },
  });
  for (const reference of data.references) {
    expect(fixture.text.slice(reference.span.start, reference.span.end)).toBe(
      reference.originalText,
    );
    for (const source of Object.values(reference.fieldSources))
      expect(fixture.text.slice(source.span!.start, source.span!.end)).toBe(
        source.raw,
      );
  }
});

it.each(["harvard", "chicago", "mla"])(
  "structures the recorded %s bibliography without rewriting field values",
  async (style) => {
    const fixture = JSON.parse(
      await readFile(
        new URL(`./fixtures/structuring/${style}.json`, import.meta.url),
        "utf8",
      ),
    ) as { text: string; expected: unknown[] };
    const response = await structure(fixture.text);
    expect(response.status).toBe(200);
    const { data } = StructuringResponse.parse(await response.json());
    expect(data.references.map((reference) => reference.csl)).toEqual(
      fixture.expected,
    );
    expect(data.rejected).toEqual([]);
    for (const reference of data.references) {
      expect(fixture.text.slice(reference.span.start, reference.span.end)).toBe(
        reference.originalText,
      );
      for (const source of Object.values(reference.fieldSources))
        expect(fixture.text.slice(source.span!.start, source.span!.end)).toBe(
          source.raw,
        );
    }
    if (style === "harvard") {
      expect(data.references[1]?.authorsTruncated).toBe(true);
      expect(data.references[1]?.fieldSources.authorsTruncated?.raw).toBe(
        "et al.",
      );
    }
  },
);

it("keeps uncertain fields empty, distinguishes no date, and lists rejected text separately", async () => {
  const text =
    "References\r\n\r\nWorld Health Organization (n.d.). Global health report.\r\n\r\nno bibliographic features here\r\n\r\n2020\r\n\r\nhttps://example.org/source\r\n\r\n10.5555/ONLY";
  const response = await structure(text);
  const { data } = StructuringResponse.parse(await response.json());
  expect(data.references.map((reference) => reference.csl)).toEqual([
    {
      author: [{ literal: "World Health Organization" }],
      issued: { literal: "n.d." },
      title: "Global health report",
    },
    { issued: { literal: "2020" } },
    { URL: "https://example.org/source" },
    { DOI: "10.5555/ONLY" },
  ]);
  expect(data.rejected.map((entry) => entry.originalText)).toEqual([
    "References",
    "no bibliographic features here",
  ]);
  expect(data.guidance).toBeNull();
  for (const reference of data.references) {
    expect(text.slice(reference.span.start, reference.span.end)).toBe(
      reference.originalText,
    );
    for (const source of Object.values(reference.fieldSources))
      expect(text.slice(source.span!.start, source.span!.end)).toBe(source.raw);
  }
});

it("returns rejected entries and actionable guidance when no References are recognized", async () => {
  const response = await structure(
    "Literatur\n\nNo bibliographic features\n\n42",
  );
  expect(response.status).toBe(200);
  const { data } = StructuringResponse.parse(await response.json());
  expect(data).toMatchObject({
    references: [],
    guidance: "no-references",
    quotaConsumed: 0,
    referenceLimit: 1000,
  });
  expect(data.rejected.map((entry) => entry.originalText)).toEqual([
    "Literatur",
    "No bibliographic features",
    "42",
  ]);
});

it("accepts 1000 structured References and rejects 1001 without truncation, stating the limit", async () => {
  const reference = "Doe, J. (2020). A study. Journal of Testing, 1(1), 1–2.";
  const accepted = await structure(Array(1000).fill(reference).join("\n"));
  expect(accepted.status).toBe(200);
  const { data } = StructuringResponse.parse(await accepted.json());
  expect(data.references).toHaveLength(1000);
  const rejected = await structure(Array(1001).fill(reference).join("\n"));
  expect(rejected.status).toBe(400);
  expect(rejected.headers.get("content-type")).toBe("application/problem+json");
  expect(ProblemDetails.parse(await rejected.json())).toMatchObject({
    code: "reference-limit",
    i18nKey: "problem_reference_limit",
    detail: "At most 1000 References can be structured at once.",
  });
});

it.each(["", " \n\t"])("rejects empty Structuring input %j", async (text) => {
  const response = await structure(text);
  expect(response.status).toBe(400);
  expect(ProblemDetails.parse(await response.json()).code).toBe("input-empty");
});

it("joins unindented continuations before rejecting, keeps author-title References without dates and preserves Unicode spans", async () => {
  const text =
    "Darwin, C. (1859). On the origin of species.\r\nJohn Murray.\r\nSmith, Jane. “A careful 🧪 title.”\r\nJournal of Testing, vol. 12, no. 3, 2020, pp. 45–67.\r\n\r\nMorrison, Toni. Beloved.\r\n\r\nA heading";
  const response = await structure(text);
  const { data } = StructuringResponse.parse(await response.json());
  expect(data.references.map((reference) => reference.csl)).toEqual([
    {
      author: [{ family: "Darwin", given: "C." }],
      issued: { literal: "1859" },
      title: "On the origin of species",
      publisher: "John Murray",
    },
    {
      author: [{ family: "Smith", given: "Jane" }],
      issued: { literal: "2020" },
      title: "A careful 🧪 title",
      "container-title": "Journal of Testing",
      volume: "12",
      issue: "3",
      page: "45–67",
    },
    { author: [{ family: "Morrison", given: "Toni" }], title: "Beloved" },
  ]);
  expect(data.rejected.map((entry) => entry.originalText)).toEqual([
    "A heading",
  ]);
  for (const reference of data.references) {
    for (const key of Object.keys(reference.csl))
      expect(reference.fieldSources[key]).toBeDefined();
    for (const source of Object.values(reference.fieldSources))
      expect(text.slice(source.span!.start, source.span!.end)).toBe(source.raw);
  }
});

it("retains identifier-only References without manufacturing dates and preserves partial dates and abbreviated containers", async () => {
  const text =
    "https://example.org/2020/article\n\n10.2020/IDENTIFIER.\n\nDoe, J. (2020, March). A title. J. Test., 12(3), e1234.\n\nMüller, A. u. a. (o. J.). Ein Titel. Beispielverlag.";
  const response = await structure(text);
  const { data } = StructuringResponse.parse(await response.json());
  expect(data.references.map((reference) => reference.csl)).toEqual([
    { URL: "https://example.org/2020/article" },
    { DOI: "10.2020/IDENTIFIER" },
    {
      author: [{ family: "Doe", given: "J." }],
      issued: { literal: "2020, March" },
      title: "A title",
      "container-title-short": "J. Test.",
      volume: "12",
      issue: "3",
      "article-number": "e1234",
    },
    {
      author: [{ family: "Müller", given: "A." }],
      issued: { literal: "o. J." },
      title: "Ein Titel",
      publisher: "Beispielverlag",
    },
  ]);
  expect(data.references[3]?.authorsTruncated).toBe(true);
  for (const reference of data.references)
    for (const source of Object.values(reference.fieldSources))
      expect(text.slice(source.span!.start, source.span!.end)).toBe(source.raw);
});

it("keeps corporate names intact and leaves an ambiguous sentence boundary empty", async () => {
  const text =
    "Research and Development Council (2020). A title.\n\nDoe, J. (2020). Dr. Smith and language. Unknown tail.";
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl)).toEqual([
    {
      author: [{ literal: "Research and Development Council" }],
      issued: { literal: "2020" },
      title: "A title",
    },
    { author: [{ family: "Doe", given: "J." }], issued: { literal: "2020" } },
  ]);
  expect(data.references[1]?.fieldSources.title).toBeUndefined();
});

it("retains labeled identifiers as written, validates check digits and separates normalized ISBNs", async () => {
  const text =
    "ISBN 0-306-40615-2\n\nISBN 978-0-306-40615-7\n\nISSN 0378-5955\n\nPMID: 12345678\n\nPMCID: PMC1234567\n\nDoe, J. (2020). A title. ISBN 978-0-306-40615-8.";
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl)).toEqual([
    { ISBN: "0-306-40615-2" },
    { ISBN: "978-0-306-40615-7" },
    { ISSN: "0378-5955" },
    { PMID: "12345678" },
    { PMCID: "PMC1234567" },
    {
      author: [{ family: "Doe", given: "J." }],
      issued: { literal: "2020" },
      title: "A title",
    },
  ]);
  expect(data.references[0]?.fieldSources.ISBN?.normalized).toBe(
    "9780306406157",
  );
  expect(data.references[1]?.fieldSources.ISBN?.normalized).toBe(
    "9780306406157",
  );
  for (const reference of data.references)
    for (const source of Object.values(reference.fieldSources))
      expect(text.slice(source.span!.start, source.span!.end)).toBe(source.raw);
});

it("structures author-date articles whose journal supplies no issue", async () => {
  const text =
    "Doe, J. (2020). A title. Journal of Testing, 12, 45–67.\nSmith, Jane. 2021. “A title.” Journal of Testing 12: e1234.\nRoe, Jane. “A title.” Journal of Testing, vol. 12, 2022, pp. 45–67.";
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl)).toEqual([
    {
      author: [{ family: "Doe", given: "J." }],
      issued: { literal: "2020" },
      title: "A title",
      "container-title": "Journal of Testing",
      volume: "12",
      page: "45–67",
    },
    {
      author: [{ family: "Smith", given: "Jane" }],
      issued: { literal: "2021" },
      title: "A title",
      "container-title": "Journal of Testing",
      volume: "12",
      "article-number": "e1234",
    },
    {
      author: [{ family: "Roe", given: "Jane" }],
      issued: { literal: "2022" },
      title: "A title",
      "container-title": "Journal of Testing",
      volume: "12",
      page: "45–67",
    },
  ]);
});

it("structures independently varied author-date examples with exact bibliographic values", async () => {
  const fixture = JSON.parse(
    await readFile(
      new URL(
        "./fixtures/structuring/varied-author-date.json",
        import.meta.url,
      ),
      "utf8",
    ),
  ) as { text: string; expected: unknown[] };
  const response = await structure(fixture.text);
  expect(response.status).toBe(200);
  const { data } = StructuringResponse.parse(await response.json());
  expect(data.references.map((reference) => reference.csl)).toEqual(
    fixture.expected,
  );
  expect(data.rejected).toEqual([]);
  expect(data.references[0]?.fieldSources.title).toEqual({
    raw: "Rivers and cities",
    span: { start: 27, end: 44 },
  });
  for (const reference of data.references)
    for (const source of Object.values(reference.fieldSources))
      expect(fixture.text.slice(source.span!.start, source.span!.end)).toBe(
        source.raw,
      );
});
