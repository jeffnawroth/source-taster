// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from "node:crypto";
import type { ReferenceSlot } from "@source-taster/contract-verification/v2";
import type { Csl } from "@source-taster/core";
export function suggestionToken(
  reference: ReferenceSlot,
  resultId: string,
): string | null {
  return suggestionFields(reference)
    ? createHash("sha256")
        .update(resultId)
        .update(JSON.stringify(reference.outcome))
        .digest("hex")
    : null;
}
export function suggestionFields(reference: ReferenceSlot): Csl | null {
  const result = reference.outcome;
  if (
    result.kind !== "verdict" ||
    result.identity.kind === "unresolved" ||
    !["correct", "exists-with-deviations", "doi-conflict"].includes(
      result.verdict,
    )
  )
    return null;
  // Identity, not the highest Score alone, authorizes the replacement.
  const candidate = result.candidates.find(
    (c) => c.id === result.identity.candidateId,
  );
  if (!candidate?.csl.title) return null;
  const fields = { ...candidate.csl };
  // Older stored Candidates omit CSL type, but retain the attested provider
  // type. Project only known equivalents; never infer it from user text.
  if (
    !fields.type &&
    candidate.raw &&
    typeof candidate.raw === "object" &&
    "type" in candidate.raw
  ) {
    const types: Record<string, string> = {
      "journal-article": "article-journal",
      article: "article-journal",
      "proceedings-article": "paper-conference",
      "book-chapter": "chapter",
      book: "book",
      monograph: "book",
      "posted-content": "article",
      report: "report",
      dissertation: "thesis",
    };
    const type = candidate.raw.type;
    if (typeof type === "string" && Object.hasOwn(types, type))
      fields.type = types[type];
  }
  const pages = candidate.fields.find((field) => field.field === "page");
  if (
    !fields["article-number"] &&
    !result.reference.csl["article-number"] &&
    pages?.score?.fullAgreement &&
    result.reference.csl.page
  )
    fields.page = result.reference.csl.page;
  return fields;
}
