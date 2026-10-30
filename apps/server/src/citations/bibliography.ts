// SPDX-License-Identifier: AGPL-3.0-or-later
import type {
  Check,
  ReferenceSlot,
} from "@source-taster/contract-verification/v2";
import type { Csl } from "@source-taster/core";
import type {
  Bibliography,
  BibliographyRequest,
} from "@source-taster/contract-verification/bibliography";
import { escapeRtf, render, rendererVersion, rtfDocument } from "./renderer.ts";
function suggestionFields(reference: ReferenceSlot): Csl | null {
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
/** A projection only: no persistence, verification, new source request or Quota. */
export function renderCheckBibliography(
  check: Check,
  request: BibliographyRequest,
): Bibliography {
  const applied = new Set(request.applySlots ?? []);
  const items: Csl[] = [];
  const unstructured: string[] = [];
  const requested = request.suggestionSlots
    ? new Set(request.suggestionSlots)
    : null;
  const eligible = check.references.map((reference) =>
    suggestionFields(reference),
  );
  const displayed = check.references.flatMap((reference, index) =>
    eligible[index] && (!requested || requested.has(reference.slot))
      ? [{ slot: reference.slot, fields: eligible[index] }]
      : [],
  );
  const suggestions = render(
    displayed.map((entry) => entry.fields),
    request.style,
    true,
  ).entries;
  const entries = check.references.map((reference, index) => {
    const fields = eligible[index] ?? null;
    const displayIndex = displayed.findIndex(
      (entry) => entry.slot === reference.slot,
    );
    const formatted = displayIndex >= 0 ? suggestions[displayIndex]! : null;
    const use = applied.has(reference.slot) && fields !== null;
    const current =
      reference.outcome.kind === "verdict"
        ? reference.outcome.reference.csl
        : null;
    if (use) items.push(fields);
    else if (current && Object.keys(current).length) items.push(current);
    else unstructured.push(reference.originalText);
    return {
      slot: reference.slot,
      suggestion:
        formatted && fields
          ? {
              csl: fields,
              text: formatted.text,
              rtf: rtfDocument(formatted.rtfBody),
              html: formatted.html,
            }
          : null,
      applied: use,
    };
  });
  const bibliography =
    request.includeBibliography !== false ? render(items, request.style) : null;
  return {
    style: request.style,
    rendererVersion,
    entries,
    bibliography: bibliography
      ? {
          html: [
            bibliography.html,
            ...unstructured.map(
              (text) =>
                `<p>${text.replace(/[&<>"']/gu, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!)}</p>`,
            ),
          ].join("\n"),
          text: [bibliography.text, ...unstructured].filter(Boolean).join("\n"),
          rtf: rtfDocument(
            [bibliography.rtfBody, ...unstructured.map(escapeRtf)]
              .filter(Boolean)
              .join("\\par\n"),
          ),
        }
      : null,
  };
}
