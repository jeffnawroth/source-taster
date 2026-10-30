// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useMemo, useState } from "react";
import type { Check } from "@source-taster/contract-verification/v2";
import type { Bibliography } from "@source-taster/contract-verification/bibliography";
import { bibliographyClient } from "@source-taster/contract-verification/bibliography-client";
import type { VerificationClientOptions } from "@source-taster/contract-verification/client-v2";
import { m } from "@source-taster/i18n";
import type { CitationStyle } from "./preferences.ts";
const buttonClass =
  "rounded-lg border border-slate-600 px-4 py-2 font-semibold disabled:bg-slate-100 disabled:text-slate-500";
export function useBibliography(
  check: Check,
  style: CitationStyle,
  transport: VerificationClientOptions,
) {
  const request = useMemo(() => bibliographyClient(transport), [transport]);
  const [applied, setApplied] = useState<number[]>([]);
  const [response, setResponse] = useState<{
    key: string;
    contentKey: string;
    data: Bibliography;
  } | null>(null);
  const [attempt, retry] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Source progress alone does not require re-rendering. Terminal outcomes do.
  const results = check.references
    .map(
      (reference) =>
        `${reference.slot}:${reference.outcome.kind === "verdict" ? "verdict" : reference.outcome.status}`,
    )
    .join(",");
  const contentKey = `${check.id}:${style}:${results}`;
  const key = `${contentKey}:${applied.join(",")}:${attempt}`;
  useEffect(() => {
    let current = true;
    void request(check.id, { style, applySlots: applied })
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
  }, [request, check.id, style, applied, key, contentKey]);
  return {
    data:
      response?.contentKey === contentKey
        ? {
            ...response.data,
            entries: response.data.entries.map((entry) => ({
              ...entry,
              applied:
                entry.suggestion !== null && applied.includes(entry.slot),
            })),
          }
        : null,
    pending: response?.key !== key,
    failed: error === key,
    retry: () => retry((value) => value + 1),
    apply: (slot: number, selected: boolean) =>
      setApplied((current) =>
        selected
          ? [...new Set([...current, slot])]
          : current.filter((value) => value !== slot),
      ),
  };
}
type Rendered = ReturnType<typeof useBibliography>;
function downloadRtf(rtf: string) {
  const url = URL.createObjectURL(new Blob([rtf], { type: "application/rtf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "source-taster-bibliography.rtf";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
/** Rich clipboard uses browser-supported formats; the same render has an RTF download. */
async function copyRich(value: Bibliography["bibliography"]) {
  const content: Record<string, Blob> = {
    "text/plain": new Blob([value.text], { type: "text/plain" }),
    "text/html": new Blob([value.html], { type: "text/html" }),
  };
  if (ClipboardItem.supports?.("text/rtf"))
    content["text/rtf"] = new Blob([value.rtf], { type: "text/rtf" });
  await navigator.clipboard.write([new ClipboardItem(content)]);
}
export function BibliographyActions({ rendered }: { rendered: Rendered }) {
  const [notice, setNotice] = useState<"copied" | "failed" | null>(null);
  return (
    <section
      aria-label={m.bibliography_heading()}
      className="my-4 space-y-3 rounded border border-slate-300 p-4"
    >
      <h3 className="font-semibold">{m.bibliography_heading()}</h3>
      <p>{m.correction_export_hint()}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={buttonClass}
          disabled={!rendered.data || rendered.pending}
          onClick={() => {
            if (rendered.data)
              void copyRich(rendered.data.bibliography)
                .then(() => setNotice("copied"))
                .catch(() => setNotice("failed"));
          }}
        >
          {m.bibliography_copy()}
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={!rendered.data || rendered.pending}
          onClick={() => {
            if (rendered.data) downloadRtf(rendered.data.bibliography.rtf);
          }}
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
export function CorrectionSuggestion({
  slot,
  rendered,
}: {
  slot: number;
  rendered: Rendered;
}) {
  const [notice, setNotice] = useState<"copied" | "failed" | null>(null);
  const entry = rendered.data?.entries.find((entry) => entry.slot === slot);
  if (!entry?.suggestion) return null;
  const suggestion = entry.suggestion;
  return (
    <section
      aria-label={m.correction_heading()}
      className="my-4 space-y-3 rounded border border-teal-700 bg-teal-50 p-4"
    >
      <h3 className="font-semibold">{m.correction_heading()}</h3>
      <p className="break-words">{suggestion.text}</p>
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
