// SPDX-License-Identifier: AGPL-3.0-or-later
// Process configuration. Both processes refuse to start unless the deployment
// mode is chosen explicitly: standalone mode grants every permission, so it
// must never be the result of a missing setting.

import { resolve } from "node:path";
import {
  assertPreviewAllowed,
  type WebsiteMode,
} from "@source-taster/website/metadata";

export interface Config {
  website?: { mode: WebsiteMode; directory: string };
  mode: "standalone";
  referenceLimit: number;
  databaseUrl: string;
  port: number;
  /** Interval of SSE comment frames that keep idle connections open. */
  sseHeartbeatMs: number;
  /** Placeholder worker delay per Reference, until real checking exists. */
  placeholderDelayMs: number;
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
    throw new ConfigError(
      "SOURCE_TASTER_MODE=hosted needs the hosted service configuration, which is not available yet.",
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
  return {
    mode,
    website,
    referenceLimit: integer(env, "SOURCE_TASTER_REFERENCE_LIMIT", 1000, 1),
    databaseUrl,
    port: integer(env, "SOURCE_TASTER_PORT", 3100),
    sseHeartbeatMs: integer(env, "SOURCE_TASTER_SSE_HEARTBEAT_MS", 25_000),
    placeholderDelayMs: integer(env, "SOURCE_TASTER_PLACEHOLDER_DELAY_MS", 500),
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
