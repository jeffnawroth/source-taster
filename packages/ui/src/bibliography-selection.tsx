// SPDX-License-Identifier: AGPL-3.0-or-later
import { abuseMessage } from "./abuse-message.tsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { m } from "@source-taster/i18n";
import type { BibliographyDocument } from "@source-taster/contract-verification/document";
import type { Check } from "@source-taster/contract-verification/v2";
import {
  ApiError,
  verificationClient,
  type VerificationClientOptions,
} from "@source-taster/contract-verification/client-v2";
const action =
  "rounded border border-border-emphasis px-3 py-2 disabled:opacity-50";
type Span = { start: number; end: number };
export function validRegions(text: string, regions: Span[]) {
  const sorted = [...regions].sort((a, b) => a.start - b.start);
  return sorted.every(
    (r, i) =>
      Number.isInteger(r.start) &&
      Number.isInteger(r.end) &&
      r.start >= 0 &&
      r.start < r.end &&
      r.end <= text.length &&
      (!i || sorted[i - 1]!.end <= r.start),
  );
}
export function BibliographyEditor({
  document,
  onChange,
  disabled = false,
}: {
  document: BibliographyDocument;
  onChange: (regions: Span[]) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLTextAreaElement>(null);
  const [marked, setMarked] = useState<Span | null>(null);
  const regions = document.selection.regions;
  const valid = validRegions(document.text, regions);
  const ordered = valid ? [...regions].sort((a, b) => a.start - b.start) : [];
  const highlighted = ordered.flatMap((region, i) => {
    const before = document.text.slice(ordered[i - 1]?.end ?? 0, region.start);
    return [
      before,
      <mark key={i} className="bg-amber-200 text-text underline decoration-2">
        {document.text.slice(region.start, region.end)}
      </mark>,
    ];
  });
  function move(index: number, key: "start" | "end", value: number) {
    onChange(regions.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  }
  return (
    <section
      aria-label={m.selection_heading()}
      className="my-4 min-w-0 space-y-3 rounded border-2 border-border-emphasis bg-surface-sunken p-3"
    >
      <h3 className="font-semibold">{m.selection_heading()}</h3>
      <p>{m.selection_help()}</p>
      {!regions.length && <p role="status">{m.selection_none()}</p>}
      {!valid && <p role="alert">{m.selection_invalid()}</p>}
      <pre
        aria-label={m.selection_text()}
        className="max-h-96 overflow-auto whitespace-pre-wrap break-words font-sans"
      >
        {highlighted}
        {document.text.slice(ordered.at(-1)?.end ?? 0)}
      </pre>
      <label className="block">
        {m.selection_original()}
        <textarea
          ref={input}
          readOnly
          value={document.text}
          onSelect={(event) => {
            const { selectionStart: start, selectionEnd: end } =
              event.currentTarget;
            setMarked(end > start ? { start, end } : null);
          }}
          className="mt-2 min-h-40 w-full min-w-0 rounded border border-border-emphasis bg-surface p-3"
        />
      </label>
      <fieldset disabled={disabled} className="min-w-0 space-y-3">
        <legend className="sr-only">{m.selection_heading()}</legend>
        {regions.map((region, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3">
            {(["start", "end"] as const).map((key) => (
              <label key={key} className="flex min-w-0 flex-col">
                {key === "start"
                  ? m.selection_start({ region: i + 1 })
                  : m.selection_end({ region: i + 1 })}
                <input
                  type="number"
                  min={0}
                  max={document.text.length}
                  step={1}
                  value={region[key]}
                  onChange={(event) => move(i, key, event.target.valueAsNumber)}
                  className="w-28 max-w-full rounded border border-border-emphasis bg-surface p-2"
                />
              </label>
            ))}
            <button
              type="button"
              className={action}
              onClick={() =>
                onChange(regions.filter((_, index) => index !== i))
              }
            >
              {m.selection_deselect({ region: i + 1 })}
            </button>
          </div>
        ))}
        <button
          type="button"
          className={action}
          disabled={
            !marked || !validRegions(document.text, [...regions, marked])
          }
          onClick={() => {
            if (marked)
              onChange([...regions, marked].sort((a, b) => a.start - b.start));
          }}
        >
          {m.selection_add()}
        </button>
      </fieldset>
      <p className="text-sm">
        {m.selection_versions({ version: document.selection.version })}
      </p>
    </section>
  );
}
export function CheckSelectionActions({
  check,
  transport,
  onSnapshot,
}: {
  check: Check;
  transport: VerificationClientOptions;
  onSnapshot: (check: Check) => void;
}) {
  const api = useMemo(() => verificationClient(transport), [transport]);
  const [draft, setDraft] = useState(check.document!);
  const [cursor] = useState(check.lastEventSeq);
  const [preview, setPreview] = useState<Awaited<
    ReturnType<ReturnType<typeof verificationClient>["previewSelection"]>
  > | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    // StrictMode re-runs effects; mark mounted on every (re)mount.
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  // This component is keyed to the Check; a detached response cannot update a new workspace.
  const active = check.references.some(
    (r) => r.outcome.kind === "status" && r.outcome.status === "running",
  );
  async function submit(apply: boolean) {
    setPending(true);
    setError(null);
    try {
      const request = {
        expectedEventSeq: cursor,
        regions: draft.selection.regions,
      };
      if (apply)
        onSnapshot(
          await api.editSelection(check.id, {
            ...request,
            prepared: preview?.prepared,
          }),
        );
      else {
        const result = await api.previewSelection(check.id, request);
        if (mounted.current) setPreview(result);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        try {
          onSnapshot(await api.getCheck(check.id));
        } catch {
          /* Keep original denial. */
        }
        setError(m.problem_reference_conflict());
      } else
        setError(
          abuseMessage(error) ??
            (error instanceof ApiError &&
            error.problem?.i18nKey === "problem_reference_limit"
              ? m.problem_reference_limit({
                  limit: error.problem.limit ?? 1000,
                })
              : m.problem_invalid_request()),
        );
    } finally {
      setPending(false);
    }
  }
  return (
    <section
      aria-label={m.selection_change()}
      className="my-4 min-w-0 space-y-3"
    >
      <h3 className="font-semibold">{m.selection_change()}</h3>
      <BibliographyEditor
        document={draft}
        disabled={active || pending}
        onChange={(regions) => {
          setDraft({ ...draft, selection: { ...draft.selection, regions } });
          setPreview(null);
        }}
      />
      {error && <p role="alert">{error}</p>}
      <button
        className={action}
        type="button"
        disabled={
          active ||
          pending ||
          !validRegions(draft.text, draft.selection.regions)
        }
        onClick={() => {
          void submit(false);
        }}
      >
        {m.selection_preview()}
      </button>
      {preview && (
        <section aria-label={m.selection_preview()} className="space-y-3">
          <p>
            {m.revision_preview_counts({
              added: preview.added,
              removed: preview.removed.length,
              total: preview.total,
              quota: preview.additionalQuota,
            })}
          </p>
          <ul>
            {preview.addedReferences.map((reference, index) => (
              <li key={`added:${index}`}>
                {m.revision_add()}: {reference.originalText}
              </li>
            ))}
            {preview.removed.map((slot) => (
              <li key={slot}>
                {m.revision_remove()}:{" "}
                {check.references.find((r) => r.slot === slot)?.originalText}
              </li>
            ))}
          </ul>
          <p>{m.revision_no_refund()}</p>
          <button
            type="button"
            className={action}
            disabled={active || pending || check.lastEventSeq !== cursor}
            onClick={() => {
              void submit(true);
            }}
          >
            {m.selection_apply()}
          </button>
        </section>
      )}
    </section>
  );
}
