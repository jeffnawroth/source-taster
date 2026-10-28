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
const heading =
  /^(?:references|bibliography|works cited|literatur(?:verzeichnis)?|quellen(?:verzeichnis)?)\s*:?$/iu;

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
      (authorTitleStart.test(trimmed) &&
        !/^[^,]+,\s*(?:vol|no|pp)\./iu.test(trimmed)) ||
      (lineDate &&
        /(?:\(|\.)\s*$/u.test(prefix) &&
        !/\b(?:vol|no|pp)\./iu.test(prefix));
    const adjacent =
      current && !/\r?\n\s*\r?\n/u.test(text.slice(current.end, start));
    const continuation =
      current &&
      adjacent &&
      !entryStart &&
      !heading.test(trimmed) &&
      !/^\d+$/u.test(trimmed) &&
      (date.test(text.slice(current.start, current.end)) ||
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
  const originalText = text.slice(span.start, span.end);
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
        start: span.start + offset,
        end: span.start + offset + raw.length,
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
  function authors(raw: string, offset: number) {
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
    for (const part of raw.split(
      /,?\s+(?:&|and|und)\s+|,\s*(?=[\p{L} -]+,)/u,
    )) {
      const clean = part.trim().replace(/,$/u, "");
      if (!clean) continue;
      const position = raw.indexOf(clean, cursor);
      cursor = position + clean.length;
      const person = /^([^,]+),\s*([^,]+)$/du.exec(clean);
      const index = names.length;
      if (person?.[1] && person[2]) {
        names.push({ family: person[1], given: person[2] });
        evidence(`author.${index}.family`, person[1], offset + position);
        evidence(
          `author.${index}.given`,
          person[2],
          offset + position + person.indices![2]![0],
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
    group: number,
    base: number,
  ) {
    const value = match[group];
    const indices = match.indices?.[group];
    if (value && indices) field(key, value, base + indices[0]);
  }
  // A date in parentheses identifies APA/Harvard. A date following an author
  // sentence identifies Chicago author-date. Late dates belong to MLA layouts.
  let bodyOffset: number | undefined;
  let layout: "early-date" | "mla" | undefined;
  if (year) {
    const prefix = originalText.slice(0, year.index);
    const suffix = originalText.slice(year.index + year[0].length);
    if (/\(\s*$/u.test(prefix) && /^\)\.?\s+/u.test(suffix)) {
      const authorText = prefix.replace(/\s*\(\s*$/u, "");
      authors(authorText, 0);
      bodyOffset =
        year.index + year[0].length + /^\)\.?\s+/u.exec(suffix)![0].length;
      layout = "early-date";
    } else if (/\.\s+$/u.test(prefix) && /^\.\s+/u.test(suffix)) {
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
  if (bodyOffset !== undefined) {
    const body = originalText.slice(bodyOffset);
    const quoted = /^[“"‘']([^”"’']+?)[.]?[”"’'][,.]?\s*/du.exec(body);
    const plain = /^(.+?)\.(?:\s+|$)/du.exec(body);
    // A known abbreviation or an initial is not a safe sentence delimiter.
    const ambiguous =
      plain?.[1] &&
      /(?:^|\s)(?:Dr|Prof|Mr|Mrs|Ms|St|Sr|Jr|\p{Lu})$/u.test(plain[1]);
    const title = quoted ?? (ambiguous ? null : plain);
    if (title?.[1]) {
      take("title", title, 1, bodyOffset);
      const restOffset = bodyOffset + title[0].length;
      const rest = originalText.slice(restOffset);
      const journal =
        layout === "mla"
          ? /^(.+?),\s*vol\.\s*(\d+),\s*(?:no\.\s*([^,]+),\s*)?(?:[12]\d{3}[a-z]?),\s*pp\.\s*(\d+[–-]\d+|e\d+)/du.exec(
              rest,
            )
          : /^([^,\r\n]+?),?\s+(\d+)(?:\s*\(([^)]+)\))?[:,]\s*(?:pp\.\s*)?(\d+[–-]\d+|e\d+)/du.exec(
              rest,
            );
      if (journal) {
        take(
          /\b(?:J|Int|Proc|Rev|Sci|Res|Med|Nat|Soc|Am|Br|Eur)\./u.test(
            journal[1] ?? "",
          )
            ? "container-title-short"
            : "container-title",
          journal,
          1,
          restOffset,
        );
        take("volume", journal, 2, restOffset);
        take("issue", journal, 3, restOffset);
        take(
          journal[4]?.startsWith("e") ? "article-number" : "page",
          journal,
          4,
          restOffset,
        );
      } else {
        const book = /^([^.:\r\n]+):\s*([^\r\n]+?)\.(?:\s|$)/du.exec(rest);
        const mlaPublisher =
          layout === "mla"
            ? /^(.+?),\s*[12]\d{3}[a-z]?\.(?:\s|$)/du.exec(rest)
            : null;
        if (book) {
          take("publisher-place", book, 1, restOffset);
          take("publisher", book, 2, restOffset);
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
    originalText,
    span,
    csl,
    fieldSources,
    ...(authorsTruncated ? { authorsTruncated } : {}),
    structuring: { path: "parser", version: "author-date/1" },
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
