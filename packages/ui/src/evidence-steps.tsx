// SPDX-License-Identifier: AGPL-3.0-or-later
import type { SourceEvidence } from "@source-taster/contract-verification/v2";
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
  const path = {
    ok: "M5 12.5l4.6 4.6L19 7.4",
    bad: "M6.5 6.5l11 11M17.5 6.5l-11 11",
    warn: "M12 6.5v7M12 17.4h.01",
    none: "M6 12h12",
    diff: "M6 9h12M6 15h12M14.4 4.6L9.6 19.4",
  }[state as "ok" | "bad" | "warn" | "none" | "diff"];
  return path ? (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  ) : null;
}
