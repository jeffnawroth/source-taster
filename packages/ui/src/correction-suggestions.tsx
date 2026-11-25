// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Check,
  ReferenceSlot,
} from "@source-taster/contract-verification/v2";
import type { Bibliography } from "@source-taster/contract-verification/bibliography";
import { bibliographyClient } from "@source-taster/contract-verification/bibliography-client";
import type { VerificationClientOptions } from "@source-taster/contract-verification/client-v2";
import { m } from "@source-taster/i18n";
import { afterPress } from "./after-press.ts";
import { Button } from "./primitives/actions.tsx";
import { Checkbox } from "./primitives/selection.tsx";
import { Copy, PencilLine } from "./workspace-icons.tsx";
import { DetailSection } from "./reference-outcome.tsx";
import { resultBinding } from "./reference-work.ts";
import type { CitationStyle } from "./preferences.ts";
/**
 * What an export choice and its rendering are bound to: the same inputs as the
 * server's result token (result id and outcome). Outcome equality alone is not
 * result identity, as a re-check may return identical data under a new result.
 */
function exportBinding(checkId: string, reference: ReferenceSlot) {
  return `${resultBinding(checkId, reference)}:${JSON.stringify(reference.outcome)}`;
}
export function useBibliography(
  check: Check,
  style: CitationStyle,
  transport: VerificationClientOptions,
  selectedSlot: number | undefined,
) {
  const request = useMemo(() => bibliographyClient(transport), [transport]);
  const [choices, setChoices] = useState<
    { slot: number; resultToken: string; binding: string }[]
  >([]);
  const selected = choices.filter((choice) =>
    check.references.some(
      (reference) =>
        reference.slot === choice.slot &&
        exportBinding(check.id, reference) === choice.binding,
    ),
  );
  const applied = selected.map((choice) => choice.slot);
  const [response, setResponse] = useState<{
    key: string;
    contentKey: string;
    exportKey: string;
    data: Bibliography;
  } | null>(null);
  const [attempt, retry] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const slots = [
    ...new Set([...applied, ...(selectedSlot ? [selectedSlot] : [])]),
  ];
  // Only the visible and explicitly selected suggestions are rendered. Other
  // terminal slots and source progress never regenerate the whole Check.
  const results = check.references
    .filter((reference) => slots.includes(reference.slot))
    .map((reference) => exportBinding(check.id, reference))
    .join(",");
  const contentKey = `${check.id}:${style}:${results}`;
  const key = `${contentKey}:${applied.join(",")}:${attempt}`;
  const appliedKey = applied.join(",");
  // What the panels and exports depend on: the applied set with each choice's
  // result binding, the style and the retry attempt. Unlike `key`, it does not
  // follow the opened Reference, so an earlier rendering with the same export
  // key stays valid for them while another suggestion renders.
  const exportKey = [
    check.id,
    style,
    attempt,
    ...selected.map((choice) => `${choice.slot}=${choice.binding}`),
  ].join("|");
  useEffect(() => {
    let current = true;
    let cancel = () => {};
    const applied = appliedKey ? appliedKey.split(",").map(Number) : [];
    const suggestionSlots = [
      ...new Set([...applied, ...(selectedSlot ? [selectedSlot] : [])]),
    ];
    void request(check.id, {
      style,
      applySlots: applied,
      suggestionSlots,
      includeBibliography: false,
    })
      .then((data) => {
        // The suggestion renders above the field editor and the verdict
        // controls, so a response that settles while a pointer is down on one
        // of them would move it away and lose the press.
        if (current)
          cancel = afterPress(() => {
            setResponse({ key, contentKey, exportKey, data });
            setError(null);
          });
      })
      .catch(() => {
        if (current) cancel = afterPress(() => setError(key));
      });
    return () => {
      current = false;
      cancel();
    };
  }, [
    request,
    check.id,
    style,
    appliedKey,
    selectedSlot,
    key,
    contentKey,
    exportKey,
  ]);
  // The rendering the corrections are read from: the one for the current
  // result bindings, or one for exactly the current applied set.
  const exportRendering =
    response?.contentKey === contentKey || response?.exportKey === exportKey
      ? response
      : null;
  const corrections = selected.filter((choice) =>
    exportRendering?.data.entries.some(
      (entry) =>
        entry.slot === choice.slot && entry.resultToken === choice.resultToken,
    ),
  );
  return {
    corrections: corrections.map(({ slot, resultToken }) => ({
      slot,
      resultToken,
    })),
    style,
    data:
      response?.contentKey === contentKey
        ? {
            ...response.data,
            entries: response.data.entries.map((entry) => ({
              ...entry,
              applied:
                entry.suggestion !== null &&
                corrections.some((choice) => choice.slot === entry.slot),
            })),
          }
        : null,
    pending: response?.key !== key,
    /**
     * The suggestion text of each correction, read from the same rendering as
     * `corrections`; the export panels list these.
     */
    appliedSuggestions: (exportRendering?.data.entries ?? []).flatMap(
      (entry) =>
        entry.suggestion &&
        corrections.some((choice) => choice.slot === entry.slot)
          ? [{ slot: entry.slot, text: entry.suggestion.text }]
          : [],
    ),
    /**
     * The exports follow the rendering only through the applied corrections.
     * With none applied they wait on nothing; otherwise they wait for a
     * rendering of exactly the current applied set, which the opened Reference
     * does not change. The panels above the detail therefore stay still while
     * another suggestion renders.
     */
    exportReady: applied.length === 0 || response?.exportKey === exportKey,
    failed: error === key,
    retry: () => retry((value) => value + 1),
    renderExport: async () => {
      const data = await request(check.id, {
        style,
        applySlots: corrections.map((choice) => choice.slot),
        suggestionSlots: [],
        includeBibliography: true,
      });
      if (!data.bibliography) throw new Error("missing-bibliography");
      return data.bibliography;
    },
    apply: (slot: number, selected: boolean) => {
      // Only an entry rendered for the current result binding can be chosen.
      const entry =
        response?.contentKey === contentKey
          ? response.data.entries.find((entry) => entry.slot === slot)
          : undefined;
      const reference = check.references.find(
        (reference) => reference.slot === slot,
      );
      setChoices((current) => [
        ...current.filter((choice) => choice.slot !== slot),
        ...(selected && entry?.resultToken && reference
          ? [
              {
                slot,
                resultToken: entry.resultToken,
                binding: exportBinding(check.id, reference),
              },
            ]
          : []),
      ]);
    },
  };
}
export type Rendered = ReturnType<typeof useBibliography>;
function downloadRtf(rtf: string) {
  const url = URL.createObjectURL(new Blob([rtf], { type: "application/rtf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "source-taster-bibliography.rtf";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
/** Rich clipboard uses browser-supported formats; the same render has an RTF download. */
async function copyRich(
  value: Promise<NonNullable<Bibliography["bibliography"]>>,
) {
  // Construct within the click gesture, including on browsers that require it.
  const content: Record<string, Promise<Blob>> = {
    "text/plain": value.then(
      (data) => new Blob([data.text], { type: "text/plain" }),
    ),
    "text/html": value.then(
      (data) => new Blob([data.html], { type: "text/html" }),
    ),
  };
  if (ClipboardItem.supports?.("text/rtf"))
    content["text/rtf"] = value.then(
      (data) => new Blob([data.rtf], { type: "text/rtf" }),
    );
  await navigator.clipboard.write([new ClipboardItem(content)]);
}
export function BibliographyActions({
  rendered,
  styleLabel,
}: {
  rendered: Rendered;
  styleLabel: string;
}) {
  const [notice, setNotice] = useState<"copied" | "failed" | null>(null);
  const [exporting, setExporting] = useState(false);
  function exportBibliography(action: "copy" | "download") {
    setExporting(true);
    setNotice(null);
    const value = rendered.renderExport();
    void (
      action === "copy"
        ? copyRich(value)
        : value.then((data) => downloadRtf(data.rtf))
    )
      .then(() => {
        if (action === "copy") setNotice("copied");
      })
      .catch(() => setNotice("failed"))
      .finally(() => setExporting(false));
  }
  // The export is rendered once the selected suggestions have been formatted.
  // A running export is pending, not disabled: disabling the pressed Button
  // would drop focus to the page and out of its Dialog.
  const exportAvailability = !rendered.exportReady
    ? { isDisabled: true as const, disabledReason: m.correction_loading() }
    : { isDisabled: false as const };
  return (
    <section
      aria-label={m.bibliography_heading()}
      className="my-4 space-y-3 rounded border border-border-emphasis p-4"
    >
      <h3 className="font-semibold">{m.bibliography_heading()}</h3>
      <p>{m.correction_export_hint()}</p>
      <p>{m.bibliography_format_style({ style: styleLabel })}</p>
      <h4 className="font-semibold">{m.correction_selected_heading()}</h4>
      {!rendered.exportReady ? (
        <p>{m.correction_loading()}</p>
      ) : rendered.appliedSuggestions.length ? (
        <ul className="list-disc space-y-2 pl-5">
          {rendered.appliedSuggestions.map((entry) => (
            <li key={entry.slot} className="break-words">
              {m.correction_selected_item({
                slot: String(entry.slot),
                text: entry.text,
              })}
            </li>
          ))}
        </ul>
      ) : (
        <p>{m.correction_none_selected()}</p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          {...exportAvailability}
          isPending={exporting}
          onPress={() => exportBibliography("copy")}
        >
          {m.bibliography_copy()}
        </Button>
        <Button
          variant="secondary"
          {...exportAvailability}
          isPending={exporting}
          onPress={() => exportBibliography("download")}
        >
          {m.bibliography_download()}
        </Button>
      </div>
      {rendered.failed && (
        <div className="space-y-2">
          <p role="alert">{m.correction_unavailable()}</p>
          <Button variant="secondary" onPress={rendered.retry}>
            {m.correction_retry()}
          </Button>
        </div>
      )}
      {notice && (
        <p role="status">
          {notice === "copied"
            ? m.correction_copied()
            : m.correction_copy_failed()}
        </p>
      )}
    </section>
  );
}
/**
 * Word-level preview of the suggestion against the immutable original. It only
 * presents two strings; it never derives structured fields from either.
 */
export function trackedChanges(before: string, after: string) {
  const a = before.split(/(\s+)/u).filter(Boolean);
  const b = after.split(/(\s+)/u).filter(Boolean);
  // Bounded quadratic table; very long inputs fall back to whole replacement.
  if (a.length * b.length > 250_000)
    return [
      { kind: "delete" as const, text: before },
      { kind: "insert" as const, text: after },
    ];
  const table = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      table[i]![j] =
        a[i] === b[j]
          ? table[i + 1]![j + 1]! + 1
          : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
  const parts: { kind: "same" | "delete" | "insert"; text: string }[] = [];
  const push = (kind: "same" | "delete" | "insert", text: string) => {
    const last = parts.at(-1);
    if (last?.kind === kind) last.text += text;
    else parts.push({ kind, text });
  };
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      push("same", a[i]!);
      i++;
      j++;
    } else if (
      i < a.length &&
      (j === b.length || table[i + 1]![j]! >= table[i]![j + 1]!)
    )
      // Deletions precede insertions at a replacement, as in tracked changes.
      push("delete", a[i++]!);
    else push("insert", b[j++]!);
  }
  return parts;
}
/**
 * Whether the server will prove a suggestion for this slot: the same gate as
 * its `suggestionFields` (a resolved identity on a verdict that has a
 * Candidate with a title). It only decides whether to reserve room while the
 * response is on its way; the response stays the authority on what is shown.
 */
export function suggestionExpected(reference: ReferenceSlot) {
  const outcome = reference.outcome;
  if (
    outcome.kind !== "verdict" ||
    outcome.identity.kind === "unresolved" ||
    !["correct", "exists-with-deviations", "doi-conflict"].includes(
      outcome.verdict,
    )
  )
    return false;
  const candidateId = outcome.identity.candidateId;
  return outcome.candidates.some(
    (candidate) => candidate.id === candidateId && !!candidate.csl.title,
  );
}
/**
 * The suggestion's place in the detail. The section renders above the field
 * editor, Re-check and Manual judgment, so one that arrives late would push
 * them away from a pointer already aimed at them. While a suggestion is
 * expected, a hidden stand-in with the section's structure and the original's
 * text holds its room during loading; the height it measures stays as the
 * slot's minimum once the section has replaced it, so the rows below keep
 * their place. The stand-in has no text of its own: the original reaches it
 * as generated content, which neither assistive technology nor text queries
 * see.
 */
function SuggestionSlot({
  reserve,
  loading,
  originalText,
  hasMeta,
  children,
}: {
  reserve: boolean;
  loading: boolean;
  originalText: string;
  hasMeta: boolean;
  children: ReactNode;
}) {
  const slot = useRef<HTMLDivElement>(null);
  const sizer = useRef<HTMLDivElement>(null);
  const sizing = reserve && loading;
  useLayoutEffect(() => {
    const element = slot.current;
    const stand = sizer.current;
    if (!element) return;
    if (!reserve) element.style.minHeight = "";
    if (!stand) return;
    const measure = () => {
      element.style.minHeight = `${Math.ceil(stand.getBoundingClientRect().height)}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stand);
    return () => observer.disconnect();
  }, [reserve, sizing]);
  return (
    <div ref={slot} className="detail-suggestion">
      {children}
      {sizing && (
        <div ref={sizer} className="detail-suggestion-sizer" aria-hidden="true">
          <div className="detail-section">
            <div className="detail-section-head">
              <span className="detail-eyebrow" />
            </div>
            <div
              className="tracked-change detail-tc"
              data-text={originalText}
            />
            {hasMeta && <div className="detail-tc-meta" />}
            <div className="detail-row">
              <span className="detail-suggestion-button" />
            </div>
            <span className="detail-suggestion-check" />
          </div>
        </div>
      )}
    </div>
  );
}
export function CorrectionSuggestion({
  slot,
  rendered,
  originalText,
  onApplyToFields,
  unavailableReason,
  operationRunning,
  provenance,
  expected,
}: {
  slot: number;
  rendered: Rendered;
  originalText: string;
  onApplyToFields: () => void;
  /** Why Apply to fields cannot run now; null when it can. */
  unavailableReason: string | null;
  /** A save, re-check or verdict change runs, so there is no current result. */
  operationRunning: boolean;
  provenance?: string;
  /** The server will prove a suggestion for this result (`suggestionExpected`). */
  expected: boolean;
}) {
  const [notice, setNotice] = useState<"copied" | "failed" | null>(null);
  const entry = rendered.data?.entries.find((entry) => entry.slot === slot);
  const suggestion = entry?.suggestion;
  const reserve = expected && !operationRunning;
  const frame = (loading: boolean, content: ReactNode) => (
    <SuggestionSlot
      reserve={reserve}
      loading={loading}
      originalText={originalText}
      hasMeta={!!provenance}
    >
      {content}
    </SuggestionSlot>
  );
  if (!suggestion)
    return frame(
      !rendered.data,
      <p className="detail-note">
        {rendered.data && !operationRunning
          ? m.correction_none_current()
          : (unavailableReason ?? m.correction_loading())}
      </p>,
    );
  return frame(
    false,
    <DetailSection
      title={m.correction_heading()}
      label={m.correction_heading()}
    >
      <p className="tracked-change detail-tc">
        {trackedChanges(originalText, suggestion.text).map((part, index) =>
          part.kind === "same" ? (
            <span key={index}>{part.text}</span>
          ) : part.kind === "delete" ? (
            <del key={index}>
              <span className="sr-only">{m.correction_deleted()}: </span>
              {part.text}
            </del>
          ) : (
            <ins key={index}>
              <span className="sr-only">{m.correction_inserted()}: </span>
              {part.text}
            </ins>
          ),
        )}
      </p>
      {provenance && <p className="detail-tc-meta">{provenance}</p>}
      <div className="detail-row">
        <Button
          size="sm"
          icon={<Copy aria-hidden="true" size={16} />}
          onPress={() => {
            void navigator.clipboard
              .writeText(suggestion.text)
              .then(() => setNotice("copied"))
              .catch(() => setNotice("failed"));
          }}
        >
          {m.correction_copy()}
        </Button>
        <Button
          size="sm"
          icon={<PencilLine aria-hidden="true" size={16} />}
          onPress={onApplyToFields}
          {...(unavailableReason
            ? { isDisabled: true, disabledReason: unavailableReason }
            : { isDisabled: false })}
        >
          {m.correction_fields_apply()}
        </Button>
      </div>
      <Checkbox
        className="detail-check"
        isSelected={entry.applied}
        onChange={(selected) => rendered.apply(slot, selected)}
      >
        {m.correction_apply()}
      </Checkbox>
      {notice && (
        <p role="status">
          {notice === "copied"
            ? m.correction_copied()
            : m.correction_copy_failed()}
        </p>
      )}
    </DetailSection>,
  );
}
