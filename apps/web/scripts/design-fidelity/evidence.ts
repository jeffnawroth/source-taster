// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Invalidate acceptance before git extraction, launch or any other fallible preflight. */
export function beginEvidence(out: string, metadata: object) {
  mkdirSync(out, { recursive: true });
  writeFileSync(
    join(out, "results.json"),
    JSON.stringify(
      {
        ...metadata,
        complete: false,
        passed: false,
        state: "preflight",
        results: [],
      },
      null,
      2,
    ),
  );
  writeFileSync(
    join(out, "index.html"),
    '<!doctype html><meta charset="utf-8"><title>Design fidelity preflight</title><h1>Run incomplete</h1><p>Preflight started. No acceptance result is available for this run.</p>',
  );
}
export interface PrivateResult {
  passed: boolean;
  coverage: {
    complete: boolean;
    total: number;
    selected: number;
    completed: number;
  };
  results: { id: string; passed: boolean }[];
}
/** A child exit code or a summary's own green flag cannot stand in for complete fresh evidence. */
export function privateCoverage(result: PrivateResult) {
  const coverage = result.coverage;
  const complete =
    coverage?.complete === true &&
    coverage.total > 0 &&
    coverage.selected === coverage.total &&
    coverage.completed === coverage.total &&
    result.results?.length === coverage.total &&
    new Set(result.results.map((r) => r.id)).size === coverage.total;
  return {
    complete,
    passed:
      complete &&
      result.passed === true &&
      result.results.every((r) => r.passed === true),
    states: result.results?.length ?? 0,
    evidence:
      "Private service checkout, apps/web/test-results/design-fidelity/index.html",
  };
}
