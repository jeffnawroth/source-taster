// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Csl, Name } from "@source-taster/core";
import type { ExportReference, ReferenceExporter } from "./references.ts";
// Traditional BibTeX in UTF-8: preserve Unicode and escape TeX syntax only.
function escape(value: string): string {
  return value
    .replace(/[\\{}$&#%_~^]/gu, (character) => {
      if (character === "\\") return "\\textbackslash{}";
      if (character === "~") return "\\textasciitilde{}";
      if (character === "^") return "\\textasciicircum{}";
      return `\\${character}`;
    })
    .replace(/[\r\n\t]+/gu, " ");
}
function name(author: Name): string {
  if (author.literal) return `{${escape(author.literal)}}`;
  const family = [author["non-dropping-particle"], author.family]
    .filter(Boolean)
    .join(" ");
  return family
    ? [escape(family), author.given ? escape(author.given) : null]
        .filter(Boolean)
        .join(", ")
    : `{${escape(author.given ?? "")}}`;
}
const types: Readonly<Record<string, string>> = {
  "article-journal": "article",
  "article-magazine": "article",
  "article-newspaper": "article",
  article: "article",
  book: "book",
  chapter: "incollection",
  "entry-dictionary": "incollection",
  "entry-encyclopedia": "incollection",
  "paper-conference": "inproceedings",
  thesis: "phdthesis",
  report: "techreport",
};
const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
export function bibtexFields(
  csl: Csl,
  truncated?: boolean,
): [string, string][] {
  const pairs: [string, string | undefined][] = [
    [
      "author",
      csl.author?.map(name).join(" and ") + (truncated ? " and others" : ""),
    ],
    ["title", csl.title ? `{${escape(csl.title)}}` : undefined],
  ];
  if (!csl.author?.length) pairs.shift();
  const type = csl.type ?? "";
  const container = [
    "chapter",
    "paper-conference",
    "entry-dictionary",
    "entry-encyclopedia",
  ].includes(type)
    ? "booktitle"
    : "journal";
  const mapping: [string, string | undefined][] = [
    [container, csl["container-title"] ?? csl["container-title-short"]],
    ["volume", csl.volume],
    ["number", csl.issue],
    ["pages", csl.page],
    [
      type === "thesis"
        ? "school"
        : type === "report"
          ? "institution"
          : "publisher",
      csl.publisher,
    ],
    ["address", csl["publisher-place"]],
    ["edition", csl.edition],
    ["doi", csl.DOI],
    ["url", csl.URL],
    ["isbn", csl.ISBN],
    ["issn", csl.ISSN],
  ];
  pairs.push(
    ...mapping.map(([key, value]): [string, string | undefined] => [
      key,
      value === undefined ? undefined : escape(value),
    ]),
  );
  const date = csl.issued?.literal.match(/^(\d{4})(?:-(\d{2}))?(?:-\d{2})?$/u);
  if (date) {
    pairs.push(["year", date[1]]);
    if (date[2]) pairs.push(["month", months[Number(date[2]) - 1]]);
  }
  const notes = [
    csl.issued && !date ? csl.issued.literal : null,
    csl["article-number"] ? `Article number: ${csl["article-number"]}` : null,
    csl.arXiv ? `arXiv: ${csl.arXiv}` : null,
    csl.PMID ? `PMID: ${csl.PMID}` : null,
    csl.PMCID ? `PMCID: ${csl.PMCID}` : null,
  ]
    .filter(Boolean)
    .join("; ");
  if (notes) pairs.push(["note", escape(notes)]);
  return pairs.filter(
    (pair): pair is [string, string] => pair[1] !== undefined && pair[1] !== "",
  );
}
function importedKey(original: string): string | undefined {
  // Do not write unsupported imported fields back. Their values remain in the
  // unchanged original input, exported separately by the CSL-JSON adapter.
  for (const match of original.matchAll(
    /@([a-z]+)\s*[{(]\s*([^\s,{}()=\\#%"']+)\s*,/giu,
  )) {
    if (["comment", "string", "preamble"].includes(match[1]!.toLowerCase()))
      continue;
    const line = original.slice(
      original.lastIndexOf("\n", match.index - 1) + 1,
      match.index,
    );
    if (!/(?:^|[^\\])(?:\\\\)*%/u.test(line)) return match[2];
  }
  return undefined;
}
export const bibtex: ReferenceExporter = {
  format: "bibtex",
  contentType: "application/x-bibtex; charset=utf-8",
  filename: "source-taster-references.bib",
  serialize(references: readonly ExportReference[]) {
    const reserved = new Set(
      references
        .map((reference) => importedKey(reference.originalText))
        .filter(Boolean),
    );
    return (
      references
        .map((reference) => {
          let key = importedKey(reference.originalText);
          if (!key) {
            key = `source-taster-${reference.id.replace(/[^a-zA-Z0-9-]/gu, "-")}`;
            while (reserved.has(key)) key += "-export";
            reserved.add(key);
          }
          const sourceType = reference.fields.type ?? "";
          const type = Object.hasOwn(types, sourceType)
            ? types[sourceType]
            : "misc";
          const body = bibtexFields(
            reference.fields,
            reference.authorsTruncated,
          )
            .map(([field, value]) => `  ${field} = {${value}}`)
            .join(",\n");
          return `@${type}{${key},\n${body}\n}`;
        })
        .join("\n\n") + "\n"
    );
  },
};
