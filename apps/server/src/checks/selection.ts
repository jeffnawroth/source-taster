// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  bibliographyRulesVersion,
  selectionRegions,
  selectionWork,
  structureSelection,
  type Structuring,
  type Span,
} from "@source-taster/core";
import type { Check } from "@source-taster/contract-verification/v2";

export function selectionDifference(
  check: Check,
  input: Span[],
  parser: Structuring,
  limit: number,
) {
  const document = check.document;
  if (!document) throw new Error("document-required");
  const regions = selectionRegions(document.text, input);
  const unchanged: number[] = [],
    removed: number[] = [],
    cut: Span[] = [];
  for (const slot of check.references) {
    const source = slot.revisions[0]?.reference;
    // Manually added slots have no document source. Their membership is independent.
    if (!source || !["parser", "ai"].includes(source.structuring.path)) {
      unchanged.push(slot.slot);
      continue;
    }
    const span = source.span;
    if (regions.some((r) => r.start <= span.start && r.end >= span.end))
      unchanged.push(slot.slot);
    else {
      removed.push(slot.slot);
      cut.push(span);
    }
  }
  const work = selectionWork(regions, document.selection.regions, cut);
  const structured = structureSelection(parser, document.text, work, limit);
  return {
    document: {
      ...document,
      selection: { version: bibliographyRulesVersion, regions },
    },
    references: structured.references,
    preview: {
      expectedEventSeq: check.lastEventSeq,
      regions,
      unchanged,
      removed,
      added: structured.references.length,
      addedReferences: structured.references,
      total: unchanged.length + structured.references.length,
      additionalQuota: structured.references.length,
      rejected: structured.rejected,
    },
  };
}
