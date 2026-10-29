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
    structuring: { path: "parser", version: "citation-styles/2" },
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

it.each([
  "ieee",
  "vancouver",
  "acs",
  "ama",
  "springer",
  "oxford",
  "din-iso-690",
])(
  "structures the recorded %s bibliography with labels excluded from fields and exact source spans",
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
    expect(data.quotaConsumed).toBe(0);
    for (const reference of data.references) {
      expect(reference.structuring).toEqual({
        path: "parser",
        version: "citation-styles/2",
      });
      expect(fixture.text.slice(reference.span.start, reference.span.end)).toBe(
        reference.originalText,
      );
      for (const [key, value] of Object.entries(reference.csl)) {
        expect(reference.fieldSources[key]).toBeDefined();
        if (typeof value === "string")
          expect(reference.fieldSources[key]?.raw).toBe(value);
      }
      if (reference.csl.issued)
        expect(reference.fieldSources.issued?.raw).toBe(
          reference.csl.issued.literal,
        );
      for (const [index, name] of (reference.csl.author ?? []).entries())
        for (const [key, value] of Object.entries(name))
          expect(reference.fieldSources[`author.${index}.${key}`]?.raw).toBe(
            value,
          );
      for (const source of Object.values(reference.fieldSources))
        expect(fixture.text.slice(source.span!.start, source.span!.end)).toBe(
          source.raw,
        );
    }
    if (style === "ama") {
      expect(data.references[0]?.authorsTruncated).toBe(true);
      expect(data.references[0]?.fieldSources.authorsTruncated?.raw).toBe(
        "et al.",
      );
    }
    if (style === "ieee") {
      expect(data.references[0]?.originalText).toBe(
        "[1] J. Doe and A. de Vries, “Signal maps,” IEEE Trans. Signal Process., vol. 12, no. 3, pp. 45–67, 2020. doi:10.5555/IEEE",
      );
      expect(data.references[0]?.fieldSources.title).toEqual({
        raw: "Signal maps",
        span: { start: 31, end: 42 },
      });
    }
  },
);

it("splits all eleven styles in one list without cross-contaminating fields or source spans", async () => {
  const styles = [
    "apa",
    "ieee",
    "harvard",
    "vancouver",
    "chicago",
    "acs",
    "mla",
    "ama",
    "springer",
    "oxford",
    "din-iso-690",
  ];
  const fixtures = await Promise.all(
    styles.map(
      async (style) =>
        JSON.parse(
          await readFile(
            new URL(`./fixtures/structuring/${style}.json`, import.meta.url),
            "utf8",
          ),
        ) as { text: string; expected: unknown[] },
    ),
  );
  const text = fixtures.map((fixture) => fixture.text.trim()).join("\r\n");
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl)).toEqual(
    fixtures.flatMap((fixture) => fixture.expected),
  );
  expect(data.rejected).toEqual([]);
  for (const reference of data.references) {
    expect(text.slice(reference.span.start, reference.span.end)).toBe(
      reference.originalText,
    );
    for (const source of Object.values(reference.fieldSources)) {
      expect(source.span!.start).toBeGreaterThanOrEqual(reference.span.start);
      expect(source.span!.end).toBeLessThanOrEqual(reference.span.end);
      expect(text.slice(source.span!.start, source.span!.end)).toBe(source.raw);
    }
  }
});

it("uses publication-date positions in every added style rather than years inside titles", async () => {
  const text = [
    "[1] J. Doe, “A 1999 retrospective,” J. Test., vol. 2, pp. 10–12, 2020.",
    "2. Doe J. The 2019 survey. J Med. 2021;2:3.",
    "(3) Doe, J.; Roe, A. The 2020 survey. J. Chem. 2022, 2, 4–5.",
    "4. Doe J. The 2017 survey. J Med. 2023;2:6–7.",
    "Doe, J.: The 1998 survey. J. Test. 2, 8–9 (2024).",
    "Doe, Jane, ‘The 1997 survey’, Journal of Testing, 2 (2025), 10–11.",
    "DOE, Jane, 2026. The 2016 survey. Berlin: Example Press.",
  ].join("\n");
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(
    data.references.map((reference) => ({
      title: reference.csl.title,
      issued: reference.csl.issued,
    })),
  ).toEqual([
    { title: "A 1999 retrospective", issued: { literal: "2020" } },
    { title: "The 2019 survey", issued: { literal: "2021" } },
    { title: "The 2020 survey", issued: { literal: "2022" } },
    { title: "The 2017 survey", issued: { literal: "2023" } },
    { title: "The 1998 survey", issued: { literal: "2024" } },
    { title: "The 1997 survey", issued: { literal: "2025" } },
    { title: "The 2016 survey", issued: { literal: "2026" } },
  ]);
  for (const reference of data.references)
    expect(
      text.slice(
        reference.fieldSources.issued!.span!.start,
        reference.fieldSources.issued!.span!.end,
      ),
    ).toBe(reference.csl.issued!.literal);
});

it("removes only list and note markers, retaining exact original input and rejecting marker-only prose", async () => {
  const text =
    "  [2020] 10.5555/ONLY\r\n\r\n(2) https://example.org/2021/article\r\n\r\n3) ISBN 0-306-40615-2\r\n\r\n¹ PMID: 12345\r\n\r\n† Ibid., p. 12.\r\n\r\n* No reference features";
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl)).toEqual([
    { DOI: "10.5555/ONLY" },
    { URL: "https://example.org/2021/article" },
    { ISBN: "0-306-40615-2" },
    { PMID: "12345" },
  ]);
  expect(data.rejected.map((entry) => entry.originalText)).toEqual([
    "† Ibid., p. 12.",
    "* No reference features",
  ]);
  expect(data.references[0]).toMatchObject({
    originalText: "[2020] 10.5555/ONLY",
    span: { start: 2, end: 21 },
    fieldSources: { DOI: { raw: "10.5555/ONLY", span: { start: 9, end: 21 } } },
  });
  for (const entry of [...data.references, ...data.rejected])
    expect(text.slice(entry.span.start, entry.span.end)).toBe(
      entry.originalText,
    );
});

it.each([
  [
    "IEEE",
    "[1] J. Doe, “A safe title,” uncertain tail 2020 or 2021.",
    { author: [{ given: "J.", family: "Doe" }], title: "A safe title" },
  ],
  [
    "Vancouver",
    "2. Doe J. Dr. Smith and language. J Med. 2020;12:45-67.",
    { author: [{ family: "Doe", given: "J" }] },
  ],
  [
    "ACS",
    "(3) Doe, J.; Roe, A. Dr. Smith and language. J. Chem. 2020, 12, 45–67.",
    {
      author: [
        { family: "Doe", given: "J." },
        { family: "Roe", given: "A." },
      ],
    },
  ],
  [
    "AMA",
    "4. Doe J, et al. Dr. Smith and language. J Med. 2020;12:45-67.",
    { author: [{ family: "Doe", given: "J" }] },
  ],
  [
    "Springer",
    "Doe, J.: Dr. Smith and language. J. Test. 12, 45–67 (2020).",
    { author: [{ family: "Doe", given: "J." }] },
  ],
  [
    "Oxford",
    "† Doe, Jane, ‘An exact title’, ambiguous journal (2020 or 2021).",
    { author: [{ family: "Doe", given: "Jane" }], title: "An exact title" },
  ],
  [
    "DIN ISO 690",
    "DOE, Jane, 2020. Dr. Smith and language. Berlin: Example Press.",
    { author: [{ family: "DOE", given: "Jane" }], issued: { literal: "2020" } },
  ],
])(
  "leaves uncertain %s fields absent rather than manufacturing them",
  async (_style, text, expected) => {
    const { data } = StructuringResponse.parse(
      await (await structure(text)).json(),
    );
    expect(data.references.map((reference) => reference.csl)).toEqual([
      expected,
    ]);
    for (const reference of data.references)
      for (const source of Object.values(reference.fieldSources))
        expect(text.slice(source.span!.start, source.span!.end)).toBe(
          source.raw,
        );
  },
);

it("splits unnumbered numeric-style References and preserves ordered comma-separated IEEE authors", async () => {
  const text =
    "J. Doe, A. Roe, and B. Ng, “An exact title,” J. Test., vol. 2, pp. 10–12, 2020.\nNg, A.; Chen, B. More maps. J. Chem. 2021, 3, 20–21.\nDoe J, Roe AB. Last maps. J Med. 2022;4:22–23.";
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl)).toEqual([
    {
      author: [
        { given: "J.", family: "Doe" },
        { given: "A.", family: "Roe" },
        { given: "B.", family: "Ng" },
      ],
      title: "An exact title",
      "container-title-short": "J. Test.",
      volume: "2",
      page: "10–12",
      issued: { literal: "2020" },
    },
    {
      author: [
        { family: "Ng", given: "A." },
        { family: "Chen", given: "B." },
      ],
      title: "More maps",
      "container-title-short": "J. Chem.",
      volume: "3",
      page: "20–21",
      issued: { literal: "2021" },
    },
    {
      author: [
        { family: "Doe", given: "J" },
        { family: "Roe", given: "AB" },
      ],
      title: "Last maps",
      "container-title-short": "J Med",
      volume: "4",
      page: "22–23",
      issued: { literal: "2022" },
    },
  ]);
  for (const reference of data.references)
    for (const source of Object.values(reference.fieldSources))
      expect(text.slice(source.span!.start, source.span!.end)).toBe(source.raw);
});

it.each([
  ["ieee", ", “Signal maps,” ", ", “Signal maps,”\r\n  "],
  ["acs", "Signal Maps. ", "Signal Maps.\r\n  "],
  ["springer", "Signal maps. ", "Signal maps.\r\n  "],
  ["oxford", "‘Signal maps’, ", "‘Signal maps’,\r\n  "],
  ["din-iso-690", "Küsten und Städte. ", "Küsten und Städte.\r\n  "],
])(
  "joins wrapped %s References before parsing their fields",
  async (style, delimiter, wrapped) => {
    const fixture = JSON.parse(
      await readFile(
        new URL(`./fixtures/structuring/${style}.json`, import.meta.url),
        "utf8",
      ),
    ) as { text: string; expected: unknown[] };
    const text = fixture.text.replace(delimiter, wrapped);
    const { data } = StructuringResponse.parse(
      await (await structure(text)).json(),
    );
    expect(data.references.map((reference) => reference.csl)).toEqual(
      fixture.expected,
    );
    for (const reference of data.references) {
      expect(text.slice(reference.span.start, reference.span.end)).toBe(
        reference.originalText,
      );
      for (const source of Object.values(reference.fieldSources))
        expect(text.slice(source.span!.start, source.span!.end)).toBe(
          source.raw,
        );
    }
  },
);

it("structures explicit Vancouver, AMA and ACS book layouts without treating identifier text as a publisher", async () => {
  const text =
    "1. Doe J. Careful systems. Berlin: Example Press; 2020.\n2. Roe AB. Open archives. Another Press; 2021.\n(3) Ng, A.; Chen, B. Coastal records; East Press: London, 2022.\n4. Doe J. A title. doi:10.5555/ONLY";
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl)).toEqual([
    {
      author: [{ family: "Doe", given: "J" }],
      title: "Careful systems",
      "publisher-place": "Berlin",
      publisher: "Example Press",
      issued: { literal: "2020" },
    },
    {
      author: [{ family: "Roe", given: "AB" }],
      title: "Open archives",
      publisher: "Another Press",
      issued: { literal: "2021" },
    },
    {
      author: [
        { family: "Ng", given: "A." },
        { family: "Chen", given: "B." },
      ],
      title: "Coastal records",
      publisher: "East Press",
      "publisher-place": "London",
      issued: { literal: "2022" },
    },
    {
      author: [{ family: "Doe", given: "J" }],
      title: "A title",
      DOI: "10.5555/ONLY",
    },
  ]);
  for (const reference of data.references)
    for (const source of Object.values(reference.fieldSources))
      expect(text.slice(source.span!.start, source.span!.end)).toBe(source.raw);
});

it("removes attached superscript and symbol note markers while keeping their original spans", async () => {
  const text =
    "¹Jane Doe, ‘Open archives’, Archives Quarterly, 8 (2021), 101–109.\n†Jane Roe, ‘Coastal records’, Archives Quarterly, 9 (2022), 20–21.";
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl)).toEqual([
    {
      author: [{ literal: "Jane Doe" }],
      title: "Open archives",
      "container-title": "Archives Quarterly",
      volume: "8",
      issued: { literal: "2021" },
      page: "101–109",
    },
    {
      author: [{ literal: "Jane Roe" }],
      title: "Coastal records",
      "container-title": "Archives Quarterly",
      volume: "9",
      issued: { literal: "2022" },
      page: "20–21",
    },
  ]);
  for (const reference of data.references) {
    expect(text.slice(reference.span.start, reference.span.end)).toBe(
      reference.originalText,
    );
    for (const source of Object.values(reference.fieldSources))
      expect(text.slice(source.span!.start, source.span!.end)).toBe(source.raw);
  }
});

it("keeps wrapped late-date book publishers with their Reference", async () => {
  const text =
    "[1] A. Roe, Careful Systems.\r\n  Berlin: Example Press, 2019.\r\nDoe, J.: Open archives.\r\n  Another Press, London (2020).\r\n2. Ng A. Coastal records.\r\n  East Press; 2021.";
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl)).toEqual([
    {
      author: [{ given: "A.", family: "Roe" }],
      title: "Careful Systems",
      publisher: "Example Press",
      "publisher-place": "Berlin",
      issued: { literal: "2019" },
    },
    {
      author: [{ family: "Doe", given: "J." }],
      title: "Open archives",
      publisher: "Another Press",
      "publisher-place": "London",
      issued: { literal: "2020" },
    },
    {
      author: [{ family: "Ng", given: "A" }],
      title: "Coastal records",
      publisher: "East Press",
      issued: { literal: "2021" },
    },
  ]);
  for (const reference of data.references) {
    expect(text.slice(reference.span.start, reference.span.end)).toBe(
      reference.originalText,
    );
    for (const source of Object.values(reference.fieldSources))
      expect(text.slice(source.span!.start, source.span!.end)).toBe(source.raw);
  }
});

it("does not reinterpret an unsupported late-date layout as an author-date Reference", async () => {
  const text =
    "Doe, Jane: A title. Example Press, Berlin (2020). doi:10.5555/UNSUPPORTED";
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl)).toEqual([
    { issued: { literal: "2020" }, DOI: "10.5555/UNSUPPORTED" },
  ]);
  expect(data.references[0]?.fieldSources.author).toBeUndefined();
  expect(data.references[0]?.fieldSources.title).toBeUndefined();
});

it("preserves apostrophes inside paired title quotes and leaves ambiguous quote boundaries empty", async () => {
  const text =
    "[1] J. Doe, “O’Neil’s maps,” J. Test., vol. 2, pp. 10–12, 2020.\nDoe, Jane, ‘O’Neil’s records’, Journal of Testing, 3 (2021), 20–21.\nRoe, Alex, ‘Authors’ rights’, Journal of Testing, 4 (2022), 30–31.";
  const { data } = StructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(data.references.map((reference) => reference.csl.title)).toEqual([
    "O’Neil’s maps",
    "O’Neil’s records",
    undefined,
  ]);
  for (const reference of data.references)
    for (const source of Object.values(reference.fieldSources))
      expect(text.slice(source.span!.start, source.span!.end)).toBe(source.raw);
});
