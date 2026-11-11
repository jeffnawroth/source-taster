// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useMemo, useRef, useState } from "react";
import { exportClient } from "@source-taster/contract-verification/export-client";
import {
  ExportFormat,
  type ExportRequest,
} from "@source-taster/contract-verification/export";
import type { VerificationClientOptions } from "@source-taster/contract-verification/client-v2";
import { m } from "@source-taster/i18n";
import type { Rendered } from "./correction-suggestions.tsx";
export function ReferenceExports({
  checkId,
  importedFormat,
  transport,
  rendered,
  styleLabel,
}: {
  checkId: string;
  importedFormat?: "bibtex" | "ris";
  transport: VerificationClientOptions;
  rendered: Rendered;
  styleLabel: string;
}) {
  const request = useMemo(() => exportClient(transport), [transport]);
  const [format, setFormat] = useState<ExportRequest["format"]>("csl-json");
  // A manually added Reference has no original interchange record. The
  // complete Check remains downloadable in the canonical export formats.
  const selectedFormat =
    format === "imported-format" && !importedFormat ? "csl-json" : format;
  const [mode, setMode] = useState<ExportRequest["mode"]>("original");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const lifetime = useRef<AbortController | null>(null);
  useEffect(() => () => lifetime.current?.abort(), []);
  async function download() {
    const controller = new AbortController();
    lifetime.current?.abort();
    lifetime.current = controller;
    setPending(true);
    setFailed(false);
    try {
      const data = await request(
        checkId,
        {
          format: selectedFormat,
          mode,
          corrections: mode === "original" ? [] : rendered.corrections,
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(data.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      if (!controller.signal.aborted) setFailed(true);
    } finally {
      if (!controller.signal.aborted) setPending(false);
    }
  }
  const selected = mode === "selected-corrections" ? rendered.corrections : [];
  return (
    <section
      aria-label={m.export_references_heading()}
      className="my-4 space-y-3 rounded border border-border-emphasis p-4"
    >
      <h3 className="font-semibold">{m.export_references_heading()}</h3>
      <p>{m.export_references_hint()}</p>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1">
          {m.export_format()}
          <select
            className="rounded border border-border-emphasis bg-surface p-2"
            value={selectedFormat}
            onChange={(event) => {
              const value = ExportFormat.safeParse(event.target.value);
              if (value.success) setFormat(value.data);
            }}
          >
            <option value="csl-json">CSL-JSON</option>
            <option value="bibtex">BibTeX</option>
            {importedFormat && (
              <option value="imported-format">
                {m.library_export_original({
                  format: importedFormat === "ris" ? "RIS" : "BibTeX",
                })}
              </option>
            )}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          {m.export_content()}
          <select
            className="rounded border border-border-emphasis bg-surface p-2"
            value={mode}
            onChange={(event) =>
              setMode(
                event.target.value === "selected-corrections"
                  ? "selected-corrections"
                  : "original",
              )
            }
          >
            <option value="original">{m.export_original()}</option>
            <option value="selected-corrections">{m.export_selected()}</option>
          </select>
        </label>
      </div>
      <p>
        {m.export_preview({
          format:
            selectedFormat === "csl-json"
              ? "CSL-JSON"
              : selectedFormat === "imported-format"
                ? m.library_export_original({
                    format: importedFormat === "ris" ? "RIS" : "BibTeX",
                  })
                : "BibTeX",
          style: styleLabel,
        })}
      </p>
      <h4 className="font-semibold">{m.correction_selected_heading()}</h4>
      {selected.length ? (
        <ul className="list-disc space-y-2 pl-5">
          {selected.map((choice) => (
            <li key={choice.slot} className="break-words">
              {m.correction_selected_item({
                slot: String(choice.slot),
                text:
                  rendered.data?.entries.find(
                    (entry) => entry.slot === choice.slot,
                  )?.suggestion?.text ?? "",
              })}
            </li>
          ))}
        </ul>
      ) : (
        <p>{m.correction_none_selected()}</p>
      )}
      <button
        type="button"
        className="rounded-lg border border-border-emphasis px-4 py-2 font-semibold disabled:bg-surface-sunken disabled:text-text-secondary"
        disabled={
          pending ||
          (mode === "selected-corrections" &&
            (rendered.pending || rendered.failed))
        }
        onClick={() => {
          void download();
        }}
      >
        {pending ? m.export_downloading() : m.export_download()}
      </button>
      {failed && <p role="alert">{m.export_failed()}</p>}
    </section>
  );
}
