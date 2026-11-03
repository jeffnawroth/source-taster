// SPDX-License-Identifier: AGPL-3.0-or-later
// Verification owns executable configurations and measurement truth. The
// deployment-owned registry contains paths, never Operator-editable JSON.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import {
  MeasuredConfiguration,
  ConfigurationId,
} from "@source-taster/contract-internal";
import { codeVersion } from "./code-version.ts";
import { checkRelease } from "./release.ts";
import {
  loadExtraction,
  readConfigurationFile,
  resolveConfiguration,
} from "./configuration.ts";
import { qualifiedAi } from "./extraction.ts";
import { scoringRulesCalibration } from "../checks/scoring-calibration.ts";
import { parseSearchSettings, type Config } from "../config.ts";
import { createDevelopmentProfile } from "@source-taster/core";
const Registry = z
  .array(
    z.strictObject({
      configuration: z.string().min(1),
      extraction: z.string().min(1).optional(),
      root: z.string().min(1).optional(),
      loadReport: z.string().min(1).optional(),
    }),
  )
  .max(100);
export const configurationDigest = (value: unknown) =>
  `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
export function measuredConfigurations(
  registry = process.env.SOURCE_TASTER_MEASURED_CONFIGURATIONS,
  clock = { now: Date.now },
) {
  async function load() {
    if (!registry) return [];
    return Registry.parse(JSON.parse(await readFile(registry, "utf8")));
  }
  async function inspect(entry: z.infer<typeof Registry>[number]) {
    const code = codeVersion();
    const port = entry.extraction
      ? await loadExtraction(entry.extraction)
      : undefined;
    const file = await readConfigurationFile(entry.configuration);
    const configuration = await resolveConfiguration(
      entry.configuration,
      port?.model ?? null,
      port?.configuration ?? null,
    );
    // Resolve executable settings now; malformed parameters never gain eligibility.
    const searchSettings = parseSearchSettings(
      JSON.stringify(configuration.searchSettings ?? {}),
    );
    const profile = createDevelopmentProfile(
      configuration.comparisonParameters ?? {},
    );
    const identity = {
      code,
      configuration,
      configurationDigest: file.digest,
      ai: port?.configuration ?? null,
      model: port?.model ?? null,
      unicode: process.versions.unicode,
      icu: process.versions.icu,
    };
    const id = ConfigurationId.parse(configurationDigest(identity));
    const release = await checkRelease({
      root: entry.root,
      code,
      loadReport: entry.loadReport,
      configurationDigest: file.digest,
      now: clock.now(),
      runtimeCalibration: scoringRulesCalibration,
      expected: {
        configuration,
        aiModel: port?.model ?? null,
        aiConfiguration: port?.configuration ?? null,
      },
    });
    const reasons = [...release.reasons];
    if (!qualifiedAi(port?.model ?? null, port?.configuration))
      reasons.push("provider-not-qualified");
    // Bind the approval and replay receipt bytes, not their self-reported flags.
    const evidence: unknown[] = [release];
    for (const source of configuration.enabledSources) {
      try {
        evidence.push(
          await readFile(
            `${entry.root}/source-qualifications/${source}.json`,
            "utf8",
          ),
        );
      } catch {
        evidence.push(null);
      }
    }
    const summary = MeasuredConfiguration.parse({
      id,
      codeVersion: code.sha,
      configurationDigest: file.digest,
      rulesVersion: configurationDigest({
        profile,
        unicode: process.versions.unicode,
        icu: process.versions.icu,
      }),
      model: port?.model ?? null,
      sources: configuration.enabledSources,
      eligible: reasons.length === 0,
      reasons: [...new Set(reasons)],
      evidenceDigest: configurationDigest(evidence),
      checkedAt: new Date(clock.now()).toISOString(),
    });
    return { summary, configuration, port, searchSettings, profile };
  }
  return {
    async list() {
      return Promise.all(
        (await load()).map(async (entry) => (await inspect(entry)).summary),
      );
    },
    async resolve(id: string) {
      for (const entry of await load()) {
        const found = await inspect(entry);
        if (found.summary.id === id) return found;
      }
      throw new Error("unknown-measured-configuration");
    },
    async executable(id: string, config: Config) {
      const found = await this.resolve(id);
      if (!found.summary.eligible) throw new Error("configuration-ineligible");
      const active: Config = {
        ...config,
        searchSettings: found.searchSettings,
        comparisonProfile: found.profile,
      };
      for (const source of [
        "url",
        "internetarchive",
        "openalex",
        "europepmc",
        "semanticscholar",
        "arxiv",
        "openlibrary",
        "googlebooks",
      ] as const)
        active[`${source}Enabled`] =
          found.configuration.enabledSources.includes(source);
      return { ...found, config: active };
    },
  };
}
