// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import * as Aria from "react-aria-components";
import { useStickySize } from "./sticky-layout.ts";
import {
  Check as CheckIcon,
  Filter,
  More,
  Square,
  X,
} from "./workspace-icons.tsx";
import type { Check, Verdict } from "@source-taster/contract-verification/v2";
import { effectiveVerdict } from "./effective-verdict.ts";
import { availability } from "./reference-fields.tsx";
import { m } from "@source-taster/i18n";
import {
  Button,
  IconButton,
  GlassSurface,
  MenuTrigger,
  Popover,
  Menu,
  MenuItem,
  Spinner,
} from "./primitives/index.ts";
import {
  verdictLabels,
  shortVerdictLabels,
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
/** One entry of the ⋯ "More actions" menu. A disabled entry states why. */
export interface StripAction {
  id: string;
  label: string;
  icon: ReactNode;
  onAction: () => void;
  disabledReason?: string;
}
export function MoreActions({
  actions,
  anchor,
}: {
  actions: StripAction[];
  /** D opens the Menu under the whole strip, not under its trigger. */
  anchor?: RefObject<HTMLElement | null>;
}) {
  const [open, setOpen] = useState(false);
  // React Aria places the Popover in document coordinates, so it would scroll
  // away from the sticky strip; D's Menu stays under the strip.
  const [top, setTop] = useState<number>();
  useEffect(() => {
    if (!open || !anchor) return;
    const update = () => {
      const box = anchor.current?.getBoundingClientRect();
      if (box) setTop(box.bottom - 5);
    };
    update();
    addEventListener("scroll", update, { capture: true, passive: true });
    return () => removeEventListener("scroll", update, { capture: true });
  }, [open, anchor]);
  return (
    <MenuTrigger
      isOpen={open}
      onOpenChange={(next) => {
        // The trigger sits in the sticky strip, so the Menu stays put while
        // the feed scrolls; D keeps it open. React Aria closes a non-modal
        // Popover on any scroll of the trigger's scroll parent.
        if (!next && globalThis.event?.type === "scroll") return;
        setOpen(next);
      }}
    >
      <IconButton size="sm" variant="secondary" label={m.shell_more_actions()}>
        <More aria-hidden="true" size={16} />
      </IconButton>
      <Popover
        placement="bottom end"
        className="strip-menu"
        {...(anchor ? { triggerRef: anchor, offset: -5, crossOffset: -9 } : {})}
        {...(anchor && top !== undefined
          ? { style: { position: "fixed", top } }
          : {})}
      >
        <Menu
          aria-label={m.shell_more_actions()}
          disabledKeys={actions
            .filter((action) => action.disabledReason)
            .map((action) => action.id)}
          onAction={(key) =>
            actions.find((action) => action.id === key)?.onAction()
          }
        >
          {actions.map((action) => (
            <MenuItem
              key={action.id}
              id={action.id}
              textValue={action.label}
              className="strip-menu-item"
            >
              {action.icon}
              <Aria.Text slot="label">{action.label}</Aria.Text>
              {/* The reason describes the item; it is not part of its name. */}
              {action.disabledReason && (
                <Aria.Text slot="description" elementType="small">
                  {action.disabledReason}
                </Aria.Text>
              )}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
/** The counter's name comes from its content: the full Verdict, then the
 *  visible count, so the name always contains the visible text (WCAG 2.5.3).
 *  The short tile label stays out of the name. */
function CounterName({ verdict }: { verdict: Verdict }) {
  return <span className="sr-only">{`${m[verdictLabels[verdict]]()}: `}</span>;
}
function counts(check: Check) {
  const verdicts = (Object.keys(verdictLabels) as Verdict[]).map((verdict) => {
    const matching = check.references.filter(
      (r) => effectiveVerdict(r) === verdict,
    );
    const manual = matching.filter((r) => r.manualOverride).length;
    return {
      verdict,
      count: matching.length,
      manual,
      label: `${m[verdictLabels[verdict]]()}: ${matching.length}${manual ? ` · ${m.override_count({ count: manual })}` : ""}`,
    };
  });
  const statuses = (Object.keys(statusLabels) as Status[])
    .map((status) => ({
      status,
      count: check.references.filter(
        (r) => r.outcome.kind === "status" && r.outcome.status === status,
      ).length,
    }))
    .filter((s) => s.count > 0);
  return { verdicts, statuses };
}
function Progress({
  completed,
  total,
  className,
}: {
  completed: number;
  total: number;
  className: string;
}) {
  return (
    <Aria.ProgressBar
      aria-label={m.check_progress_label()}
      value={completed}
      minValue={0}
      maxValue={Math.max(1, total)}
      valueLabel={m.check_progress({
        completed: String(completed),
        total: String(total),
      })}
      className={className}
    >
      {({ percentage }) => <i style={{ width: `${percentage ?? 0}%` }} />}
    </Aria.ProgressBar>
  );
}
/**
 * D's sticky summary strip. Wide: a phase row and six labelled counters.
 * Compact (narrow container, strip "a"): glyph + count buttons in one row.
 * The ⋯ menu carries every check-level action; nothing else hosts them.
 */
export function CheckSummary({
  check,
  filter,
  onFilter,
  completed,
  running,
  compact,
  stop,
  actions,
}: {
  check: Check;
  filter: OutcomeFilter;
  onFilter: (value: OutcomeFilter) => void;
  completed: number;
  running: boolean;
  compact: boolean;
  stop?: ReactNode;
  actions: StripAction[];
}) {
  const strip = useStickySize("--checking-strip-height");
  const menuAnchor = useRef<HTMLDivElement>(null);
  const { verdicts, statuses } = counts(check);
  const total = check.references.length;
  const statusCount = statuses.reduce((sum, s) => sum + s.count, 0);
  // "Show all labels" lays the narrow strip out like the wide one.
  const [labelled, setLabelled] = useState(false);
  const narrow = compact && !labelled;
  // D moves focus to ⋯ once "Hide labels" removes the toggle itself.
  const refocusMore = useRef(false);
  useEffect(() => {
    if (narrow && refocusMore.current) {
      refocusMore.current = false;
      const anchor = menuAnchor.current;
      // After React Aria settles the press on the removed toggle.
      requestAnimationFrame(() =>
        anchor
          ?.querySelector<HTMLElement>(
            `.summary-row [aria-haspopup][aria-label="${m.shell_more_actions()}"]`,
          )
          ?.focus(),
      );
    }
  }, [narrow]);
  // D leads the narrow ⋯ Menu with the label toggle.
  const menu: StripAction[] = compact
    ? [
        {
          id: "labels",
          label: labelled ? m.shell_hide_labels() : m.shell_show_labels(),
          icon: <Filter aria-hidden="true" size={16} />,
          onAction: () => setLabelled((value) => !value),
        },
        ...actions,
      ]
    : actions;
  // D: the wide strip states the filter as a plain row ("Filter on: x" +
  // a ghost "Clear filter"); the compact strip keeps the glyph chip.
  const filterRow =
    filter &&
    (narrow ? (
      <div className="active-filter compact">
        {filter.startsWith("status:") ? (
          <StatusIcon status={filter.slice(7) as Status} />
        ) : (
          <VerdictGlyph verdict={filter as Verdict} />
        )}
        <span>{filterLabel(filter)}</span>
        <IconButton
          size="sm"
          onPress={() => onFilter(null)}
          label={m.shell_remove_filter({ filter: filterLabel(filter) })}
        >
          <X aria-hidden="true" size={16} />
        </IconButton>
      </div>
    ) : (
      <div className="active-filter">
        <span>{m.shell_active_filter({ filter: filterLabel(filter) })}</span>
        <Button
          size="sm"
          variant="ghost"
          icon={<X aria-hidden="true" size={16} />}
          onPress={() => onFilter(null)}
        >
          {m.shell_clear_filter()}
        </Button>
      </div>
    ));
  return (
    <div ref={strip} className="summary-container">
      <section
        aria-label={m.workspace_summary()}
        className="summary-section"
        data-compact={narrow}
      >
        <GlassSurface
          ref={menuAnchor}
          layer="summary-strip"
          className="summary-strip"
        >
          {narrow ? (
            <>
              {/* One keyboard stop: arrow keys move between the counters,
                  the status filter and the ⋯ Menu. */}
              <Aria.Toolbar
                aria-label={m.workspace_summary()}
                className="summary-row"
              >
                <div
                  role="group"
                  aria-label={m.shell_verdicts()}
                  className="summary-compact-counts"
                >
                  {verdicts.map(({ verdict, count, manual }) => (
                    <Aria.ToggleButton
                      key={verdict}
                      isSelected={filter === verdict}
                      isDisabled={count === 0 && filter !== verdict}
                      onChange={() =>
                        onFilter(filter === verdict ? null : verdict)
                      }
                      className="summary-counter compact"
                      data-verdict={verdict}
                    >
                      <VerdictGlyph verdict={verdict} />
                      <CounterName verdict={verdict} />
                      <span className="summary-count">{count}</span>
                      {manual > 0 && (
                        <span className="sr-only">{` · ${m.override_count({ count: manual })}`}</span>
                      )}
                    </Aria.ToggleButton>
                  ))}
                </div>
                {statusCount > 0 && (
                  <MenuTrigger>
                    <Aria.Button
                      aria-label={`${m.workspace_statuses()}: ${statuses.map((s) => `${m[statusLabels[s.status]]()} ${s.count}`).join(", ")}`}
                      className="summary-status compact"
                      data-pressed={filter?.startsWith("status:") || undefined}
                    >
                      <StatusIcon status={statuses[0]!.status} />
                      <span className="summary-count" aria-hidden="true">
                        {statusCount}
                      </span>
                    </Aria.Button>
                    <Popover placement="bottom end">
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
                <MoreActions actions={menu} anchor={menuAnchor} />
              </Aria.Toolbar>
              {filterRow}
              {running && (
                <Progress
                  completed={completed}
                  total={total}
                  className="summary-progress compact"
                />
              )}
            </>
          ) : (
            <>
              <div className="summary-row">
                {running ? (
                  <>
                    <span className="summary-phase">
                      <StatusIcon status="running" size={18} />
                      {m.shell_check_in_progress()}
                    </span>
                    <span className="summary-checked">
                      {m.shell_checked({
                        completed: String(completed),
                        total: String(total),
                      })}
                    </span>
                    <Progress
                      completed={completed}
                      total={total}
                      className="summary-progress"
                    />
                    {stop}
                  </>
                ) : (
                  <>
                    <span className="summary-phase">
                      <CheckIcon aria-hidden="true" size={18} />
                      {m.shell_check_complete()}
                    </span>
                    <span className="summary-sentence">
                      {m.shell_feed_done({
                        correct: verdicts[0]!.count,
                        total,
                      })}
                    </span>
                    <span className="summary-spacer" />
                  </>
                )}
                {compact && (
                  <IconButton
                    size="sm"
                    variant="secondary"
                    label={m.shell_hide_labels()}
                    aria-expanded
                    onPress={() => {
                      refocusMore.current = true;
                      setLabelled(false);
                    }}
                  >
                    <Filter aria-hidden="true" size={16} />
                  </IconButton>
                )}
                <MoreActions actions={menu} anchor={menuAnchor} />
              </div>
              <Aria.Toolbar
                aria-label={m.shell_outcome_filters()}
                className="summary-counts"
              >
                <div
                  role="group"
                  aria-label={m.shell_verdicts()}
                  className="summary-verdicts"
                >
                  {verdicts.map(({ verdict, count, manual }) => (
                    <Aria.ToggleButton
                      key={verdict}
                      isSelected={filter === verdict}
                      isDisabled={count === 0 && filter !== verdict}
                      onChange={() =>
                        onFilter(filter === verdict ? null : verdict)
                      }
                      className="summary-counter"
                      data-verdict={verdict}
                    >
                      <VerdictGlyph verdict={verdict} />
                      <CounterName verdict={verdict} />
                      <span className="summary-count">{count}</span>
                      <span className="summary-label">
                        <span aria-hidden="true">
                          {m[shortVerdictLabels[verdict]]()}
                        </span>
                        {manual > 0 &&
                          ` · ${m.override_count({ count: manual })}`}
                      </span>
                    </Aria.ToggleButton>
                  ))}
                </div>
                {statusCount > 0 && (
                  <div
                    role="group"
                    aria-label={m.workspace_statuses()}
                    className="summary-statuses"
                  >
                    <span className="summary-eyebrow" aria-hidden="true">
                      {m.workspace_statuses()}
                    </span>
                    {statuses.map(({ status, count }) => (
                      <Aria.ToggleButton
                        key={status}
                        isSelected={filter === `status:${status}`}
                        onChange={() =>
                          onFilter(
                            filter === `status:${status}`
                              ? null
                              : `status:${status}`,
                          )
                        }
                        className="summary-status"
                      >
                        {/* The visible "Running 1" is the name (WCAG 2.5.3);
                            label before count, as D's status chips. */}
                        <StatusIcon status={status} />
                        <span>
                          {m[statusLabels[status]]()} {count}
                        </span>
                      </Aria.ToggleButton>
                    ))}
                  </div>
                )}
              </Aria.Toolbar>
              {filterRow}
            </>
          )}
        </GlassSurface>
      </section>
    </div>
  );
}
/** Compact running/done line above the feed, standing in for the wide phase row. */
export function SummaryLede({
  check,
  running,
  completed,
  stop,
}: {
  check: Check;
  running: boolean;
  completed: number;
  stop?: ReactNode;
}) {
  const total = check.references.length;
  return (
    <p className="feed-lede">
      {running ? (
        <>
          <span className="feed-lede-phase">
            <StatusIcon status="running" size={18} />
            {m.shell_run_lede({
              completed: String(completed),
              total: String(total),
            })}
          </span>
          {stop}
        </>
      ) : (
        m.shell_feed_done({
          correct: check.references.filter(
            (r) => effectiveVerdict(r) === "correct",
          ).length,
          total,
        })
      )}
    </p>
  );
}
export function StopButton({
  onStop,
  pending,
}: {
  onStop: () => void;
  pending: boolean;
}) {
  return (
    // Disabled with a reason rather than isPending: a pending button announces
    // its label through a live node that outlives the button once the Check
    // ends, which leaves an unnamed image behind.
    <Button
      size="sm"
      icon={
        pending ? (
          <Spinner size={16} />
        ) : (
          <Square aria-hidden="true" size={16} />
        )
      }
      {...availability(pending, m.check_cancelling)}
      onPress={onStop}
    >
      {pending ? m.check_cancelling() : m.check_cancel()}
    </Button>
  );
}
