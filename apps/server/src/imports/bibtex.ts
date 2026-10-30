// SPDX-License-Identifier: AGPL-3.0-or-later
import { BibLatexParser, CSLExporter } from "bibliojson";
import {
  ReferenceLimitExceeded,
  type Csl,
  type StructuredReference,
} from "@source-taster/core";
import type { ImportResult } from "@source-taster/contract-verification/import";
import { StructuredCsl } from "@source-taster/contract-verification/v2";
import { bibtexFields } from "../exports/bibtex.ts";
import { applyEdits, type LibraryImporter, type TextEdit } from "./library.ts";
// Owned BibTeX/BibLaTeX entry-type table (ADR-0011). Unlisted types such as
// misc keep no CSL type and therefore take the article route.
const types: Readonly<Record<string, string>> = {
  article: "article-journal",
  book: "book",
  mvbook: "book",
  bookinbook: "book",
  collection: "book",
  mvcollection: "book",
  proceedings: "book",
  mvproceedings: "book",
  reference: "book",
  mvreference: "book",
  inbook: "chapter",
  incollection: "chapter",
  suppbook: "chapter",
  suppcollection: "chapter",
  inreference: "entry-encyclopedia",
  inproceedings: "paper-conference",
  conference: "paper-conference",
  thesis: "thesis",
  phdthesis: "thesis",
  mastersthesis: "thesis",
  report: "report",
  techreport: "report",
  manual: "report",
  booklet: "pamphlet",
  periodical: "periodical",
  suppperiodical: "article-journal",
  review: "review",
  online: "webpage",
  electronic: "webpage",
  www: "webpage",
  dataset: "dataset",
  software: "software",
  patent: "patent",
  standard: "standard",
  unpublished: "manuscript",
  letter: "personal_communication",
  legislation: "legislation",
  jurisdiction: "legal_case",
  video: "motion_picture",
  movie: "motion_picture",
  audio: "song",
  music: "musical_score",
  artwork: "graphic",
  image: "graphic",
  performance: "performance",
};
/** A record owns its entry plus the text up to the next entry (comments, blank lines). */
export interface RawRecord {
  start: number;
  end: number;
  bodyStart: number;
  bodyEnd: number;
  malformed: boolean;
}
/** Lexical envelope only; field/name/TeX interpretation belongs to BiblioJSON. */
export function bibRecords(text: string): RawRecord[] {
  const records: RawRecord[] = [];
  const starts = [...text.matchAll(/@([a-z]+)\s*[{(]/giu)];
  let consumed = 0;
  for (const [index, match] of starts.entries()) {
    const start = match.index;
    if (start < consumed) continue;
    const open = text[start + match[0].length - 1];
    const close = open === "{" ? "}" : ")";
    let depth = 1,
      braces = 0,
      quoted = false,
      end = start + match[0].length;
    for (; end < text.length; end++) {
      const char = text[end];
      if (char === "\\") {
        end++;
        continue;
      }
      if (char === "%" && !quoted) {
        while (end < text.length && text[end] !== "\n") end++;
        continue;
      }
      if (open === "(") {
        if (char === "{") braces++;
        if (char === "}") braces--;
        if (!braces && char === '"') quoted = !quoted;
        if (!braces && !quoted && char === close) {
          depth = 0;
          break;
        }
      } else {
        if (char === "{") depth++;
        if (char === "}") depth--;
        if (depth === 0) break;
      }
    }
    const malformed = depth !== 0;
    end = malformed ? (starts[index + 1]?.index ?? text.length) : end + 1;
    const kind = match[1]?.toLowerCase() ?? "";
    if (["comment", "string", "preamble"].includes(kind) && !malformed) {
      consumed = end;
      continue;
    }
    records.push({
      start: records.length ? start : 0,
      end,
      bodyStart: start,
      bodyEnd: end,
      malformed,
    });
    consumed = end;
  }
  for (let i = 0; i < records.length; i++)
    records[i]!.end = records[i + 1]?.start ?? text.length;
  return records;
}
export interface BibField {
  name: string;
  nameStart: number;
  valueStart: number;
  valueEnd: number;
  /** Offset after the field's separating comma, if it has one. */
  commaEnd?: number;
}
/**
 * Field spans of one well-formed entry, relative to `entry`. Values are kept
 * as written (braces, quotes, macros and `#` concatenation).
 */
export function bibFields(entry: string): {
  fields: BibField[];
  close: number;
} {
  const fields: BibField[] = [];
  const open = entry.search(/[{(]/u);
  const closing = entry[open] === "(" ? ")" : "}";
  let at = entry.indexOf(",", open);
  if (at < 0) return { fields, close: entry.lastIndexOf(closing) };
  at++;
  const space = () => {
    for (;;) {
      while (at < entry.length && /\s/u.test(entry[at]!)) at++;
      if (entry[at] !== "%") return;
      while (at < entry.length && entry[at] !== "\n") at++;
    }
  };
  // One value part: {braced}, "quoted" (braces nest inside) or a bare token.
  const value = () => {
    const first = entry[at];
    if (first !== "{" && first !== '"') {
      while (at < entry.length && /[^\s,#{}()"]/u.test(entry[at]!)) at++;
      return;
    }
    let depth = 0;
    if (first === '"') at++;
    for (; at < entry.length; at++) {
      const char = entry[at];
      if (char === "\\") at++;
      else if (char === "{") depth++;
      else if (char === "}" && --depth === 0 && first === "{") break;
      else if (char === '"' && depth === 0 && first === '"') break;
    }
    at++;
  };
  for (;;) {
    space();
    if (at >= entry.length || entry[at] === closing) break;
    const name = /^[^\s=,{}()"#%]+/u.exec(entry.slice(at))?.[0];
    if (!name) break;
    const nameStart = at;
    at += name.length;
    space();
    if (entry[at] !== "=") break;
    at++;
    space();
    const valueStart = at;
    let valueEnd = at;
    for (;;) {
      value();
      valueEnd = at;
      space();
      if (entry[at] !== "#") break;
      at++;
      space();
    }
    const field: BibField = {
      name: name.toLowerCase(),
      nameStart,
      valueStart,
      valueEnd,
    };
    fields.push(field);
    if (entry[at] === ",") field.commaEnd = ++at;
  }
  return { fields, close: entry.lastIndexOf(closing) };
}
function plain(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(plain).join("");
  if (value && typeof value === "object" && "text" in value)
    return String(value.text);
  return JSON.stringify(value);
}
const textFields = [
  ["title", "title"],
  ["journaltitle", "container-title"],
  ["booktitle", "container-title"],
  ["publisher", "publisher"],
  ["location", "publisher-place"],
] as const;
// Traditional names #87 writes, and the BibLaTeX spellings they replace.
const aliases: Readonly<Record<string, readonly string[]>> = {
  journal: ["journal", "journaltitle"],
  booktitle: ["booktitle"],
  address: ["address", "location"],
};
/** Patches changed fields in place; untouched fields, comments and spacing stay. */
function patchBibtex(originalText: string, changes: Csl, imported: Csl) {
  const record = bibRecords(originalText).find((entry) => !entry.malformed);
  if (!record) return originalText;
  const offset = record.bodyStart;
  const entry = originalText.slice(record.bodyStart, record.bodyEnd);
  const { fields, close } = bibFields(entry);
  const find = (name: string) =>
    fields.find((field) => (aliases[name] ?? [name]).includes(field.name));
  const edits: TextEdit[] = [];
  const inserted: [string, string][] = [];
  const set = (name: string, value: string) => {
    const field = find(name);
    if (field)
      edits.push({
        start: offset + field.valueStart,
        end: offset + field.valueEnd,
        text: value,
      });
    else inserted.push([name, value]);
  };
  for (const key of Object.keys(changes) as (keyof Csl)[]) {
    // No traditional field carries these without overwriting a user's note.
    if (["container-title-short", "article-number", "arXiv", "PMID", "PMCID"].includes(key))
      continue;
    if (key === "issued") {
      const literal = changes.issued?.literal ?? "";
      const date = find("date");
      if (date) {
        set("date", `{${literal}}`);
        continue;
      }
      const iso = /^(\d{4})(?:-(\d{2}))?(?:-\d{2})?$/u.exec(literal);
      if (!iso) continue;
      set("year", `{${iso[1]}}`);
      const month = find("month");
      if (iso[2])
        set("month", bibtexFields({ issued: { literal } }).find(([n]) => n === "month")?.[1] ?? iso[2]);
      else if (month)
        edits.push(remove(entry, offset, month));
      continue;
    }
    for (const [name, value] of bibtexFields({ type: imported.type, [key]: changes[key] }))
      if (name !== "note") set(name, `{${value}}`);
  }
  if (inserted.length) edits.push(...insert(entry, offset, fields, close, inserted));
  return applyEdits(originalText, edits);
}
function remove(entry: string, offset: number, field: BibField): TextEdit {
  let start = field.nameStart;
  let end = field.commaEnd ?? field.valueEnd;
  const lineStart = entry.lastIndexOf("\n", start - 1) + 1;
  if (!entry.slice(lineStart, start).trim()) {
    const after = /^[ \t]*\r?\n/u.exec(entry.slice(end));
    if (after) {
      start = lineStart;
      end += after[0].length;
    }
  }
  return { start: offset + start, end: offset + end, text: "" };
}
function insert(
  entry: string,
  offset: number,
  fields: BibField[],
  close: number,
  inserted: [string, string][],
): TextEdit[] {
  const eol = entry.includes("\r\n") ? "\r\n" : "\n";
  const first = fields[0];
  const firstLine = first ? entry.lastIndexOf("\n", first.nameStart - 1) + 1 : 0;
  const indent =
    first && !entry.slice(firstLine, first.nameStart).trim()
      ? entry.slice(firstLine, first.nameStart)
      : "  ";
  const lines = inserted.map(([name, value]) => `${name} = ${value}`);
  const last = fields.at(-1);
  const edits: TextEdit[] = [];
  const closeLine = entry.lastIndexOf("\n", close - 1) + 1;
  if (closeLine > 0 && !entry.slice(closeLine, close).trim()) {
    if (last && !last.commaEnd)
      edits.push({ start: offset + last.valueEnd, end: offset + last.valueEnd, text: "," });
    const block = last?.commaEnd
      ? lines.map((line) => `${indent}${line},${eol}`).join("")
      : lines.map((line) => indent + line).join(`,${eol}`) + eol;
    edits.push({ start: offset + closeLine, end: offset + closeLine, text: block });
  } else {
    const prefix = !last || last.commaEnd ? " " : ", ";
    edits.push({ start: offset + close, end: offset + close, text: prefix + lines.join(", ") });
  }
  return edits;
}
export const bibtexImporter: LibraryImporter = {
  patch: patchBibtex,
  parse(text, referenceLimit): ImportResult {
    const records = bibRecords(text);
    if (records.length > referenceLimit)
      throw new ReferenceLimitExceeded(referenceLimit);
    // One parse of the whole library resolves @string macros and crossrefs.
    // Malformed records are blanked (offsets kept) so they cannot leak into
    // their neighbours.
    const safe = records.reduceRight(
      (all, record) =>
        record.malformed
          ? all.slice(0, record.bodyStart) +
            all.slice(record.bodyStart, record.end).replace(/[^\r\n]/gu, " ") +
            all.slice(record.end)
          : all,
      text,
    );
    const parser = new BibLatexParser(safe, {
      includeRawText: true,
      includeLocation: true,
      processUnknown: true,
      processUnexpected: true,
      processComments: true,
    });
    parser.parse();
    const csl = new CSLExporter(parser.bibDB).parse();
    // BiblioJSON's offsets drift after skipped whitespace, so records pair
    // with entries in order by their raw text (duplicate keys stay distinct).
    const entries = Object.entries(parser.bibDB);
    const matched = new Map<RawRecord, { id: string; entry: (typeof entries)[number][1] }>();
    let cursor = 0;
    for (const record of records) {
      if (record.malformed) continue;
      const body = text.slice(record.bodyStart, record.bodyEnd).trim();
      const index = entries.findIndex(
        ([, entry], i) => i >= cursor && entry.raw_text?.trim() === body,
      );
      if (index < 0) continue;
      const [id, entry] = entries[index]!;
      matched.set(record, { id, entry });
      cursor = index + 1;
    }
    const failed = new Set(
      parser.errors.flatMap((error) =>
        [error.entry, error.key].filter(Boolean),
      ),
    );
    const references: StructuredReference[] = [];
    const rejected: ImportResult["rejected"] = [];
    for (const record of records) {
      const originalText = text.slice(record.start, record.end);
      const span = { start: record.start, end: record.end };
      const found = matched.get(record);
      if (
        record.malformed ||
        !found ||
        found.entry.incomplete ||
        failed.has(found.entry.entry_key)
      ) {
        rejected.push({ originalText, span, reason: "malformed-record" });
        continue;
      }
      const { id, entry } = found;
      const item = (csl[id] ?? {}) as Record<string, unknown>;
      const fields: Csl = StructuredCsl.parse({
        ...item,
        type: undefined,
        issued: undefined,
      });
      const type = entry.bib_type.toLowerCase();
      if (Object.hasOwn(types, type)) fields.type = types[type];
      for (const [from, to] of textFields)
        if (entry.fields[from]) fields[to] = plain(entry.fields[from]);
      const issued = item.issued as
        | { "date-parts"?: number[][]; literal?: string }
        | undefined;
      const parts = issued?.["date-parts"]?.[0];
      if (parts)
        fields.issued = {
          literal: parts
            .map((n, i) => (i ? String(n).padStart(2, "0") : String(n)))
            .join("-"),
        };
      else if (issued?.literal) fields.issued = { literal: issued.literal };
      references.push({
        originalText,
        span,
        csl: fields,
        fieldSources: Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [
            key,
            { raw: typeof value === "string" ? value : JSON.stringify(value) },
          ]),
        ),
        structuring: { path: "parser", version: "bibliojson-4.1.0" },
        imported: {
          format: "bibtex",
          unsupported: Object.entries({
            ...entry.unknown_fields,
            ...entry.unexpected_fields,
          }).map(([name, value]) => ({ name, value: plain(value) })),
          fields,
        },
      });
    }
    if (!records.length)
      rejected.push({
        originalText: text,
        span: { start: 0, end: text.length },
        reason: "malformed-record",
      });
    return { references, rejected, quotaConsumed: 0, referenceLimit };
  },
};
