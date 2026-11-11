// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useMemo, useState } from "react";
import type {
  Check,
  ReferenceSlot,
} from "@source-taster/contract-verification/v2";
import type { Bibliography } from "@source-taster/contract-verification/bibliography";
import { bibliographyClient } from "@source-taster/contract-verification/bibliography-client";
import type { VerificationClientOptions } from "@source-taster/contract-verification/client-v2";
import { m } from "@source-taster/i18n";
import { Button } from "./primitives/actions.tsx";
import type { CitationStyle } from "./preferences.ts";
const buttonClass =
  "rounded-lg border border-border-emphasis px-4 py-2 font-semibold disabled:bg-surface-sunken disabled:text-text-secondary";
/** Outcome equality is not result identity: repeated runs may return identical data. */
export function referenceBinding(checkId: string, reference: ReferenceSlot) {
  return `${checkId}:${reference.slot}:${reference.revision}:${reference.results[0]?.id ?? "none"}:${JSON.stringify(reference.outcome)}`;
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
        referenceBinding(check.id, reference) === choice.binding,
    ),
  );
  const applied = selected.map((choice) => choice.slot);
  const [response, setResponse] = useState<{
    key: string;
    contentKey: string;
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
    .map((reference) => referenceBinding(check.id, reference))
    .join(",");
  const contentKey = `${check.id}:${style}:${results}`;
  const key = `${contentKey}:${applied.join(",")}:${attempt}`;
  const appliedKey = applied.join(",");
  useEffect(() => {
    let current = true;
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
        if (current) {
          setResponse({ key, contentKey, data });
          setError(null);
        }
      })
      .catch(() => {
        if (current) setError(key);
      });
    return () => {
      current = false;
    };
  }, [request, check.id, style, appliedKey, selectedSlot, key, contentKey]);
  const corrections = selected.filter(
    (choice) =>
      response?.contentKey === contentKey &&
      response.data.entries.some(
        (entry) =>
          entry.slot === choice.slot &&
          entry.resultToken === choice.resultToken,
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
                binding: referenceBinding(check.id, reference),
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
  return (
    <section
      aria-label={m.bibliography_heading()}
      className="my-4 space-y-3 rounded border border-border-emphasis p-4"
    >
      <h3 className="font-semibold">{m.bibliography_heading()}</h3>
      <p>{m.correction_export_hint()}</p>
      <p>{m.bibliography_format_style({ style: styleLabel })}</p>
      <h4 className="font-semibold">{m.correction_selected_heading()}</h4>
      {rendered.pending ? (
        <p>{m.correction_loading()}</p>
      ) : rendered.data?.entries.some((entry) => entry.applied) ? (
        <ul className="list-disc space-y-2 pl-5">
          {rendered.data.entries
            .filter((entry) => entry.applied)
            .map((entry) => (
              <li key={entry.slot} className="break-words">
                {m.correction_selected_item({
                  slot: String(entry.slot),
                  text: entry.suggestion!.text,
                })}
              </li>
            ))}
        </ul>
      ) : (
        <p>{m.correction_none_selected()}</p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={buttonClass}
          disabled={!rendered.data || rendered.pending || exporting}
          onClick={() => exportBibliography("copy")}
        >
          {m.bibliography_copy()}
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={!rendered.data || rendered.pending || exporting}
          onClick={() => exportBibliography("download")}
        >
          {m.bibliography_download()}
        </button>
      </div>
      {rendered.failed && (
        <div>
          <p role="alert">{m.correction_unavailable()}</p>
          <button
            type="button"
            className={buttonClass}
            onClick={rendered.retry}
          >
            {m.correction_retry()}
          </button>
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
      j < b.length &&
      (i === a.length || table[i]![j + 1]! >= table[i + 1]![j]!)
    )
      push("insert", b[j++]!);
    else push("delete", a[i++]!);
  }
  return parts;
}
export function CorrectionSuggestion({
  slot,
  rendered,
  originalText,
  onApply,
  unavailable,
}: {
  slot: number;
  rendered: Rendered;
  originalText: string;
  onApply: () => void;
  /** Why Apply to fields cannot run now; null when it can. */
  unavailable: string | null;
}) {
  const [notice, setNotice] = useState<"copied" | "failed" | null>(null);
  const entry = rendered.data?.entries.find((entry) => entry.slot === slot);
  if (!entry?.suggestion)
    return (
      <p className="my-4">
        {rendered.data
          ? m.correction_fields_unavailable()
          : (unavailable ?? m.correction_loading())}
      </p>
    );
  const suggestion = entry.suggestion;
  return (
    <section
      aria-label={m.correction_heading()}
      className="my-4 space-y-3 rounded border border-border-emphasis bg-surface-sunken p-4"
    >
      <h3 className="font-semibold">{m.correction_heading()}</h3>
      <p className="tracked-change break-words">
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
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onPress={onApply}
          {...(unavailable
            ? { isDisabled: true, disabledReason: unavailable }
            : { isDisabled: false })}
        >
          {m.correction_fields_apply()}
        </Button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            void navigator.clipboard
              .writeText(suggestion.text)
              .then(() => setNotice("copied"))
              .catch(() => setNotice("failed"));
          }}
        >
          {m.correction_copy()}
        </button>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={entry.applied}
            onChange={(event) => rendered.apply(slot, event.target.checked)}
          />
          {m.correction_apply()}
        </label>
      </div>
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
