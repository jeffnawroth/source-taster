// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  ReferenceLimitExceeded,
  type Csl,
  type Name,
  type StructuredReference,
} from "@source-taster/core";
import type { ImportResult } from "@source-taster/contract-verification/import";
import { applyEdits, type LibraryImporter, type TextEdit } from "./library.ts";
// RIS type vocabulary shared by Zotero, Citavi and EndNote dialects. Unknown
// types remain unknown (the normal article fallback); known unsupported types
// retain their CSL type so search cannot silently claim coverage.
const types: Readonly<Record<string, string>> = {
  JOUR: "article-journal",
  JFULL: "article-journal",
  EJOUR: "article-journal",
  MGZN: "article-magazine",
  NEWS: "article-newspaper",
  ABST: "article",
  INPR: "article",
  BOOK: "book",
  EBOOK: "book",
  CHAP: "chapter",
  ECHAP: "chapter",
  CONF: "paper-conference",
  CPAPER: "paper-conference",
  THES: "thesis",
  RPRT: "report",
  ELEC: "webpage",
  WEB: "webpage",
  BLOG: "post-weblog",
  DBASE: "dataset",
  DATA: "dataset",
  COMP: "software",
  DICT: "entry-dictionary",
  ENCYC: "entry-encyclopedia",
  STAND: "standard",
  PAT: "patent",
  STAT: "legislation",
  BILL: "bill",
  CASE: "legal_case",
  HEAR: "hearing",
  UNPB: "manuscript",
  PCOMM: "personal_communication",
  ICOMM: "personal_communication",
  INTV: "interview",
  ADVS: "motion_picture",
  VIDEO: "motion_picture",
  MPCT: "motion_picture",
  SOUND: "song",
  MUSIC: "musical_score",
  ART: "graphic",
  FIGURE: "figure",
  MAP: "map",
  SLIDE: "speech",
  GEN: "document",
  SER: "periodical",
};
/** Tags in reading priority; the last entry is written when a field is added. */
const tagged: readonly [keyof Csl, readonly string[], string?][] = [
  ["title", ["TI", "T1", "CT"]],
  ["container-title", ["JF", "JO", "T2"], "T2"],
  ["container-title-short", ["JA", "J2"], "J2"],
  ["publisher", ["PB"]],
  ["publisher-place", ["CY", "PP"]],
  ["volume", ["VL"]],
  ["issue", ["IS"]],
  ["edition", ["ET"]],
  ["article-number", ["C7"]],
  ["DOI", ["DO"]],
  ["URL", ["UR", "L1"]],
];
const serialTypes = ["book", "chapter"];
const dateTags = ["DA", "Y1", "PY"];
export interface RisField {
  tag: string;
  value: string;
  /** Line start, and the end including continuation lines and line ending. */
  start: number;
  end: number;
  valueStart: number;
  valueEnd: number;
}
export function risFields(text: string): RisField[] {
  const fields: RisField[] = [];
  for (const line of text.matchAll(/[^\r\n]*(?:\r\n|\n|\r|$)/gu)) {
    if (!line[0]) continue;
    const content = line[0].replace(/(?:\r\n|\n|\r)$/u, "");
    const match = /^(?:\uFEFF)?([A-Z0-9]{2}) {2}-[ \t]?(.*)$/u.exec(content);
    const last = fields.at(-1);
    if (match) {
      const valueStart = line.index + content.length - match[2]!.length;
      fields.push({
        tag: match[1]!,
        value: match[2]!,
        start: line.index,
        end: line.index + line[0].length,
        valueStart,
        valueEnd: line.index + content.length,
      });
    } else if (last && !["TY", "ER"].includes(last.tag)) {
      // Dialects wrap long values with or without indentation.
      last.value += " " + content.trim();
      last.end = line.index + line[0].length;
      last.valueEnd = line.index + content.length;
    }
  }
  return fields;
}
function person(raw: string): Name {
  const parts = raw.split(",").map((part) => part.trim());
  if (parts.length !== 2 || !parts[1]) return { literal: raw };
  const particle =
    /^((?:(?:van|von|de|der|den|del|della|da|di|la|le)\s+)+)(.+)$/u.exec(
      parts[0]!,
    );
  return {
    family: particle?.[2] ?? parts[0],
    given: parts[1],
    ...(particle ? { "non-dropping-particle": particle[1]!.trim() } : {}),
  };
}
function risName(name: Name): string {
  if (name.literal) return name.literal;
  const family = [name["non-dropping-particle"], name.family]
    .filter(Boolean)
    .join(" ");
  return name.given ? `${family}, ${name.given}` : family;
}
function projection(fields: RisField[]) {
  const values = (...tags: string[]) =>
    fields.filter((field) => tags.includes(field.tag)).map((f) => f.value);
  const first = (...tags: string[]) =>
    tags.map((tag) => values(tag)[0]).find(Boolean);
  const csl: Csl = {};
  const supported = new Set(["TY", "ER"]);
  const type = first("TY");
  if (type && Object.hasOwn(types, type)) csl.type = types[type];
  for (const [key, tags] of tagged) {
    const value = first(...tags);
    if (!value) continue;
    Object.assign(csl, { [key]: value });
    tags.forEach((tag) => supported.add(tag));
  }
  const names = values("AU").length ? values("AU") : values("A1");
  if (names.length) {
    csl.author = names.map(person);
    supported.add("AU");
    supported.add("A1");
  }
  // EndNote/Citavi put the full date in DA or Y1; PY is often the year only.
  const dates = values(...dateTags)
    .map((date) => /^(\d{4})(?:[-/](\d{1,2}))?(?:[-/](\d{1,2}))?/u.exec(date))
    .filter((match) => match !== null)
    .sort((a, b) => b.filter(Boolean).length - a.filter(Boolean).length);
  if (dates[0]) {
    csl.issued = {
      literal: dates[0]
        .slice(1)
        .filter(Boolean)
        .map((part, i) => (i ? part.padStart(2, "0") : part))
        .join("-"),
    };
    dateTags.forEach((tag) => supported.add(tag));
  }
  const start = first("SP"),
    end = first("EP");
  if (start) {
    csl.page = end ? `${start}-${end}` : start;
    supported.add("SP");
    supported.add("EP");
  }
  const serial = first("SN");
  if (serial) {
    if (serialTypes.includes(csl.type ?? "")) csl.ISBN = serial;
    else csl.ISSN = serial;
    supported.add("SN");
  }
  return {
    csl,
    unsupported: fields
      .filter((field) => !supported.has(field.tag))
      .map((field) => ({ name: field.tag, value: field.value })),
  };
}
/** Patches changed fields line by line; every other line stays as written. */
function patchRis(originalText: string, changes: Csl, imported: Csl) {
  const fields = risFields(originalText);
  const eol = /\r\n|\n|\r/u.exec(originalText)?.[0] ?? "\n";
  const end = fields.find((field) => field.tag === "ER");
  if (!end) return originalText;
  const edits: TextEdit[] = [];
  const line = (tag: string, value: string) => `${tag}  - ${value}${eol}`;
  const find = (...tags: string[]) =>
    tags.map((tag) => fields.find((field) => field.tag === tag)).find(Boolean);
  const set = (
    tags: readonly string[],
    value: string,
    options: { after?: RisField; tag?: string } = {},
  ) => {
    const field = find(...tags);
    if (field)
      edits.push({ start: field.valueStart, end: field.valueEnd, text: value });
    else {
      const at = options.after?.end ?? end.start;
      const tag = options.tag ?? tags[0]!;
      edits.push({ start: at, end: at, text: line(tag, value) });
    }
  };
  if (changes.type) {
    const kind = Object.entries(types).find(
      ([, csl]) => csl === changes.type,
    )?.[0];
    if (kind) set(["TY"], kind);
  }
  for (const [key, tags, tag] of tagged) {
    const value = changes[key];
    if (typeof value === "string") set(tags, value, { tag });
  }
  if (changes.author) {
    const names = fields.filter((field) => ["AU", "A1"].includes(field.tag));
    const tag = names[0]?.tag ?? "AU";
    const text = changes.author
      .map((name) => line(tag, risName(name)))
      .join("");
    const [first, ...rest] = names;
    edits.push({
      start: first?.start ?? end.start,
      end: first?.end ?? end.start,
      text,
    });
    rest.forEach((field) =>
      edits.push({ start: field.start, end: field.end, text: "" }),
    );
  }
  const iso = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/u.exec(
    changes.issued?.literal ?? "",
  );
  if (iso) {
    // RIS dates: PY is the year; DA/Y1 are YYYY/MM/DD/ with empty parts.
    const full = `${iso[1]}/${iso[2] ?? ""}/${iso[3] ?? ""}/`;
    const year = find("PY");
    set(["PY"], iso[1]!);
    for (const tag of ["DA", "Y1"]) {
      const field = find(tag);
      if (field)
        edits.push({
          start: field.valueStart,
          end: field.valueEnd,
          text: full,
        });
    }
    if (iso[2] && !find("DA", "Y1")) set(["DA"], full, { after: year });
  }
  if (changes.page) {
    const [first, last] = changes.page.split(/[-–]/u);
    const start = find("SP");
    set(["SP"], first!);
    const close = find("EP");
    if (last) set(["EP"], last, { after: start });
    else if (close)
      edits.push({ start: close.start, end: close.end, text: "" });
  }
  const serial = serialTypes.includes(imported.type ?? "")
    ? changes.ISBN
    : changes.ISSN;
  if (serial) set(["SN"], serial);
  return applyEdits(originalText, edits);
}
export const risImporter: LibraryImporter = {
  patch: patchRis,
  parse(text, referenceLimit): ImportResult {
    const starts = [...text.matchAll(/^(?:\uFEFF)?TY {2}-/gmu)];
    if (starts.length > referenceLimit)
      throw new ReferenceLimitExceeded(referenceLimit);
    const references: StructuredReference[] = [];
    const rejected: ImportResult["rejected"] = [];
    for (const [i, start] of starts.entries()) {
      // A record owns the text up to the next record, so nothing is lost.
      const begin = i === 0 ? 0 : start.index;
      const end = starts[i + 1]?.index ?? text.length;
      const originalText = text.slice(begin, end);
      const span = { start: begin, end };
      const fields = risFields(originalText);
      const close = fields.findIndex((field) => field.tag === "ER");
      if (close < 0 || !fields[0]?.value || fields.slice(close + 1).length) {
        rejected.push({ originalText, span, reason: "malformed-record" });
        continue;
      }
      const { csl, unsupported } = projection(fields);
      references.push({
        originalText,
        span,
        csl,
        fieldSources: Object.fromEntries(
          Object.entries(csl).map(([key, value]) => [
            key,
            { raw: typeof value === "string" ? value : JSON.stringify(value) },
          ]),
        ),
        structuring: {
          path: "parser",
          version: "ris-zotero-citavi-endnote-1",
        },
        imported: { format: "ris", unsupported, fields: csl },
      });
    }
    if (!starts.length)
      rejected.push({
        originalText: text,
        span: { start: 0, end: text.length },
        reason: "malformed-record",
      });
    return { references, rejected, quotaConsumed: 0, referenceLimit };
  },
};
