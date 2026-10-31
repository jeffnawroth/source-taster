// SPDX-License-Identifier: AGPL-3.0-or-later
// FA-UEB-40–43 reporting and threshold behavior of the load harness (#117).
// Pure measurement seam: observations in, machine-readable report and exit
// code out. Expected numbers are worked by hand from the spec limits.
import { describe, expect, it } from "vitest";
import { defaultSearchSettings } from "@source-taster/core";
import {
  buildReport,
  exitCodeFor,
  LoadReport,
  TARGETS,
  type CheckObservation,
  type ReferenceObservation,
  type ReportInput,
} from "../scripts/load/analysis.ts";

const LAUNCH = { concurrentChecks: 50, referencesPerCheck: 100 };

/** A finished Reference: the observation times are monotonic milliseconds. */
function reference(
  slot: number,
  category: ReferenceObservation["category"],
  firstActiveAtMs: number,
  endedAtMs: number,
  outcome?: ReferenceObservation["outcome"],
): ReferenceObservation {
  return {
    slot,
    id: `r${slot}`,
    category,
    firstActiveAtMs,
    endedAtMs,
    outcome:
      outcome ??
      (category === "findable"
        ? { kind: "verdict", verdict: "correct", unavailable: [] }
        : { kind: "verdict", verdict: "not-found", unavailable: [] }),
  };
}

/**
 * One Check of `count` References, every Reference running from `sentAtMs`
 * and ending after its category's duration; Checks end with the last one.
 */
function uniformCheck(
  index: number,
  count: number,
  durations: { findable: number; notFindable: number },
  sentAtMs = 0,
): CheckObservation {
  const references = Array.from({ length: count }, (_, i) => {
    const category = i % 2 === 0 ? "findable" : "not-findable";
    const duration =
      category === "findable" ? durations.findable : durations.notFindable;
    return reference(i + 1, category, sentAtMs, sentAtMs + duration);
  });
  return {
    index,
    checkId: `check-${index}`,
    sentAtMs,
    createdAtMs: sentAtMs + 5,
    endedAtMs: Math.max(...references.map((r) => r.endedAtMs!)),
    endReason: "completed",
    reconnects: 0,
    leaseRenewals: 0,
    references,
  };
}

function input(
  checks: CheckObservation[],
  changes: Partial<ReportInput> = {},
): ReportInput {
  return {
    checks,
    scope: LAUNCH,
    durationBasis: "check-start",
    searchSettings: defaultSearchSettings,
    placeholderDelayMs: 500,
    codeVersion: { sha: "a".repeat(40), dirty: false },
    enabledSources: ["europepmc", "openalex"],
    topology: { webProcesses: 1, workerProcesses: 1, database: "postgres" },
    evidence: {
      provenance: "recorded",
      recordingDigest: "sha256:" + "a".repeat(64),
      authorization: "operator-approved-test-recording",
      unmatchedRequests: 0,
      requests: { openalex: 10 },
    },
    ...changes,
  };
}

const launchChecks = (
  durations = { findable: 1000, notFindable: 4000 },
  count = 100,
  checks = 50,
) =>
  Array.from({ length: checks }, (_, i) =>
    uniformCheck(i, count, durations, i * 10),
  );

const target = (report: LoadReport, id: string) =>
  report.targets.find((t) => t.id === id)!;

describe("load report", () => {
  it("passes only when all four launch targets are measured and met", () => {
    const report = buildReport(input(launchChecks()));
    expect(report.outcome).toBe("passed");
    expect(exitCodeFor(report)).toBe(0);
    expect(report.targets.map((t) => [t.id, t.status])).toEqual([
      ["FA-UEB-40", "met"],
      ["FA-UEB-41", "met"],
      ["FA-UEB-42-first-verdict", "met"],
      ["FA-UEB-42-list", "met"],
      ["FA-UEB-43", "met"],
    ]);
    expect(target(report, "FA-UEB-40").measured).toBe(1000);
    expect(target(report, "FA-UEB-41").measured).toBe(4000);
    // The worst Check decides the first-Verdict target: all send at i*10 ms
    // and the first Verdict arrives 1000 ms later.
    expect(target(report, "FA-UEB-42-first-verdict").measured).toBe(1000);
    expect(report.scope.launch).toBe(true);
    // Round-trips as machine-readable JSON against its own schema.
    expect(LoadReport.parse(JSON.parse(JSON.stringify(report)))).toEqual(
      report,
    );
  });

  it("fails when the findable mean exceeds 3 s", () => {
    const report = buildReport(
      input(launchChecks({ findable: 3001, notFindable: 4000 })),
    );
    expect(target(report, "FA-UEB-40")).toMatchObject({
      status: "missed",
      limit: TARGETS.findableMeanMs,
      measured: 3001,
    });
    expect(report.outcome).toBe("failed");
    expect(exitCodeFor(report)).toBe(1);
  });

  it("fails when the not-findable mean exceeds 15 s", () => {
    const report = buildReport(
      input(launchChecks({ findable: 1000, notFindable: 15001 })),
    );
    expect(target(report, "FA-UEB-41")).toMatchObject({
      status: "missed",
      measured: 15001,
    });
    expect(exitCodeFor(report)).toBe(1);
  });

  it("fails when any Check shows its first Verdict later than 10 s", () => {
    const checks = launchChecks();
    // One Check's References all begin and end at 10.5 s.
    checks[7] = uniformCheck(7, 100, { findable: 500, notFindable: 500 }, 0);
    for (const r of checks[7].references) {
      r.firstActiveAtMs = 10_000;
      r.endedAtMs = 10_500;
    }
    checks[7].endedAtMs = 10_500;
    const report = buildReport(input(checks));
    expect(target(report, "FA-UEB-42-first-verdict")).toMatchObject({
      status: "missed",
      measured: 10_500,
    });
    expect(exitCodeFor(report)).toBe(1);
  });

  it("fails when a 100-Reference list needs longer than 3 minutes", () => {
    const checks = launchChecks();
    checks[3]!.endedAtMs = checks[3]!.sentAtMs + 180_001;
    const report = buildReport(input(checks));
    expect(target(report, "FA-UEB-42-list")).toMatchObject({
      status: "missed",
      measured: 180_001,
    });
    expect(exitCodeFor(report)).toBe(1);
  });

  it("fails when the 50 Checks never ran concurrently", () => {
    // Fifty Checks, but each finishes before the next one starts.
    const checks = Array.from({ length: 50 }, (_, i) =>
      uniformCheck(i, 100, { findable: 500, notFindable: 500 }, i * 1000),
    );
    const report = buildReport(input(checks));
    expect(target(report, "FA-UEB-43")).toMatchObject({
      status: "missed",
      measured: 1,
    });
    expect(exitCodeFor(report)).toBe(1);
  });

  it("measures time to finish the list only for lists of 100 References", () => {
    const report = buildReport(
      input(launchChecks(undefined, 40), {
        scope: { concurrentChecks: 50, referencesPerCheck: 40 },
      }),
    );
    expect(target(report, "FA-UEB-42-list").status).toBe("not-measured");
    expect(report.scope.launch).toBe(false);
    expect(report.outcome).toBe("incomplete");
    expect(exitCodeFor(report)).toBe(3);
  });

  it("still fails a reduced scope run that already misses a target", () => {
    const report = buildReport(
      input(launchChecks({ findable: 3500, notFindable: 4000 }, 10, 5), {
        scope: { concurrentChecks: 5, referencesPerCheck: 10 },
      }),
    );
    expect(target(report, "FA-UEB-40").status).toBe("missed");
    expect(report.outcome).toBe("failed");
    expect(exitCodeFor(report)).toBe(1);
  });

  it("never reports a reduced concurrency run as passed", () => {
    const report = buildReport(
      input(launchChecks(undefined, 100, 10), {
        scope: { concurrentChecks: 10, referencesPerCheck: 100 },
      }),
    );
    expect(target(report, "FA-UEB-43").status).toBe("not-measured");
    expect(report.outcome).toBe("incomplete");
    expect(report.qualifying).toBe(false);
    expect(exitCodeFor(report)).toBe(3);
  });

  it("does not let a fast outage stand in for a completed negative search", () => {
    const checks = launchChecks({ findable: 1000, notFindable: 200 });
    checks[0]!.references[1]!.outcome = {
      kind: "verdict",
      verdict: "not-verifiable",
      unavailable: ["rate-budget", "deadline"],
    };
    const report = buildReport(input(checks));
    // The mean is still low, but the evidence is not a completed search.
    expect(target(report, "FA-UEB-41")).toMatchObject({
      status: "invalid-evidence",
    });
    expect(report.invalidEvidence).toContainEqual(
      expect.objectContaining({
        code: "not-findable-search-incomplete",
        count: 1,
      }),
    );
    expect(report.outcome).toBe("failed");
    expect(exitCodeFor(report)).toBe(1);
  });

  it("does not accept a findable Reference that was not identified", () => {
    const checks = launchChecks();
    checks[2]!.references[0]!.outcome = {
      kind: "verdict",
      verdict: "not-found",
      unavailable: [],
    };
    const report = buildReport(input(checks));
    expect(target(report, "FA-UEB-40").status).toBe("invalid-evidence");
    expect(report.invalidEvidence).toContainEqual(
      expect.objectContaining({ code: "findable-not-identified", count: 1 }),
    );
    expect(exitCodeFor(report)).toBe(1);
  });

  it("counts Checks still running at the run deadline as concurrent", () => {
    const checks = launchChecks().map((check) => ({
      ...check,
      endedAtMs: undefined,
      endReason: undefined,
      failure: "run-deadline",
    }));
    const report = buildReport(input(checks));
    expect(target(report, "FA-UEB-43").measured).toBe(50);
    expect(report.diagnostics.peakConcurrentChecks).toBe(50);
    expect(report.outcome).toBe("failed");
  });

  it("rejects a Check that did not complete, e.g. lease expiry", () => {
    const checks = launchChecks();
    checks[5]!.endReason = "lease-expired";
    const report = buildReport(input(checks));
    expect(report.invalidEvidence).toContainEqual(
      expect.objectContaining({ code: "check-not-completed", count: 1 }),
    );
    expect(exitCodeFor(report)).toBe(1);
  });

  it("rejects a Reference that never reached an outcome", () => {
    const checks = launchChecks();
    delete checks[1]!.references[3]!.endedAtMs;
    delete checks[1]!.references[3]!.outcome;
    const report = buildReport(input(checks));
    expect(report.invalidEvidence).toContainEqual(
      expect.objectContaining({ code: "reference-unfinished", count: 1 }),
    );
    expect(exitCodeFor(report)).toBe(1);
  });

  it("fails when a replayed Data source request had no recording", () => {
    const report = buildReport(
      input(launchChecks(), {
        evidence: { ...input([]).evidence, unmatchedRequests: 3 },
      }),
    );
    expect(report.invalidEvidence).toContainEqual(
      expect.objectContaining({ code: "unmatched-replay-requests", count: 3 }),
    );
    expect(exitCodeFor(report)).toBe(1);
  });

  it("marks synthetic latency witnesses as no qualification", () => {
    const report = buildReport(
      input(launchChecks(), {
        evidence: {
          provenance: "synthetic-witness",
          unmatchedRequests: 0,
          requests: {},
        },
      }),
    );
    expect(report.outcome).toBe("passed");
    expect(report.qualifying).toBe(false);
    expect(report.evidence.provenance).toBe("synthetic-witness");
    expect(report.limitations).toContain(
      "Synthetic latency witnesses are not recorded latencies and give no qualification.",
    );
  });

  it("never qualifies a run that eased the measurement or the budgets", () => {
    const eased = {
      "slot-eligible duration basis": { durationBasis: "slot-eligible" },
      "settings different from the shipped defaults": {
        searchSettings: {
          ...defaultSearchSettings,
          sources: {
            ...defaultSearchSettings.sources,
            openalex: {
              ...defaultSearchSettings.sources.openalex,
              intervalMs: 0,
            },
          },
        },
      },
      "a placeholder delay below the service default": {
        placeholderDelayMs: 0,
      },
    } satisfies Record<string, Partial<ReportInput>>;
    for (const [name, change] of Object.entries(eased)) {
      const report = buildReport(input(launchChecks(), change));
      // The run itself may pass, but it can never be offered as qualification.
      expect(report.outcome, name).toBe("passed");
      expect(report.qualifying, name).toBe(false);
    }
    expect(buildReport(input(launchChecks())).qualifying).toBe(true);
  });

  it("never qualifies a run of unidentified or modified code", () => {
    for (const codeVersion of [
      undefined,
      { sha: "a".repeat(40), dirty: true },
    ]) {
      const report = buildReport(input(launchChecks(), { codeVersion }));
      expect(report.outcome).toBe("passed");
      expect(report.qualifying).toBe(false);
    }
    const report = buildReport(input(launchChecks()));
    expect(report.codeVersion).toEqual({ sha: "a".repeat(40), dirty: false });
    expect(report.configuration.enabledSources).toEqual([
      "europepmc",
      "openalex",
    ]);
  });

  it("qualifies non-default settings only when taken from a named reviewed configuration", () => {
    const settings = {
      ...defaultSearchSettings,
      sources: {
        ...defaultSearchSettings.sources,
        openalex: { ...defaultSearchSettings.sources.openalex, intervalMs: 40 },
      },
    };
    const adHoc = buildReport(
      input(launchChecks(), { searchSettings: settings }),
    );
    expect(adHoc.outcome).toBe("passed");
    expect(adHoc.qualifying).toBe(false);
    expect(adHoc.configuration.reviewed).toBeNull();
    const reviewed = buildReport(
      input(launchChecks(), {
        searchSettings: settings,
        reviewedConfiguration: { digest: "sha256:" + "c".repeat(64) },
      }),
    );
    expect(reviewed.qualifying).toBe(true);
    expect(reviewed.configuration.reviewed).toEqual({
      digest: "sha256:" + "c".repeat(64),
    });
    // The guard, not this flag, decides whether the reviewed file is the
    // production configuration; the report still says it differs from defaults.
    expect(reviewed.configuration.matchesShippedDefaults).toBe(false);
  });

  it("never lets a replay report stand in for live acceptance", () => {
    const report = buildReport(input(launchChecks()));
    expect(report.qualifying).toBe(true);
    expect(report.limitations).toContain(
      "Replay is regression evidence; live fifty-Check acceptance (FA-UEB-43) is separate.",
    );
  });

  it("flags operating settings that differ from the shipped defaults", () => {
    const same = buildReport(input(launchChecks()));
    expect(same.configuration.matchesShippedDefaults).toBe(true);
    const tuned = buildReport(
      input(launchChecks(), {
        searchSettings: {
          ...defaultSearchSettings,
          sources: {
            ...defaultSearchSettings.sources,
            openalex: {
              ...defaultSearchSettings.sources.openalex,
              intervalMs: 40,
            },
          },
        },
      }),
    );
    expect(tuned.configuration.matchesShippedDefaults).toBe(false);
    expect(tuned.configuration.settingsHash).not.toBe(
      same.configuration.settingsHash,
    );
    expect(tuned.configuration.defaultSettingsHash).toBe(
      same.configuration.defaultSettingsHash,
    );
  });

  it("discloses a non-zero placeholder delay and the process topology", () => {
    const report = buildReport(
      input(launchChecks(), { placeholderDelayMs: 500 }),
    );
    expect(report.configuration.placeholderDelayMs).toBe(500);
    expect(report.configuration.topology).toEqual({
      webProcesses: 1,
      workerProcesses: 1,
      database: "postgres",
    });
  });

  it("states the duration basis and exposes the other one beside it", () => {
    // One Check of four findable References with two active slots: the third
    // and fourth wait for the Check's own cap, ending at 6 s and 7 s.
    const check: CheckObservation = {
      index: 0,
      checkId: "c",
      sentAtMs: 0,
      createdAtMs: 1,
      endedAtMs: 7000,
      endReason: "completed",
      reconnects: 0,
      leaseRenewals: 0,
      references: [
        reference(1, "findable", 0, 2000),
        reference(2, "findable", 0, 3000),
        reference(3, "findable", 2000, 6000),
        reference(4, "findable", 3000, 7000),
      ],
    };
    const settings = { ...defaultSearchSettings, activeReferencesPerCheck: 2 };
    const eligible = buildReport(
      input([check], {
        searchSettings: settings,
        durationBasis: "slot-eligible",
        scope: { concurrentChecks: 1, referencesPerCheck: 4 },
      }),
    );
    const strict = buildReport(
      input([check], {
        searchSettings: settings,
        durationBasis: "check-start",
        scope: { concurrentChecks: 1, referencesPerCheck: 4 },
      }),
    );
    // slot-eligible: 2000, 3000, 6000-2000, 7000-3000 -> mean 3250.
    expect(target(eligible, "FA-UEB-40").measured).toBe(3250);
    // check-start: 2000, 3000, 6000, 7000 -> mean 4500.
    expect(target(strict, "FA-UEB-40").measured).toBe(4500);
    expect(eligible.diagnostics.findable.meanFromCheckStartMs).toBe(4500);
    expect(strict.diagnostics.findable.meanSlotEligibleMs).toBe(3250);
    expect(eligible.durationBasis).toBe("slot-eligible");
    expect(strict.durationBasis).toBe("check-start");
  });

  it("counts the outcomes and the unavailable reasons behind a failure", () => {
    const check = uniformCheck(0, 2, { findable: 1000, notFindable: 4000 });
    check.references[0]!.outcome = {
      kind: "verdict",
      verdict: "not-verifiable",
      unavailable: ["rate-budget", "deadline", "rate-budget"],
    };
    const report = buildReport(input([check]));
    expect(report.diagnostics.outcomes).toEqual({
      findable: { "not-verifiable": 1 },
      "not-findable": { "not-found": 1 },
      degraded: {},
    });
    expect(report.diagnostics.unavailableReasons).toEqual({
      "rate-budget": 2,
      deadline: 1,
    });
  });

  it("splits queue wait from execution time without hiding either", () => {
    const check = uniformCheck(0, 2, { findable: 800, notFindable: 900 });
    check.references[0]!.firstActiveAtMs = 300;
    const report = buildReport(
      input([check], {
        scope: { concurrentChecks: 1, referencesPerCheck: 2 },
      }),
    );
    expect(report.diagnostics.findable).toMatchObject({
      count: 1,
      meanQueueMs: 300,
      meanExecutionMs: 500,
    });
  });
});
