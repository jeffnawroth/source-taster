// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0006 private dataset location. The Reference test set, the Development
// set, their replay fixtures and the measurement logs live outside this
// open-core repository; this module refuses any location inside it.
//
//   <root>/reference-test-set/{manifest,records,fixtures}.json
//   <root>/development-set/{manifest,records,fixtures}.json
//   <root>/measurement-logs/, <root>/calibration/   (written by the gate)
import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import type { GateRecord } from "./targets.ts";

export type DatasetKind = "reference-test-set" | "development-set";
export const replaySources = [
  "doi.org",
  "crossref",
  "openalex",
  "europepmc",
  "semanticscholar",
  "arxiv",
  "openlibrary",
  "googlebooks",
  "web",
] as const;
export type ReplaySource = (typeof replaySources)[number];

const Verdict = z.enum([
  "correct",
  "exists-with-deviations",
  "mixed-citation",
  "doi-conflict",
  "not-found",
  "not-verifiable",
]);
const Record = z.object({
  id: z.string().min(1),
  input: z.string().min(1),
  style: z.string().min(1),
  language: z.string().min(1),
  sourceType: z.string().min(1),
  class: z.enum([
    "real-correct",
    "real-deviating",
    "falsified",
    "invented",
    "outside-coverage",
  ]),
  expectedVerdict: Verdict.optional(),
  mutation: z.string().optional(),
  acceptedIdentifiers: z
    .array(
      z.object({ type: z.enum(["doi", "isbn", "url"]), value: z.string() }),
    )
    .default([]),
  expectedFields: z.record(z.string(), z.unknown()).optional(),
  generator: z.object({ model: z.string(), provider: z.string() }).optional(),
  provenance: z.object({
    reviewedBy: z.string().min(1),
    reviewedAt: z.string().min(1),
    generator: z
      .object({
        model: z.string(),
        provider: z.string(),
        date: z.string(),
        prompt: z.string(),
      })
      .optional(),
  }),
});
const Manifest = z.object({
  kind: z.enum(["reference-test-set", "development-set"]),
  version: z.string().min(1),
});
export const FixtureEntry = z.object({
  source: z.enum(replaySources),
  method: z.string().default("GET"),
  /** Path and query exactly as the adapter requests them from its origin. */
  path: z.string().startsWith("/"),
  /** Exact request body for POST lookups (e.g. identifier batches). */
  requestBody: z.string().optional(),
  status: z.number().int(),
  headers: z.record(z.string(), z.string()).default({}),
  body: z.string(),
  /** Recorded latency, replayed through the real clock and rate limiter. */
  delayMs: z.number().int().nonnegative().default(0),
  license: z.string().min(1),
});
export type FixtureEntry = z.infer<typeof FixtureEntry>;
const Fixtures = z.object({
  recordedAt: z.string(),
  entries: z.array(FixtureEntry),
});

export interface Dataset {
  kind: DatasetKind;
  version: string;
  records: GateRecord[];
  fixtures: FixtureEntry[];
  /** SHA-256 over the exact fixture bytes: the measured fixture state. */
  fixtureState: string;
}

const repository = fileURLToPath(new URL("../../../../", import.meta.url));

/** Resolve a private location and refuse one inside the repository. */
export async function privateLocation(path: string) {
  const [resolved, repo] = await Promise.all([
    realpath(path),
    realpath(repository),
  ]);
  if (resolved === repo || resolved.startsWith(repo + sep))
    throw new Error(
      `Quality datasets and logs must live outside the open-core repository (ADR-0006): ${path}`,
    );
  return resolved;
}

async function json(file: string, schema: z.ZodType, name: string) {
  let value: unknown;
  try {
    value = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    throw new Error(`${name} is invalid: ${(error as Error).message}`, {
      cause: error,
    });
  }
  const parsed = schema.safeParse(value);
  if (!parsed.success)
    throw new Error(`${name} is invalid: ${parsed.error.message}`);
  return parsed.data;
}

/**
 * Reads exactly one set. Calibration asks only for the Development set, so it
 * never opens the Reference test set directory; the manifest kind is checked
 * before any record is read.
 */
export async function loadDataset(
  root: string,
  kind: DatasetKind,
): Promise<Dataset> {
  const directory = join(await privateLocation(root), kind);
  const manifest = (await json(
    join(directory, "manifest.json"),
    Manifest,
    `${kind}/manifest.json`,
  )) as z.infer<typeof Manifest>;
  if (manifest.kind !== kind)
    throw new Error(
      `${kind}/manifest.json declares ${manifest.kind}, expected ${kind}.`,
    );
  const records = (await json(
    join(directory, "records.json"),
    z.array(Record),
    `${kind}/records.json`,
  )) as GateRecord[];
  const ids = new Set(records.map((r) => r.id));
  if (ids.size !== records.length)
    throw new Error(`${kind}/records.json is invalid: duplicate record ids.`);
  const fixtureBytes = await readFile(join(directory, "fixtures.json"));
  const fixtures = (await json(
    join(directory, "fixtures.json"),
    Fixtures,
    `${kind}/fixtures.json`,
  )) as z.infer<typeof Fixtures>;
  return {
    kind,
    version: manifest.version,
    records,
    fixtures: fixtures.entries,
    fixtureState: `sha256:${createHash("sha256").update(fixtureBytes).digest("hex")}`,
  };
}
