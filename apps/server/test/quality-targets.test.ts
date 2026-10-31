// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 pass rule and §14.4 metric definitions at the gate's public evaluation
// interface. All records are synthetic counting witnesses, not dataset content.
import { describe, expect, it } from "vitest";
import {
  checkComposition,
  decideRelease,
  evaluatePath,
  type GateMeasurement,
  type GateRecord,
  type PathRun,
  type RecordOutcome,
} from "../scripts/quality/targets.ts";

function record(
  id: string,
  overrides: Partial<GateRecord> = {},
): GateRecord {
  return {
    id,
    input: `Synthetic record ${id}`,
    style: "apa",
    language: "en",
    sourceType: "article",
    class: "real-correct",
    acceptedIdentifiers: [{ type: "doi", value: `10.5555/${id}` }],
    ...overrides,
  };
}
const correct = (id: string): RecordOutcome => ({
  kind: "verdict",
  verdict: "correct",
  identifiers: [`doi:10.5555/${id}`],
  failedSources: [],
  reasons: [],
});
const verdict = (
  value: Extract<RecordOutcome, { kind: "verdict" }>["verdict"],
): RecordOutcome => ({
  kind: "verdict",
  verdict: value,
  identifiers: [],
  failedSources: [],
  reasons: [],
});
function target(result: ReturnType<typeof evaluatePath>, name: string) {
  return result.targets.find((t) => t.target === name)!;
}

describe("§14.4 exact-share pass rule", () => {
  it("passes AI Correctness at exactly 93 of 100 and fails at 92", () => {
    const records = Array.from({ length: 100 }, (_, i) => record(`r${i}`));
    const outcomes = (hits: number) =>
      new Map(
        records.map((r, i) => [
          r.id,
          i < hits ? correct(r.id) : verdict("exists-with-deviations"),
        ]),
      );
    const pass = target(evaluatePath(records, outcomes(93), "ai"), "correctness");
    expect(pass).toMatchObject({ hits: 93, n: 100, met: true });
    expect(pass.threshold).toEqual({ op: ">=", basisPoints: 9300 });
    const fail = target(evaluatePath(records, outcomes(92), "ai"), "correctness");
    expect(fail).toMatchObject({ hits: 92, n: 100, met: false });
    const parser = target(
      evaluatePath(records, outcomes(77), "parser"),
      "correctness",
    );
    expect(parser).toMatchObject({ met: true, threshold: { basisPoints: 7700 } });
  });

  it("counts a Correct for a different work as a miss", () => {
    const records = [record("a"), record("b")];
    const outcomes = new Map<string, RecordOutcome>([
      ["a", correct("a")],
      ["b", { ...correct("b"), identifiers: ["doi:10.5555/someone-else"] }],
    ]);
    expect(
      target(evaluatePath(records, outcomes, "ai"), "correctness"),
    ).toMatchObject({ hits: 1, n: 2 });
  });

  it("matches accepted DOIs, ISBNs and URLs after identifier normalization", () => {
    const records = [
      record("doi", {
        acceptedIdentifiers: [{ type: "doi", value: "https://doi.org/10.5555/ABC" }],
      }),
      record("isbn", {
        sourceType: "book",
        acceptedIdentifiers: [{ type: "isbn", value: "978-3-16-148410-0" }],
      }),
    ];
    const outcomes = new Map<string, RecordOutcome>([
      ["doi", { ...correct("doi"), identifiers: ["doi:10.5555/abc"] }],
      ["isbn", { ...correct("isbn"), identifiers: ["isbn:9783161484100"] }],
    ]);
    expect(
      target(evaluatePath(records, outcomes, "ai"), "correctness"),
    ).toMatchObject({ hits: 2, n: 2 });
  });

  it("limits Correctness to real, correctly cited APA References", () => {
    const records = [
      record("apa"),
      record("mla", { style: "mla" }),
      record("dev", { class: "real-deviating" }),
    ];
    const outcomes = new Map(records.map((r) => [r.id, correct(r.id)]));
    expect(
      target(evaluatePath(records, outcomes, "ai"), "correctness"),
    ).toMatchObject({ hits: 1, n: 1 });
  });

  it("allows at most 3 red Verdicts among 100 real References on the parser path, 1 on the AI path", () => {
    const records = Array.from({ length: 100 }, (_, i) =>
      record(`r${i}`, { style: i % 2 ? "mla" : "apa" }),
    );
    const outcomes = (red: number) =>
      new Map(
        records.map((r, i) => [
          r.id,
          i < red
            ? verdict(
                (["not-found", "mixed-citation", "doi-conflict"] as const)[i % 3]!,
              )
            : correct(r.id),
        ]),
      );
    expect(
      target(evaluatePath(records, outcomes(3), "parser"), "false-alarms"),
    ).toMatchObject({ hits: 3, n: 100, met: true, threshold: { op: "<=", basisPoints: 300 } });
    expect(
      target(evaluatePath(records, outcomes(4), "parser"), "false-alarms"),
    ).toMatchObject({ met: false });
    expect(
      target(evaluatePath(records, outcomes(1), "ai"), "false-alarms"),
    ).toMatchObject({ met: true });
    expect(
      target(evaluatePath(records, outcomes(2), "ai"), "false-alarms"),
    ).toMatchObject({ met: false });
  });

  it("does not count Not verifiable as a red Verdict", () => {
    const records = [record("a")];
    const outcomes = new Map([["a", verdict("not-verifiable")]]);
    expect(
      target(evaluatePath(records, outcomes, "ai"), "false-alarms"),
    ).toMatchObject({ hits: 0, n: 1, met: true });
  });

  it("measures Detection as invented or falsified without Correct, and invented works by red Verdicts", () => {
    const invented = Array.from({ length: 20 }, (_, i) =>
      record(`inv${i}`, { class: "invented", acceptedIdentifiers: [] }),
    );
    const falsified = Array.from({ length: 30 }, (_, i) =>
      record(`fal${i}`, {
        class: "falsified",
        expectedVerdict: "doi-conflict",
      }),
    );
    const outcomes = new Map<string, RecordOutcome>([
      ...invented.map((r, i): [string, RecordOutcome] => [
        r.id,
        i === 0 ? verdict("not-verifiable") : verdict("not-found"),
      ]),
      ...falsified.map((r): [string, RecordOutcome] => [
        r.id,
        verdict("exists-with-deviations"),
      ]),
    ]);
    const result = evaluatePath([...invented, ...falsified], outcomes, "ai");
    // 50 of 50 without Correct; 19 of 20 invented red = 95 %.
    expect(target(result, "detection")).toMatchObject({ hits: 50, n: 50, met: true });
    expect(target(result, "invented-detection")).toMatchObject({
      hits: 19,
      n: 20,
      met: true,
      threshold: { op: ">=", basisPoints: 9500 },
    });
  });

  it("marks a target with an empty denominator as unmeasured, never as passed", () => {
    const records = [record("a", { style: "mla" })];
    const outcomes = new Map([["a", correct("a")]]);
    const result = evaluatePath(records, outcomes, "ai");
    expect(target(result, "correctness")).toMatchObject({ n: 0, met: null });
    expect(target(result, "detection")).toMatchObject({ n: 0, met: null });
  });

  it("keeps unstructured records in every denominator", () => {
    const records = [record("a"), record("b")];
    const outcomes = new Map<string, RecordOutcome>([
      ["a", correct("a")],
      ["b", { kind: "unstructured", references: 0 }],
    ]);
    expect(
      target(evaluatePath(records, outcomes, "parser"), "correctness"),
    ).toMatchObject({ hits: 1, n: 2 });
  });

  it("logs a Wilson interval for information", () => {
    const records = Array.from({ length: 100 }, (_, i) => record(`r${i}`));
    const outcomes = new Map(
      records.map((r, i) => [
        r.id,
        i < 93 ? correct(r.id) : verdict("not-verifiable"),
      ]),
    );
    // Independent: Wilson 95 % (z = 1.959964) for 93/100 = [0.862505, 0.965681].
    expect(
      target(evaluatePath(records, outcomes, "ai"), "correctness").wilson,
    ).toEqual({ low: 0.862505, high: 0.965681 });
  });
});

const styles = [
  "apa",
  "mla",
  "chicago",
  "ieee",
  "vancouver",
  "harvard",
  "acs",
  "ama",
  "oxford",
  "springer",
  "din-iso-690",
];
/** A synthetic population sized exactly to the ADR-0006 launch floors. */
function launchSizedRecords(): GateRecord[] {
  // APA: 110 records, 100 correctly cited; other styles: 40, 30 correct.
  // Every tenth-group: 3 German, 2 books, 1 web page (30 %, 20 %, 10 %).
  const real = styles.flatMap((style) =>
    Array.from({ length: style === "apa" ? 110 : 40 }, (_, i) =>
      record(`${style}-${i}`, {
        style,
        language: i % 10 < 3 ? "de" : "en",
        sourceType: i % 10 < 2 ? "book" : i % 10 === 2 ? "webpage" : "article",
        class:
          i < (style === "apa" ? 100 : 30) ? "real-correct" : "real-deviating",
      }),
    ),
  );
  const generators = [
    { model: "synthetic-model-a", provider: "provider-one" },
    { model: "synthetic-model-b", provider: "provider-one" },
    { model: "synthetic-model-c", provider: "provider-two" },
  ];
  const fake = Array.from({ length: 150 }, (_, i) =>
    record(`fake-${i}`, {
      class: i < 75 ? "invented" : "falsified",
      acceptedIdentifiers: [],
      generator: generators[i % 3]!,
    }),
  );
  return [...real, ...fake];
}

describe("composition floors", () => {
  it("accepts a population at the §14.4 minimums and ADR-0006 floors", () => {
    expect(
      checkComposition(launchSizedRecords()).filter((f) => !f.met),
    ).toEqual([]);
  });

  it("names every floor a small set misses", () => {
    const missed = checkComposition([record("a")])
      .filter((f) => !f.met)
      .map((f) => f.floor);
    expect(missed).toEqual(
      expect.arrayContaining([
        "real-references",
        "invented-or-falsified",
        "entirely-invented",
        "real-correct",
        "real-correct-apa",
        "german-share",
        "book-share",
        "web-share",
        "styles",
        "generator-models",
        "style:mla",
      ]),
    );
  });

  it("requires DIN ISO 690 among the styles", () => {
    const records = launchSizedRecords().filter(
      (r) => r.style !== "din-iso-690",
    );
    expect(
      checkComposition(records).find((f) => f.floor === "style:din-iso-690"),
    ).toMatchObject({ met: false, actual: 0, required: 20 });
  });
});

function passingRun(path: "parser" | "ai", run: number): PathRun {
  return {
    path,
    run,
    valid: true,
    invalidRecords: [],
    replayMisses: 0,
    targets: (
      ["correctness", "false-alarms", "detection", "invented-detection"] as const
    ).map((t) => ({
      target: t,
      path,
      threshold: { op: ">=", basisPoints: 0 },
      hits: 1,
      n: 1,
      met: true,
      wilson: null,
    })),
  };
}
function measurement(overrides: Partial<GateMeasurement> = {}): GateMeasurement {
  return {
    configuration: {
      aiModel: "synthetic-model",
      calibration: { record: "synthetic-calibration", selected: {} },
      runtimeCalibration: "calibrated",
      codeVersion: { sha: "0".repeat(40), dirty: false },
    },
    composition: checkComposition(launchSizedRecords()),
    runs: [
      passingRun("parser", 1),
      passingRun("ai", 1),
      passingRun("ai", 2),
      passingRun("ai", 3),
    ],
    ...overrides,
  };
}

describe("release decision", () => {
  it("is releasable only when every target, run, floor and calibration holds", () => {
    expect(decideRelease(measurement())).toEqual({
      releasable: true,
      reasons: [],
    });
  });

  it("blocks an uncalibrated configuration even when every target passes", () => {
    expect(
      decideRelease(
        measurement({
          configuration: {
            ...measurement().configuration,
            calibration: null,
            runtimeCalibration: "uncalibrated",
          },
        }),
      ),
    ).toEqual({ releasable: false, reasons: ["uncalibrated"] });
  });

  it("blocks when the runtime still reports uncalibrated rules despite a calibration record", () => {
    expect(
      decideRelease(
        measurement({
          configuration: {
            ...measurement().configuration,
            runtimeCalibration: "uncalibrated",
          },
        }),
      ).reasons,
    ).toEqual(["uncalibrated"]);
  });

  it("blocks when any one of the three AI runs misses a target", () => {
    const third = passingRun("ai", 3);
    third.targets[1] = { ...third.targets[1]!, met: false };
    expect(
      decideRelease(
        measurement({
          runs: [passingRun("parser", 1), passingRun("ai", 1), passingRun("ai", 2), third],
        }),
      ).reasons,
    ).toEqual(["target-missed:ai-3:false-alarms"]);
  });

  it("blocks an unmeasured target, an invalid run and missing AI runs", () => {
    const parser = passingRun("parser", 1);
    parser.targets[0] = { ...parser.targets[0]!, n: 0, met: null };
    const invalid = { ...passingRun("ai", 1), valid: false, replayMisses: 2 };
    expect(
      decideRelease(measurement({ runs: [parser, invalid] })).reasons,
    ).toEqual([
      "target-unmeasured:parser-1:correctness",
      "invalid-run:ai-1",
      "ai-runs:1-of-3",
    ]);
  });

  it("measures only the parser path when the configuration uses no AI extraction", () => {
    expect(
      decideRelease(
        measurement({
          configuration: { ...measurement().configuration, aiModel: null },
          runs: [passingRun("parser", 1)],
        }),
      ),
    ).toEqual({ releasable: true, reasons: [] });
  });

  it("blocks a dirty code version and a population below the floors", () => {
    expect(
      decideRelease(
        measurement({
          configuration: {
            ...measurement().configuration,
            codeVersion: { sha: "0".repeat(40), dirty: true },
          },
          composition: checkComposition([record("a")]),
        }),
      ).reasons,
    ).toEqual(
      expect.arrayContaining([
        "code-version-dirty",
        "composition:real-references",
      ]),
    );
  });
});
