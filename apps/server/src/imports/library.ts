// SPDX-License-Identifier: AGPL-3.0-or-later
import { ReferenceLimitExceeded, type StructuredReference } from "@source-taster/core";
import type { ImportResult, LibraryInput } from "@source-taster/contract-verification/import";
import { risImporter } from "./ris.ts";
import { bibRecords, parseBib } from "./bibtex.ts";
/** Application-owned port. Library objects never cross transport or persistence. */
export interface LibraryImporter { parse(input: string, referenceLimit: number): ImportResult }
const bibtex: LibraryImporter = {
  parse(text, referenceLimit) {
    const records=bibRecords(text);
    if(records.length > referenceLimit) throw new ReferenceLimitExceeded(referenceLimit);
    const references: StructuredReference[] = [], rejected: ImportResult["rejected"] = [];
    for (const record of records) {
      const originalText=text.slice(record.start,record.end), span={start:record.start,end:record.end};
      try {
        if(record.malformed) throw new Error("malformed-record");
        const {csl,unsupported}=parseBib(text,record);
        references.push({ originalText,span,csl,fieldSources:Object.fromEntries(Object.entries(csl).map(([key,value])=>[key,{raw:typeof value === "string" ? value : JSON.stringify(value)}])),structuring:{path:"parser",version:"bibliojson-4.1.0"},imported:{format:"bibtex",unsupported} });
      } catch { rejected.push({originalText,span,reason:"malformed-record"}); }
    }
    if(!records.length) rejected.push({originalText:text,span:{start:0,end:text.length},reason:"malformed-record"});
    return {references,rejected,quotaConsumed:0,referenceLimit};
  },
};
export function importLibrary(input: LibraryInput, referenceLimit: number): ImportResult {
  return (input.format === "bibtex" ? bibtex : risImporter).parse(input.text, referenceLimit);
}
