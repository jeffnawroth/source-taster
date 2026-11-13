// SPDX-License-Identifier: AGPL-3.0-or-later
import type { SourceEvidence } from "@source-taster/contract-verification/v2";
import { Check as CheckIcon, Minus, TriangleAlert, X } from "lucide-react";
import { m } from "@source-taster/i18n";

/** How one evidence step reads in D's track, source list and trail. */
export type StepState =
  "ok" | "diff" | "bad" | "warn" | "none" | "pend" | "cur";
/** Outcomes without a state (disabled, skipped, unsupported) were never queried. */
export const evidenceStep: Partial<
  Record<SourceEvidence["outcome"], StepState>
> = {
  exists: "ok",
  redirect: "ok",
  candidate: "ok",
  nonexistent: "bad",
  unavailable: "warn",
  "no-record": "none",
};
const stepRank: StepState[] = ["ok", "bad", "warn", "none"];
export function evidenceLabel(outcome: SourceEvidence["outcome"]) {
  return m[
    `evidence_${outcome.replaceAll("-", "_")}` as
      | "evidence_redirect"
      | "evidence_exists"
      | "evidence_nonexistent"
      | "evidence_candidate"
      | "evidence_no_record"
      | "evidence_unavailable"
      | "evidence_disabled"
      | "evidence_skipped"
      | "evidence_unsupported"
  ]();
}
/** One entry per queried Data source: its most telling outcome, in first-query order. */
export function queriedSources(evidence: readonly SourceEvidence[]) {
  const bySource = new Map<string, SourceEvidence>();
  for (const entry of evidence) {
    const state = evidenceStep[entry.outcome];
    if (!state) continue;
    const known = bySource.get(entry.source);
    if (
      !known ||
      stepRank.indexOf(state) < stepRank.indexOf(evidenceStep[known.outcome]!)
    )
      bySource.set(entry.source, entry);
  }
  return [...bySource.values()];
}
export function StepIcon({ state }: { state: StepState }) {
  const props = { "aria-hidden": true, size: 14, strokeWidth: 2.25 } as const;
  switch (state) {
    case "ok":
      return <CheckIcon {...props} />;
    case "bad":
      return <X {...props} />;
    case "warn":
      return <TriangleAlert {...props} />;
    case "none":
      return <Minus {...props} />;
    default:
      return null;
  }
}
