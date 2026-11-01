// SPDX-License-Identifier: AGPL-3.0-or-later
// One short-lived, resource-limited worker thread per report. A report that
// exceeds time, memory or output limits ends as `limit-exceeded`, never as a
// partial or silently truncated file.
import { Worker } from "node:worker_threads";
import type { ReportFailure } from "@source-taster/contract-verification/report";
import type { ReportInput } from "./model.ts";

export class ReportFailed extends Error {
  readonly failure: ReportFailure;
  constructor(failure: ReportFailure) {
    super(failure);
    this.failure = failure;
  }
}
export const reportLimits = {
  wallClockMs: 120_000,
  maxOldGenerationSizeMb: 512,
  maxYoungGenerationSizeMb: 64,
  /** The sealed file is stored as base64 JSON. */
  maxBytes: 24 * 1024 * 1024,
} as const;

export function generateReport(input: ReportInput): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const file = import.meta.url.endsWith(".ts")
      ? "./generate-worker.ts"
      : "./generate-worker.js";
    const worker = new Worker(new URL(file, import.meta.url), {
      resourceLimits: {
        maxOldGenerationSizeMb: reportLimits.maxOldGenerationSizeMb,
        maxYoungGenerationSizeMb: reportLimits.maxYoungGenerationSizeMb,
      },
    });
    let settled = false;
    const finish = (done: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      void worker.terminate();
      done();
    };
    const deadline = setTimeout(
      () => finish(() => reject(new ReportFailed("limit-exceeded"))),
      reportLimits.wallClockMs,
    );
    worker.on(
      "message",
      (result: { ok: boolean; pdf?: Uint8Array; failure?: ReportFailure }) =>
        finish(() => {
          if (result.ok && result.pdf) {
            if (result.pdf.byteLength > reportLimits.maxBytes)
              reject(new ReportFailed("limit-exceeded"));
            else resolve(result.pdf);
          } else reject(new ReportFailed(result.failure ?? "unavailable"));
        }),
    );
    worker.on("error", (error: Error & { code?: string }) =>
      finish(() =>
        reject(
          new ReportFailed(
            error.code === "ERR_WORKER_OUT_OF_MEMORY"
              ? "limit-exceeded"
              : "unavailable",
          ),
        ),
      ),
    );
    worker.on("exit", () =>
      finish(() => reject(new ReportFailed("unavailable"))),
    );
    worker.postMessage(input);
  });
}
