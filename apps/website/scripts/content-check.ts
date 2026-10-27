// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { sourceAccess } from "../src/source-access.ts";
import { languages, copy, pages } from "../src/content.ts";
import { legalDocuments, legalIds } from "../src/legal.ts";
import type { Publication } from "./publication.ts";
interface Claims {
  claims: Record<
    string,
    { requirements: string[]; evidence: string[]; state: string }
  >;
}
const claims = JSON.parse(await readFile("claims.json", "utf8")) as Claims;
const requirements = await readFile(
  "../../docs/requirements-traceability.md",
  "utf8",
);
const config = JSON.parse(
  await readFile("publication.json", "utf8"),
) as Publication;
const docs = await legalDocuments();
for (const language of languages) {
  for (const key of Object.keys(
    sourceAccess.en,
  ) as (keyof typeof sourceAccess.en)[])
    if (!sourceAccess[language][key]?.trim())
      throw new Error(`Missing ${language} source-access text: ${key}`);
  for (const [key, value] of Object.entries(copy.en)) {
    if (!value.trim() || !copy[language][key as keyof typeof copy.en]?.trim())
      throw new Error(`Missing ${language} UI text: ${key}`);
  }
  for (const page of pages.en) {
    const other = pages[language].find(
      (p) => p.id === page.id && p.section === page.section,
    );
    if (
      !other?.title.trim() ||
      !other.summary.trim() ||
      other.paragraphs.length !== page.paragraphs.length ||
      other.paragraphs.some((p) => !p.trim()) ||
      other.claim !== page.claim
    )
      throw new Error(`Incomplete ${language} page: ${page.id}`);
    if (!other.claim || !claims.claims[other.claim])
      throw new Error(`Unmapped feature claim: ${page.id}`);
  }
  if (pages[language].length !== pages.en.length)
    throw new Error("Unpaired content");
  for (const id of legalIds) {
    const version = config.legalVersions[language]?.[id];
    if (
      !docs.some(
        (doc) =>
          doc.language === language &&
          doc.id === id &&
          doc.version === version &&
          doc.paragraphs.every((p) => p.trim()),
      )
    )
      throw new Error(`Incomplete current ${language} legal version: ${id}`);
  }
}
for (const [id, claim] of Object.entries(claims.claims)) {
  if (
    !claim.requirements.length ||
    !claim.state ||
    claim.requirements.some((id) => !requirements.includes(`| ${id} |`))
  )
    throw new Error(`Invalid requirement mapping: ${id}`);
  for (const file of claim.evidence)
    if (!(await stat(resolve(file))).isFile())
      throw new Error(`Missing claim evidence: ${file}`);
}
console.log(
  `DE/EN content complete: ${pages.en.length} paired information pages, ${legalIds.length} paired legal documents, ${Object.keys(copy.en).length} paired UI texts, ${Object.keys(sourceAccess.en).length} paired source-access texts; human translation review pending`,
);
