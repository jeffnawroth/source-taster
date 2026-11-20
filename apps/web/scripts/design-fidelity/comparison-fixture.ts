// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ReferenceSlot } from "@source-taster/contract-verification/v2";
import en from "../../../../packages/i18n/messages/en.json" with { type: "json" };
import de from "../../../../packages/i18n/messages/de.json" with { type: "json" };

// Independent contract-field inventory, deliberately not imported from the rendered component.
export const apiFieldLabels = {
  type: "field_type",
  arXiv: "field_arxiv",
  title: "field_title",
  author: "field_author",
  issued: "field_issued",
  "container-title": "field_container",
  "container-title-short": "field_container_short",
  DOI: "field_doi",
  volume: "field_volume",
  page: "field_page",
  issue: "field_issue",
  ISBN: "field_isbn",
  PMID: "field_pmid",
  PMCID: "field_pmcid",
  URL: "field_url",
  publisher: "field_publisher",
  "publisher-place": "field_place",
  "article-number": "field_article_number",
  edition: "field_edition",
  ISSN: "field_issn",
} as const;
export interface ComparisonRow {
  field: string;
  label: string;
  yours: string;
  best: string;
  note: string;
  differs: string;
  agrees: boolean;
  unknownYours: boolean;
  unknownBest: boolean;
}
export function apiComparisonRows(
  reference: ReferenceSlot,
  language: "en" | "de",
): ComparisonRow[] {
  if (reference.outcome.kind !== "verdict") return [];
  const outcome = reference.outcome;
  const best = outcome.candidates.find(
    (candidate) => candidate.id === outcome.bestMatchId,
  );
  if (outcome.bestMatchId !== null && !best)
    throw new Error(
      `Comparison API Best-match record is missing: ${outcome.bestMatchId}`,
    );
  const compared = best?.fields.map((item) => item.field) ?? [];
  if (new Set(compared).size !== compared.length)
    throw new Error("Comparison API repeats a field in the Best-match record");
  const messages = language === "de" ? de : en;
  const unknown = messages.workspace_unknown;
  function value(raw: unknown): string {
    if (
      raw === undefined ||
      raw === null ||
      raw === "" ||
      (Array.isArray(raw) && !raw.length)
    )
      return unknown;
    if (Array.isArray(raw)) return raw.map(value).join("; ");
    if (typeof raw === "object") return Object.values(raw).map(value).join(" ");
    return typeof raw === "string" ||
      typeof raw === "number" ||
      typeof raw === "boolean"
      ? String(raw)
      : unknown;
  }
  const reasonKeys = {
    "missing-reference": "field_missing_reference",
    "missing-candidate": "field_missing_candidate",
    "not-determinable": "field_not_determinable",
    "resource-limit": "field_resource_limit",
    unweighted: "field_unweighted",
  } as const;
  const keys = new Set([
    ...Object.keys(outcome.reference.csl),
    ...Object.keys(best?.csl ?? {}),
    ...(best?.fields.map((field) => field.field) ?? []),
  ]);
  for (const field of keys)
    if (!Object.hasOwn(apiFieldLabels, field))
      throw new Error(
        `Comparison API field has no independent label: ${field}`,
      );
  return (
    Object.keys(apiFieldLabels) as (keyof typeof apiFieldLabels)[]
  ).flatMap((field) => {
    const comparison = best?.fields.find((item) => item.field === field);
    const yours = value(
      comparison ? comparison.reference : outcome.reference.csl[field],
    );
    const theirs = value(comparison ? comparison.candidate : best?.csl[field]);
    if (!comparison && yours === unknown && theirs === unknown) return [];
    const deviates =
      comparison?.agreement === false ||
      (!!comparison?.score && !comparison.score.fullAgreement);
    const agrees =
      !deviates &&
      (comparison?.agreement === true ||
        comparison?.score?.fullAgreement === true);
    const scored =
      comparison?.score != null || comparison?.agreement !== undefined;
    let reason = messages.workspace_not_compared;
    if (comparison?.score) {
      let hundredths = (BigInt(comparison.score.value) + 5000n) / 10000n;
      if (!comparison.score.fullAgreement && hundredths >= 10000n)
        hundredths = 9999n;
      reason = `${hundredths / 100n}.${String(hundredths % 100n).padStart(2, "0")} %`;
    } else if (comparison && comparison.reason in reasonKeys)
      reason =
        messages[reasonKeys[comparison.reason as keyof typeof reasonKeys]];
    return [
      {
        field,
        label: messages[apiFieldLabels[field]],
        yours,
        best: theirs,
        note: scored ? reason : `${messages.field_excluded} · ${reason}`,
        differs: deviates ? messages.field_differs : "",
        agrees,
        unknownYours: yours === unknown,
        unknownBest: theirs === unknown,
      },
    ];
  });
}
export function assertComparisonRows(
  expected: ComparisonRow[],
  displayed: ComparisonRow[],
) {
  if (expected.length !== displayed.length)
    throw new Error(
      `Comparison inventory: API requires ${expected.length} rows; product displays ${displayed.length}`,
    );
  for (const [index, row] of expected.entries()) {
    const observed = displayed[index]!;
    for (const key of Object.keys(row) as (keyof ComparisonRow)[])
      if (row[key] !== observed[key])
        throw new Error(
          `Comparison ${row.field}.${key}: API requires ${JSON.stringify(row[key])}; product displays ${JSON.stringify(observed[key])}`,
        );
  }
}

/** A matching title or another Candidate's provenance cannot stand in for the
 * recorded Best-match identity. Keep this check independent of product helpers. */
export function assertComparisonRecord(
  reference: ReferenceSlot,
  language: "en" | "de",
  provenance: { text: string; record: boolean }[],
) {
  if (reference.outcome.kind !== "verdict" || !reference.outcome.bestMatchId)
    return;
  const messages = language === "de" ? de : en;
  const expected = `${messages.candidate_record}: ${reference.outcome.bestMatchId}`;
  const records = provenance.filter((item) => item.record);
  if (records.length !== 1 || records[0]?.text !== expected)
    throw new Error(
      "The displayed comparison omits or changes the API Best-match record ID",
    );
}
