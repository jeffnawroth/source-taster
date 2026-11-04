// SPDX-License-Identifier: AGPL-3.0-or-later
// Runs inside a resource-limited worker thread: model building and PDF layout
// are CPU- and memory-bound for large Checks and must not share the web or
// worker process heap (ADR-0017 resource limits).
import { parentPort } from "node:worker_threads";
import { buildReport, type ReportInput } from "./model.ts";
import { renderPdf, ReportError } from "./pdf.ts";

parentPort!.on("message", (input: ReportInput) => {
  void renderPdf(buildReport(input))
    .then((pdf) =>
      parentPort!.postMessage({ ok: true, pdf }, [pdf.buffer as ArrayBuffer]),
    )
    .catch((error: unknown) =>
      parentPort!.postMessage({
        ok: false,
        failure:
          error instanceof ReportError ? error.code : ("unavailable" as const),
      }),
    );
});
