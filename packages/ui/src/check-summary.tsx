// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Check, Verdict } from "@source-taster/contract-verification/v2";
import { effectiveVerdict } from "./effective-verdict.ts";
import { m } from "@source-taster/i18n";
export const verdictLabels = {
  correct: "verdict_correct",
  "exists-with-deviations": "verdict_exists",
  "mixed-citation": "verdict_mixed",
  "doi-conflict": "verdict_doi_conflict",
  "not-found": "verdict_not_found",
  "not-verifiable": "verdict_not_verifiable",
} as const;
const statuses = {
  running: "status_running",
  cancelled: "status_cancelled",
  failed: "status_failed",
  "not-checked": "status_not_checked",
} as const;
export function CheckSummary({
  check,
  filter,
  onFilter,
  completed,
}: {
  check: Check;
  filter: Verdict | null;
  onFilter: (value: Verdict | null) => void;
  completed: number;
}) {
  return (
    <section aria-label={m.workspace_summary()} className="my-5 space-y-3">
      <p>{m.workspace_recognized({ count: check.references.length })}</p>
      <progress
        aria-label={m.check_progress_label()}
        value={completed}
        max={check.references.length}
        className="w-full"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-slate-500 p-2 aria-pressed:bg-teal-800 aria-pressed:text-white"
          aria-pressed={filter === null}
          onClick={() => onFilter(null)}
        >
          {m.workspace_all()}: {check.references.length}
        </button>
        {(Object.keys(verdictLabels) as Verdict[]).map((verdict) => (
          <button
            key={verdict}
            type="button"
            className="rounded border border-slate-500 p-2 aria-pressed:bg-teal-800 aria-pressed:text-white"
            aria-pressed={filter === verdict}
            onClick={() => onFilter(verdict)}
          >
            {m[verdictLabels[verdict]]()}:{" "}
            {
              check.references.filter((r) => effectiveVerdict(r) === verdict)
                .length
            }
            {check.references.some(
              (r) => effectiveVerdict(r) === verdict && r.manualOverride,
            ) && (
              <span>
                {" "}
                ·{" "}
                {m.override_count({
                  count: check.references.filter(
                    (r) => effectiveVerdict(r) === verdict && r.manualOverride,
                  ).length,
                })}
              </span>
            )}
          </button>
        ))}
      </div>
      <p>{m.workspace_statuses()}</p>
      <ul className="flex flex-wrap gap-3">
        {(Object.keys(statuses) as (keyof typeof statuses)[]).map((status) => (
          <li key={status}>
            {m[statuses[status]]()}:{" "}
            {
              check.references.filter(
                (r) =>
                  r.outcome.kind === "status" && r.outcome.status === status,
              ).length
            }
          </li>
        ))}
      </ul>
    </section>
  );
}
