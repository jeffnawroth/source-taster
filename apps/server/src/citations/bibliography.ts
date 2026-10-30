// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Check } from "@source-taster/contract-verification/v2";
import type { Csl } from "@source-taster/core";
import type {
  Bibliography,
  BibliographyRequest,
} from "@source-taster/contract-verification/bibliography";
import { escapeRtf, render, rendererVersion, rtfDocument } from "./renderer.ts";
import { suggestionFields, suggestionToken } from "./suggestion.ts";
/** A projection only: no persistence, verification, new source request or Quota. */
export function renderCheckBibliography(
  check: Check,
  request: BibliographyRequest,
  resultIds: Record<number, string>,
): Bibliography {
  const applied = new Set(request.applySlots ?? []);
  const items: Csl[] = [];
  const unstructured: string[] = [];
  const requested = request.suggestionSlots
    ? new Set(request.suggestionSlots)
    : null;
  const eligible = check.references.map((reference) =>
    resultIds[reference.slot] ? suggestionFields(reference) : null,
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
    const current = reference.fields;
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
      ...(fields
        ? {
            resultToken: suggestionToken(
              reference,
              resultIds[reference.slot]!,
            )!,
          }
        : {}),
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
