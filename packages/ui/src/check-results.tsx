// SPDX-License-Identifier: AGPL-3.0-or-later
import { effectiveVerdict } from "./effective-verdict.ts";
import { verdictLabels, statusLabels } from "./outcome-badges.tsx";
import { Button } from "./primitives/actions.tsx";
import { GlassSurface } from "./primitives/overlays.tsx";
import { useRef, useState } from "react";
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
import { m } from "@source-taster/i18n";
import {
  ReferenceActions,
  ReferenceListActions,
} from "./reference-actions.tsx";
import { GridList, GridListItem } from "./primitives/grid-list.tsx";
import {
  CheckSummary,
  matchesFilter,
  type OutcomeFilter,
} from "./check-summary.tsx";
import {
  ReferenceOutcomeHeader,
  ReferenceOutcomeSummary,
  ReferenceOutcomeView,
  sourceNames,
} from "./reference-outcome.tsx";
import { useReferenceWork, useSnapshotGate } from "./reference-work.ts";

function RunningStep({ reference }: { reference: ReferenceSlot }) {
  if (
    reference.outcome.kind !== "status" ||
    reference.outcome.status !== "running"
  )
    return null;
  return (
    <ol className="evidence-track">
      <li>
        <span aria-hidden="true">◌</span>
        {reference.progress === "queued"
          ? m.reference_queued()
          : Object.hasOwn(sourceNames, reference.progress)
            ? m.reference_source({
                source:
                  sourceNames[reference.progress as keyof typeof sourceNames],
              })
            : m.reference_checking()}
      </li>
    </ol>
  );
}
/** Selection is a stable slot, never an outcome, array index or sorted result. */
export function CheckResults({
  check,
  completed,
  citationStyle,
  citationStyleLabel,
  transport,
  quota,
  upgradeUrl,
  onSnapshot,
}: {
  quota: OwnerQuota | null;
  upgradeUrl?: string;
  check: Check;
  completed: number;
  citationStyle: CitationStyle;
  citationStyleLabel: string;
  transport: VerificationClientOptions;
  onSnapshot: (check: Check) => void;
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [filter, setFilter] = useState<OutcomeFilter>(null);
  const [selectedSlot, selectSlot] = useState(check.references[0]?.slot);
  const bibliography = useBibliography(
    check,
    citationStyle,
    transport,
    selectedSlot,
  );
  // "auto" leaves the layout to the stylesheet, the single breakpoint source:
  // two panes show the detail beside the list, a single pane shows the list.
  // An explicit open or Back holds across the breakpoint without a transient
  // state that hides focus.
  const [detailOpen, setDetailOpen] = useState<"auto" | "open" | "closed">(
    "auto",
  );
  // Drafts and in-flight requests outlive the keyed detail, so navigation
  // never silently drops unsaved work.
  const work = useReferenceWork();
  const gate = useSnapshotGate(check, onSnapshot);
  const list = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const buttons = useRef(new Map<number, HTMLDivElement>());
  const position = useRef({ list: 0, page: 0 });
  const visible = check.references.filter((reference) =>
    matchesFilter(reference, filter),
  );
  const selected = visible.find((reference) => reference.slot === selectedSlot);
  function open(slot: number) {
    position.current = {
      list: list.current?.scrollTop ?? 0,
      page: window.scrollY,
    };
    selectSlot(slot);
    setDetailOpen("open");
    requestAnimationFrame(() => heading.current?.focus());
  }
  function back() {
    setDetailOpen("closed");
    requestAnimationFrame(() => {
      if (selectedSlot !== undefined)
        buttons.current.get(selectedSlot)?.focus({ preventScroll: true });
      if (list.current) list.current.scrollTop = position.current.list;
      window.scrollTo({ top: position.current.page });
    });
  }
  return (
    <>
      <button
        type="button"
        className="my-3 rounded border border-border-emphasis p-3 underline"
        aria-expanded={helpOpen}
        aria-controls="check-explanation"
        onClick={() => setHelpOpen((value) => !value)}
      >
        {m.workspace_help()}
      </button>
      <section
        id="check-explanation"
        aria-label={m.workspace_help()}
        hidden={!helpOpen}
        className="my-3 space-y-3 rounded border border-border-emphasis bg-surface-sunken p-4"
      >
        <h2 className="font-semibold">{m.workspace_help()}</h2>
        <p>{m.workspace_human()}</p>
        <p>{m.workspace_method()}</p>
        <p>{m.workspace_limits()}</p>
        <p>{m.doi_uncalibrated()}</p>
      </section>
      <ReferenceExports
        checkId={check.id}
        importedFormat={importedFormat}
        transport={transport}
        rendered={bibliography}
        styleLabel={citationStyleLabel}
      />
      <ReportDownload
        check={check}
        citationStyle={citationStyle}
        transport={transport}
        quota={quota}
        upgradeUrl={upgradeUrl}
      />
      <ReferenceListActions
        check={check}
        transport={transport}
        onSnapshot={onSnapshot}
      />
      <BibliographyActions
        key={citationStyle}
        rendered={bibliography}
        styleLabel={citationStyleLabel}
      />
      <CheckSummary
        check={check}
        completed={completed}
        filter={filter}
        onFilter={(value) => {
          setFilter(value);
          // An explicit open returns to the stylesheet layout: two panes keep
          // the detail while its slot remains in the filtered feed, a single
          // pane returns to the filtered list.
          setDetailOpen((open) => (open === "open" ? "auto" : open));
        }}
      />
      <div
        className="check-panes"
        data-detail-open={selected ? detailOpen : "closed"}
      >
        <div ref={list} className="check-list">
          <p className="feed-sentence">
            {check.references.some(
              (r) =>
                r.outcome.kind === "status" && r.outcome.status === "running",
            )
              ? `${m.check_running()} · ${m.check_progress({ completed: String(completed), total: String(check.references.length) })}`
              : m.shell_feed_done({
                  correct: check.references.filter(
                    (r) => effectiveVerdict(r) === "correct",
                  ).length,
                  total: check.references.length,
                })}
          </p>
          <GridList
            aria-label={m.workspace_references()}
            className="space-y-4"
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
            {visible.map((reference) => (
              <GridListItem
                key={reference.slot}
                id={reference.slot}
                onAction={() => open(reference.slot)}
                textValue={reference.fields.title ?? reference.originalText}
                ref={(element) => {
                  if (element) buttons.current.set(reference.slot, element);
                  else buttons.current.delete(reference.slot);
                }}
                aria-label={`${m.workspace_open({ slot: reference.slot, title: reference.fields.title ?? reference.originalText })} · ${reference.outcome.kind === "status" ? m[statusLabels[reference.outcome.status]]() : m[verdictLabels[effectiveVerdict(reference)!]]()}`}
                className="feed-card"
              >
                <div className="feed-head">
                  <span className="feed-slot" aria-hidden="true">
                    {reference.slot}
                  </span>
                  <button
                    type="button"
                    aria-label={m.workspace_open({
                      slot: reference.slot,
                      title: reference.fields.title ?? reference.originalText,
                    })}
                    tabIndex={-1}
                    aria-current={
                      selectedSlot === reference.slot ? "true" : undefined
                    }
                    aria-controls="reference-detail"
                    onClick={() => open(reference.slot)}
                    className="w-full rounded text-left font-semibold underline decoration-border-emphasis underline-offset-4"
                  >
                    <span className="feed-title">
                      {reference.fields.title ?? reference.originalText}
                    </span>
                  </button>
                </div>
                <p className="feed-meta">
                  {reference.fields.author
                    ?.map(
                      (author) =>
                        author.literal ??
                        [author.given, author.family].filter(Boolean).join(" "),
                    )
                    .join("; ")}
                  {reference.fields.issued?.literal
                    ? ` · ${reference.fields.issued.literal}`
                    : ""}
                </p>
                <ReferenceOutcomeSummary
                  outcome={reference.outcome}
                  manualOverride={reference.manualOverride}
                />
                <RunningStep reference={reference} />
              </GridListItem>
            ))}
          </GridList>
          {!visible.length && (
            <p>
              <span>{m.workspace_empty()}</span>{" "}
              <button type="button" onClick={() => setFilter(null)}>
                {m.workspace_all()}
              </button>
            </p>
          )}
        </div>
        <section
          id="reference-detail"
          aria-labelledby="reference-detail-title"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
              event.preventDefault();
              back();
            }
          }}
          className="check-detail min-w-0 rounded-xl border border-border-emphasis p-4"
        >
          <Button className="check-back mb-3" onPress={back}>
            {m.workspace_back()}
          </Button>
          <h2
            id="reference-detail-title"
            ref={heading}
            tabIndex={-1}
            className="text-xl font-semibold"
          >
            {m.workspace_detail()}
          </h2>
          {selected ? (
            <>
              <RunningStep reference={selected} />
              <ReferenceOutcomeView
                header={
                  <GlassSurface
                    layer="detail-header"
                    className="detail-verdict-header"
                  >
                    <ReferenceOutcomeHeader
                      outcome={selected.outcome}
                      manualOverride={selected.manualOverride}
                    />
                  </GlassSurface>
                }
                outcome={selected.outcome}
                manualOverride={selected.manualOverride}
                originalText={selected.originalText}
              />
              <ReferenceActions
                key={selected.slot}
                check={check}
                reference={selected}
                bibliography={bibliography}
                transport={transport}
                work={work(selected.slot)}
                gate={gate}
              />
            </>
          ) : (
            <p>{m.workspace_select()}</p>
          )}
        </section>
      </div>
    </>
  );
}
