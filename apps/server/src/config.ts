// SPDX-License-Identifier: AGPL-3.0-or-later
// Process configuration. Both processes refuse to start unless the deployment
// mode is chosen explicitly: standalone mode grants every permission, so it
// must never be the result of a missing setting.

import {
  defaultExtractionLimits,
  type ExtractionLimits,
} from "./documents/extraction.ts";
import { loadHostedSettings, type HostedSettings } from "./authority/crypto.ts";
import {
  createDevelopmentProfile,
  defaultSearchSettings,
  referenceDeadlineMs,
  type ComparisonProfile,
  type SearchSettings,
} from "@source-taster/core";
import { z } from "zod";
import { resolve } from "node:path";
import {
  assertPreviewAllowed,
  type WebsiteMode,
} from "@source-taster/website/metadata";

export interface Config {
  documentImage?: string;
  documentLimits: ExtractionLimits;
  website?: { mode: WebsiteMode; directory: string };
  mode: "standalone" | "hosted";
  hosted?: HostedSettings;
  referenceLimit: number;
  databaseUrl: string;
  port: number;
  /** Interval of SSE comment frames that keep idle connections open. */
  sseHeartbeatMs: number;
  doiPreview: boolean;
  bibliographicPreview?: boolean;
  openalexEnabled?: boolean;
  openalexBase?: string;
  europepmcEnabled?: boolean;
  europepmcBase?: string;
  semanticscholarEnabled?: boolean;
  semanticscholarBase?: string;
  arxivEnabled?: boolean;
  arxivBase?: string;
  openlibraryEnabled?: boolean;
  openlibraryBase?: string;
  googlebooksEnabled?: boolean;
  googlebooksBase?: string;
  /** Operator-changeable search operating settings (spec #70, ADR-0007). */
  searchSettings: SearchSettings;
  comparisonProfile: ComparisonProfile;
  resolverBase: string;
  crossrefBase: string;
  /** Development/test scheduling delay; never a source timeout. */
  placeholderDelayMs: number;
  clientLeaseMs: number;
  workerClaimMs: number;
}

export class ConfigError extends Error {
  override name = "ConfigError";
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const mode = env.SOURCE_TASTER_MODE;
  if (!mode) {
    throw new ConfigError(
      'SOURCE_TASTER_MODE is not set. Set it to "standalone" to run with one local Owner.',
    );
  }
  if (mode === "hosted") {
    try {
      loadHostedSettings(env.SOURCE_TASTER_AUTH_CONFIG);
    } catch {
      throw new ConfigError(
        "Hosted mode needs a valid SOURCE_TASTER_AUTH_CONFIG with distinct internal signing and service public keys.",
      );
    }
    throw new ConfigError(
      "Hosted activation requires an eligible exact Measured configuration (#94). Uncalibrated or absent measurements cannot serve users.",
    );
  }
  if (mode !== "standalone") {
    throw new ConfigError(
      `SOURCE_TASTER_MODE="${mode}" is unknown. Use "standalone".`,
    );
  }
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) throw new ConfigError("DATABASE_URL is not set.");
  const websiteMode = env.SOURCE_TASTER_WEBSITE_MODE;
  let website: Config["website"];
  if (websiteMode) {
    if (websiteMode !== "preview" && websiteMode !== "publication")
      throw new ConfigError("Choose website preview or publication explicitly");
    try {
      assertPreviewAllowed(websiteMode, env.NODE_ENV);
    } catch (error) {
      throw new ConfigError((error as Error).message);
    }
    website = {
      mode: websiteMode,
      directory: resolve(
        env.SOURCE_TASTER_WEBSITE_DIRECTORY ??
          `../website/${websiteMode === "preview" ? "dist-preview" : "dist"}`,
      ),
    };
  }
  const doiPreview = env.SOURCE_TASTER_DOI_PREVIEW === "uncalibrated";
  if (env.SOURCE_TASTER_DOI_PREVIEW && !doiPreview)
    throw new ConfigError(
      "Only the uncalibrated DOI development preview exists.",
    );
  if (doiPreview && env.NODE_ENV === "production")
    throw new ConfigError(
      "Uncalibrated DOI rules cannot be released or activated. #94 qualification is required.",
    );
  const bibliographicPreview =
    env.SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW === "uncalibrated";
  if (env.SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW && !bibliographicPreview)
    throw new ConfigError(
      "Only the uncalibrated bibliographic development preview exists.",
    );
  if (bibliographicPreview && (!doiPreview || env.NODE_ENV === "production"))
    throw new ConfigError(
      "Bibliographic search requires the uncalibrated development profile.",
    );
  for (const [name, label] of [
    ["OPENALEX", "OpenAlex"],
    ["EUROPEPMC", "Europe PMC"],
    ["SEMANTICSCHOLAR", "Semantic Scholar"],
    ["ARXIV", "arXiv"],
    ["OPENLIBRARY", "Open Library"],
    ["GOOGLEBOOKS", "Google Books"],
  ] as const) {
    const value = env[`SOURCE_TASTER_${name}_ENABLED`];
    if (value && !["true", "false"].includes(value))
      throw new ConfigError(`${label} enablement must be true or false.`);
  }
  let searchSettings: SearchSettings;
  try {
    searchSettings = parseSearchSettings(env.SOURCE_TASTER_SEARCH_SETTINGS);
  } catch {
    throw new ConfigError("Invalid ADR-0007 search operating settings.");
  }
  if (env.SOURCE_TASTER_SEARCH_SETTINGS && !bibliographicPreview)
    throw new ConfigError(
      "Search operating settings require the bibliographic development preview.",
    );
  // The catalog rates are search operating settings; a separate rate variable
  // would be a second, silently ignored mechanism.
  for (const name of ["OPENLIBRARY", "GOOGLEBOOKS"])
    if (env[`SOURCE_TASTER_${name}_REQUESTS_PER_SECOND`] !== undefined)
      throw new ConfigError(
        `SOURCE_TASTER_${name}_REQUESTS_PER_SECOND is replaced by intervalMs in SOURCE_TASTER_SEARCH_SETTINGS.`,
      );
  let comparisonProfile: ComparisonProfile;
  try {
    comparisonProfile = createDevelopmentProfile(
      env.SOURCE_TASTER_COMPARISON_PARAMETERS
        ? (JSON.parse(env.SOURCE_TASTER_COMPARISON_PARAMETERS) as unknown)
        : {},
    );
  } catch {
    throw new ConfigError(
      "Invalid ADR-0025 development comparison parameters.",
    );
  }
  function endpoint(name: string, fallback: string) {
    const value = env[name] ?? fallback;
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new ConfigError("Data source base is not a valid origin.");
    }
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    )
      throw new ConfigError(
        "Data source base must be an origin without credentials.",
      );
    if (
      value !== fallback &&
      (!doiPreview ||
        env.NODE_ENV === "production" ||
        !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname))
    )
      throw new ConfigError(
        "Fixture endpoint overrides are loopback-only in the development preview.",
      );
    return url.origin;
  }
  let documentLimits: ExtractionLimits;
  try {
    documentLimits = z
      .strictObject({
        inputBytes: z.number().int().positive(),
        pages: z.number().int().positive(),
        expandedBytes: z.number().int().positive(),
        timeoutMs: z.number().int().positive(),
        cpuSeconds: z.number().int().positive(),
        outputBytes: z.number().int().positive(),
        memoryBytes: z
          .number()
          .int()
          .min(32 * 1024 * 1024),
        concurrency: z.number().int().positive(),
      })
      .parse({
        ...defaultExtractionLimits,
        ...JSON.parse(env.SOURCE_TASTER_DOCUMENT_LIMITS ?? "{}"),
      });
  } catch {
    throw new ConfigError("Invalid document extraction resource limits.");
  }
  if (
    env.SOURCE_TASTER_DOCUMENT_IMAGE &&
    !/^sha256:[a-f0-9]{64}$/.test(env.SOURCE_TASTER_DOCUMENT_IMAGE)
  )
    throw new ConfigError(
      "Document extraction requires an immutable local image ID.",
    );
  return {
    documentImage: env.SOURCE_TASTER_DOCUMENT_IMAGE,
    documentLimits,
    mode,
    doiPreview,
    bibliographicPreview,
    openalexEnabled:
      bibliographicPreview && env.SOURCE_TASTER_OPENALEX_ENABLED === "true",
    openalexBase: endpoint(
      "SOURCE_TASTER_OPENALEX_BASE_URL",
      "https://api.openalex.org",
    ),
    europepmcEnabled:
      bibliographicPreview && env.SOURCE_TASTER_EUROPEPMC_ENABLED === "true",
    europepmcBase: endpoint(
      "SOURCE_TASTER_EUROPEPMC_BASE_URL",
      "https://www.ebi.ac.uk",
    ),
    semanticscholarEnabled:
      bibliographicPreview &&
      env.SOURCE_TASTER_SEMANTICSCHOLAR_ENABLED === "true",
    semanticscholarBase: endpoint(
      "SOURCE_TASTER_SEMANTICSCHOLAR_BASE_URL",
      "https://api.semanticscholar.org",
    ),
    arxivEnabled:
      bibliographicPreview && env.SOURCE_TASTER_ARXIV_ENABLED === "true",
    arxivBase: endpoint(
      "SOURCE_TASTER_ARXIV_BASE_URL",
      "https://export.arxiv.org",
    ),
    openlibraryEnabled:
      bibliographicPreview && env.SOURCE_TASTER_OPENLIBRARY_ENABLED === "true",
    openlibraryBase: endpoint(
      "SOURCE_TASTER_OPENLIBRARY_BASE_URL",
      "https://openlibrary.org",
    ),
    googlebooksEnabled:
      bibliographicPreview && env.SOURCE_TASTER_GOOGLEBOOKS_ENABLED === "true",
    googlebooksBase: endpoint(
      "SOURCE_TASTER_GOOGLEBOOKS_BASE_URL",
      "https://www.googleapis.com",
    ),
    searchSettings,
    comparisonProfile,
    resolverBase: endpoint(
      "SOURCE_TASTER_DOI_RESOLVER_BASE_URL",
      "https://doi.org",
    ),
    crossrefBase: endpoint(
      "SOURCE_TASTER_CROSSREF_BASE_URL",
      "https://api.crossref.org",
    ),
    website,
    referenceLimit: integer(env, "SOURCE_TASTER_REFERENCE_LIMIT", 1000, 1),
    databaseUrl,
    port: integer(env, "SOURCE_TASTER_PORT", 3100),
    sseHeartbeatMs: integer(env, "SOURCE_TASTER_SSE_HEARTBEAT_MS", 25_000),
    placeholderDelayMs: integer(env, "SOURCE_TASTER_PLACEHOLDER_DELAY_MS", 500),
    clientLeaseMs: integer(env, "SOURCE_TASTER_CLIENT_LEASE_MS", 75_000, 1000),
    workerClaimMs: integer(
      env,
      "SOURCE_TASTER_WORKER_CLAIM_MS",
      45_000,
      31_000,
    ),
  };
}

// A request and a permit wait both stay within the Reference deadline.
const sourceSettings = z.strictObject({
  requestTimeoutMs: z
    .number()
    .int()
    .min(100)
    .max(referenceDeadlineMs)
    .optional(),
  intervalMs: z.number().int().min(0).max(60000).optional(),
  searchIntervalMs: z.number().int().min(0).max(60000).optional(),
  concurrency: z.number().int().min(1).max(100).optional(),
  maxWaitMs: z.number().int().min(0).max(referenceDeadlineMs).optional(),
});
// Identifier batching only exists for the sources that batch (ADR-0007).
const batchedSettings = {
  semanticscholar: sourceSettings.extend({
    // API bound: 500 identifiers; ADR-0007: collect for at most 200 ms.
    batchSize: z.number().int().min(1).max(500).optional(),
    batchWindowMs: z.number().int().min(0).max(200).optional(),
  }),
  arxiv: sourceSettings.extend({
    // API bound: at most 2000 results per request.
    batchSize: z.number().int().min(1).max(2000).optional(),
    batchWindowMs: z.number().int().min(0).max(3000).optional(),
  }),
} as Record<string, typeof sourceSettings>;
const searchSettingsPatch = z.strictObject({
  // ADR-0007 bounds: at most one retry, after a Retry-After of at most 2 s.
  maxRetries: z.number().int().min(0).max(1).optional(),
  retryAfterMaxMs: z.number().int().min(0).max(2000).optional(),
  activeReferencesPerCheck: z.number().int().min(1).max(1000).optional(),
  workerConcurrency: z.number().int().min(1).max(1000).optional(),
  sources: z
    .strictObject(
      Object.fromEntries(
        Object.keys(defaultSearchSettings.sources).map((name) => [
          name,
          (batchedSettings[name] ?? sourceSettings).optional(),
        ]),
      ),
    )
    .optional(),
});
/** Partial JSON overrides merged over the default search settings. */
function parseSearchSettings(raw: string | undefined): SearchSettings {
  const patch = searchSettingsPatch.parse(raw ? JSON.parse(raw) : {});
  const { sources = {}, ...rest } = patch;
  const merged = Object.fromEntries(
    Object.entries(defaultSearchSettings.sources).map(([name, values]) => [
      name,
      {
        ...values,
        ...Object.fromEntries(
          Object.entries(sources[name] ?? {}).filter(
            ([, v]) => v !== undefined,
          ),
        ),
      },
    ]),
  ) as SearchSettings["sources"];
  return {
    ...defaultSearchSettings,
    ...Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined),
    ),
    sources: merged,
  };
}

function integer(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  minimum = 0,
): number {
  const raw = env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < minimum) {
    throw new ConfigError(
      `${name} must be an integer of at least ${minimum}, got "${raw}".`,
    );
  }
  return value;
}

/** Runs an entrypoint, turning configuration errors into a clean non-zero exit. */
export async function runMain(
  main: (config: Config) => void | Promise<void>,
): Promise<void> {
  let config: Config;
  try {
    config = loadConfig();
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
    console.error(`Configuration error: ${error.message}`);
    process.exit(78); // EX_CONFIG
  }
  await main(config);
}
