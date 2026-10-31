// SPDX-License-Identifier: AGPL-3.0-or-later
// The extraction port (ADR-0011). Callers see extracted text or one distinct
// failure; they never see which library or restricted area produced it.
import type { DocumentFormat } from "@source-taster/contract-verification/document";

export interface ExtractedText {
  format: DocumentFormat;
  text: string;
  /** Some, but not all, PDF pages contain no text. */
  partialNoText: boolean;
}

/** Each failure is distinct; none is an empty bibliography or a no-text PDF. */
export type ExtractionFailure =
  | "unsupported"
  | "no-text"
  | "encrypted"
  | "unreadable"
  | "page-limit"
  | "expansion-limit"
  | "time-limit"
  | "resource-limit"
  | "aborted"
  | "unavailable";

export class ExtractionFailed extends Error {
  override name = "ExtractionFailed";
  readonly failure: ExtractionFailure;
  constructor(failure: ExtractionFailure) {
    super(failure);
    this.failure = failure;
  }
}

export interface DocumentExtractor {
  close?(): Promise<void>;
  extract(
    format: DocumentFormat,
    bytes: Uint8Array,
    signal?: AbortSignal,
  ): Promise<ExtractedText>;
}

/** Initial values of ADR-0011/0015; memory, output and concurrency are operating settings. */
export interface ExtractionLimits {
  inputBytes: number;
  pages: number;
  /** "200 MB" stays 200,000,000 bytes, never reinterpreted as MiB. */
  expandedBytes: number;
  timeoutMs: number;
  cpuSeconds: number;
  outputBytes: number;
  memoryBytes: number;
  concurrency: number;
}
export const defaultExtractionLimits: ExtractionLimits = {
  inputBytes: 20_971_520,
  pages: 2000,
  expandedBytes: 200_000_000,
  timeoutMs: 60_000,
  cpuSeconds: 60,
  outputBytes: 32 * 1024 * 1024,
  memoryBytes: 1536 * 1024 * 1024,
  concurrency: 2,
};

/** Recognizes the format by content, never by file name or declared type. */
export function sniffFormat(bytes: Uint8Array): DocumentFormat | null {
  const head = Buffer.from(bytes.subarray(0, 1024)).toString("latin1");
  if (head.includes("%PDF-")) return "pdf";
  if (head.startsWith("PK\u0003\u0004")) return "docx";
  return null;
}

/** Content-free counters (ADR-0011 §19 OCR trigger). */
export interface DocumentMetrics {
  record(event: "pdf-no-text" | "pdf-partial-no-text"): void;
}
export const logMetrics: DocumentMetrics = {
  record: (event) => console.log(JSON.stringify({ code: `document-${event}` })),
};

export const unavailableExtractor: DocumentExtractor = {
  extract: () => Promise.reject(new ExtractionFailed("unavailable")),
};
