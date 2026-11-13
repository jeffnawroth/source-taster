// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useMemo, useRef, useState } from "react";
import { exportClient } from "@source-taster/contract-verification/export-client";
import {
  ExportFormat,
  type ExportRequest,
} from "@source-taster/contract-verification/export";
import type { VerificationClientOptions } from "@source-taster/contract-verification/client-v2";
import { m } from "@source-taster/i18n";
import { Download } from "lucide-react";
import type { Rendered } from "./correction-suggestions.tsx";
import { Button, Radio, RadioGroup } from "./primitives/index.ts";
export function ReferenceExports({
  checkId,
  importedFormat,
  transport,
  rendered,
  styleLabel,
  onCancel,
}: {
  checkId: string;
  importedFormat?: "bibtex" | "ris";
  transport: VerificationClientOptions;
  rendered: Rendered;
  styleLabel: string;
  /** Inside a Dialog: renders Cancel beside the download. */
  onCancel?: () => void;
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
  // A failed rendering of the opened Reference does not invalidate the
  // corrections read for the applied set; only their readiness counts.
  const availability =
    mode === "selected-corrections" && !rendered.exportReady
      ? { isDisabled: true as const, disabledReason: m.correction_loading() }
      : { isDisabled: false as const };
  const originalFormat = importedFormat
    ? m.library_export_original({
        format: importedFormat === "ris" ? "RIS" : "BibTeX",
      })
    : "";
  return (
    <section
      aria-label={m.export_references_heading()}
      className="reference-exports"
    >
      <h3>{m.export_references_heading()}</h3>
      <RadioGroup
        label={m.export_format()}
        value={selectedFormat}
        onChange={(value) => {
          const parsed = ExportFormat.safeParse(value);
          if (parsed.success) setFormat(parsed.data);
        }}
      >
        <Radio value="csl-json">CSL-JSON</Radio>
        <Radio value="bibtex">BibTeX</Radio>
        {importedFormat && (
          <Radio value="imported-format">{originalFormat}</Radio>
        )}
      </RadioGroup>
      <label className="workspace-select">
        {m.export_content()}
        <select
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
      {mode === "selected-corrections" &&
        (selected.length ? (
          <div>
            <h4 className="export-subheading">
              {m.correction_selected_heading()}
            </h4>
            <ul className="list-disc space-y-2 pl-5">
              {selected.map((choice) => (
                <li key={choice.slot} className="break-words">
                  {m.correction_selected_item({
                    slot: String(choice.slot),
                    text:
                      rendered.appliedSuggestions.find(
                        (entry) => entry.slot === choice.slot,
                      )?.text ?? "",
                  })}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="export-note">{m.correction_none_selected()}</p>
        ))}
      <p className="export-note">
        {m.export_references_hint()}{" "}
        {m.export_preview({
          format:
            selectedFormat === "csl-json"
              ? "CSL-JSON"
              : selectedFormat === "imported-format"
                ? originalFormat
                : "BibTeX",
          style: styleLabel,
        })}
      </p>
      {failed && <p role="alert">{m.export_failed()}</p>}
      <div className="st-actions">
        {onCancel && (
          <Button variant="ghost" onPress={onCancel}>
            {m.shell_cancel()}
          </Button>
        )}
        <Button
          variant="primary"
          icon={<Download aria-hidden="true" size={16} />}
          isPending={pending}
          {...availability}
          onPress={() => {
            void download();
          }}
        >
          {pending ? m.export_downloading() : m.export_download()}
        </Button>
      </div>
    </section>
  );
}
