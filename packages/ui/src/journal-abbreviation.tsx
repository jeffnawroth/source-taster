// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Candidate } from "@source-taster/contract-verification/v2";
import { m } from "@source-taster/i18n";
export function JournalAbbreviationExplanation({
  evidence,
}: {
  evidence: NonNullable<Candidate["fields"][number]["journalAbbreviation"]>;
}) {
  const sources = {
    nlm: "NLM",
    crossref: "Crossref",
    europepmc: "Europe PMC",
    semanticscholar: "Semantic Scholar",
  };
  return (
    <>
      <dd>
        {evidence.outcome === "match"
          ? m.journal_abbreviation_match()
          : evidence.outcome === "different"
            ? m.journal_abbreviation_different()
            : m.journal_abbreviation_unknown()}
      </dd>
      {evidence.attestations.map((a, index) => (
        <dd key={index} className="break-words">
          {a.role === "candidate" ? m.candidate_label() : m.reference_label()}:{" "}
          {a.journalTitle} — {a.abbreviation} ({sources[a.source]}
          {a.nlmId ? `, ${a.nlmId}` : ""})
          {a.source === "nlm" && (
            <p>
              Courtesy of the U.S. National Library of Medicine.{" "}
              {m.journal_nlm_snapshot({ date: a.snapshotDate ?? "" })}
            </p>
          )}
        </dd>
      ))}
    </>
  );
}
