// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0006 pass rule over the §14.4 quality targets. Integer basis points
// only: a share target "≥ p" passes at hits·10000 ≥ p·n, i.e. ⌈p·n⌉ hits.
import { normalizeDoi, normalizeIsbn } from "@source-taster/core";
import type { StructuringResult } from "./structuring.ts";

export type Verdict =
  | "correct"
  | "exists-with-deviations"
  | "mixed-citation"
  | "doi-conflict"
  | "not-found"
  | "not-verifiable";
export type RecordClass =
  | "real-correct"
  | "real-deviating"
  | "falsified"
  | "invented"
  | "outside-coverage";
export type StructuringPath = "parser" | "ai";
export interface AcceptedIdentifier {
  type: "doi" | "isbn" | "url";
  value: string;
}
export interface GateRecord {
  id: string;
  input: string;
  style: string;
  language: string;
  sourceType: string;
  class: RecordClass;
  /** Fixed expected Verdict of a falsified record (regression check). */
  expectedVerdict?: Verdict;
  acceptedIdentifiers: AcceptedIdentifier[];
  /** Expected CSL fields as written in the Reference (FA-STR-02). */
  expectedFields?: Record<string, unknown>;
  /** Generating model of an invented or falsified record. */
  generator?: { model: string; provider: string };
}
/** Newest result of a record's Reference slot, as observed at the API. */
export type RecordOutcome =
  | {
      kind: "verdict";
      verdict: Verdict;
      /** `doi:`/`isbn:`/`url:` identifiers of the Best match. */
      identifiers: string[];
      failedSources: string[];
      reasons: string[];
    }
  | { kind: "status"; status: string }
  /** The path produced zero or several References for one record. */
  | { kind: "unstructured"; references: number };

/** Missing results, technical Statuses and source-failure grey invalidate a run. */
export function invalidOutcome(outcome: RecordOutcome | undefined) {
  return (
    !outcome ||
    outcome.kind === "status" ||
    (outcome.kind === "verdict" &&
      outcome.verdict === "not-verifiable" &&
      (outcome.failedSources.length > 0 ||
        outcome.reasons.includes("sources-unavailable")))
  );
}

export type TargetName =
  "correctness" | "false-alarms" | "detection" | "invented-detection";
export interface Threshold {
  op: ">=" | "<=";
  basisPoints: number;
}
export interface TargetResult {
  target: TargetName;
  path: StructuringPath;
  threshold: Threshold;
  hits: number;
  n: number;
  /** null: empty denominator, unmeasured and never a pass. */
  met: boolean | null;
  /** Wilson 95 % interval, informational only. */
  wilson: { low: number; high: number } | null;
}

/** §14.4 target values, frozen input (requirements v3.4). */
export const qualityTargets: Record<
  TargetName,
  Record<StructuringPath, Threshold>
> = {
  correctness: {
    ai: { op: ">=", basisPoints: 9300 },
    parser: { op: ">=", basisPoints: 7700 },
  },
  "false-alarms": {
    ai: { op: "<=", basisPoints: 100 },
    parser: { op: "<=", basisPoints: 300 },
  },
  detection: {
    ai: { op: ">=", basisPoints: 9800 },
    parser: { op: ">=", basisPoints: 9800 },
  },
  "invented-detection": {
    ai: { op: ">=", basisPoints: 9500 },
    parser: { op: ">=", basisPoints: 9500 },
  },
};

const red = new Set<Verdict>(["mixed-citation", "doi-conflict", "not-found"]);
const verdictOf = (outcome: RecordOutcome | undefined) =>
  outcome?.kind === "verdict" ? outcome.verdict : undefined;

export function normalizeIdentifier(
  type: AcceptedIdentifier["type"],
  value: string,
): string | undefined {
  if (type === "doi") return `doi:${normalizeDoi(value)}`;
  if (type === "isbn") {
    const isbn = normalizeIsbn(value);
    return isbn && `isbn:${isbn}`;
  }
  try {
    const url = new URL(value.trim());
    url.hash = "";
    return `url:${url.href.replace(/\/$/u, "")}`;
  } catch {
    return undefined;
  }
}
function parseIdentifier(value: string) {
  const match = /^(doi|isbn|url):(.*)$/su.exec(value);
  return match
    ? normalizeIdentifier(match[1] as AcceptedIdentifier["type"], match[2]!)
    : undefined;
}
/** ADR-0006 identity: a Correct counts only for an accepted identifier. */
function correctWithIdentity(record: GateRecord, outcome?: RecordOutcome) {
  if (outcome?.kind !== "verdict" || outcome.verdict !== "correct")
    return false;
  const accepted = new Set(
    record.acceptedIdentifiers.map((a) => normalizeIdentifier(a.type, a.value)),
  );
  return outcome.identifiers.some((id) => {
    const parsed = parseIdentifier(id);
    return parsed !== undefined && accepted.has(parsed);
  });
}

const definitions: Record<
  TargetName,
  {
    counts: (r: GateRecord) => boolean;
    hit: (r: GateRecord, o?: RecordOutcome) => boolean;
  }
> = {
  correctness: {
    counts: (r) => r.class === "real-correct" && r.style === "apa",
    hit: correctWithIdentity,
  },
  "false-alarms": {
    counts: (r) => r.class === "real-correct",
    hit: (_, o) => o?.kind === "unstructured" || red.has(verdictOf(o)!),
  },
  detection: {
    counts: (r) => r.class === "falsified" || r.class === "invented",
    hit: (_, o) => o?.kind === "verdict" && o.verdict !== "correct",
  },
  "invented-detection": {
    counts: (r) => r.class === "invented",
    hit: (_, o) => red.has(verdictOf(o)!),
  },
};

export function passes(threshold: Threshold, hits: number, n: number) {
  if (n === 0) return null;
  return threshold.op === ">="
    ? hits * 10000 >= threshold.basisPoints * n
    : hits * 10000 <= threshold.basisPoints * n;
}

const z = 1.959963984540054;
function wilson(hits: number, n: number) {
  if (n === 0) return null;
  const p = hits / n;
  const d = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / d;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  const round = (x: number) => Math.round(x * 1e6) / 1e6;
  return { low: round(centre - half), high: round(centre + half) };
}

function measureTargets(
  records: GateRecord[],
  outcomes: ReadonlyMap<string, RecordOutcome>,
  path: StructuringPath,
): TargetResult[] {
  return (Object.keys(definitions) as TargetName[]).map((name) => {
    const { counts, hit } = definitions[name];
    const counted = records.filter(counts);
    const hits = counted.filter((r) => hit(r, outcomes.get(r.id))).length;
    const threshold = qualityTargets[name][path];
    return {
      target: name,
      path,
      threshold,
      hits,
      n: counted.length,
      met: passes(threshold, hits, counted.length),
      wilson: wilson(hits, counted.length),
    };
  });
}

export function evaluatePath(
  records: GateRecord[],
  outcomes: ReadonlyMap<string, RecordOutcome>,
  path: StructuringPath,
) {
  return { path, targets: measureTargets(records, outcomes, path) };
}

export interface StratumValue extends TargetResult {
  dimension: "language" | "sourceType" | "style" | "language+sourceType";
  value: string;
  /** ADR-0006: informational. At least 30 below target fires the section 19 trigger. */
  status: "trigger" | "ok" | "unmeasured" | "too-small";
}
const stratumDimensions: [
  StratumValue["dimension"],
  (r: GateRecord) => string,
][] = [
  ["language", (r) => r.language],
  ["sourceType", (r) => r.sourceType],
  ["style", (r) => r.style],
  ["language+sourceType", (r) => `${r.language}+${r.sourceType}`],
];
/** Every target per language, source type and citation style. Never gates. */
export function strata(
  records: GateRecord[],
  outcomes: ReadonlyMap<string, RecordOutcome>,
  path: StructuringPath,
): StratumValue[] {
  return stratumDimensions.flatMap(([dimension, key]) =>
    [...new Set(records.map(key))].sort().flatMap((value) =>
      measureTargets(
        records.filter((r) => key(r) === value),
        outcomes,
        path,
      ).map((t) => ({
        ...t,
        dimension,
        value,
        status:
          t.n < 30
            ? "too-small"
            : t.met === null
              ? "unmeasured"
              : t.met
                ? "ok"
                : "trigger",
      })),
    ),
  );
}

/** ADR-0006 regression check: logged, never part of a section 14.4 target. */
export function regressionChecks(
  records: GateRecord[],
  outcomes: ReadonlyMap<string, RecordOutcome>,
) {
  const expectedOf = (r: GateRecord): Verdict | undefined =>
    r.class === "real-deviating"
      ? "exists-with-deviations"
      : r.class === "outside-coverage"
        ? "not-verifiable"
        : r.class === "falsified"
          ? r.expectedVerdict
          : undefined;
  return records.flatMap((r) => {
    const expected = expectedOf(r);
    if (!expected) return [];
    const o = outcomes.get(r.id);
    const actual =
      o?.kind === "verdict"
        ? o.verdict
        : o?.kind === "status"
          ? `status:${o.status}`
          : o
            ? `unstructured:${o.references}`
            : "missing";
    return actual === expected
      ? []
      : [{ id: r.id, class: r.class, expected, actual }];
  });
}

/** The eleven FA-STR-02 styles; ADR-0006 asks at least 20 real records each. */
export const citationStyles = [
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
] as const;
export interface CompositionFloor {
  floor: string;
  required: number;
  actual: number;
  met: boolean;
}
/**
 * §14.4 launch minimums and ADR-0006 composition floors. Shares compare in
 * integers: actual is the percentage numerator, required the percent floor.
 */
export function checkComposition(records: GateRecord[]): CompositionFloor[] {
  const real = records.filter(
    (r) => r.class === "real-correct" || r.class === "real-deviating",
  );
  const correct = records.filter((r) => r.class === "real-correct");
  const fake = records.filter(
    (r) => r.class === "invented" || r.class === "falsified",
  );
  const count = (floor: string, required: number, actual: number) => ({
    floor,
    required,
    actual,
    met: actual >= required,
  });
  const share = (floor: string, percent: number, hits: number) => ({
    floor,
    required: percent,
    actual: real.length ? Math.floor((hits * 100) / real.length) : 0,
    met: real.length > 0 && hits * 100 >= percent * real.length,
  });
  const models = new Set(fake.map((r) => r.generator?.model).filter(Boolean));
  const providers = new Set(
    fake.map((r) => r.generator?.provider).filter(Boolean),
  );
  return [
    count("real-references", 400, real.length),
    count("invented-or-falsified", 150, fake.length),
    count(
      "entirely-invented",
      75,
      fake.filter((r) => r.class === "invented").length,
    ),
    count("real-correct", 300, correct.length),
    count(
      "real-correct-apa",
      100,
      correct.filter((r) => r.style === "apa").length,
    ),
    share("german-share", 30, real.filter((r) => r.language === "de").length),
    count(
      "english-references",
      1,
      real.filter((r) => r.language === "en").length,
    ),
    share(
      "book-share",
      20,
      real.filter((r) => r.sourceType === "book" || r.sourceType === "chapter")
        .length,
    ),
    share(
      "web-share",
      10,
      real.filter((r) => r.sourceType === "webpage").length,
    ),
    count("styles", 5, new Set(real.map((r) => r.style)).size),
    count("generator-models", 3, models.size),
    count("generator-providers", 2, providers.size),
    ...citationStyles.map((style) =>
      count(`style:${style}`, 20, real.filter((r) => r.style === style).length),
    ),
  ];
}

export interface PathRun {
  path: StructuringPath;
  run: number;
  valid: boolean;
  invalidRecords: string[];
  replayMisses: number;
  targets: TargetResult[];
  structuring?: StructuringResult[];
}
export interface GateMeasurement {
  configuration: {
    aiModel: string | null;
    aiQualified?: boolean;
    /** The ADR-0025 calibration record whose selected values were measured. */
    calibration: { record: string; selected: Record<string, number> } | null;
    /** What the running verification rules report about themselves. */
    runtimeCalibration: string;
    codeVersion: { sha: string; dirty: boolean };
  };
  composition: CompositionFloor[];
  runs: PathRun[];
}
/**
 * A configuration is releasable only if it is calibrated, from a clean code
 * version, on a population that meets the floors, and every required run is
 * valid and meets every target. Every blocking reason is reported.
 */
export function decideRelease(measurement: GateMeasurement) {
  const reasons: string[] = [];
  const { configuration, composition, runs } = measurement;
  if (
    !configuration.calibration ||
    configuration.runtimeCalibration === "uncalibrated"
  )
    reasons.push("uncalibrated");
  if (configuration.codeVersion.dirty) reasons.push("code-version-dirty");
  if (configuration.aiModel && configuration.aiQualified !== true)
    reasons.push("ai-evidence-unqualified");
  for (const floor of composition)
    if (!floor.met) reasons.push(`composition:${floor.floor}`);
  for (const run of runs) {
    const label = `${run.path}-${run.run}`;
    for (const t of run.targets) {
      if (t.met === null)
        reasons.push(`target-unmeasured:${label}:${t.target}`);
      else if (!t.met) reasons.push(`target-missed:${label}:${t.target}`);
    }
    if (!run.valid || run.replayMisses > 0)
      reasons.push(`invalid-run:${label}`);
    if (run.path === "ai") {
      for (const style of citationStyles) {
        const result = run.structuring?.find((s) => s.style === style);
        if (!result || result.met === null)
          reasons.push(`structuring-unmeasured:${label}:${style}`);
        else if (!result.met)
          reasons.push(`structuring-missed:${label}:${style}`);
      }
    }
  }
  const parserRuns = runs.filter((r) => r.path === "parser").length;
  if (parserRuns !== 1) reasons.push(`parser-runs:${parserRuns}-of-1`);
  const aiRuns = runs.filter((r) => r.path === "ai").length;
  const requiredAi = configuration.aiModel ? 3 : 0;
  if (aiRuns !== requiredAi) reasons.push(`ai-runs:${aiRuns}-of-${requiredAi}`);
  return { releasable: reasons.length === 0, reasons };
}
