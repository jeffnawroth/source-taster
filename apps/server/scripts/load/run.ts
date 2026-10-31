// SPDX-License-Identifier: AGPL-3.0-or-later
// Orchestrates one load run (#117): an owned database and role, the replay
// edge, the real `src/web.ts` and `src/worker.ts` processes, the driver, and
// the report. The Operator's search settings reach the processes unchanged;
// the harness has no way to loosen a target or a budget.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import pg from "pg";
import { loadConfig } from "../../src/config.ts";
import {
  startProcess,
  testDatabase,
  waitForHealth,
  type RunningProcess,
} from "../../test/support/processes.ts";
import { setupDatabase } from "../db-setup.ts";
import { codeVersion } from "../quality/code-version.ts";
import {
  buildReport,
  type DurationBasis,
  type Evidence,
  type LoadReport,
} from "./analysis.ts";
import { driveChecks } from "./driver.ts";
import {
  startReplay,
  type ReplayPolicy,
  type WorkloadReference,
} from "./replay.ts";

/**
 * The optional Data sources this harness enables and replays (Crossref and
 * doi.org are always on). A production configuration enabling any other
 * source cannot be load-qualified here, and the release guard says so.
 */
export const HARNESS_SOURCES = ["europepmc", "openalex"] as const;

export interface RunOptions {
  /** Pre-built lists, one per concurrent Check. */
  workload: WorkloadReference[][];
  /** Where Data source answers come from. */
  replay: {
    policy: ReplayPolicy;
    provenance: Evidence["provenance"];
    recordingDigest?: string;
    authorization?: string;
  };
  adminUrl: string;
  /** Ports: verification API and the shared Data source replay edge. */
  apiPort: number;
  replayPort: number;
  /** JSON patch for SOURCE_TASTER_SEARCH_SETTINGS; empty means shipped defaults. */
  searchSettingsPatch?: object;
  /** Digest of the reviewed configuration file the patch came from, when it did. */
  reviewedConfiguration?: { digest: string };
  placeholderDelayMs: number;
  workers: number;
  durationBasis: DurationBasis;
  maxRunMs: number;
  /** Written as machine-readable JSON when set. */
  reportPath?: string;
  /** Concurrent Checks required by the launch scope; defaults to the 50 target. */
  scope?: { concurrentChecks: number; referencesPerCheck: number };
  log?: (line: string) => void;
}

async function dropOwned(adminUrl: string, appUrl: string) {
  const owned = new URL(appUrl);
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    await admin.query(
      `DROP DATABASE IF EXISTS ${admin.escapeIdentifier(owned.pathname.slice(1))} WITH (FORCE)`,
    );
    await admin.query(
      `DROP ROLE IF EXISTS ${admin.escapeIdentifier(owned.username)}`,
    );
  } finally {
    await admin.end();
  }
}

export async function runLoad(options: RunOptions): Promise<LoadReport> {
  const log = options.log ?? (() => undefined);
  const { appUrl } = testDatabase();
  const adminUrl = options.adminUrl;
  const replay = await startReplay({
    port: options.replayPort,
    policy: options.replay.policy,
  });
  const processes: RunningProcess[] = [];
  let provisioned = false;
  try {
    // Owned names only: cleanup runs even when provisioning stops half way.
    provisioned = true;
    await setupDatabase(adminUrl, appUrl);
    const source = replay.url;
    const env: Record<string, string> = {
      SOURCE_TASTER_MODE: "standalone",
      DATABASE_URL: appUrl,
      SOURCE_TASTER_PORT: String(options.apiPort),
      SOURCE_TASTER_DOI_PREVIEW: "uncalibrated",
      SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
      SOURCE_TASTER_DOI_RESOLVER_BASE_URL: source,
      SOURCE_TASTER_CROSSREF_BASE_URL: source,
      SOURCE_TASTER_OPENALEX_ENABLED: "true",
      SOURCE_TASTER_OPENALEX_BASE_URL: source,
      SOURCE_TASTER_EUROPEPMC_ENABLED: "true",
      SOURCE_TASTER_EUROPEPMC_BASE_URL: source,
      SOURCE_TASTER_PLACEHOLDER_DELAY_MS: String(options.placeholderDelayMs),
      ...(options.searchSettingsPatch
        ? {
            SOURCE_TASTER_SEARCH_SETTINGS: JSON.stringify(
              options.searchSettingsPatch,
            ),
          }
        : {}),
    };
    // The effective settings are read with the processes' own loader.
    const config = loadConfig(env);
    const web = startProcess("web", env);
    processes.push(web);
    for (let i = 0; i < options.workers; i += 1)
      processes.push(startProcess("worker", env));
    const apiUrl = `http://127.0.0.1:${options.apiPort}`;
    await Promise.race([
      waitForHealth(apiUrl),
      ...processes.map((p) =>
        p.exited.then((code) => {
          throw new Error(
            `A service process exited with ${code} during startup:\n${p.output()}`,
          );
        }),
      ),
    ]);
    log(`services ready on ${apiUrl}; replay edge ${source}`);

    const checks = await driveChecks({
      apiUrl,
      workload: options.workload,
      maxRunMs: options.maxRunMs,
    });
    log(`driver finished: ${checks.length} Checks observed`);

    const stats = replay.stats();
    const report = buildReport({
      checks,
      scope: options.scope ?? {
        concurrentChecks: options.workload.length,
        referencesPerCheck: Math.min(
          ...options.workload.map((list) => list.length),
        ),
      },
      durationBasis: options.durationBasis,
      searchSettings: config.searchSettings,
      placeholderDelayMs: options.placeholderDelayMs,
      codeVersion: codeVersion(),
      enabledSources: [...HARNESS_SOURCES],
      reviewedConfiguration: options.reviewedConfiguration,
      topology: {
        webProcesses: 1,
        workerProcesses: options.workers,
        database: "postgres",
      },
      evidence: {
        provenance: options.replay.provenance,
        recordingDigest: options.replay.recordingDigest,
        authorization: options.replay.authorization,
        unmatchedRequests: stats.unmatched,
        requests: stats.requests,
      },
    });
    if (options.reportPath) {
      await mkdir(dirname(options.reportPath), { recursive: true });
      await writeFile(
        options.reportPath,
        `${JSON.stringify(report, null, 2)}\n`,
      );
    }
    return report;
  } finally {
    await Promise.all(processes.map((p) => p.stop()));
    await replay.stop();
    if (provisioned) await dropOwned(adminUrl, appUrl);
  }
}
