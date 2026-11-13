// SPDX-License-Identifier: AGPL-3.0-or-later
import { effectiveVerdict } from "./effective-verdict.ts";
import {
  verdictLabels,
  statusLabels,
  VerdictGlyph,
} from "./outcome-badges.tsx";
import { Button, IconButton } from "./primitives/actions.tsx";
import {
  AlertDialog,
  Dialog,
  DialogHeading,
  GlassSurface,
  Modal,
} from "./primitives/overlays.tsx";
import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useStickySize } from "./sticky-layout.ts";
import type {
  Check,
  ReferenceSlot,
  Verdict,
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
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  FileDown,
  FileText,
  List,
  ListPlus,
  PanelRight,
  PencilLine,
  RotateCcw,
  Shield,
  Square,
  X,
} from "lucide-react";
import { m } from "@source-taster/i18n";
import {
  evidenceLabel,
  evidenceStep,
  queriedSources,
  StepIcon,
  type StepState,
} from "./evidence-steps.tsx";
import { ReferenceActions } from "./reference-actions.tsx";
import { ReferenceListActions } from "./reference-list-actions.tsx";
import { GridList, GridListItem } from "./primitives/grid-list.tsx";
import {
  CheckSummary,
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

/** D switches to the compact strip and the full-cover detail below 700 px. */
const NARROW = 700;
function useNarrow(ref: RefObject<HTMLElement | null>) {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setNarrow(element.clientWidth < NARROW);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return narrow;
}

const verdictStep: Record<Verdict, StepState> = {
  correct: "ok",
  "exists-with-deviations": "diff",
  "mixed-citation": "diff",
  "doi-conflict": "bad",
  "not-found": "none",
  "not-verifiable": "warn",
};
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
  if (outcome.kind === "status") {
    if (outcome.status !== "running") return null;
    const queued = reference.progress === "queued";
    return (
      <div className="card-track">
        <ol className="evidence-track" aria-label={runningText(reference)}>
          <li className="track-node" data-state={queued ? "pend" : "cur"} />
        </ol>
        <span className="card-step">{runningText(reference)}</span>
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
          <VerdictGlyph verdict={verdict} />
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
export function CheckResults({
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
}: {
  quota: OwnerQuota | null;
  upgradeUrl?: string;
  check: Check;
  completed: number;
  /** The Check still has a running Reference and can be stopped. */
  running: boolean;
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
      icon: <BookOpenText aria-hidden="true" size={16} />,
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
                  aria-label={`${m.workspace_open({ slot: reference.slot, title: titleOf(reference) })} · ${reference.outcome.kind === "status" ? m[statusLabels[reference.outcome.status]]() : m[verdictLabels[verdict!]]()}${unsaved ? ` · ${m.feed_unsaved_draft()}` : ""}`}
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
          <footer className="feed-foot">
            {footer}
            <p className="feed-foot-row">
              <Shield aria-hidden="true" size={16} />
              <span>
                {m.shell_feed_disclaimer()}{" "}
                <button
                  type="button"
                  className="feed-link"
                  onClick={() => setDialog("help")}
                >
                  {m.workspace_help()}
                </button>
              </span>
            </p>
          </footer>
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
              <span className="detail-position">
                {m.shell_reference_position({
                  position: String(selectedIndex + 1),
                  total: String(visible.length),
                })}
              </span>
              {/* At either end the arrow gives way to a same-size gap rather
                than a disabled control: the position already says why, and
                every page change moves focus to the title. */}
              <div className="detail-pager">
                {selectedIndex > 0 ? (
                  <IconButton
                    size="sm"
                    variant="secondary"
                    label={m.shell_previous_reference()}
                    onPress={() => open(visible[selectedIndex - 1]!.slot)}
                  >
                    <ChevronLeft aria-hidden="true" size={16} />
                  </IconButton>
                ) : (
                  <span className="detail-pager-gap" />
                )}
                {selectedIndex < visible.length - 1 ? (
                  <IconButton
                    size="sm"
                    variant="secondary"
                    label={m.shell_next_reference()}
                    onPress={() => open(visible[selectedIndex + 1]!.slot)}
                  >
                    <ChevronRight aria-hidden="true" size={16} />
                  </IconButton>
                ) : (
                  <span className="detail-pager-gap" />
                )}
              </div>
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
                comparison={(action, editor) =>
                  selected.outcome.kind === "verdict" ? (
                    <BestMatchComparison
                      outcome={selected.outcome}
                      action={action}
                    >
                      {editor}
                    </BestMatchComparison>
                  ) : (
                    <DetailSection
                      title={m.shell_field_by_field()}
                      action={action}
                    >
                      {editor}
                    </DetailSection>
                  )
                }
                evidence={<EvidenceDetails outcome={selected.outcome} />}
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
      >
        <ReportDownload
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
      <Modal
        isOpen={dialog === "help"}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDialog(null);
        }}
      >
        <Dialog className="workspace-dialog">
          {({ close }) => (
            <>
              <DialogHeading>{m.workspace_help()}</DialogHeading>
              <ol className="workspace-dialog-steps">
                <li>{m.workspace_method()}</li>
                <li>{m.workspace_limits()}</li>
                <li>{m.doi_uncalibrated()}</li>
              </ol>
              <p className="detail-note">{m.workspace_human()}</p>
              <div className="st-actions">
                <Button variant="primary" onPress={close}>
                  {m.shell_close()}
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
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
          onAction={onReset}
        >
          {m.shell_reset_confirm()}
        </AlertDialog>
      </Modal>
    </div>
  );
}
