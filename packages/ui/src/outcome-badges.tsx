// SPDX-License-Identifier: AGPL-3.0-or-later
import type {
  Verdict,
  ReferenceOutcome,
} from "@source-taster/contract-verification/v2";
import {
  CircleDashed,
  CircleOff,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { m } from "@source-taster/i18n";
export const verdictLabels = {
  correct: "verdict_correct",
  "exists-with-deviations": "verdict_exists",
  "mixed-citation": "verdict_mixed",
  "doi-conflict": "verdict_doi_conflict",
  "not-found": "verdict_not_found",
  "not-verifiable": "verdict_not_verifiable",
} as const;
export const statusLabels = {
  running: "status_running",
  cancelled: "status_cancelled",
  failed: "status_failed",
  "not-checked": "status_not_checked",
} as const;
export type Status = Extract<ReferenceOutcome, { kind: "status" }>["status"];
/** Project-owned silhouettes; the mark alone carries Verdict colour. */
export function VerdictGlyph({ verdict }: { verdict: Verdict }) {
  const marks = {
    correct: "correct",
    "exists-with-deviations": "deviations",
    "mixed-citation": "mixed",
    "doi-conflict": "doi-conflict",
    "not-found": "not-found",
    "not-verifiable": "not-verifiable",
  } as const;
  return (
    <svg
      data-verdict={verdict}
      className="verdict-glyph"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ color: `var(--st-verdict-${marks[verdict]}-mark)` }}
    >
      {verdict === "correct" ? (
        <>
          <circle cx="12" cy="12" r="11" fill="currentColor" />
          <path d="m6 12 4 4 8-8" />
        </>
      ) : verdict === "exists-with-deviations" ? (
        <>
          <path d="M12 1 23 12 12 23 1 12Z" fill="currentColor" stroke="none" />
          <path d="M7 9h10M7 15h10m-3-9-4 12" />
        </>
      ) : verdict === "mixed-citation" ? (
        <>
          <path
            d="m12 1 10 5v12l-10 5-10-5V6Z"
            fill="currentColor"
            stroke="none"
          />
          <ellipse cx="9" cy="12" rx="4" ry="5" />
          <ellipse cx="15" cy="12" rx="4" ry="5" />
        </>
      ) : verdict === "doi-conflict" ? (
        <>
          <path
            d="M5 1h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4Z"
            fill="currentColor"
            stroke="none"
          />
          <path d="M5 10h6l2-4m-2 12 2-4h6" />
        </>
      ) : verdict === "not-found" ? (
        <>
          <path
            d="M10 1a9 9 0 1 0 5.6 16L22 23l2-2-6.5-6.5A9 9 0 0 0 10 1Z"
            fill="currentColor"
            stroke="none"
          />
          <path d="m6 6 8 8m0-8-8 8" />
        </>
      ) : (
        <>
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="4 2"
          />
          <path
            d="M9 8a3 3 0 1 1 5 3c-2 1-2 2-2 3m0 3v.1"
            style={{ stroke: "currentColor" }}
          />
        </>
      )}
    </svg>
  );
}
export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span className="verdict-badge">
      <VerdictGlyph verdict={verdict} />
      <span>{m[verdictLabels[verdict]]()}</span>
    </span>
  );
}
export function StatusIcon({ status }: { status: Status }) {
  const Icon = {
    running: LoaderCircle,
    cancelled: CircleOff,
    failed: TriangleAlert,
    "not-checked": CircleDashed,
  }[status];
  return (
    <Icon
      aria-hidden="true"
      width={16}
      height={16}
      className={status === "running" ? "status-running" : undefined}
    />
  );
}
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="status-badge">
      <StatusIcon status={status} />
      {m[statusLabels[status]]()}
    </span>
  );
}
