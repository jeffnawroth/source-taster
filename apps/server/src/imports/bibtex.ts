// SPDX-License-Identifier: AGPL-3.0-or-later
import { BibLatexParser, CSLExporter } from "bibliojson";
import type { Csl } from "@source-taster/core";
import { StructuredCsl } from "@source-taster/contract-verification/v2";
export interface RawRecord { start: number; end: number; bodyStart: number; bodyEnd: number; malformed?: boolean }
/** Lexical envelope only; field/name/TeX interpretation belongs to BiblioJSON. */
export function bibRecords(text: string): RawRecord[] {
  const records: RawRecord[] = [];
  const starts = [...text.matchAll(/@([a-z]+)\s*[{(]/giu)];
  let consumed = 0;
  for (const [index, match] of starts.entries()) {
    const start = match.index;
    if (start < consumed) continue;
    const open = text[start + match[0].length - 1]!;
    const close = open === "{" ? "}" : ")";
    let depth = 1, braces = 0, quoted = false, end = start + match[0].length;
    for (; end < text.length; end++) {
      const char = text[end]!;
      if (char === "\\") {end++; continue;}
      if (char === "%" && !quoted) { while(end < text.length && text[end] !== "\n") end++; continue; }
      if (open === "(") {
        if (char === "{") braces++;
        if (char === "}") braces--;
        if (!braces && char === '"') quoted = !quoted;
        if (!braces && !quoted && char === close) {depth=0;break;}
      } else {
        if (char === "{") depth++;
        if (char === "}") depth--;
        if (depth === 0) break;
      }
    }
    const malformed = depth !== 0;
    end = malformed ? (starts[index+1]?.index ?? text.length) : end + 1;
    if (["comment","string","preamble"].includes(match[1]!.toLowerCase()) && !malformed) { consumed=end; continue; }
    records.push({start:records.length ? start : 0,end,bodyStart:start,bodyEnd:end,malformed});
    consumed=end;
  }
  for (let i=0;i<records.length;i++) records[i]!.end=records[i+1]?.start ?? text.length;
  return records;
}
export function plain(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(plain).join("");
  if (value && typeof value === "object" && "text" in value) return String(value.text);
  return JSON.stringify(value);
}
export function parseBib(text: string, record: RawRecord) {
  // Parse the entire valid library for macro/crossref resolution, preserving offsets.
  const safe = bibRecords(text).reduceRight((all,r)=> r.malformed ? all.slice(0,r.start)+all.slice(r.start,r.end).replace(/[^\r\n]/gu," ")+all.slice(r.end) : all,text);
  const parser = new BibLatexParser(safe, {includeRawText:true,includeLocation:true,processUnknown:true,processUnexpected:true,processComments:true});
  parser.parse();
  const key = text.slice(record.bodyStart,record.bodyEnd).match(/^@\w+\s*[{(]\s*([^,]+),/u)?.[1]?.trim();
  const found = Object.entries(parser.bibDB).find(([,entry])=>entry.entry_key === key);
  if (!found || found[1].incomplete) throw new Error("malformed-record");
  const [id,entry] = found;
  if (parser.errors.some(error => error.entry === entry.entry_key || error.key === entry.entry_key)) throw new Error("malformed-record");
  const item = new CSLExporter(parser.bibDB).parse()[id] ?? {};
  const csl: Csl = StructuredCsl.parse({...item,issued:undefined});
  for (const [from,to] of [["title","title"],["journaltitle","container-title"],["booktitle","container-title"],["publisher","publisher"],["location","publisher-place"]] as const) {
    if (entry.fields[from]) csl[to] = plain(entry.fields[from]);
  }
  const issued = item.issued as {"date-parts"?:number[][];literal?:string}|undefined;
  if (issued?.["date-parts"]?.[0]) csl.issued = {literal:issued["date-parts"][0].map((n,i)=> i ? String(n).padStart(2,"0") : String(n)).join("-")};
  else if (issued?.literal) csl.issued={literal:issued.literal};
  return {csl,unsupported:Object.entries({...entry.unknown_fields,...entry.unexpected_fields}).map(([name,value])=>({name,value:plain(value)}))};
}
