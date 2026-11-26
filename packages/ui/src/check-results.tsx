// SPDX-License-Identifier: AGPL-3.0-or-later
import { effectiveVerdict } from "./effective-verdict.ts";
import {
  ConnectionLostContext,
  verdictLabels,
  StatusIcon,
  VerdictGlyph,
  useStatusLabel,
} from "./outcome-badges.tsx";
import { Button } from "./primitives/actions.tsx";
import {
  AlertDialog,
  Dialog,
  GlassSurface,
  Modal,
} from "./primitives/overlays.tsx";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import type { PaletteCommand } from "./checking-top-bar.tsx";
import { useNarrow, useStickySize } from "./sticky-layout.ts";
import type {
  Check,
  ReferenceSlot,
} from "@source-taster/contract-verification/v2";
import type { VerificationClientOptions } from "@source-taster/contract-verification/client-v2";
import type { CitationStyle } from "./preferences.ts";
import {
  useBibliography,
  BibliographyActions,
} from "./correction-suggestions.tsx";
import { ReferenceExports } from "./reference-exports.tsx";
import type { OwnerQuota } from "./quota.ts";
import { ReportDownload } from "./report-download.tsx";
import { HowItWorksDialog } from "./how-it-works.tsx";
import { PanelRight } from "lucide-react";
import {
  ChevronLeft,
  CircleHelp,
  Download,
  FileDown,
  FileText,
  List,
  ListPlus,
  Filter,
  PencilLine,
  RotateCcw,
  Square,
  X,
} from "./workspace-icons.tsx";
import { m } from "@source-taster/i18n";
import {
  EndIcon,
  evidenceLabel,
  evidenceStep,
  queriedSources,
  StepIcon,
  verdictStep,
} from "./evidence-steps.tsx";
import { ReferenceActions } from "./reference-actions.tsx";
import { Fields } from "./reference-fields.tsx";
import { ReferenceListActions } from "./reference-list-actions.tsx";
import { GridList, GridListItem } from "./primitives/grid-list.tsx";
import {
  CheckSummary,
  counts,
  matchesFilter,
  StopButton,
  SummaryLede,
  type OutcomeFilter,
  type StripAction,
} from "./check-summary.tsx";
import {
  BestMatchComparison,
  DetailSection,
  EvidenceDetails,
  suggestionProvenance,
  OriginalInput,
  outcomeReasons,
  ReferenceOutcomeSummary,
  sourceNames,
  VerdictBlock,
} from "./reference-outcome.tsx";
import {
  isDirty,
  useReferenceWork,
  useSnapshotGate,
} from "./reference-work.ts";

function runningText(reference: ReferenceSlot) {
  return reference.progress === "queued"
    ? m.reference_queued()
    : Object.hasOwn(sourceNames, reference.progress)
      ? m.reference_source({
          source: sourceNames[reference.progress as keyof typeof sourceNames],
        })
      : m.reference_checking();
}
/** The card's evidence trail: one node per consulted Data source, then the Verdict. */
function EvidenceTrack({ reference }: { reference: ReferenceSlot }) {
  const { outcome } = reference;
  const lost = useContext(ConnectionLostContext);
  if (outcome.kind === "status") {
    if (outcome.status !== "running") return null;
    // Without the connection the step is not known: no current node, no step.
    const queued = lost || reference.progress === "queued";
    const text = lost ? m.reference_connection_lost() : runningText(reference);
    return (
      <div className="card-track">
        <ol className="evidence-track" aria-label={text}>
          <li className="track-node" data-state={queued ? "pend" : "cur"}>
            {!queued && <StatusIcon status="running" size={16} />}
          </li>
        </ol>
        <span className="card-step">{text}</span>
      </div>
    );
  }
  const steps = queriedSources(outcome.evidence);
  const verdict = reference.manualOverride?.verdict ?? outcome.verdict;
  const total = steps.length + 1;
  return (
    <div className="card-track">
      <ol
        className="evidence-track"
        aria-label={m.shell_evidence_track({
          done: String(total),
          total: String(total),
        })}
      >
        {steps.map((evidence) => (
          <li
            key={evidence.source}
            className="track-node"
            data-state={evidenceStep[evidence.outcome]}
          >
            <StepIcon state={evidenceStep[evidence.outcome]!} />
            <span className="sr-only">
              {sourceNames[evidence.source]}: {evidenceLabel(evidence.outcome)}
            </span>
          </li>
        ))}
        <li className="track-node" data-state={verdictStep[verdict]}>
          <EndIcon />
          <span className="sr-only">{m[verdictLabels[verdict]]()}</span>
        </li>
      </ol>
      <span className="card-step">
        {m.shell_evidence_steps({ count: String(total) })}
      </span>
    </div>
  );
}
function authorLine(reference: ReferenceSlot) {
  return [
    reference.fields.author
      ?.map(
        (author) =>
          author.literal ??
          [author.given, author.family].filter(Boolean).join(" "),
      )
      .join("; "),
    reference.fields.issued?.literal,
  ]
    .filter(Boolean)
    .join(" · ");
}
function titleOf(reference: ReferenceSlot) {
  return reference.fields.title ?? reference.originalText;
}
/** The sticky drawer header reports its height, so that scrolling a control
 *  into view clears it instead of leaving the control half underneath. */
function DetailHeader({ children }: { children: ReactNode }) {
  const header = useStickySize("--detail-header-height");
  return (
    <GlassSurface ref={header} layer="detail-header" className="detail-head">
      {children}
    </GlassSurface>
  );
}
type MenuDialog =
  "export" | "report" | "bibliography" | "help" | "edit-list" | "reset";
function ActionDialog({
  label,
  isOpen,
  onClose,
  ownActions,
  children,
}: {
  label: string;
  isOpen: boolean;
  onClose: () => void;
  /** The content renders its own Cancel and primary action. */
  ownActions?: boolean;
  children: ReactNode;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog aria-label={label} className="workspace-dialog">
        {({ close }) => (
          <>
            {children}
            {!ownActions && (
              <div className="st-actions">
                <Button variant="ghost" onPress={close}>
                  {m.shell_close()}
                </Button>
              </div>
            )}
          </>
        )}
      </Dialog>
    </Modal>
  );
}
export type IntakeSource = "text" | "file" | "selection";
/** Selection is a stable slot, never an outcome, array index or sorted result. */
function CheckResultsStage({
  check,
  completed,
  running,
  citationStyle,
  citationStyleLabel,
  transport,
  quota,
  upgradeUrl,
  onSnapshot,
  onStop,
  stopping,
  onReset,
  busy,
  source,
  sourceLabel,
  notices,
  footer,
  onCommands,
}: {
  quota: OwnerQuota | null;
  upgradeUrl?: string;
  check: Check;
  completed: number;
  /** The Check still has a running Reference and can be stopped. */
  running: boolean;
  /** The workspace stopped following this Check: running slots are unknown, not running. */
  connectionLost?: boolean;
  citationStyle: CitationStyle;
  citationStyleLabel: string;
  transport: VerificationClientOptions;
  onSnapshot: (check: Check) => void;
  onStop: () => void;
  stopping: boolean;
  onReset: () => void;
  /** A list edit would race with work in flight. */
  busy: boolean;
  source: IntakeSource;
  sourceLabel: string;
  notices?: ReactNode;
  footer?: ReactNode;
  /** Receives the launcher's Actions, Filters and References of this view. */
  onCommands?: (commands: PaletteCommand[]) => void;
}) {
  const firstFormat =
    check.references[0]?.revisions[0]?.reference.imported?.format;
  const importedFormat =
    firstFormat &&
    check.references.every(
      (reference) =>
        reference.revisions[0]?.reference.imported?.format === firstFormat,
    )
      ? firstFormat
      : undefined;
  const statusLabel = useStatusLabel();
  const [dialog, setDialog] = useState<MenuDialog | null>(null);
  const [filter, setFilter] = useState<OutcomeFilter>(null);
  const [selectedSlot, selectSlot] = useState(check.references[0]?.slot);
  const bibliography = useBibliography(
    check,
    citationStyle,
    transport,
    selectedSlot,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  // Drafts and in-flight requests outlive the keyed detail, so navigation
  // never silently drops unsaved work.
  const work = useReferenceWork();
  const gate = useSnapshotGate(check, onSnapshot);
  const stage = useRef<HTMLDivElement>(null);
  const narrow = useNarrow(stage);
  const heading = useRef<HTMLHeadingElement>(null);
  const cards = useRef(new Map<number, HTMLDivElement>());
  const position = useRef(0);
  const visible = check.references.filter((reference) =>
    matchesFilter(reference, filter),
  );
  const selectedIndex = visible.findIndex(
    (reference) => reference.slot === selectedSlot,
  );
  const selected = visible[selectedIndex];
  const showDetail = detailOpen && !!selected;
  function open(slot: number) {
    if (!showDetail) position.current = window.scrollY;
    selectSlot(slot);
    setDetailOpen(true);
    requestAnimationFrame(() => {
      // Narrow: the detail replaces the feed in the document flow.
      if (narrow) window.scrollTo({ top: 0 });
      heading.current?.focus({ preventScroll: narrow });
    });
  }
  function back() {
    setDetailOpen(false);
    requestAnimationFrame(() => {
      if (selectedSlot !== undefined)
        cards.current.get(selectedSlot)?.focus({ preventScroll: true });
      if (narrow) window.scrollTo({ top: position.current });
    });
  }
  const stop = <StopButton onStop={onStop} pending={stopping} />;
  const actions: StripAction[] = [
    {
      id: "stop",
      label: m.check_cancel(),
      icon: <Square aria-hidden="true" size={16} />,
      onAction: onStop,
      disabledReason: running ? undefined : m.shell_stop_reason(),
    },
    {
      id: "reset",
      label: m.check_reset(),
      icon: <RotateCcw aria-hidden="true" size={16} />,
      onAction: () => setDialog("reset"),
    },
    {
      id: "export",
      label: m.shell_export(),
      icon: <Download aria-hidden="true" size={16} />,
      onAction: () => setDialog("export"),
    },
    {
      id: "report",
      label: m.shell_report(),
      icon: <FileDown aria-hidden="true" size={16} />,
      onAction: () => setDialog("report"),
    },
    {
      id: "bibliography",
      label: m.bibliography_heading(),
      icon: <List aria-hidden="true" size={16} />,
      onAction: () => setDialog("bibliography"),
    },
    {
      id: "help",
      label: m.workspace_help(),
      icon: <CircleHelp aria-hidden="true" size={16} />,
      onAction: () => setDialog("help"),
    },
    {
      id: "edit-list",
      label: m.revision_list(),
      icon: <ListPlus aria-hidden="true" size={16} />,
      onAction: () => setDialog("edit-list"),
      disabledReason: busy ? m.shell_edit_list_reason() : undefined,
    },
  ];
  // #194 D cmdItems: the strip's Actions (Stop and Reset come from the
  // workspace), one filter per Verdict and present technical status, then
  // every Reference.
  const tally = counts(check);
  const commands: PaletteCommand[] = [
    ...actions
      // D's palette leaves the bibliography to the ⋯ Menu.
      .filter(
        (action) =>
          action.id !== "stop" &&
          action.id !== "reset" &&
          action.id !== "bibliography",
      )
      .map((action) => ({
        id: action.id,
        group: "actions" as const,
        label: action.label,
        icon: action.icon,
        onAction: action.onAction,
        disabledReason: action.disabledReason,
      })),
    ...tally.verdicts.map(({ verdict, count }) => ({
      id: `filter:${verdict}`,
      group: "filters" as const,
      label: m.shell_filter_command({
        label: m[verdictLabels[verdict]](),
        count: String(count),
      }),
      icon: <VerdictGlyph verdict={verdict} />,
      onAction: () => setFilter(verdict),
    })),
    ...tally.statuses.map(({ status, count }) => ({
      id: `filter:status:${status}`,
      group: "filters" as const,
      label: m.shell_filter_command({
        label: statusLabel(status),
        count: String(count),
      }),
      icon: <Filter aria-hidden="true" size={16} />,
      onAction: () => setFilter(`status:${status}` as const),
    })),
    ...(filter
      ? [
          {
            id: "filter:clear",
            group: "filters" as const,
            label: m.shell_clear_filter(),
            icon: <X aria-hidden="true" size={16} />,
            onAction: () => setFilter(null),
          },
        ]
      : []),
    ...check.references.map((reference) => ({
      id: `reference:${reference.slot}`,
      group: "references" as const,
      label: m.shell_reference_command({
        slot: String(reference.slot),
        title: titleOf(reference),
      }),
      icon: <FileText aria-hidden="true" size={16} />,
      onAction: () => {
        if (!matchesFilter(reference, filter)) setFilter(null);
        open(reference.slot);
      },
    })),
  ];
  // Handlers change every render; publish only when a row changes and run
  // the latest handler through the ref.
  const latest = useRef(commands);
  useLayoutEffect(() => {
    latest.current = commands;
  });
  const signature = JSON.stringify(
    commands.map((command) => [
      command.id,
      command.label,
      command.disabledReason ?? "",
    ]),
  );
  useEffect(() => {
    if (!onCommands) return;
    onCommands(
      latest.current.map((command) => ({
        ...command,
        onAction: () =>
          latest.current.find((row) => row.id === command.id)?.onAction?.(),
      })),
    );
  }, [signature, onCommands]);
  useEffect(() => () => onCommands?.([]), [onCommands]);
  const SourceIcon =
    source === "file" ? FileText : source === "selection" ? PanelRight : List;
  return (
    <div
      ref={stage}
      className="check-stage"
      data-narrow={narrow}
      data-detail-open={showDetail}
    >
      <div className="check-main" inert={narrow && showDetail}>
        <CheckSummary
          check={check}
          completed={completed}
          running={running}
          compact={narrow}
          stop={stop}
          actions={actions}
          filter={filter}
          onFilter={setFilter}
        />
        <div className="check-feed">
          {narrow && (
            <SummaryLede
              check={check}
              running={running}
              completed={completed}
              stop={stop}
            />
          )}
          <p className="feed-echo">
            <SourceIcon aria-hidden="true" size={16} />
            <b>{sourceLabel}</b>
            <span className="feed-echo-count">
              ·{" "}
              {check.references.length === 1
                ? m.workspace_recognized_one()
                : m.workspace_recognized({ count: check.references.length })}
            </span>
          </p>
          {running && <p className="feed-note">{m.shell_order_note()}</p>}
          {notices}
          <GridList
            aria-label={m.workspace_references()}
            className="feed-cards"
            selectionMode="single"
            selectionBehavior="replace"
            selectedKeys={selectedSlot === undefined ? [] : [selectedSlot]}
            onSelectionChange={(keys) => {
              if (keys !== "all") {
                const key = [...keys][0];
                if (key !== undefined) selectSlot(Number(key));
              }
            }}
          >
            {visible.map((reference) => {
              const draft = work(reference.slot).draft;
              const unsaved = !!draft && isDirty(draft);
              const verdict = effectiveVerdict(reference);
              const reasons = outcomeReasons(reference.outcome);
              return (
                <GridListItem
                  key={reference.slot}
                  id={reference.slot}
                  onAction={() => open(reference.slot)}
                  textValue={titleOf(reference)}
                  ref={(element) => {
                    if (element) cards.current.set(reference.slot, element);
                    else cards.current.delete(reference.slot);
                  }}
                  aria-label={`${m.workspace_open({ slot: reference.slot, title: titleOf(reference) })} · ${reference.outcome.kind === "status" ? statusLabel(reference.outcome.status) : m[verdictLabels[verdict!]]()}${unsaved ? ` · ${m.feed_unsaved_draft()}` : ""}`}
                  className="feed-card"
                  data-verdict={verdict}
                  data-current={
                    showDetail && selectedSlot === reference.slot
                      ? true
                      : undefined
                  }
                >
                  <span className="card-num" aria-hidden="true">
                    {reference.slot}
                  </span>
                  <div className="card-main">
                    <h3 className="card-title">
                      <button
                        type="button"
                        aria-label={m.workspace_open({
                          slot: reference.slot,
                          title: titleOf(reference),
                        })}
                        tabIndex={-1}
                        aria-current={
                          showDetail && selectedSlot === reference.slot
                            ? "true"
                            : undefined
                        }
                        aria-controls={
                          showDetail ? "reference-detail" : undefined
                        }
                        onClick={() => open(reference.slot)}
                        className="card-open"
                      >
                        {titleOf(reference)}
                      </button>
                    </h3>
                    <p className="card-meta">{authorLine(reference)}</p>
                  </div>
                  <div className="card-result">
                    <ReferenceOutcomeSummary
                      outcome={reference.outcome}
                      manualOverride={reference.manualOverride}
                    />
                  </div>
                  <EvidenceTrack reference={reference} />
                  {!!reasons.length && (
                    <p className="card-reason">{reasons.join(" ")}</p>
                  )}
                  {unsaved && (
                    // Text and a glyph, never colour alone: an unsaved draft
                    // must be findable from the feed.
                    <p className="feed-draft">
                      <PencilLine aria-hidden="true" size={16} />
                      <span>{m.feed_unsaved_draft()}</span>
                    </p>
                  )}
                </GridListItem>
              );
            })}
          </GridList>
          {!visible.length && (
            <div className="feed-empty">
              <p>{m.workspace_empty()}</p>
              <Button size="sm" onPress={() => setFilter(null)}>
                {m.workspace_all()}
              </Button>
            </div>
          )}
          <footer className="feed-foot">{footer}</footer>
        </div>
      </div>
      {showDetail && (
        // The slot opts the window out of anchoring inside the detail's own
        // scroller (#220); the pane keeps its anchoring.
        <div className="check-detail-slot">
          <section
            id="reference-detail"
            aria-label={m.workspace_detail()}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !event.defaultPrevented) {
                event.preventDefault();
                back();
              }
            }}
            className="check-detail"
          >
            <DetailHeader>
              <Button
                size="sm"
                variant="ghost"
                className="check-back"
                icon={
                  narrow ? (
                    <ChevronLeft aria-hidden="true" size={16} />
                  ) : (
                    <X aria-hidden="true" size={16} />
                  )
                }
                aria-label={narrow ? m.workspace_back() : undefined}
                onPress={back}
              >
                {narrow ? m.shell_back() : m.shell_close()}
              </Button>
            </DetailHeader>
            <div className="detail-body">
              <div>
                <h2
                  id="reference-detail-title"
                  ref={heading}
                  tabIndex={-1}
                  className="detail-title"
                >
                  {titleOf(selected)}
                </h2>
                <p className="detail-authors">{authorLine(selected)}</p>
              </div>
              <VerdictBlock
                outcome={selected.outcome}
                manualOverride={selected.manualOverride}
              >
                {/* D: the step track belongs to a running Reference; a finished
                  one shows its evidence trail further down. */}
                {selected.outcome.kind === "status" &&
                  selected.outcome.status === "running" && (
                    <EvidenceTrack reference={selected} />
                  )}
              </VerdictBlock>
              <OriginalInput text={selected.originalText} />
              <ReferenceActions
                key={selected.slot}
                check={check}
                reference={selected}
                bibliography={bibliography}
                transport={transport}
                work={work(selected.slot)}
                gate={gate}
                comparison={(action, edit) =>
                  selected.outcome.kind === "verdict" ? (
                    <BestMatchComparison
                      outcome={selected.outcome}
                      action={action}
                      editing={edit?.editing}
                    >
                      {edit?.form()}
                    </BestMatchComparison>
                  ) : (
                    <DetailSection
                      title={m.shell_field_by_field()}
                      action={action}
                    >
                      {edit?.form(
                        <Fields
                          fields={edit.editing.fields}
                          onChange={edit.editing.onChange}
                          truncated={edit.editing.truncated}
                          onTruncated={edit.editing.onTruncated}
                          disabled={edit.editing.disabled}
                        />,
                      )}
                    </DetailSection>
                  )
                }
                evidence={
                  <EvidenceDetails
                    outcome={selected.outcome}
                    manualOverride={selected.manualOverride}
                  />
                }
                provenance={suggestionProvenance(
                  selected.outcome,
                  citationStyleLabel,
                )}
              />
            </div>
          </section>
        </div>
      )}
      <ActionDialog
        label={m.export_references_heading()}
        isOpen={dialog === "export"}
        onClose={() => setDialog(null)}
        ownActions
      >
        <ReferenceExports
          onCancel={() => setDialog(null)}
          checkId={check.id}
          importedFormat={importedFormat}
          transport={transport}
          rendered={bibliography}
          styleLabel={citationStyleLabel}
        />
      </ActionDialog>
      <ActionDialog
        label={m.report_ui_heading()}
        isOpen={dialog === "report"}
        onClose={() => setDialog(null)}
        ownActions
      >
        <ReportDownload
          onClose={() => setDialog(null)}
          check={check}
          citationStyle={citationStyle}
          transport={transport}
          quota={quota}
          upgradeUrl={upgradeUrl}
        />
      </ActionDialog>
      <ActionDialog
        label={m.bibliography_heading()}
        isOpen={dialog === "bibliography"}
        onClose={() => setDialog(null)}
      >
        <BibliographyActions
          key={citationStyle}
          rendered={bibliography}
          styleLabel={citationStyleLabel}
        />
      </ActionDialog>
      <ActionDialog
        label={m.revision_list()}
        isOpen={dialog === "edit-list"}
        onClose={() => setDialog(null)}
      >
        <ReferenceListActions
          check={check}
          transport={transport}
          onSnapshot={onSnapshot}
          autoStart
          onDone={() => setDialog(null)}
        />
      </ActionDialog>
      <HowItWorksDialog
        quota={transport.credentials !== undefined}
        isOpen={dialog === "help"}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDialog(null);
        }}
      />
      <Modal
        isOpen={dialog === "reset"}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDialog(null);
        }}
      >
        <AlertDialog
          title={m.check_reset()}
          cancelLabel={m.shell_keep()}
          actionLabel={m.check_reset()}
          actionIcon={<RotateCcw aria-hidden="true" />}
          onAction={onReset}
        >
          {m.shell_reset_confirm()}
        </AlertDialog>
      </Modal>
    </div>
  );
}
/** The Check's feed and detail, which report a lost connection as one fact. */
export function CheckResults(props: ComponentProps<typeof CheckResultsStage>) {
  return (
    <ConnectionLostContext value={props.connectionLost ?? false}>
      <CheckResultsStage {...props} />
    </ConnectionLostContext>
  );
}
