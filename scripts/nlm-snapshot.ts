// SPDX-License-Identifier: AGPL-3.0-or-later
// Explicit release step only: no network and no automatic refresh at runtime.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const [input, snapshotDate] = process.argv.slice(2);
if (!input || !snapshotDate || !/^\d{4}-\d{2}-\d{2}$/u.test(snapshotDate))
  throw new Error(
    "Usage: node scripts/nlm-snapshot.ts <J_Medline.txt> <YYYY-MM-DD>",
  );
const raw = await readFile(input);
const journals = raw
  .toString("utf8")
  .split(/^-+\s*$/mu)
  .flatMap((block) => {
    if (!block.trim()) return [];
    const fields = new Map(
      block
        .trim()
        .split(/\r?\n/u)
        .map((line) => {
          const colon = line.indexOf(":");
          if (colon < 0) throw new Error("Invalid NLM field");
          return [line.slice(0, colon), line.slice(colon + 1).trim()];
        }),
    );
    const row = [
      "NlmId",
      "JournalTitle",
      "MedAbbr",
      "IsoAbbr",
      "ISSN (Print)",
      "ISSN (Online)",
    ].map((key) => fields.get(key) ?? "");
    if (!row[0] || !row[1]) throw new Error("NLM journal without identity");
    return [row];
  });
if (
  journals.length < 10000 ||
  new Set(journals.map((r) => r[0])).size !== journals.length
)
  throw new Error("Incomplete or duplicate NLM snapshot");
await writeFile(
  new URL("../packages/core/src/data/nlm-journals.json", import.meta.url),
  JSON.stringify({
    source: "https://ftp.ncbi.nih.gov/pubmed/J_Medline.txt",
    attribution: "Courtesy of the U.S. National Library of Medicine",
    snapshotDate,
    sourceSha256: createHash("sha256").update(raw).digest("hex"),
    columns: [
      "nlmId",
      "title",
      "medlineAbbreviation",
      "isoAbbreviation",
      "printIssn",
      "onlineIssn",
    ],
    journals,
  }) + "\n",
);
console.log(
  `Pinned ${journals.length} NLM journals (${snapshotDate}). A refresh requires a new Scoring rules version and Quality gate.`,
);
