// SPDX-License-Identifier: AGPL-3.0-or-later
import { useState } from "react";
import { useStickySize } from "./sticky-layout.ts";
import { Ellipsis, CircleDashed } from "lucide-react";
import type { Check, Verdict } from "@source-taster/contract-verification/v2";
import { effectiveVerdict } from "./effective-verdict.ts";
import { m } from "@source-taster/i18n";
import {
  Toolbar,
  ToggleButton,
  TooltipTrigger,
  Button,
  IconButton,
  GlassSurface,
  MenuTrigger,
  Popover,
  Menu,
  MenuItem,
  Tooltip,
} from "./primitives/index.ts";
import {
  verdictLabels,
  statusLabels,
  VerdictGlyph,
  StatusIcon,
  type Status,
} from "./outcome-badges.tsx";
export { verdictLabels } from "./outcome-badges.tsx";
export type OutcomeFilter = Verdict | `status:${Status}` | null;
export function matchesFilter(
  reference: Check["references"][number],
  filter: OutcomeFilter,
) {
  return (
    !filter ||
    (filter.startsWith("status:")
      ? reference.outcome.kind === "status" &&
        `status:${reference.outcome.status}` === filter
      : effectiveVerdict(reference) === filter)
  );
}
export function filterLabel(filter: Exclude<OutcomeFilter, null>) {
  return filter.startsWith("status:")
    ? m[statusLabels[filter.slice(7) as Status]]()
    : m[verdictLabels[filter as Verdict]]();
}
export function CheckSummary({
  check,
  filter,
  onFilter,
  completed,
}: {
  check: Check;
  filter: OutcomeFilter;
  onFilter: (value: OutcomeFilter) => void;
  completed: number;
}) {
  const [labels, setLabels] = useState(false);
  const strip = useStickySize("--checking-strip-height");
  const statuses = (Object.keys(statusLabels) as Status[])
    .map((status) => ({
      status,
      count: check.references.filter(
        (r) => r.outcome.kind === "status" && r.outcome.status === status,
      ).length,
    }))
    .filter((s) => s.count > 0);
  const statusCount = statuses.reduce((sum, s) => sum + s.count, 0);
  return (
    <section
      ref={strip}
      aria-label={m.workspace_summary()}
      className="summary-container"
      data-labels={labels}
    >
      <GlassSurface layer="summary-strip" className="summary-strip">
        <p className="summary-wide-sentence">
          {m.workspace_recognized({ count: check.references.length })}
        </p>
        <Toolbar aria-label={m.workspace_summary()} className="summary-toolbar">
          {(Object.keys(verdictLabels) as Verdict[]).map((verdict) => {
            const count = check.references.filter(
              (r) => effectiveVerdict(r) === verdict,
            ).length;
            const manual = check.references.filter(
              (r) => effectiveVerdict(r) === verdict && r.manualOverride,
            ).length;
            const label = `${m[verdictLabels[verdict]]()}: ${count}${manual ? ` · ${m.override_count({ count: manual })}` : ""}`;
            return (
              <TooltipTrigger key={verdict} delay={600}>
                <ToggleButton
                  aria-label={label}
                  isSelected={filter === verdict}
                  aria-disabled={count === 0 && filter !== verdict}
                  onChange={() => {
                    // Keep zero-count labels discoverable by keyboard/tooltip,
                    // but never activate an empty filter. An active filter can
                    // still be cleared if its last matching result changes.
                    if (count > 0 || filter === verdict)
                      onFilter(filter === verdict ? null : verdict);
                  }}
                  className="summary-counter"
                >
                  <VerdictGlyph verdict={verdict} />
                  <span className="counter-label">
                    {m[verdictLabels[verdict]]()}:{" "}
                  </span>
                  <span>{count}</span>
                  {manual > 0 && (
                    <span className="counter-label">
                      {" "}
                      · {m.override_count({ count: manual })}
                    </span>
                  )}
                </ToggleButton>
                <Tooltip>{label}</Tooltip>
              </TooltipTrigger>
            );
          })}
          {statusCount > 0 && (
            <MenuTrigger>
              <Button
                size="sm"
                variant="ghost"
                className="summary-status"
                aria-label={m.shell_status_count({ count: statusCount })}
              >
                <CircleDashed aria-hidden="true" size={16} />
                <span className="counter-label">
                  {m.shell_status_count({ count: statusCount })}
                </span>
                <span className="compact-status-count">{statusCount}</span>
              </Button>
              <Popover>
                <Menu aria-label={m.workspace_statuses()}>
                  {statuses.map(({ status, count }) => (
                    <MenuItem
                      key={status}
                      id={status}
                      textValue={`${m[statusLabels[status]]()}: ${count}`}
                      onAction={() => onFilter(`status:${status}`)}
                    >
                      <StatusIcon status={status} />
                      {m[statusLabels[status]]()}: {count}
                    </MenuItem>
                  ))}
                </Menu>
              </Popover>
            </MenuTrigger>
          )}
          <MenuTrigger>
            <IconButton size="sm" label={m.shell_summary_options()}>
              <Ellipsis aria-hidden="true" size={20} />
            </IconButton>
            <Popover>
              <Menu aria-label={m.shell_summary_options()}>
                <MenuItem onAction={() => setLabels(!labels)}>
                  {labels ? m.shell_compact_labels() : m.shell_show_labels()}
                </MenuItem>
                <MenuItem onAction={() => onFilter(null)}>
                  {m.workspace_all()}: {check.references.length}
                </MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
        </Toolbar>
        <div className="summary-wide-statuses">
          <p>{m.workspace_statuses()}</p>
          {statuses.map(({ status, count }) => (
            <button
              key={status}
              type="button"
              aria-pressed={filter === `status:${status}`}
              onClick={() => onFilter(`status:${status}`)}
            >
              <StatusIcon status={status} />
              {m[statusLabels[status]]()}: {count}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={filter === null}
            onClick={() => onFilter(null)}
          >
            {m.workspace_all()}: {check.references.length}
          </button>
        </div>
        <progress
          aria-label={m.check_progress_label()}
          value={completed}
          max={Math.max(1, check.references.length)}
        />
      </GlassSurface>
      {filter && (
        <div className="active-filter">
          <span>{m.shell_active_filter({ filter: filterLabel(filter) })}</span>
          <Button
            size="sm"
            onPress={() => onFilter(null)}
            aria-label={m.shell_remove_filter({ filter: filterLabel(filter) })}
          >
            ×
          </Button>
        </div>
      )}
    </section>
  );
}
