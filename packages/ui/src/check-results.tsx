// SPDX-License-Identifier: AGPL-3.0-or-later
import { useRef, useState } from "react";
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
  CorrectionSuggestion,
} from "./correction-suggestions.tsx";
import { ReferenceExports } from "./reference-exports.tsx";
import { m } from "@source-taster/i18n";
import {
  ReferenceActions,
  ReferenceListActions,
} from "./reference-actions.tsx";
import { CheckSummary } from "./check-summary.tsx";
import {
  ReferenceOutcomeSummary,
  ReferenceOutcomeView,
  sourceNames,
} from "./reference-outcome.tsx";

function RunningStep({ reference }: { reference: ReferenceSlot }) {
  if (
    reference.outcome.kind !== "status" ||
    reference.outcome.status !== "running"
  )
    return null;
  return (
    <p>
      {reference.progress === "queued"
        ? m.reference_queued()
        : Object.hasOwn(sourceNames, reference.progress)
          ? m.reference_source({
              source:
                sourceNames[reference.progress as keyof typeof sourceNames],
            })
          : m.reference_checking()}
    </p>
  );
}
/** Selection is a stable slot, never an outcome, array index or sorted result. */
export function CheckResults({
  check,
  completed,
  citationStyle,
  citationStyleLabel,
  transport,
  onSnapshot,
}: {
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
  const [filter, setFilter] = useState<Verdict | null>(null);
  const [selectedSlot, selectSlot] = useState(check.references[0]?.slot);
  const bibliography = useBibliography(
    check,
    citationStyle,
    transport,
    selectedSlot,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const buttons = useRef(new Map<number, HTMLButtonElement>());
  const position = useRef({ list: 0, page: 0 });
  const visible = check.references.filter(
    (reference) =>
      !filter ||
      (reference.outcome.kind === "verdict" &&
        reference.outcome.verdict === filter),
  );
  const selected = visible.find((reference) => reference.slot === selectedSlot);
  function open(slot: number) {
    position.current = {
      list: list.current?.scrollTop ?? 0,
      page: window.scrollY,
    };
    selectSlot(slot);
    setDetailOpen(true);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function back() {
    setDetailOpen(false);
    requestAnimationFrame(() => {
      if (selectedSlot)
        buttons.current.get(selectedSlot)?.focus({ preventScroll: true });
      if (list.current) list.current.scrollTop = position.current.list;
      window.scrollTo({ top: position.current.page });
    });
  }
  return (
    <>
      <button
        type="button"
        className="my-3 rounded border border-slate-500 p-3 underline"
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
        className="my-3 space-y-3 rounded border border-slate-300 bg-teal-50 p-4"
      >
        <h2 className="font-semibold">{m.workspace_help()}</h2>
        <p>{m.workspace_human()}</p>
        <p>{m.workspace_method()}</p>
        <p>{m.workspace_limits()}</p>
        <p>{m.doi_uncalibrated()}</p>
      </section>
      <CheckSummary
        check={check}
        completed={completed}
        filter={filter}
        onFilter={(value) => {
          setFilter(value);
          setDetailOpen(false);
        }}
      />
      <ReferenceExports
        checkId={check.id}
        importedFormat={importedFormat}
        transport={transport}
        rendered={bibliography}
        styleLabel={citationStyleLabel}
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
      <div className="check-panes" data-detail-open={detailOpen && !!selected}>
        <div ref={list} className="check-list">
          <ol aria-label={m.workspace_references()} className="space-y-4">
            {visible.map((reference) => (
              <li key={reference.slot} className="rounded-xl bg-slate-100 p-4">
                <button
                  type="button"
                  ref={(element) => {
                    if (element) buttons.current.set(reference.slot, element);
                    else buttons.current.delete(reference.slot);
                  }}
                  aria-current={
                    selectedSlot === reference.slot ? "true" : undefined
                  }
                  aria-controls="reference-detail"
                  onClick={() => open(reference.slot)}
                  className="w-full rounded text-left font-semibold underline decoration-teal-700 underline-offset-4"
                >
                  {m.workspace_open({
                    slot: reference.slot,
                    title: reference.fields.title ?? reference.originalText,
                  })}
                </button>
                <ReferenceOutcomeSummary outcome={reference.outcome} />
                <RunningStep reference={reference} />
              </li>
            ))}
          </ol>
          {!visible.length && <p>{m.workspace_empty()}</p>}
        </div>
        <section
          id="reference-detail"
          aria-labelledby="reference-detail-title"
          className="check-detail min-w-0 rounded-xl border border-slate-300 p-4"
        >
          <button
            type="button"
            className="check-back mb-4 rounded border border-slate-500 p-3"
            onClick={back}
          >
            {m.workspace_back()}
          </button>
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
              <ReferenceActions
                key={selected.slot}
                check={check}
                reference={selected}
                transport={transport}
                onSnapshot={onSnapshot}
              />
              <CorrectionSuggestion
                key={`${selected.slot}:${citationStyle}`}
                slot={selected.slot}
                rendered={bibliography}
              />
              <ReferenceOutcomeView
                outcome={selected.outcome}
                originalText={selected.originalText}
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
