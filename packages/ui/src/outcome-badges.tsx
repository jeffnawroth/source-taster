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
/** Counter labels: the strip's narrow tiles carry the short form; the
 *  accessible name keeps the full Verdict, which contains it. */
export const shortVerdictLabels = {
  correct: "verdict_short_correct",
  "exists-with-deviations": "verdict_short_exists",
  "mixed-citation": "verdict_short_mixed",
  "doi-conflict": "verdict_short_doi_conflict",
  "not-found": "verdict_short_not_found",
  "not-verifiable": "verdict_short_not_verifiable",
} as const;
export const statusLabels = {
  running: "status_running",
  cancelled: "status_cancelled",
  failed: "status_failed",
  "not-checked": "status_not_checked",
} as const;
export type Status = Extract<ReferenceOutcome, { kind: "status" }>["status"];
/** Original #194 D silhouettes and path recipes; only the mark carries Verdict colour. */
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
          <circle cx="12" cy="12" r="10.3" style={{ fill: "currentColor" }} />
          <path
            d="M7.3 12.4l3.2 3.2 6.2-6.8"
            style={{
              fill: "none",
              stroke: "var(--st-on-verdict-mark)",
              strokeWidth: "2.3",
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          />
        </>
      ) : verdict === "exists-with-deviations" ? (
        <>
          <path
            d="M12 1.6L22.4 12 12 22.4 1.6 12Z"
            style={{
              fill: "currentColor",
              stroke: "currentColor",
              strokeWidth: "1.6",
              strokeLinejoin: "round",
            }}
          />
          <path
            d="M8 10.2h8M8 13.8h8M13.4 6.8l-2.8 10.4"
            style={{
              fill: "none",
              stroke: "var(--st-on-verdict-mark)",
              strokeWidth: "1.8",
              strokeLinecap: "round",
            }}
          />
        </>
      ) : verdict === "mixed-citation" ? (
        <>
          <path
            d="M12 1.7l8.9 5.1v10.4L12 22.3 3.1 17.2V6.8Z"
            style={{
              fill: "currentColor",
              stroke: "currentColor",
              strokeWidth: "1.6",
              strokeLinejoin: "round",
            }}
          />
          <circle
            cx="9.6"
            cy="12"
            r="3.3"
            style={{
              fill: "none",
              stroke: "var(--st-on-verdict-mark)",
              strokeWidth: "1.7",
            }}
          />
          <circle
            cx="14.4"
            cy="12"
            r="3.3"
            style={{
              fill: "none",
              stroke: "var(--st-on-verdict-mark)",
              strokeWidth: "1.7",
            }}
          />
        </>
      ) : verdict === "doi-conflict" ? (
        <>
          <rect
            x="2.4"
            y="2.4"
            width="19.2"
            height="19.2"
            rx="5.2"
            style={{ fill: "currentColor" }}
          />
          <path
            d="M6.4 12h3.4M14.2 12h3.4M11 15.6l2-7.2"
            style={{
              fill: "none",
              stroke: "var(--st-on-verdict-mark)",
              strokeWidth: "2",
              strokeLinecap: "round",
            }}
          />
        </>
      ) : verdict === "not-found" ? (
        <>
          <circle
            cx="10.2"
            cy="10.2"
            r="7.6"
            style={{ fill: "none", stroke: "currentColor", strokeWidth: "2.5" }}
          />
          <path
            d="M15.8 15.8l5.6 5.6"
            style={{
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "3.2",
              strokeLinecap: "round",
            }}
          />
          <path
            d="M7.4 7.4l5.6 5.6M13 7.4l-5.6 5.6"
            style={{
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "1.9",
              strokeLinecap: "round",
            }}
          />
        </>
      ) : (
        <>
          <circle
            cx="12"
            cy="12"
            r="9.6"
            style={{
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2.1",
              strokeDasharray: "3.4 2.7",
            }}
          />
          <path
            d="M9.5 9.6a2.6 2.6 0 1 1 3.7 2.3c-.9.5-1.2 1-1.2 1.9M12 17h.01"
            style={{
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
            }}
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
