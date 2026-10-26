// SPDX-License-Identifier: AGPL-3.0-or-later
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Language, Page } from "./content.ts";
export const legalIds = ["legal-notice", "terms", "privacy", "withdrawal"];
export interface LegalDocument { language: Language; id: string; version: string; status: "draft" | "approved"; approval: null | { reviewer: string; date: string; evidence: string; sha256: string }; title: string; summary: string; paragraphs: string[] }
export async function legalDocuments(): Promise<LegalDocument[]> {
  const documents: LegalDocument[] = [];
  for (const language of ["de", "en"]) for (const id of legalIds) {
    // All immutable versions stay addressable, not only the current document.
    const dir = resolve("content/legal", language, id);
    for (const file of (await readdir(dir)).filter(file => file.endsWith('.json')).sort()) {
      documents.push(JSON.parse(await readFile(resolve(dir,file),'utf8')) as LegalDocument);
    }
  }
  return documents;
}
export function legalPage(doc: LegalDocument): Page { return { id: doc.id, section: 'site', title:doc.title, summary:doc.summary, paragraphs:doc.paragraphs }; }
