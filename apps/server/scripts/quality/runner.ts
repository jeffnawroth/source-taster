// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 Quality gate runner (ADR-0006). Measures one configuration on the
// frozen Reference test set: the real web and worker processes run against
// replayed Data source responses, the parser path runs once and AI extraction
// runs live three times, and a write-once measurement log is kept in the
// private location. Nothing is published.
import { createHash } from "node:crypto";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { verificationClient } from "@source-taster/contract-verification/client-v2";
import type {
  Check,
  ReferenceOutcome,
  StructuredCsl,
} from "@source-taster/contract-verification/v2";
import { startTestService } from "../../test/support/service.ts";
import { codeVersion } from "./code-version.ts";
import {
  expandGrid,
  selectPoint,
  type CalibrationGrid,
} from "./calibration.ts";
import { loadDataset, privateLocation, type Dataset } from "./dataset.ts";
import { startReplay, type ReplayMiss } from "./replay.ts";
import {
  checkComposition,
  decideRelease,
  evaluatePath,
  normalizeIdentifier,
  regressionChecks,
  strata,
  type StratumValue,
  type GateMeasurement,
  type GateRecord,
  type PathRun,
  type RecordOutcome,
  type StructuringPath,
} from "./targets.ts";

/** The AI extraction slot. A real provider adapter plugs in here. */
export interface ExtractionPort {
  model: string;
  /** Structures one record's text into zero, one or several References. */
  extract(input: string): Promise<StructuredCsl[]>;
}
export const optionalSources = [
  "url",
  "internetarchive",
  "openalex",
  "europepmc",
  "semanticscholar",
  "arxiv",
  "openlibrary",
  "googlebooks",
] as const;
export type OptionalSource = (typeof optionalSources)[number];
/** The operator-chosen part of a Measured configuration. */
export interface GateConfiguration {
  enabledSources: OptionalSource[];
  /** ADR-0025 free comparison parameters (SOURCE_TASTER_COMPARISON_PARAMETERS). */
  comparisonParameters?: Record<string, number>;
  /** ADR-0007 search operating settings snapshot. */
  searchSettings?: Record<string, unknown>;
  /** The ADR-0025 calibration record whose selected values are measured. */
  calibration?: { record: string; selected: Record<string, number> };
}
export interface ServiceDatabase {
  adminUrl: string;
  appUrl: string;
}

function serviceEnvironment(
  configuration: GateConfiguration,
  replay: Record<string, string>,
) {
  const bibliographic =
    configuration.enabledSources.length > 0 ||
    configuration.searchSettings !== undefined;
  const env: Record<string, string> = {
    ...replay,
    SOURCE_TASTER_DOI_PREVIEW: "uncalibrated",
    SOURCE_TASTER_PLACEHOLDER_DELAY_MS: "0",
  };
  // Web fixture replacement exists only in the bibliographic preview.
  if (bibliographic) env.SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW = "uncalibrated";
  else delete env.SOURCE_TASTER_WEB_FIXTURE_BASE_URL;
  for (const source of optionalSources)
    env[`SOURCE_TASTER_${source.toUpperCase()}_ENABLED`] = String(
      configuration.enabledSources.includes(source),
    );
  if (configuration.comparisonParameters)
    env.SOURCE_TASTER_COMPARISON_PARAMETERS = JSON.stringify(
      configuration.comparisonParameters,
    );
  if (configuration.searchSettings)
    env.SOURCE_TASTER_SEARCH_SETTINGS = JSON.stringify(
      configuration.searchSettings,
    );
  return env;
}

type VerdictOutcome = Extract<ReferenceOutcome, { kind: "verdict" }>;
function toRecordOutcome(outcome: ReferenceOutcome): RecordOutcome {
  if (outcome.kind === "status")
    return { kind: "status", status: outcome.status };
  const best = outcome.candidates.find((c) => c.id === outcome.bestMatchId);
  const identifiers: string[] = [];
  if (best) {
    const add = (type: "doi" | "isbn" | "url", value?: string) => {
      const id = value && normalizeIdentifier(type, value);
      if (id) identifiers.push(id);
    };
    add("doi", best.csl.DOI);
    add("isbn", best.csl.ISBN);
    add("url", best.csl.URL);
    for (const id of best.identifiers ?? []) {
      const match = /^(doi|isbn|url):(.*)$/su.exec(id);
      if (match) add(match[1] as "doi" | "isbn" | "url", match[2]);
    }
  }
  // A web Correct identifies the cited page itself.
  if (
    outcome.identity.kind === "web-url" ||
    outcome.identity.kind === "web-archive"
  ) {
    const url = outcome.reference.csl.URL;
    const id = url && normalizeIdentifier("url", url);
    if (id) identifiers.push(id);
  }
  return {
    kind: "verdict",
    verdict: outcome.verdict,
    identifiers,
    failedSources: [...outcome.failedSources],
    reasons: [...outcome.reasons],
  };
}

function needsRerun(outcome: RecordOutcome | undefined) {
  if (!outcome || outcome.kind === "status") return true;
  return (
    outcome.kind === "verdict" &&
    outcome.verdict === "not-verifiable" &&
    (outcome.failedSources.length > 0 ||
      outcome.reasons.includes("sources-unavailable"))
  );
}

interface Submission {
  record: GateRecord;
  fields: StructuredCsl;
}
const chunkSize = 200;
async function verify(apiUrl: string, submissions: Submission[]) {
  const client = verificationClient({
    baseUrl: apiUrl,
    client: "quality-gate",
  });
  const results = new Map<string, VerdictOutcome | ReferenceOutcome>();
  for (let i = 0; i < submissions.length; i += chunkSize) {
    const chunk = submissions.slice(i, i + chunkSize);
    let check: Check = await client.createCheck({
      references: chunk.map((s) => ({
        originalText: s.record.input,
        fields: s.fields,
      })),
    });
    let renewAt = Date.now() + check.leaseRenewAfterMs;
    while (check.state !== "ended") {
      await sleep(200);
      if (Date.now() >= renewAt) {
        await client.renewCheckLease(check.id);
        renewAt = Date.now() + check.leaseRenewAfterMs;
      }
      check = await client.getCheck(check.id);
    }
    const slots = [...check.references].sort((a, b) => a.slot - b.slot);
    if (slots.length !== chunk.length)
      throw new Error(
        `Check ${check.id} returned ${slots.length} References for ${chunk.length} submitted.`,
      );
    slots.forEach((slot, index) =>
      results.set(chunk[index]!.record.id, slot.outcome),
    );
  }
  return results;
}

async function structure(
  apiUrl: string,
  path: StructuringPath,
  records: GateRecord[],
  extraction?: ExtractionPort,
) {
  const client = verificationClient({
    baseUrl: apiUrl,
    client: "quality-gate",
  });
  const submissions: Submission[] = [];
  const unstructured = new Map<string, RecordOutcome>();
  for (const record of records) {
    const references =
      path === "parser"
        ? (await client.structureReferences(record.input)).references.map(
            (r) => r.csl,
          )
        : await extraction!.extract(record.input);
    if (references.length === 1)
      submissions.push({ record, fields: references[0]! });
    else
      unstructured.set(record.id, {
        kind: "unstructured",
        references: references.length,
      });
  }
  return { submissions, unstructured };
}

type Structured = Awaited<ReturnType<typeof structure>> & {
  path: StructuringPath;
};
interface Session {
  apiUrl: string;
  replay: Awaited<ReturnType<typeof startReplay>>;
  restart: (changes: Record<string, string>) => Promise<void>;
}
type LoggedRun = PathRun & {
  strata: StratumValue[];
  regressions: ReturnType<typeof regressionChecks>;
  reruns: string[];
  misses: ReplayMiss[];
  outcomes: Record<string, RecordOutcome>;
};

/** Real web and worker processes against replayed Data sources only. */
async function withSession<T>(
  dataset: Dataset,
  configuration: GateConfiguration,
  port: number,
  work: (session: Session) => Promise<T>,
) {
  const replay = await startReplay(dataset.fixtures);
  try {
    const service = await startTestService(
      port,
      0,
      serviceEnvironment(configuration, replay.env),
    );
    try {
      return await work({
        apiUrl: service.apiUrl,
        replay,
        restart: service.restart,
      });
    } finally {
      await service.stop();
    }
  } finally {
    await replay.stop();
  }
}

/** The parser path once and, with a model, AI extraction three times. */
async function structureAll(
  apiUrl: string,
  records: GateRecord[],
  extraction?: ExtractionPort,
): Promise<Structured[]> {
  const plan: StructuringPath[] = [
    "parser",
    ...(extraction ? (["ai", "ai", "ai"] as const) : []),
  ];
  const structured: Structured[] = [];
  for (const path of plan)
    structured.push({
      path,
      ...(await structure(apiUrl, path, records, extraction)),
    });
  return structured;
}

async function verifyAll(
  session: Session,
  records: GateRecord[],
  structured: Structured[],
) {
  const runs: LoggedRun[] = [];
  let observed: VerdictOutcome | undefined;
  for (const { path, submissions, unstructured } of structured) {
    const missesBefore = session.replay.misses().length;
    const outcomes = new Map<string, RecordOutcome>(unstructured);
    const record = async (batch: Submission[]) => {
      for (const [id, outcome] of await verify(session.apiUrl, batch)) {
        if (outcome.kind === "verdict") observed ??= outcome;
        outcomes.set(id, toRecordOutcome(outcome));
      }
    };
    await record(submissions);
    // ADR-0006 validity: a record that ended in a Status or in Not verifiable
    // because sources failed is rerun once; if that persists the run is
    // invalid. No record is excluded from any denominator.
    const failed = () =>
      submissions.filter((s) => needsRerun(outcomes.get(s.record.id)));
    const reruns = failed();
    if (reruns.length) await record(reruns);
    const invalidRecords = failed().map((s) => s.record.id);
    const misses = session.replay.misses().slice(missesBefore);
    runs.push({
      path,
      run: runs.filter((r) => r.path === path).length + 1,
      valid: invalidRecords.length === 0 && misses.length === 0,
      invalidRecords,
      reruns: reruns.map((s) => s.record.id),
      replayMisses: misses.length,
      misses,
      targets: evaluatePath(records, outcomes, path).targets,
      strata: strata(records, outcomes, path),
      regressions: regressionChecks(records, outcomes),
      outcomes: Object.fromEntries(outcomes),
    });
  }
  return { runs, observed };
}
const gateRun = ({
  outcomes: _o,
  misses: _m,
  reruns: _r,
  strata: _s,
  regressions: _g,
  ...run
}: LoggedRun): PathRun => run;
const scoringRulesOf = (observed?: VerdictOutcome) =>
  observed
    ? {
        version: observed.scoringRules.version,
        calibration: observed.scoringRules.calibration,
        unicode: observed.scoringRules.unicode,
        icu: observed.scoringRules.icu,
        profile: observed.scoringRules.profile,
      }
    : null;

/** Write-once: a log or record is never replaced (FA-UEB-31 hook). */
async function writeOnce(directory: string, name: string, content: unknown) {
  await mkdir(directory, { recursive: true });
  const path = join(directory, name);
  try {
    await writeFile(path, `${JSON.stringify(content, null, 2)}\n`, {
      flag: "wx",
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST")
      throw new Error(
        `${path} already exists; measurement records are never replaced.`,
        {
          cause: error,
        },
      );
    throw error;
  }
  return path;
}
/** Refuses before any work when the record for this identity exists. */
async function refuseExisting(directory: string, name: string) {
  const path = join(directory, name);
  if (
    await stat(path).then(
      () => true,
      () => false,
    )
  )
    throw new Error(
      `${path} already exists; measurement records are never replaced.`,
    );
}
const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);

export interface MeasureOptions {
  /** Private dataset location (ADR-0006); refused inside this repository. */
  root: string;
  configuration: GateConfiguration;
  /** Absent: the parser path alone is measured. */
  extraction?: ExtractionPort;
  port: number;
}

export async function measureConfiguration(options: MeasureOptions) {
  const root = await privateLocation(options.root);
  const dataset = await loadDataset(root, "reference-test-set");
  // ADR-0006 Measured configuration identity. Scoring rules and the Search
  // strategy version follow from the code version and are logged as observed.
  const identity = {
    testSetVersion: dataset.version,
    fixtureState: dataset.fixtureState,
    codeVersion: codeVersion(),
    aiModel: options.extraction?.model ?? null,
    enabledSources: [...options.configuration.enabledSources].sort(),
    comparisonParameters: options.configuration.comparisonParameters ?? {},
    searchSettings: options.configuration.searchSettings ?? null,
    calibration: options.configuration.calibration ?? null,
  };
  const configurationId = digest(identity);
  const logDirectory = join(root, "measurement-logs", dataset.version);
  await refuseExisting(logDirectory, `${configurationId}.json`);
  const { runs, observed } = await withSession(
    dataset,
    options.configuration,
    options.port,
    async (session) =>
      verifyAll(
        session,
        dataset.records,
        await structureAll(session.apiUrl, dataset.records, options.extraction),
      ),
  );
  const measured = {
    ...identity,
    scoringRules: scoringRulesOf(observed),
    searchStrategyVersion: observed?.searchStrategyVersion ?? null,
  };
  const measurement: GateMeasurement = {
    configuration: {
      aiModel: measured.aiModel,
      calibration: measured.calibration,
      runtimeCalibration: observed?.scoringRules.calibration ?? "unobserved",
      codeVersion: measured.codeVersion,
    },
    composition: checkComposition(dataset.records),
    runs: runs.map(gateRun),
  };
  const decision = decideRelease(measurement);
  const logPath = await writeOnce(logDirectory, `${configurationId}.json`, {
    format: "source-taster-quality-gate/1",
    configurationId,
    configuration: measured,
    composition: measurement.composition,
    runs,
    decision,
  });
  return { logPath, decision, configurationId };
}

export interface CalibrateOptions {
  root: string;
  grid: CalibrationGrid;
  /** Fixed for the whole search; only comparison parameters vary. */
  configuration?: Omit<
    GateConfiguration,
    "comparisonParameters" | "calibration"
  >;
  extraction?: ExtractionPort;
  port: number;
}

/**
 * ADR-0025 search. Reads only the Development set; the Reference test set is
 * never opened. Structuring runs once and every grid point verifies the same
 * structured fields, so the search is deterministic over replayed sources.
 */
export async function calibrate(options: CalibrateOptions) {
  const points = expandGrid(options.grid);
  const root = await privateLocation(options.root);
  const dataset = await loadDataset(root, "development-set");
  const configuration = options.configuration ?? { enabledSources: [] };
  const identity = {
    developmentSetVersion: dataset.version,
    fixtureState: dataset.fixtureState,
    codeVersion: codeVersion(),
    aiModel: options.extraction?.model ?? null,
    enabledSources: [...configuration.enabledSources].sort(),
    searchSettings: configuration.searchSettings ?? null,
    grid: options.grid,
  };
  const recordName = `${digest(identity)}.json`;
  const recordDirectory = join(root, "calibration", dataset.version);
  await refuseExisting(recordDirectory, recordName);
  const results = await withSession(
    dataset,
    configuration,
    options.port,
    async (session) => {
      const structured = await structureAll(
        session.apiUrl,
        dataset.records,
        options.extraction,
      );
      const results = [];
      for (const parameters of points) {
        await session.restart({
          SOURCE_TASTER_COMPARISON_PARAMETERS: JSON.stringify(parameters),
        });
        const { runs, observed } = await verifyAll(
          session,
          dataset.records,
          structured,
        );
        results.push({
          parameters,
          observedProfile: observed?.scoringRules.profile ?? null,
          scoringRules: scoringRulesOf(observed),
          searchStrategyVersion: observed?.searchStrategyVersion ?? null,
          runs,
        });
      }
      return results;
    },
  );
  const selection = selectPoint(results.map((r) => r.runs.map(gateRun)));
  const scoringRules =
    results.find((r) => r.scoringRules)?.scoringRules ?? null;
  const record = {
    format: "source-taster-calibration/1",
    ...identity,
    scoringRules: scoringRules && { ...scoringRules, profile: undefined },
    searchStrategyVersion: results[0]?.searchStrategyVersion ?? null,
    results,
    // No point meets every target: nothing is calibrated, nothing released.
    selected: selection && {
      index: selection.index,
      parameters: points[selection.index]!,
      minimumMargin: selection.minimumMargin,
    },
  };
  const recordPath = await writeOnce(recordDirectory, recordName, record);
  return { recordPath, selected: record.selected };
}
