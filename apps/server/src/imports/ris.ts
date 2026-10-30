// SPDX-License-Identifier: AGPL-3.0-or-later
import { ReferenceLimitExceeded, type Csl, type Name, type StructuredReference } from "@source-taster/core";
import type { ImportResult } from "@source-taster/contract-verification/import";
// RIS type vocabulary shared by Zotero, Citavi and EndNote dialects. Unknown
// types remain unknown (the normal article fallback); known unsupported types
// retain their CSL type so search cannot silently claim coverage.
const types: Readonly<Record<string,string>> = {
  JOUR:"article-journal", JFULL:"article-journal", EJOUR:"article-journal", MGZN:"article-magazine", NEWS:"article-newspaper", ABST:"article", INPR:"article", BOOK:"book", EBOOK:"book", CHAP:"chapter", ECHAP:"chapter", CONF:"paper-conference", CPAPER:"paper-conference", THES:"thesis", RPRT:"report", ELEC:"webpage", WEB:"webpage", BLOG:"post-weblog", DBASE:"dataset", DATA:"dataset", COMP:"software", DICT:"entry-dictionary", ENCYC:"entry-encyclopedia", STAND:"standard", PAT:"patent", STAT:"legislation", BILL:"bill", CASE:"legal_case", HEAR:"hearing", UNPB:"manuscript", PCOMM:"personal_communication", ICOMM:"personal_communication", INTV:"interview", ADVS:"motion_picture", VIDEO:"motion_picture", MPCT:"motion_picture", SOUND:"song", MUSIC:"musical_score", ART:"graphic", FIGURE:"figure", MAP:"map", SLIDE:"speech", GEN:"document", SER:"periodical",
};
export interface RisField { tag:string; value:string; start:number; end:number; valueStart:number }
export function risFields(text:string): RisField[] {
  const fields: RisField[]=[];
  for(const line of text.matchAll(/[^\r\n]*(?:\r\n|\n|\r|$)/gu)) {
    if(!line[0]) continue;
    const match=line[0].match(/^(?:\uFEFF)?([A-Z0-9]{2}) {2}-[ \t]?(.*?)(?:\r\n|\n|\r)?$/u);
    if(match) fields.push({tag:match[1]!,value:match[2]!,start:line.index,end:line.index+line[0].length,valueStart:line.index+line[0].indexOf('-')+1+(line[0][line[0].indexOf('-')+1] === ' ' ? 1 : 0)});
    else if(fields.length && !["TY","ER"].includes(fields.at(-1)!.tag)) {fields.at(-1)!.value+=" "+line[0].trim();fields.at(-1)!.end=line.index+line[0].length;}
  }
  return fields;
}
function person(raw:string):Name {
  const parts=raw.split(",").map(s=>s.trim());
  if(parts.length !== 2 || !parts[1]) return {literal:raw};
  const particle=parts[0]!.match(/^((?:(?:van|von|de|der|den|del|della|da|di|la|le)\s+)+)(.+)$/u);
  return {family:particle?.[2] ?? parts[0],given:parts[1],...(particle?{"non-dropping-particle":particle[1]!.trim()}:{})};
}
export function risProjection(fields:RisField[]) {
  const values=(...tags:string[])=>fields.filter(f=>tags.includes(f.tag)).map(f=>f.value);
  const first=(...tags:string[])=>{for(const tag of tags){const v=values(tag)[0];if(v)return v;}return undefined;};
  const csl:Csl={}; const supported=new Set(["TY","ER"]);
  const type=first("TY");if(type && Object.hasOwn(types,type)) csl.type=types[type];
  const mapping: [keyof Csl,string[]][] = [["title",["TI","T1","CT"]],["container-title",["JF","JO","T2"]],["container-title-short",["JA","J2"]],["publisher",["PB"]],["publisher-place",["CY","PP"]],["volume",["VL"]],["issue",["IS"]],["edition",["ET"]],["DOI",["DO"]],["URL",["UR","L1"]],["PMID",["AN"]]];
  for(const [key,tags] of mapping){const value=first(...tags);if(value){Object.assign(csl,{[key]:value});tags.forEach(t=>supported.add(t));}}
  const names=values("AU").length ? values("AU") : values("A1");
  if(names.length){csl.author=names.map(person);supported.add("AU");supported.add("A1");}
  const dates=values("DA","Y1","PY").map(date=>date.match(/^(\d{4})(?:[-/](\d{1,2}))?(?:[-/](\d{1,2}))?/u)).filter(m=>m !== null).sort((a,b)=>b.filter(Boolean).length-a.filter(Boolean).length);
  if(dates[0]){csl.issued={literal:dates[0].slice(1).filter(Boolean).map((v,i)=>i?v.padStart(2,"0"):v).join("-")};["DA","Y1","PY"].forEach(t=>supported.add(t));}
  const start=first("SP"),end=first("EP");if(start){csl.page=end?`${start}-${end}`:start;supported.add("SP");supported.add("EP");}
  const serial=first("SN");if(serial){if(["book","chapter"].includes(csl.type??""))csl.ISBN=serial;else csl.ISSN=serial;supported.add("SN");}
  return {csl,unsupported:fields.filter(f=>!supported.has(f.tag)).map(f=>({name:f.tag,value:f.value}))};
}
export const risImporter = {
  parse(text:string,referenceLimit:number):ImportResult {
    const starts=[...text.matchAll(/^(?:\uFEFF)?TY {2}-/gmu)];
    if(starts.length>referenceLimit)throw new ReferenceLimitExceeded(referenceLimit);
    const references:StructuredReference[]=[],rejected:ImportResult["rejected"]=[];
    for(const [i,start] of starts.entries()){
      const begin=i===0?0:start.index,end=starts[i+1]?.index??text.length,originalText=text.slice(begin,end),span={start:begin,end};
      const fields=risFields(originalText);
      const er=fields.findIndex(f=>f.tag==="ER");
      if(er<0||!fields[0]?.value||fields.slice(er+1).length){rejected.push({originalText,span,reason:"malformed-record"});continue;}
      const {csl,unsupported}=risProjection(fields);
      references.push({originalText,span,csl,fieldSources:Object.fromEntries(Object.entries(csl).map(([key,value])=>[key,{raw:typeof value==="string"?value:JSON.stringify(value)}])),structuring:{path:"parser",version:"ris-zotero-citavi-endnote-1"},imported:{format:"ris",unsupported}});
    }
    if(!starts.length)rejected.push({originalText:text,span:{start:0,end:text.length},reason:"malformed-record"});
    return {references,rejected,quotaConsumed:0,referenceLimit};
  },
};
