// SPDX-License-Identifier: AGPL-3.0-or-later
// #117 release guard for the fifty-Check replay (ADR-0007, FA-UEB-43). The
// guard reads a private load report and recomputes qualification from its
// numbers; what the report says about itself (`qualifying`, `outcome`, target
// statuses) is never trusted. Reports are generated synthetic observations.
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultSearchSettings } from "@source-taster/core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TARGETS, type LoadReport } from "../scripts/load/analysis.ts";
import { checkLoadReplay } from "../scripts/load/release.ts";
import {
  launchObservations,
  passingReport,
  syntheticSha,
} from "./support/load-reports.ts";

let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "st-117-release-"));
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

const code = { sha: syntheticSha, dirty: false };
const production = {
  enabledSources: ["europepmc", "openalex"],
  searchSettings: null,
};

async function check(
  report: unknown,
  overrides: Partial<Parameters<typeof checkLoadReplay>[0]> = {},
) {
  const path = join(directory, "load-report.json");
  await writeFile(
    path,
    typeof report === "string" ? report : JSON.stringify(report),
  );
  return checkLoadReplay({ path, code, expected: production, ...overrides });
}
const tamper = (report: LoadReport, change: (r: LoadReport) => void) => {
  const copy = structuredClone(report);
  change(copy);
  return copy;
};

describe("load replay release guard", () => {
  it("accepts a recorded, launch-scale, passing replay of the exact production configuration", async () => {
    await expect(check(passingReport())).resolves.toEqual({
      ok: true,
      reasons: [],
    });
  });

  it("refuses a missing, unreadable or malformed report", async () => {
    expect(
      await checkLoadReplay({ path: undefined, code, expected: production }),
    ).toEqual({ ok: false, reasons: ["no-load-report"] });
    expect(
      (
        await checkLoadReplay({
          path: join(directory, "absent.json"),
          code,
          expected: production,
        })
      ).reasons,
    ).toEqual(["load-report-unreadable"]);
    expect((await check("{not json")).reasons).toEqual(["invalid-load-report"]);
    expect((await check({ schemaVersion: 1 })).reasons).toEqual([
      "invalid-load-report",
    ]);
  });

  it("refuses synthetic witnesses even when the report claims to qualify", async () => {
    const report = tamper(
      passingReport({
        evidence: {
          provenance: "synthetic-witness",
          unmatchedRequests: 0,
          requests: {},
        },
      }),
      (r) => {
        r.qualifying = true;
      },
    );
    expect((await check(report)).reasons).toContain("load-synthetic-evidence");
    const unauthorized = tamper(passingReport(), (r) => {
      delete r.evidence.authorization;
    });
    expect((await check(unauthorized)).reasons).toContain(
      "load-synthetic-evidence",
    );
  });

  it("never lets a reduced scope pass, whatever the report claims", async () => {
    const small = launchObservations().slice(0, 5);
    const report = tamper(
      passingReport(
        { scope: { concurrentChecks: 5, referencesPerCheck: 100 } },
        small,
      ),
      (r) => {
        r.outcome = "passed";
        r.qualifying = true;
        r.scope.launch = true;
      },
    );
    const { reasons } = await check(report);
    expect(reasons).toContain("load-scope-reduced");
  });

  it("recomputes each target from the report's own measurements", async () => {
    // Longest list 200 s on a report that still says "met" and "passed".
    const slow = tamper(passingReport(), (r) => {
      r.checks[3]!.durationMs = 200_000;
      r.targets.find((t) => t.id === "FA-UEB-42-list")!.measured = 200_000;
    });
    expect((await check(slow)).reasons).toContain(
      "load-target-missed:FA-UEB-42-list",
    );
    // A mean above 3 s that was edited to a passing number elsewhere.
    const mean = tamper(passingReport(), (r) => {
      r.diagnostics.findable.meanFromCheckStartMs = 3_500;
    });
    expect((await check(mean)).reasons).toContain(
      "load-target-missed:FA-UEB-40",
    );
    const concurrency = tamper(passingReport(), (r) => {
      r.diagnostics.peakConcurrentChecks = 49;
    });
    expect((await check(concurrency)).reasons).toContain(
      "load-target-missed:FA-UEB-43",
    );
  });

  it("refuses a report whose targets are loosened or incomplete", async () => {
    const loosened = tamper(passingReport(), (r) => {
      r.targets.find((t) => t.id === "FA-UEB-40")!.limit = 60_000;
    });
    expect((await check(loosened)).reasons).toContain(
      "load-target-changed:FA-UEB-40",
    );
    const incomplete = tamper(passingReport(), (r) => {
      r.targets = r.targets.filter((t) => t.id !== "FA-UEB-43");
    });
    expect((await check(incomplete)).reasons).toContain(
      "load-target-changed:FA-UEB-43",
    );
    expect(TARGETS.concurrentChecks).toBe(50);
  });

  it("refuses invalid evidence, unfinished Checks and eased measurement", async () => {
    const invalid = tamper(passingReport(), (r) => {
      r.invalidEvidence = [
        { code: "reference-unfinished", count: 2, detail: "" },
      ];
    });
    expect((await check(invalid)).reasons).toContain("load-invalid-evidence");
    const unmatched = tamper(passingReport(), (r) => {
      r.evidence.unmatchedRequests = 1;
    });
    expect((await check(unmatched)).reasons).toContain("load-invalid-evidence");
    const unfinished = tamper(passingReport(), (r) => {
      r.checks[0]!.endReason = "lease-expired";
    });
    expect((await check(unfinished)).reasons).toContain(
      "load-check-not-completed",
    );
    const eased = tamper(passingReport(), (r) => {
      r.durationBasis = "slot-eligible";
      r.configuration.placeholderDelayMs = 0;
    });
    expect((await check(eased)).reasons).toEqual(
      expect.arrayContaining(["load-duration-basis", "load-placeholder-delay"]),
    );
  });

  it("binds the replay to this exact, clean code version", async () => {
    expect(
      (
        await check(passingReport(), {
          code: { sha: "b".repeat(40), dirty: false },
        })
      ).reasons,
    ).toContain("load-code-version-mismatch");
    expect(
      (
        await check(passingReport(), {
          code: { sha: syntheticSha, dirty: true },
        })
      ).reasons,
    ).toContain("load-code-version-mismatch");
    expect(
      (
        await check(
          passingReport({ codeVersion: { sha: syntheticSha, dirty: true } }),
        )
      ).reasons,
    ).toContain("load-code-version-mismatch");
    const unidentified = tamper(passingReport(), (r) => {
      delete r.codeVersion;
    });
    expect((await check(unidentified)).reasons).toContain(
      "load-code-version-mismatch",
    );
  });

  it("binds the replay to the exact production configuration, never to arbitrary settings", async () => {
    const faster = {
      ...defaultSearchSettings,
      sources: {
        ...defaultSearchSettings.sources,
        openalex: { ...defaultSearchSettings.sources.openalex, intervalMs: 40 },
      },
    };
    const reviewed = passingReport({
      searchSettings: faster,
      reviewedConfiguration: { digest: `sha256:${"c".repeat(64)}` },
    });
    // The same patch as the measured production configuration qualifies...
    const patch = { sources: { openalex: { intervalMs: 40 } } };
    expect(
      (
        await check(reviewed, {
          expected: { ...production, searchSettings: patch },
        })
      ).ok,
    ).toBe(true);
    // ...but not against shipped defaults, another patch, or an unequal operator budget.
    for (const searchSettings of [
      null,
      { sources: { openalex: { intervalMs: 41 } } },
      { sources: { openalex: { intervalMs: 40 } }, workerConcurrency: 21 },
    ]) {
      expect(
        (await check(reviewed, { expected: { ...production, searchSettings } }))
          .reasons,
      ).toContain("load-configuration-mismatch");
    }
    // Shipped-default measurements do not stand in for a changed production budget.
    expect(
      (
        await check(passingReport(), {
          expected: { ...production, searchSettings: patch },
        })
      ).reasons,
    ).toContain("load-configuration-mismatch");
    // An invalid production patch is a configuration error, not a pass.
    expect(
      (
        await check(passingReport(), {
          expected: { ...production, searchSettings: { maxRetries: 9 } },
        })
      ).reasons,
    ).toContain("load-configuration-invalid");
  });

  it("refuses a production source set the harness did not replay", async () => {
    const { reasons } = await check(passingReport(), {
      expected: {
        ...production,
        enabledSources: ["europepmc", "openalex", "semanticscholar"],
      },
    });
    expect(reasons).toContain("load-sources-mismatch");
    expect(
      (await check(passingReport(), { expected: undefined })).reasons,
    ).toEqual([]);
  });
});
