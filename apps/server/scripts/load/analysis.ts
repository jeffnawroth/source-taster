// SPDX-License-Identifier: AGPL-3.0-or-later
// Measurement and reporting for the FA-UEB-40–43 load harness (#117, ADR-0007).
// Pure: monotonic observations in, machine-readable report and exit code out.
// A target missed at a reduced scope is still a failure (more load cannot make
// it faster); a reduced scope can never pass, only report `incomplete`.
// The targets below are the approved requirement values. They are constants,
// not settings: no option of the harness can loosen them.

import { createHash } from "node:crypto";
import {
  defaultSearchSettings,
  type SearchSettings,
} from "@source-taster/core";
import { z } from "zod";

export const TARGETS = Object.freeze({
  /** FA-UEB-40: mean per findable Reference. */
  findableMeanMs: 3_000,
  /** FA-UEB-41: mean per Reference that cannot be found. */
  notFindableMeanMs: 15_000,
  /** FA-UEB-42: first Verdict after the start of each Check. */
  firstVerdictMs: 10_000,
  /** FA-UEB-42: a list of 100 References is finished. */
  listCompletionMs: 180_000,
  listReferences: 100,
  /** FA-UEB-43: Checks running concurrently (initial value). */
  concurrentChecks: 50,
});

/** The service's own development scheduling delay (`SOURCE_TASTER_PLACEHOLDER_DELAY_MS`). */
export const SHIPPED_PLACEHOLDER_DELAY_MS = 500;

export type Category = "findable" | "not-findable" | "degraded";
/**
 * How a Reference's duration is counted for FA-UEB-40/41.
 * - `check-start`: the literal requirement reading and the only basis that can
 *   qualify. The clock starts when the Check starts and includes every wait,
 *   among them the Check's own per-Check pacing (ADR-0007: ten active
 *   References per Check). With 100-Reference lists the mean sits near 5.5 x
 *   the per-Reference duration, a tension the handoff raises as a spec question.
 * - `slot-eligible`: a diagnostic reading from the moment the Reference could
 *   first run (Check start for the first `activeReferencesPerCheck` runs, the
 *   end of the Check's own earlier Reference that freed its slot afterwards).
 *   It is easier to pass, so a run measured this way never qualifies.
 */
export type DurationBasis = "slot-eligible" | "check-start";

export interface ReferenceOutcome {
  kind: "verdict" | "status";
  verdict?: string;
  status?: string;
  /** Transport-failure reasons recorded on the Reference's source evidence. */
  unavailable: string[];
}
export interface ReferenceObservation {
  slot: number;
  /** Workload identifier; never the Reference text. */
  id: string;
  category: Category;
  /** First progress other than `queued`, as monotonic milliseconds. */
  firstActiveAtMs?: number;
  endedAtMs?: number;
  outcome?: ReferenceOutcome;
}
export interface CheckObservation {
  index: number;
  checkId?: string;
  /** Immediately before the create request was sent: the Check's clock start. */
  sentAtMs: number;
  createdAtMs?: number;
  endedAtMs?: number;
  endReason?: string;
  /** Why this Check's observation is incomplete (client-side). */
  failure?: string;
  reconnects: number;
  leaseRenewals: number;
  references: ReferenceObservation[];
}
export interface Evidence {
  provenance: "recorded" | "synthetic-witness";
  recordingDigest?: string;
  authorization?: string;
  unmatchedRequests: number;
  requests: Record<string, number>;
}
export interface ReportInput {
  checks: CheckObservation[];
  scope: { concurrentChecks: number; referencesPerCheck: number };
  durationBasis: DurationBasis;
  searchSettings: SearchSettings;
  placeholderDelayMs: number;
  topology: { webProcesses: number; workerProcesses: number; database: string };
  evidence: Evidence;
  /** Search strategy versions that the Verdicts actually carried. */
  observedStrategyVersions?: string[];
}

const TargetResult = z.object({
  id: z.string(),
  requirement: z.string(),
  description: z.string(),
  unit: z.enum(["ms", "checks"]),
  comparison: z.enum(["at-most", "at-least"]),
  limit: z.number(),
  measured: z.number().nullable(),
  samples: z.number().int().nonnegative(),
  status: z.enum(["met", "missed", "invalid-evidence", "not-measured"]),
});
const Mean = z.object({
  count: z.number().int().nonnegative(),
  meanQueueMs: z.number().nullable(),
  meanExecutionMs: z.number().nullable(),
  meanFromCheckStartMs: z.number().nullable(),
  meanSlotEligibleMs: z.number().nullable(),
  p95SlotEligibleMs: z.number().nullable(),
});
export const LoadReport = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string(),
  clock: z.literal("monotonic"),
  outcome: z.enum(["passed", "failed", "incomplete"]),
  qualifying: z.boolean(),
  durationBasis: z.enum(["slot-eligible", "check-start"]),
  scope: z.object({
    launch: z.boolean(),
    concurrentChecks: z.number().int(),
    referencesPerCheck: z.number().int(),
    references: z.number().int(),
  }),
  configuration: z.object({
    searchSettings: z.unknown(),
    settingsHash: z.string(),
    defaultSettingsHash: z.string(),
    matchesShippedDefaults: z.boolean(),
    placeholderDelayMs: z.number().int(),
    topology: z.object({
      webProcesses: z.number().int(),
      workerProcesses: z.number().int(),
      database: z.string(),
    }),
    observedStrategyVersions: z.array(z.string()),
  }),
  evidence: z.object({
    provenance: z.enum(["recorded", "synthetic-witness"]),
    recordingDigest: z.string().optional(),
    authorization: z.string().optional(),
    unmatchedRequests: z.number().int(),
    requests: z.record(z.string(), z.number().int()),
  }),
  targets: z.array(TargetResult),
  invalidEvidence: z.array(
    z.object({
      code: z.string(),
      count: z.number().int().positive(),
      detail: z.string(),
    }),
  ),
  diagnostics: z.object({
    findable: Mean,
    notFindable: Mean,
    degraded: Mean,
    /** Terminal outcomes per category, e.g. `{ findable: { correct: 4 } }`. */
    outcomes: z.record(z.string(), z.record(z.string(), z.number().int())),
    /** Why Data source requests were unavailable, over all References. */
    unavailableReasons: z.record(z.string(), z.number().int()),
    peakConcurrentChecks: z.number().int(),
    reconnects: z.number().int(),
    leaseRenewals: z.number().int(),
  }),
  checks: z.array(
    z.object({
      index: z.number().int(),
      checkId: z.string().optional(),
      firstVerdictMs: z.number().nullable(),
      durationMs: z.number().nullable(),
      endReason: z.string().nullable(),
      failure: z.string().optional(),
      references: z.number().int(),
    }),
  ),
  limitations: z.array(z.string()),
});
export type LoadReport = z.infer<typeof LoadReport>;

/** Canonical hash of the operating settings, comparable against the shipped defaults. */
export function settingsHash(settings: SearchSettings): string {
  return createHash("sha256")
    .update(JSON.stringify(canonical(settings)))
    .digest("hex")
    .slice(0, 16);
}
function canonical(value: unknown): unknown {
  return value && typeof value === "object"
    ? Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [
            key,
            canonical((value as Record<string, unknown>)[key]),
          ]),
      )
    : value;
}

const identified = new Set(["correct", "exists-with-deviations"]);
const mean = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
const percentile = (values: number[], p: number) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)]!;
};

interface Timed {
  reference: ReferenceObservation;
  fromCheckStart: number;
  slotEligible: number;
  queue: number;
  execution: number;
}
/** Per-Reference durations of one Check under both duration bases. */
function timings(check: CheckObservation, cap: number): Timed[] {
  const finished = check.references.filter(
    (r) => r.endedAtMs !== undefined && r.outcome,
  );
  const byStart = [...finished].sort(
    (a, b) =>
      (a.firstActiveAtMs ?? a.endedAtMs!) - (b.firstActiveAtMs ?? b.endedAtMs!),
  );
  const ends = finished.map((r) => r.endedAtMs!).sort((a, b) => a - b);
  return byStart.map((reference, rank) => {
    const active = reference.firstActiveAtMs ?? reference.endedAtMs!;
    const freed = rank < cap ? check.sentAtMs : ends[rank - cap]!;
    const eligible = Math.min(freed, active);
    return {
      reference,
      fromCheckStart: reference.endedAtMs! - check.sentAtMs,
      slotEligible: reference.endedAtMs! - eligible,
      queue: active - check.sentAtMs,
      execution: reference.endedAtMs! - active,
    };
  });
}

function peakConcurrency(checks: CheckObservation[]): number {
  // A Check that was created and never ended was still running when the run
  // stopped; it counts as concurrent until then.
  const events = checks.flatMap((c) =>
    c.endedAtMs === undefined && c.createdAtMs === undefined
      ? []
      : [
          [c.sentAtMs, 1] as const,
          [c.endedAtMs ?? Number.POSITIVE_INFINITY, -1] as const,
        ],
  );
  // Ends before starts at the same instant: touching Checks do not overlap.
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let current = 0;
  let peak = 0;
  for (const [, delta] of events) {
    current += delta;
    peak = Math.max(peak, current);
  }
  return peak;
}

export function buildReport(input: ReportInput): LoadReport {
  const { checks, scope, evidence } = input;
  const cap = input.searchSettings.activeReferencesPerCheck;
  const invalid = new Map<string, { count: number; detail: string }>();
  const flag = (code: string, detail: string, count = 1) => {
    const existing = invalid.get(code);
    invalid.set(code, { detail, count: (existing?.count ?? 0) + count });
  };

  if (evidence.unmatchedRequests > 0)
    flag(
      "unmatched-replay-requests",
      "Data source requests without a recording received an empty answer; they cannot count as evidence.",
      evidence.unmatchedRequests,
    );
  for (const check of checks) {
    if (check.endReason !== "completed" || check.endedAtMs === undefined)
      flag(
        "check-not-completed",
        "A Check ended without reason `completed` (lease expiry, cancellation or a lost stream); its list did not finish.",
      );
    for (const r of check.references)
      if (r.endedAtMs === undefined || !r.outcome)
        flag(
          "reference-unfinished",
          "A Reference reached no terminal outcome.",
        );
  }

  const all = checks.flatMap((check) => timings(check, cap));
  const bad = { findable: false, notFindable: false };
  for (const t of all) {
    const { reference } = t;
    const outcome = reference.outcome!;
    if (reference.category === "findable") {
      if (
        outcome.kind !== "verdict" ||
        !identified.has(outcome.verdict ?? "") ||
        outcome.unavailable.length > 0
      ) {
        flag(
          "findable-not-identified",
          "A findable Reference did not end with an identity-establishing Verdict from complete evidence.",
        );
        bad.findable = true;
      }
    } else if (reference.category === "not-findable") {
      if (
        outcome.kind !== "verdict" ||
        outcome.verdict !== "not-found" ||
        outcome.unavailable.length > 0
      ) {
        flag(
          "not-findable-search-incomplete",
          "A Reference that cannot be found did not end Not found after a completed search; fast outage, Not verifiable and deadline results are not negative evidence.",
        );
        bad.notFindable = true;
      }
    }
  }
  if (checks.some((c) => c.failure))
    flag(
      "client-failure",
      "The harness lost observations for a Check.",
      checks.filter((c) => c.failure).length,
    );

  const summarize = (category: Category) => {
    const rows = all.filter((t) => t.reference.category === category);
    return {
      rows,
      summary: {
        count: rows.length,
        meanQueueMs: mean(rows.map((t) => t.queue)),
        meanExecutionMs: mean(rows.map((t) => t.execution)),
        meanFromCheckStartMs: mean(rows.map((t) => t.fromCheckStart)),
        meanSlotEligibleMs: mean(rows.map((t) => t.slotEligible)),
        p95SlotEligibleMs: percentile(
          rows.map((t) => t.slotEligible),
          0.95,
        ),
      },
    };
  };
  const findable = summarize("findable");
  const notFindable = summarize("not-findable");
  const degraded = summarize("degraded");
  const basisMean = (rows: Timed[]) =>
    mean(
      rows.map((t) =>
        input.durationBasis === "check-start"
          ? t.fromCheckStart
          : t.slotEligible,
      ),
    );

  const outcomes: Record<string, Record<string, number>> = {
    findable: {},
    "not-findable": {},
    degraded: {},
  };
  const unavailableReasons: Record<string, number> = {};
  for (const t of all) {
    const outcome = t.reference.outcome!;
    const name =
      (outcome.kind === "verdict" ? outcome.verdict : outcome.status) ??
      "unknown";
    const bucket = outcomes[t.reference.category]!;
    bucket[name] = (bucket[name] ?? 0) + 1;
    for (const reason of outcome.unavailable)
      unavailableReasons[reason] = (unavailableReasons[reason] ?? 0) + 1;
  }

  const firstVerdicts = checks.map((c) => {
    const ended = c.references
      .filter((r) => r.endedAtMs !== undefined)
      .map((r) => r.endedAtMs!);
    return ended.length ? Math.min(...ended) - c.sentAtMs : null;
  });
  const durations = checks.map((c) =>
    c.endedAtMs === undefined ? null : c.endedAtMs - c.sentAtMs,
  );
  const peak = peakConcurrency(checks);

  const launchConcurrency = scope.concurrentChecks >= TARGETS.concurrentChecks;
  const listScope = scope.referencesPerCheck >= TARGETS.listReferences;
  const measuredOf = (
    values: (number | null)[],
    complete: boolean,
  ): number | null =>
    complete && values.length && values.every((v) => v !== null)
      ? Math.max(...values)
      : null;

  function target(
    id: string,
    requirement: string,
    description: string,
    unit: "ms" | "checks",
    comparison: "at-most" | "at-least",
    limit: number,
    measured: number | null,
    samples: number,
    applicable: boolean,
    invalidEvidence = false,
  ): z.infer<typeof TargetResult> {
    let status: z.infer<typeof TargetResult>["status"];
    if (!applicable || measured === null) status = "not-measured";
    else if (invalidEvidence) status = "invalid-evidence";
    else if (comparison === "at-most")
      status = measured <= limit ? "met" : "missed";
    else status = measured >= limit ? "met" : "missed";
    return {
      id,
      requirement,
      description,
      unit,
      comparison,
      limit,
      measured,
      samples,
      status,
    };
  }

  const anyInvalid = invalid.size > 0;
  const targets = [
    target(
      "FA-UEB-40",
      "FA-UEB-40",
      "Mean duration per findable Reference",
      "ms",
      "at-most",
      TARGETS.findableMeanMs,
      basisMean(findable.rows),
      findable.rows.length,
      true,
      bad.findable,
    ),
    target(
      "FA-UEB-41",
      "FA-UEB-41",
      "Mean duration per Reference that cannot be found",
      "ms",
      "at-most",
      TARGETS.notFindableMeanMs,
      basisMean(notFindable.rows),
      notFindable.rows.length,
      true,
      bad.notFindable,
    ),
    target(
      "FA-UEB-42-first-verdict",
      "FA-UEB-42",
      "Longest time from Check start to the first Verdict",
      "ms",
      "at-most",
      TARGETS.firstVerdictMs,
      measuredOf(firstVerdicts, true),
      firstVerdicts.length,
      true,
    ),
    target(
      "FA-UEB-42-list",
      "FA-UEB-42",
      "Longest time to finish a list of 100 References",
      "ms",
      "at-most",
      TARGETS.listCompletionMs,
      measuredOf(durations, true),
      durations.length,
      listScope && launchConcurrency,
    ),
    target(
      "FA-UEB-43",
      "FA-UEB-43",
      "Peak number of Checks running concurrently",
      "checks",
      "at-least",
      TARGETS.concurrentChecks,
      checks.length ? peak : null,
      checks.length,
      launchConcurrency,
    ),
  ];

  const launch = launchConcurrency && listScope;
  const missed = targets.some(
    (t) => t.status === "missed" || t.status === "invalid-evidence",
  );
  const unmeasured = targets.some((t) => t.status === "not-measured");
  const outcome: LoadReport["outcome"] =
    missed || anyInvalid
      ? "failed"
      : unmeasured || !launch
        ? "incomplete"
        : "passed";

  const hash = settingsHash(input.searchSettings);
  const defaultHash = settingsHash(defaultSearchSettings);
  const limitations = [
    "Replay is regression evidence; live fifty-Check acceptance (FA-UEB-43) is separate.",
    "Host CPU, memory, connection and parser-isolation capacity are not measured by this harness.",
  ];
  if (evidence.provenance === "synthetic-witness")
    limitations.push(
      "Synthetic latency witnesses are not recorded latencies and give no qualification.",
    );
  if (input.durationBasis !== "check-start")
    limitations.push(
      "The slot-eligible duration basis is a diagnostic reading, not the literal Check-start clock; it gives no qualification.",
    );
  if (!launch)
    limitations.push(
      `Reduced scope (${scope.concurrentChecks} concurrent Checks, ${scope.referencesPerCheck} References each): a miss still fails, but the run cannot pass.`,
    );
  if (hash !== defaultHash)
    limitations.push(
      "The operating settings differ from the shipped defaults; this is evidence for that exact configuration only.",
    );
  if (input.placeholderDelayMs > 0)
    limitations.push(
      `A development scheduling delay of ${input.placeholderDelayMs} ms is part of every Reference run.`,
    );

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    clock: "monotonic",
    outcome,
    // Qualification needs a pass on authorized recordings under the shipped
    // operating budgets and the literal measurement; easing any of them,
    // for diagnosis, can never produce a qualifying report.
    qualifying:
      outcome === "passed" &&
      evidence.provenance === "recorded" &&
      !!evidence.recordingDigest &&
      !!evidence.authorization &&
      hash === defaultHash &&
      input.placeholderDelayMs >= SHIPPED_PLACEHOLDER_DELAY_MS &&
      input.durationBasis === "check-start",
    durationBasis: input.durationBasis,
    scope: {
      launch,
      ...scope,
      references: checks.reduce((n, c) => n + c.references.length, 0),
    },
    configuration: {
      searchSettings: input.searchSettings,
      settingsHash: hash,
      defaultSettingsHash: defaultHash,
      matchesShippedDefaults: hash === defaultHash,
      placeholderDelayMs: input.placeholderDelayMs,
      topology: input.topology,
      observedStrategyVersions: input.observedStrategyVersions ?? [],
    },
    evidence,
    targets,
    invalidEvidence: [...invalid].map(([code, v]) => ({ code, ...v })),
    diagnostics: {
      findable: findable.summary,
      notFindable: notFindable.summary,
      degraded: degraded.summary,
      outcomes,
      unavailableReasons,
      peakConcurrentChecks: peak,
      reconnects: checks.reduce((n, c) => n + c.reconnects, 0),
      leaseRenewals: checks.reduce((n, c) => n + c.leaseRenewals, 0),
    },
    checks: checks.map((c, i) => ({
      index: c.index,
      checkId: c.checkId,
      firstVerdictMs: firstVerdicts[i]!,
      durationMs: durations[i]!,
      endReason: c.endReason ?? null,
      ...(c.failure ? { failure: c.failure } : {}),
      references: c.references.length,
    })),
    limitations,
  };
}

/** 0 passed, 1 a target missed or invalid evidence, 3 not a launch-scope run. */
export function exitCodeFor(report: LoadReport): 0 | 1 | 3 {
  return report.outcome === "passed" ? 0 : report.outcome === "failed" ? 1 : 3;
}
