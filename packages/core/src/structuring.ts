// SPDX-License-Identifier: AGPL-3.0-or-later
// Pure owned rules. This module has no transport, persistence or network imports.
export interface Span {
  start: number;
  end: number;
}
export interface FieldSource {
  raw: string;
  /** Only parser-derived fields have offsets in original text. */
  span?: Span;
  normalized?: string;
}
export interface Name {
  family?: string;
  "non-dropping-particle"?: string;
  given?: string;
  literal?: string;
}
export interface Csl {
  type?: string;
  author?: Name[];
  issued?: { literal: string };
  title?: string;
  "container-title"?: string;
  "container-title-short"?: string;
  publisher?: string;
  "publisher-place"?: string;
  volume?: string;
  issue?: string;
  page?: string;
  "article-number"?: string;
  edition?: string;
  DOI?: string;
  URL?: string;
  ISBN?: string;
  ISSN?: string;
  PMID?: string;
  PMCID?: string;
  /** Native arXiv identifier; never inferred from an arXiv DOI (ADR-0011). */
  arXiv?: string;
}
export interface StructuredReference {
  originalText: string;
  span: Span;
  csl: Csl;
  fieldSources: Record<string, FieldSource>;
  authorsTruncated?: boolean;
  structuring: { path: "parser" | "user"; version: string };
}
export interface StructuringResult {
  references: StructuredReference[];
  rejected: {
    originalText: string;
    span: Span;
    reason: "no-reference-features";
  }[];
  guidance: "no-references" | null;
  quotaConsumed: 0;
  referenceLimit: number;
}
/** Application-owned port; transport sees results, never rule internals. */
export interface Structuring {
  structure(text: string): StructuringResult;
}
export class ReferenceLimitExceeded extends Error {
  readonly limit: number;
  constructor(limit: number) {
    super("reference-limit");
    this.limit = limit;
  }
}

const date =
  /(?<![\d./])\b(?:[12]\d{3}[a-z]?(?!\d)(?:,?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Januar|Februar|März|Mai|Juni|Juli|Oktober|Dezember)(?:\s+\d{1,2})?)?|n\.d\.|o\.\s*J\.)/u;
const entryMarker =
  /^(?:(?:\[\d+\]|\(\d+\)|\d+[.)])\s+|[¹²³⁴⁵⁶⁷⁸⁹⁰]+\s*|[*†‡]+\s*)/u;
const ieeeAuthors =
  /^((?:\p{Lu}\.\s*)+[\p{L}\p{M}’' -]+(?:(?:,\s*(?:(?:and|&)\s+)?|\s+(?:and|&)\s+)(?:\p{Lu}\.\s*)+[\p{L}\p{M}’' -]+)*(?:,?\s+et al\.)?),\s+/du;
const acsAuthors =
  /^([\p{L}\p{M}’' -]+,\s*(?:\p{Lu}\.\s*)*\p{Lu}\.(?:;\s*[\p{L}\p{M}’' -]+,\s*(?:\p{Lu}\.\s*)*\p{Lu}\.)*)\s+/du;
const springerAuthors =
  /^([\p{L}\p{M}’' -]+,\s*(?:\p{Lu}\.\s*)*\p{Lu}\.(?:,\s*[\p{L}\p{M}’' -]+,\s*(?:\p{Lu}\.\s*)*\p{Lu}\.)*):\s+/du;
const compactAuthors =
  /^([\p{L}\p{M}’' -]+? \p{Lu}{1,4}(?:,\s*[\p{L}\p{M}’' -]+? \p{Lu}{1,4})*)(?:\.\s+|,\s*et al\.\s+)/du;
const heading =
  /^(?:references|bibliography|works cited|literatur(?:verzeichnis)?|quellen(?:verzeichnis)?)\s*:?$/iu;

type AuthorSyntax = "family-given" | "initial-first" | "compact";
const authorSyntaxes: Record<
  AuthorSyntax,
  {
    split: (raw: string) => string[];
    person: RegExp;
    familyGroup: 1 | 2;
    givenGroup: 1 | 2;
  }
> = {
  "family-given": {
    split: (raw) =>
      raw
        .split(/;\s*|,?\s+(?:&|and|und)\s+/u)
        .flatMap((part) => part.split(/,\s*(?=[\p{L} -]+,)/u)),
    person: /^([^,]+),\s*([^,]+)$/du,
    familyGroup: 1,
    givenGroup: 2,
  },
  "initial-first": {
    split: (raw) => raw.split(/,?\s+(?:and|&)\s+|,\s*/u),
    person: /^((?:\p{Lu}\.\s*)+)([\p{L}\p{M}’' -]+)$/du,
    familyGroup: 2,
    givenGroup: 1,
  },
  compact: {
    split: (raw) => raw.split(/,\s*/u),
    person: /^(.+?) (\p{Lu}{1,4})$/du,
    familyGroup: 1,
    givenGroup: 2,
  },
};

function oxfordOpening(text: string) {
  const match =
    /^([\p{L}\p{M}.’' -]+(?:,\s*(?!(?:and|&)\s)[\p{L}\p{M}.’' -]+)?(?:,?\s+(?:and|&)\s+[\p{L}\p{M}.’' -]+)?),\s+/du.exec(
      text,
    );
  return match?.[1] &&
    (/^[“"‘']/u.test(text.slice(match[0].length)) ||
      /\([^():]+:\s*[^()]+,\s*[12]\d{3}[a-z]?\)/u.test(text))
    ? match
    : null;
}

const closingQuotes: Record<string, string> = {
  "“": "”",
  '"': '"',
  "‘": "’",
  "'": "'",
};
function quotedTitle(body: string): RegExpExecArray | null {
  const closing = closingQuotes[body[0] ?? ""];
  if (!closing) return null;
  let boundary: number | undefined;
  for (
    let index = body.indexOf(closing, 1);
    index !== -1;
    index = body.indexOf(closing, index + 1)
  ) {
    const next = body[index + 1];
    // An apostrophe inside a word is not a closing title quote.
    if (next !== undefined && !/[,.\s]/u.test(next)) continue;
    if (boundary !== undefined) return null;
    boundary = index;
  }
  if (boundary === undefined) return null;
  return new RegExp(
    `^${body[0]}([\\s\\S]+?)[.,]?${closing}(?=[,.\\s]|$)[,.]?\\s*`,
    "du",
  ).exec(body);
}

type Layout =
  | "early-date"
  | "mla"
  | "ieee"
  | "medical"
  | "acs"
  | "springer"
  | "oxford"
  | "iso";

// Each layout names its fields so date position never shifts another field's capture.
const journalPatterns: Record<Layout, RegExp> = {
  "early-date":
    /^(?<container>[^,\r\n]+?),?\s+(?<volume>\d+)(?:\s*\((?<issue>[^)]+)\))?[:,]\s*(?:pp\.\s*)?(?<pages>\d+[–-]\d+|e\d+)/du,
  mla: /^(?<container>.+?),\s*vol\.\s*(?<volume>\d+),\s*(?:no\.\s*(?<issue>[^,]+),\s*)?(?<issued>[12]\d{3}[a-z]?),\s*pp\.\s*(?<pages>\d+[–-]\d+|e\d+)/du,
  ieee: /^(?<container>.+?),\s*vol\.\s*(?<volume>\d+),\s*(?:no\.\s*(?<issue>[^,]+),\s*)?pp\.\s*(?<pages>\d+[–-]\d+|e\d+),\s*(?<issued>[12]\d{3}[a-z]?)\.(?:\s|$)/du,
  medical:
    /^(?<container>.+?)\.\s*(?<issued>[12]\d{3}[a-z]?);\s*(?<volume>\d+)(?:\((?<issue>[^)]+)\))?:\s*(?<pages>\d+(?:[–-]\d+)?|e\d+)\.(?:\s|$)/du,
  acs: /^(?<container>.+?)\s+(?<issued>[12]\d{3}[a-z]?),\s*(?<volume>\d+)(?:\s*\((?<issue>[^)]+)\))?,\s*(?<pages>\d+(?:[–-]\d+)?|e\d+)\.(?:\s|$)/du,
  springer:
    /^(?<container>.+?)\s+(?<volume>\d+)(?:\((?<issue>[^)]+)\))?,\s*(?<pages>\d+(?:[–-]\d+)?|e\d+)\s+\((?<issued>[12]\d{3}[a-z]?)\)\.(?:\s|$)/du,
  oxford:
    /^(?<container>[^,\r\n]+),\s*(?<volume>\d+)(?:\/(?<issue>\d+))?\s+\((?<issued>[12]\d{3}[a-z]?)\),\s*(?<pages>\d+(?:[–-]\d+)?|e\d+)\.(?:\s|$)/du,
  iso: /^In:\s*(?<container>.+?)\.\s*Bd\.\s*(?<volume>\d+),\s*(?:Nr\.\s*(?<issue>[^,]+),\s*)?S\.\s*(?<pages>\d+(?:[–-]\d+)?|e\d+)\.(?:\s|$)/du,
};
const placePublisher =
  /^(?<place>[^.:\r\n]+):\s*(?<publisher>[^\r\n]+?)\.(?:\s|$)/du;
const bookPatterns: Record<Layout, RegExp> = {
  "early-date": placePublisher,
  mla: placePublisher,
  iso: placePublisher,
  ieee: /^(?<place>[^.:\r\n]+):\s*(?<publisher>[^\r\n]+?),\s*(?<issued>[12]\d{3}[a-z]?)\.(?:\s|$)/du,
  medical:
    /^(?:(?<place>[^:;\r\n]+):\s*)?(?<publisher>[^:;\r\n]+);\s*(?<issued>[12]\d{3}[a-z]?)\.(?:\s|$)/du,
  acs: /^(?<publisher>[^:;\r\n]+):\s*(?<place>[^,;\r\n]+),\s*(?<issued>[12]\d{3}[a-z]?)\.(?:\s|$)/du,
  springer:
    /^(?<publisher>[^,:\r\n]+),\s*(?<place>[^,:\r\n]+)\s+\((?<issued>[12]\d{3}[a-z]?)\)\.(?:\s|$)/du,
  oxford:
    /^\((?<place>[^():]+):\s*(?<publisher>[^()]+?),\s*(?<issued>[12]\d{3}[a-z]?)\)\.(?:\s|$)/du,
};

function styledOpening(text: string): boolean {
  return (
    ieeeAuthors.test(text) ||
    compactAuthors.test(text) ||
    springerAuthors.test(text) ||
    acsAuthors.test(text) ||
    oxfordOpening(text) !== null
  );
}

/** Preserve the original substring, including CRLF and continuation indentation. */
function split(text: string): Span[] {
  const spans: Span[] = [];
  let current: Span | undefined;
  for (const match of text.matchAll(/[^\r\n]+/gu)) {
    const raw = match[0];
    const trimmed = raw.trim();
    if (!trimmed) {
      current = undefined;
      continue;
    }
    const start = match.index + raw.indexOf(trimmed);
    const end = start + trimmed.length;
    const lineDate = date.exec(trimmed);
    const prefix = lineDate ? trimmed.slice(0, lineDate.index) : "";
    const authorTitleStart = /^[\p{L}\p{M}'’ -]+,\s*[\p{L}\p{M}.'’ -]+?\.\s+/u;
    const entryStart =
      entryMarker.test(trimmed) ||
      styledOpening(trimmed) ||
      (authorTitleStart.test(trimmed) &&
        !/^[^,]+,\s*(?:vol|no|pp)\./iu.test(trimmed)) ||
      (lineDate &&
        /(?:\(|\.|,)\s*$/u.test(prefix) &&
        !/\b(?:vol|no|pp)\./iu.test(prefix));
    const adjacent =
      current && !/\r?\n\s*\r?\n/u.test(text.slice(current.end, start));
    const journalContinuation =
      /^.+\s+[12]\d{3}[a-z]?,\s*\d+(?:\s*\([^)]+\))?,\s*(?:\d|e\d)/u.test(
        trimmed,
      ) ||
      /^.+\.\s*[12]\d{3}[^;]*;/u.test(trimmed) ||
      /^.+\s+\d+(?:\([^)]+\))?,\s*(?:\d+(?:[–-]\d+)?|e\d+)\s+\([12]\d{3}[a-z]?\)\./u.test(
        trimmed,
      ) ||
      /^[^,]+,\s*\d+(?:\/\d+)?\s+\([12]\d{3}[a-z]?\),/u.test(trimmed);
    const bookContinuation = Object.values(bookPatterns).some((pattern) =>
      pattern.test(trimmed),
    );
    const previous = current
      ? text.slice(current.start, current.end).replace(entryMarker, "")
      : "";
    const continuation =
      current &&
      adjacent &&
      !entryMarker.test(trimmed) &&
      !styledOpening(trimmed) &&
      !(entryStart && !journalContinuation && !bookContinuation) &&
      !heading.test(trimmed) &&
      !/^\d+$/u.test(trimmed) &&
      (styledOpening(previous) ||
        date.test(text.slice(current.start, current.end)) ||
        authorTitleStart.test(text.slice(current.start, current.end)) ||
        /https?:|10\.\d{4}/u.test(text.slice(current.start, current.end)));
    if (continuation && current) current.end = end;
    else {
      current = { start, end };
      spans.push(current);
    }
  }
  return spans;
}

/** ISBN-10/13 validation and conversion, without altering the supplied value. */
function normalizedIsbn(raw: string): string | undefined {
  const value = raw.replace(/[\s-]/gu, "");
  if (/^\d{9}[\dX]$/iu.test(value)) {
    const sum = [...value].reduce(
      (total, digit, index) =>
        total +
        (digit.toUpperCase() === "X" ? 10 : Number(digit)) * (10 - index),
      0,
    );
    if (sum % 11 !== 0) return undefined;
    const prefix = "978" + value.slice(0, 9);
    const check =
      (10 -
        ([...prefix].reduce(
          (total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1),
          0,
        ) %
          10)) %
      10;
    return prefix + String(check);
  }
  if (
    /^97[89]\d{10}$/u.test(value) &&
    [...value].reduce(
      (total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1),
      0,
    ) %
      10 ===
      0
  )
    return value;
  return undefined;
}

function parse(text: string, span: Span): StructuredReference | null {
  const originalInput = text.slice(span.start, span.end);
  const contentOffset = entryMarker.exec(originalInput)?.[0].length ?? 0;
  const originalText = originalInput.slice(contentOffset);
  const csl: Csl = {};
  const fieldSources: Record<string, FieldSource> = {};
  function evidence(
    key: string,
    raw: string,
    offset: number,
    normalized?: string,
  ) {
    fieldSources[key] = {
      raw,
      span: {
        start: span.start + contentOffset + offset,
        end: span.start + contentOffset + offset + raw.length,
      },
      ...(normalized === undefined ? {} : { normalized }),
    };
  }
  function field(
    key: Exclude<keyof Csl, "author" | "issued">,
    raw: string,
    offset: number,
    normalized?: string,
  ) {
    csl[key] = raw;
    evidence(key, raw, offset, normalized);
  }
  const doi =
    /(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)?(10\.\d{4,9}\/[^\s]+?)(?=[.,;]?\s*$|\s)/iu.exec(
      originalText,
    );
  if (doi?.[1])
    field(
      "DOI",
      doi[1],
      doi.index + doi[0].indexOf(doi[1]),
      doi[1].toLowerCase(),
    );
  const url = /https?:\/\/[^\s]+/du.exec(originalText);
  if (url && !/^https?:\/\/(?:dx\.)?doi\.org\//iu.test(url[0])) {
    const value = url[0].replace(/[.,;]$/u, "");
    field("URL", value, url.index);
  }
  const isbn = /\bISBN(?:-1[03])?:?\s*([\dX][\dX -]+[\dX])/diu.exec(
    originalText,
  );
  if (isbn?.[1]) {
    const normalized = normalizedIsbn(isbn[1]);
    if (normalized) field("ISBN", isbn[1], isbn.indices![1]![0], normalized);
  }
  const issn = /\bISSN:?\s*(\d{4}-?\d{3}[\dX])/diu.exec(originalText);
  if (issn?.[1]) {
    const value = issn[1].replace("-", "");
    const sum = [...value].reduce(
      (total, digit, index) =>
        total +
        (digit.toUpperCase() === "X" ? 10 : Number(digit)) * (8 - index),
      0,
    );
    if (sum % 11 === 0) field("ISSN", issn[1], issn.indices![1]![0], value);
  }
  const pmid = /\bPMID:\s*(\d+)\b/diu.exec(originalText);
  if (pmid?.[1]) field("PMID", pmid[1], pmid.indices![1]![0]);
  const pmcid = /\bPMCID:\s*(PMC\d+)\b/diu.exec(originalText);
  if (pmcid?.[1]) field("PMCID", pmcid[1], pmcid.indices![1]![0]);
  const yearText = originalText.replace(
    /https?:\/\/[^\s]+|10\.\d{4,9}\/[^\s]+/gu,
    (value) => " ".repeat(value.length),
  );
  const year = date.exec(yearText);
  if (year) {
    csl.issued = { literal: year[0] };
    evidence("issued", year[0], year.index);
  }
  let authorsTruncated: boolean | undefined;
  function authors(
    raw: string,
    offset: number,
    syntax: AuthorSyntax = "family-given",
  ) {
    const truncation = /(?:et al\.|u\.\s*a\.)/du.exec(raw);
    if (truncation) {
      authorsTruncated = true;
      evidence("authorsTruncated", truncation[0], offset + truncation.index);
      raw = raw.slice(0, truncation.index).replace(/[,\s]+$/u, "");
    }
    // Initial punctuation can also delimit the author sentence in Chicago/MLA.
    if (
      /,(?:\s*[\p{Lu}]\.)*\s*[\p{Lu}]$/u.test(raw) &&
      originalText[offset + raw.length] === "."
    )
      raw += ".";
    if (!raw.trim()) return;
    evidence("author", raw, offset);
    if (
      /\b(?:Organization|Organisation|Council|University|Universität|Institute|Institut|Association|Society|Gesellschaft|GmbH|Inc|Ltd)\b/u.test(
        raw,
      )
    ) {
      csl.author = [{ literal: raw }];
      evidence("author.0.literal", raw, offset);
      return;
    }
    const names: Name[] = [];
    let cursor = 0;
    const authorSyntax = authorSyntaxes[syntax];
    for (const part of authorSyntax.split(raw)) {
      const clean = part.trim().replace(/,$/u, "");
      if (!clean) continue;
      const position = raw.indexOf(clean, cursor);
      cursor = position + clean.length;
      const person = authorSyntax.person.exec(clean);
      const index = names.length;
      if (person?.[1] && person[2]) {
        const { familyGroup, givenGroup } = authorSyntax;
        const family = person[familyGroup]!;
        const given = person[givenGroup]!.trimEnd();
        names.push({ family, given });
        evidence(
          `author.${index}.family`,
          family,
          offset + position + person.indices![familyGroup]![0],
        );
        evidence(
          `author.${index}.given`,
          given,
          offset + position + person.indices![givenGroup]![0],
        );
      } else {
        // Unmarked names are retained literally; never invent family/given parts.
        names.push({ literal: clean });
        evidence(`author.${index}.literal`, clean, offset + position);
      }
    }
    if (names.length) csl.author = names;
  }
  function take(
    key: Exclude<keyof Csl, "author" | "issued">,
    match: RegExpExecArray,
    group: number | string,
    base: number,
  ) {
    const value =
      typeof group === "number" ? match[group] : match.groups?.[group];
    const indices =
      typeof group === "number"
        ? match.indices?.[group]
        : match.indices?.groups?.[group];
    if (value && indices) field(key, value, base + indices[0]);
  }
  // Recognize numeric/note openings before scanning early author-date layouts.
  // A late publication date must not turn a title or container into authors.
  let bodyOffset: number | undefined;
  let layout: Layout | undefined;
  const ieee = ieeeAuthors.exec(originalText);
  if (ieee?.[1]) {
    authors(ieee[1], 0, "initial-first");
    bodyOffset = ieee[0].length;
    layout = "ieee";
  }
  const medical = compactAuthors.exec(originalText);
  if (medical?.[1]) {
    const rawAuthors = medical[0].trimEnd();
    authors(
      rawAuthors.endsWith("et al.") ? rawAuthors : medical[1],
      0,
      "compact",
    );
    bodyOffset = medical[0].length;
    layout = "medical";
  }
  const acs = acsAuthors.exec(originalText);
  if (
    acs?.[1] &&
    (/\b[12]\d{3}[a-z]?,\s*\d+(?:\s*\([^)]+\))?,\s*(?:\d|e\d)/u.test(
      originalText,
    ) ||
      /;\s*[^:;]+:\s*[^,;]+,\s*[12]\d{3}[a-z]?\./u.test(originalText))
  ) {
    authors(acs[1], 0);
    bodyOffset = acs[0].length;
    layout = "acs";
  }
  const springer = springerAuthors.exec(originalText);
  if (springer?.[1]) {
    authors(springer[1], 0);
    bodyOffset = springer[0].length;
    layout = "springer";
  }
  const oxford = oxfordOpening(originalText);
  if (bodyOffset === undefined && oxford?.[1]) {
    authors(oxford[1], 0);
    bodyOffset = oxford[0].length;
    layout = "oxford";
  }
  if (bodyOffset === undefined && year) {
    const prefix = originalText.slice(0, year.index);
    const suffix = originalText.slice(year.index + year[0].length);
    const authorLike = /^[\p{L}\p{M}\s.,’'&-]+$/u.test(
      prefix.replace(/\s*\(\s*$/u, ""),
    );
    if (authorLike && /\(\s*$/u.test(prefix) && /^\)\.?\s+/u.test(suffix)) {
      const authorText = prefix.replace(/\s*\(\s*$/u, "");
      authors(authorText, 0);
      bodyOffset =
        year.index + year[0].length + /^\)\.?\s+/u.exec(suffix)![0].length;
      layout = "early-date";
    } else if (
      authorLike &&
      /,\s+$/u.test(prefix) &&
      /^\.\s+/u.test(suffix) &&
      /^[\p{L}\p{M}’' -]+,\s*[\p{L}\p{M}’' -]+/u.test(prefix)
    ) {
      authors(prefix.replace(/,\s+$/u, ""), 0);
      bodyOffset =
        year.index + year[0].length + /^\.\s+/u.exec(suffix)![0].length;
      layout = "iso";
    } else if (authorLike && /\.\s+$/u.test(prefix) && /^\.\s+/u.test(suffix)) {
      authors(prefix.replace(/\.\s+$/u, ""), 0);
      bodyOffset =
        year.index + year[0].length + /^\.\s+/u.exec(suffix)![0].length;
      layout = "early-date";
    }
  }
  if (bodyOffset === undefined) {
    const opening =
      /^([\p{L}\p{M}'’ -]+,\s*[\p{L}\p{M}.'’ -]+?)\.\s+(?=[“"‘']|[^,]+\.(?:\s|$))/du.exec(
        originalText,
      );
    if (opening?.[1]) {
      authors(opening[1], 0);
      bodyOffset = opening[0].length;
      layout = "mla";
    }
  }
  function publicationDate(match: RegExpExecArray, base: number) {
    const value = match.groups?.issued;
    const indices = match.indices?.groups?.issued;
    if (value && indices) {
      csl.issued = { literal: value };
      evidence("issued", value, base + indices[0]);
    }
  }
  if (layout && !["early-date", "iso", "mla"].includes(layout)) {
    // Dates in a title are not publication dates. Only the matched tail supplies one.
    delete csl.issued;
    delete fieldSources.issued;
  }
  if (bodyOffset !== undefined) {
    const body = originalText.slice(bodyOffset);
    const quoted = quotedTitle(body);
    const plain =
      layout === "oxford"
        ? /^(.+?)\s+(?=\([^():]+:\s*[^()]+,\s*[12]\d{3}[a-z]?\))/du.exec(body)
        : layout === "acs"
          ? /^(.+?)[.;](?:\s+|$)/du.exec(body)
          : /^(.+?)\.(?:\s+|$)/du.exec(body);
    // A known abbreviation or an initial is not a safe sentence delimiter.
    const ambiguous =
      plain?.[1] &&
      /(?:^|\s)(?:Dr|Prof|Mr|Mrs|Ms|St|Sr|Jr|\p{Lu})$/u.test(plain[1]);
    const title = closingQuotes[body[0] ?? ""]
      ? quoted
      : ambiguous
        ? null
        : plain;
    if (title?.[1]) {
      take("title", title, 1, bodyOffset);
      const restOffset = bodyOffset + title[0].length;
      const rest = originalText.slice(restOffset);
      const journal = journalPatterns[layout ?? "early-date"].exec(rest);
      if (journal) {
        publicationDate(journal, restOffset);
        take(
          (layout === "medical" &&
            /\b(?:J|Int|Arch|Med|Nat|Sci|Res|Am|Br|Eur)\b/u.test(
              journal.groups?.container ?? "",
            )) ||
            /\b(?:J|Int|Proc|Rev|Sci|Res|Med|Nat|Soc|Am|Br|Eur|Trans)\./u.test(
              journal.groups?.container ?? "",
            )
            ? "container-title-short"
            : "container-title",
          journal,
          "container",
          restOffset,
        );
        take("volume", journal, "volume", restOffset);
        take("issue", journal, "issue", restOffset);
        take(
          journal.groups?.pages?.startsWith("e") ? "article-number" : "page",
          journal,
          "pages",
          restOffset,
        );
      } else {
        const book = bookPatterns[layout ?? "early-date"].exec(rest);
        const mlaPublisher =
          layout === "mla"
            ? /^(.+?),\s*[12]\d{3}[a-z]?\.(?:\s|$)/du.exec(rest)
            : null;
        if (book) {
          publicationDate(book, restOffset);
          take("publisher-place", book, "place", restOffset);
          take("publisher", book, "publisher", restOffset);
        } else if (mlaPublisher) take("publisher", mlaPublisher, 1, restOffset);
        else if (layout === "early-date" && !quoted) {
          // APA book publisher: a single final sentence, with no journal or identifier syntax.
          const publisher = /^([^,:\r\n]+)\.\s*$/du.exec(rest);
          if (
            publisher &&
            !/https?:|doi:|ISBN|ISSN|PMID|PMCID|10\.\d{4}|\d+\s*\(/u.test(rest)
          )
            take("publisher", publisher, 1, restOffset);
        }
      }
    }
  }
  if (!year && !doi && !url && !isbn && !issn && !pmid && !pmcid && !csl.author)
    return null;
  return {
    originalText: originalInput,
    span,
    csl,
    fieldSources,
    ...(authorsTruncated ? { authorsTruncated } : {}),
    structuring: { path: "parser", version: "citation-styles/2" },
  };
}

export function createParser({
  referenceLimit = 1000,
}: { referenceLimit?: number } = {}): Structuring {
  return {
    structure(text) {
      const references: StructuredReference[] = [];
      const rejected: StructuringResult["rejected"] = [];
      for (const span of split(text)) {
        const reference = parse(text, span);
        if (reference) {
          references.push(reference);
          if (references.length > referenceLimit)
            throw new ReferenceLimitExceeded(referenceLimit);
        } else
          rejected.push({
            originalText: text.slice(span.start, span.end),
            span,
            reason: "no-reference-features",
          });
      }
      return {
        references,
        rejected,
        guidance: references.length ? null : "no-references",
        quotaConsumed: 0,
        referenceLimit,
      };
    },
  };
}
