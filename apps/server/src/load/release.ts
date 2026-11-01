// SPDX-License-Identifier: AGPL-3.0-or-later
// Release guard for the fifty-Check replay (#117, ADR-0007, FA-UEB-43). ADR-0007
// runs the clock- and limiter-aware replay on every release and makes the
// operating budgets part of the measured configuration, with no blanket
// exemption. The guard therefore accepts a report only when it was produced by
// recorded, authorized evidence at launch scale on the literal Check-start
// clock for exactly this clean code version, with exactly the production
// configuration that #94 measures: the same optional Data sources and the same
// effective search settings. Every number is recomputed from the report's own
// measurements; its `qualifying`, `outcome` and target statuses are not trusted.
import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { parseSearchSettings } from "../config.ts";
import {
  LoadReport,
  SHIPPED_PLACEHOLDER_DELAY_MS,
  TARGETS,
} from "./analysis.ts";

export interface LoadReplayInput {
  /** Private report location (`SOURCE_TASTER_LOAD_REPORT`); undefined when not configured. */
  path: string | undefined;
  /** Derived from git by the caller, never from the report. */
  code: { sha: string; dirty: boolean };
  /** The configuration being released, from the #94 Measured configuration file. */
  expected?: {
    enabledSources: string[];
    searchSettings: Record<string, unknown> | null;
  };
}
export interface LoadReplayResult {
  ok: boolean;
  reasons: string[];
}

const LAUNCH_TARGETS = [
  ["FA-UEB-40", TARGETS.findableMeanMs, "at-most", "ms"],
  ["FA-UEB-41", TARGETS.notFindableMeanMs, "at-most", "ms"],
  ["FA-UEB-42-first-verdict", TARGETS.firstVerdictMs, "at-most", "ms"],
  ["FA-UEB-42-list", TARGETS.listCompletionMs, "at-most", "ms"],
  ["FA-UEB-43", TARGETS.concurrentChecks, "at-least", "checks"],
] as const;

const maximum = (values: (number | null)[]) =>
  values.length && values.every((v) => v !== null) ? Math.max(...values) : null;

export async function checkLoadReplay(
  input: LoadReplayInput,
): Promise<LoadReplayResult> {
  const result = (reasons: string[]) => ({
    ok: reasons.length === 0,
    reasons,
  });
  if (!input.path) return result(["no-load-report"]);
  let text: string;
  try {
    text = await readFile(input.path, "utf8");
  } catch {
    return result(["load-report-unreadable"]);
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return result(["invalid-load-report"]);
  }
  const parsed = LoadReport.safeParse(json);
  if (!parsed.success) return result(["invalid-load-report"]);
  const report = parsed.data;
  const reasons: string[] = [];

  // Authorized recorded evidence only; a synthetic witness is a regression aid.
  if (
    report.evidence.provenance !== "recorded" ||
    !report.evidence.recordingDigest ||
    !report.evidence.authorization
  )
    reasons.push("load-synthetic-evidence");
  if (
    report.evidence.unmatchedRequests > 0 ||
    report.invalidEvidence.length > 0
  )
    reasons.push("load-invalid-evidence");
  if (report.checks.some((c) => c.endReason !== "completed" || c.failure))
    reasons.push("load-check-not-completed");

  // Launch scale, from the Checks actually observed.
  if (
    report.checks.length < TARGETS.concurrentChecks ||
    report.checks.some((c) => c.references < TARGETS.listReferences)
  )
    reasons.push("load-scope-reduced");

  if (report.durationBasis !== "check-start")
    reasons.push("load-duration-basis");
  if (report.configuration.placeholderDelayMs < SHIPPED_PLACEHOLDER_DELAY_MS)
    reasons.push("load-placeholder-delay");

  // The targets are fixed requirement constants; recompute each measurement.
  const recomputed: Record<string, number | null> = {
    "FA-UEB-40": report.diagnostics.findable.count
      ? report.diagnostics.findable.meanFromCheckStartMs
      : null,
    "FA-UEB-41": report.diagnostics.notFindable.count
      ? report.diagnostics.notFindable.meanFromCheckStartMs
      : null,
    "FA-UEB-42-first-verdict": maximum(
      report.checks.map((c) => c.firstVerdictMs),
    ),
    "FA-UEB-42-list": maximum(report.checks.map((c) => c.durationMs)),
    "FA-UEB-43": report.diagnostics.peakConcurrentChecks,
  };
  for (const [id, limit, comparison, unit] of LAUNCH_TARGETS) {
    const stated = report.targets.filter((t) => t.id === id);
    if (
      stated.length !== 1 ||
      stated[0]!.limit !== limit ||
      stated[0]!.comparison !== comparison ||
      stated[0]!.unit !== unit
    ) {
      reasons.push(`load-target-changed:${id}`);
      continue;
    }
    const measured = recomputed[id] ?? null;
    const met =
      measured !== null &&
      (comparison === "at-most" ? measured <= limit : measured >= limit);
    if (!met) reasons.push(`load-target-missed:${id}`);
    else if (stated[0]!.measured !== measured)
      reasons.push(`load-target-inconsistent:${id}`);
  }

  // This exact, clean code version.
  if (
    input.code.dirty ||
    !report.codeVersion ||
    report.codeVersion.dirty ||
    report.codeVersion.sha !== input.code.sha
  )
    reasons.push("load-code-version-mismatch");

  // The exact production configuration measured by the Quality gate (#94).
  if (input.expected) {
    let effective: unknown;
    try {
      effective = JSON.parse(
        JSON.stringify(
          parseSearchSettings(
            JSON.stringify(input.expected.searchSettings ?? {}),
          ),
        ),
      );
    } catch {
      reasons.push("load-configuration-invalid");
    }
    if (
      effective !== undefined &&
      !isDeepStrictEqual(effective, report.configuration.searchSettings)
    )
      reasons.push("load-configuration-mismatch");
    if (
      !isDeepStrictEqual(
        [...(report.configuration.enabledSources ?? [])].sort(),
        [...input.expected.enabledSources].sort(),
      )
    )
      reasons.push("load-sources-mismatch");
  }
  return result(reasons);
}
