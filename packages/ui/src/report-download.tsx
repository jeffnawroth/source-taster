// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useRef, useState } from "react";
import type { Check } from "@source-taster/contract-verification/v2";
import { ApiError } from "@source-taster/contract-verification/client";
import type { VerificationClientOptions } from "@source-taster/contract-verification/client-v2";
import { reportClient } from "@source-taster/contract-verification/report-client";
import {
  ReportLanguage,
  reportFeature,
  type Report,
} from "@source-taster/contract-verification/report";
import { getLocale } from "@source-taster/i18n/runtime";
import { m } from "@source-taster/i18n";
import type { CitationStyle } from "./preferences.ts";
import type { OwnerQuota } from "./quota.ts";
import { UpgradeLink } from "./quota-panel.tsx";

type Phase =
  | { kind: "idle" }
  | { kind: "working"; report: Report }
  | { kind: "ready"; report: Report }
  | { kind: "message"; text: string };

const pollMs = 700;
/** Create, follow, cancel and download one temporary accessible PDF report. */
export function ReportDownload({
  check,
  citationStyle,
  transport,
  quota,
  upgradeUrl,
}: {
  check: Check;
  citationStyle: CitationStyle;
  transport: VerificationClientOptions;
  /** The Owner's Quota; its features say whether reports are included. */
  quota: OwnerQuota | null;
  upgradeUrl?: string;
}) {
  const entitled = quota?.features.includes(reportFeature) ?? false;
  const client = useRef(reportClient(transport));
  client.current = reportClient(transport);
  const parsed = ReportLanguage.safeParse(getLocale());
  const [language, setLanguage] = useState<"de" | "en">(
    parsed.success ? parsed.data : "en",
  );
  const [documentName, setDocumentName] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const lifetime = useRef<AbortController | null>(null);
  useEffect(() => () => lifetime.current?.abort(), []);
  // A new Check starts without the previous Check's report.
  useEffect(() => {
    lifetime.current?.abort();
    setPhase({ kind: "idle" });
  }, [check.id]);

  function describe(error: unknown) {
    if (error instanceof ApiError && error.status === 403)
      return m.report_ui_unavailable();
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 410)
    )
      return m.report_ui_expired();
    return m.report_ui_error();
  }
  async function create() {
    const controller = new AbortController();
    lifetime.current?.abort();
    lifetime.current = controller;
    const name = documentName.trim();
    try {
      let report = await client.current.create(
        check.id,
        {
          language,
          style: citationStyle,
          ...(name ? { documentName: name } : {}),
        },
        controller.signal,
      );
      while (!controller.signal.aborted) {
        if (report.state === "ready") {
          setPhase({ kind: "ready", report });
          return;
        }
        if (report.state === "cancelled") {
          setPhase({ kind: "message", text: m.report_ui_cancelled() });
          return;
        }
        if (report.state === "failed") {
          setPhase({
            kind: "message",
            text:
              report.failure === "unsupported-character"
                ? m.report_ui_failed_unsupported()
                : report.failure === "limit-exceeded"
                  ? m.report_ui_failed_limit()
                  : m.report_ui_failed_unavailable(),
          });
          return;
        }
        setPhase({ kind: "working", report });
        await new Promise((resolve) => setTimeout(resolve, pollMs));
        if (controller.signal.aborted) return;
        report = await client.current.status(
          check.id,
          report.id,
          controller.signal,
        );
      }
    } catch (error) {
      if (!controller.signal.aborted)
        setPhase({ kind: "message", text: describe(error) });
    }
  }
  async function cancel() {
    if (phase.kind !== "working") return;
    const { report } = phase;
    lifetime.current?.abort();
    try {
      await client.current.cancel(check.id, report.id);
      setPhase({ kind: "message", text: m.report_ui_cancelled() });
    } catch (error) {
      setPhase({ kind: "message", text: describe(error) });
    }
  }
  async function download() {
    if (phase.kind !== "ready") return;
    const controller = new AbortController();
    lifetime.current?.abort();
    lifetime.current = controller;
    try {
      const data = await client.current.download(
        check.id,
        phase.report.id,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(data.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      if (!controller.signal.aborted)
        setPhase({ kind: "message", text: describe(error) });
    }
  }

  return (
    <section
      aria-label={m.report_ui_heading()}
      className="my-4 space-y-3 rounded border border-slate-300 p-4"
    >
      <h3 className="font-semibold">{m.report_ui_heading()}</h3>
      {!entitled ? (
        <p>
          {m.report_ui_unavailable()}
          <UpgradeLink href={upgradeUrl} />
        </p>
      ) : (
        <>
          <p>{m.report_ui_hint()}</p>
          {check.state !== "ended" && <p>{m.report_ui_intermediate()}</p>}
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1">
              {m.report_ui_language()}
              <select
                className="rounded border border-slate-500 bg-white p-2"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value === "de" ? "de" : "en")
                }
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              {m.report_ui_document()}
              <input
                className="rounded border border-slate-500 bg-white p-2"
                value={documentName}
                maxLength={200}
                onChange={(event) => setDocumentName(event.target.value)}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-600 px-4 py-2 font-semibold disabled:bg-slate-100 disabled:text-slate-500"
              disabled={phase.kind === "working"}
              onClick={() => void create()}
            >
              {m.report_ui_create()}
            </button>
            {phase.kind === "working" && (
              <button
                type="button"
                className="rounded-lg border border-slate-600 px-4 py-2 font-semibold"
                onClick={() => void cancel()}
              >
                {m.report_ui_cancel()}
              </button>
            )}
            {phase.kind === "ready" && (
              <button
                type="button"
                className="rounded-lg border border-slate-600 px-4 py-2 font-semibold"
                onClick={() => void download()}
              >
                {m.report_ui_download()}
              </button>
            )}
          </div>
          <p role="status" aria-live="polite">
            {phase.kind === "working"
              ? m.report_ui_working()
              : phase.kind === "ready"
                ? m.report_ui_ready({
                    time: new Intl.DateTimeFormat(getLocale(), {
                      timeStyle: "short",
                    }).format(new Date(phase.report.expiresAt)),
                  })
                : phase.kind === "message"
                  ? phase.text
                  : ""}
          </p>
        </>
      )}
    </section>
  );
}
