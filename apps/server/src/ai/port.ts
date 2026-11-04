// SPDX-License-Identifier: AGPL-3.0-or-later
// One port for runtime and ADR-0006 measurement. Legacy CSL-only diagnostic
// adapters remain measurable, but cannot dispatch through the grounded intake.
import type { StructuredCsl } from "@source-taster/contract-verification/v2";
import type { AiConfiguration } from "../quality/extraction.ts";
export interface ExtractionPort {
  model: string;
  /** Exact adapter entry-module bytes, derived by the loader. */
  codeDigest?: string;
  configuration?: AiConfiguration;
  extract(input: string, signal?: AbortSignal): Promise<StructuredCsl[]>;
  warmup?(): Promise<void>;
  extractSpans?(input: string, signal: AbortSignal): Promise<unknown>;
}
