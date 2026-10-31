// SPDX-License-Identifier: AGPL-3.0-or-later
// Synthetic launch-scale load reports for the release-guard tests (#117). The
// observations are generated, never recorded latencies: the report builder is
// real, the evidence provenance is declared by the test.
import { defaultSearchSettings } from "@source-taster/core";
import {
  buildReport,
  type CheckObservation,
  type LoadReport,
  type ReportInput,
} from "../../scripts/load/analysis.ts";

export const syntheticSha = "a".repeat(40);

/** Fifty Checks of 100 References, each finished within a few seconds. */
export function launchObservations(
  durations = { findable: 1000, notFindable: 4000 },
): CheckObservation[] {
  return Array.from({ length: 50 }, (_, index) => {
    const sentAtMs = index * 10;
    const references = Array.from({ length: 100 }, (_, i) => {
      const findable = i % 2 === 0;
      return {
        slot: i + 1,
        id: `r${i + 1}`,
        category: findable ? ("findable" as const) : ("not-findable" as const),
        firstActiveAtMs: sentAtMs,
        endedAtMs:
          sentAtMs + (findable ? durations.findable : durations.notFindable),
        outcome: {
          kind: "verdict" as const,
          verdict: findable ? "correct" : "not-found",
          unavailable: [],
        },
      };
    });
    return {
      index,
      checkId: `check-${index}`,
      sentAtMs,
      createdAtMs: sentAtMs + 5,
      endedAtMs: Math.max(...references.map((r) => r.endedAtMs)),
      endReason: "completed",
      reconnects: 0,
      leaseRenewals: 0,
      references,
    };
  });
}

/** A report that passes every launch target on recorded evidence, built by the real report builder. */
export function passingReport(
  changes: Partial<ReportInput> = {},
  checks = launchObservations(),
): LoadReport {
  return buildReport({
    checks,
    scope: { concurrentChecks: 50, referencesPerCheck: 100 },
    durationBasis: "check-start",
    searchSettings: defaultSearchSettings,
    placeholderDelayMs: 500,
    codeVersion: { sha: syntheticSha, dirty: false },
    enabledSources: ["europepmc", "openalex"],
    topology: { webProcesses: 1, workerProcesses: 1, database: "postgres" },
    evidence: {
      provenance: "recorded",
      recordingDigest: `sha256:${"a".repeat(64)}`,
      authorization: "synthetic-test-authorization",
      unmatchedRequests: 0,
      requests: { openalex: 1 },
    },
    ...changes,
  });
}
