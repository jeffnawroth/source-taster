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
  measuredConfigurationId,
} from "./configuration.ts";
import { evidenceDigest } from "./evidence.ts";
import { qualifiedAi } from "./extraction.ts";
import { scoringRules } from "../checks/scoring-rules.ts";
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
    const id = ConfigurationId.parse(
      measuredConfigurationId(
        code,
        file.digest,
        configuration,
        port?.model ?? null,
        port?.configuration ?? null,
        port?.codeDigest ?? null,
      ),
    );
    const expected = {
      configuration,
      aiModel: port?.model ?? null,
      aiConfiguration: port?.configuration ?? null,
      extractionCodeDigest: port?.codeDigest,
    };
    const evidenceInput = {
      root: entry.root,
      loadReport: entry.loadReport,
      configurationDigest: file.digest,
      expected,
      code,
    };
    const before = await evidenceDigest(evidenceInput);
    const release = await checkRelease({
      root: entry.root,
      code,
      loadReport: entry.loadReport,
      configurationDigest: file.digest,
      now: clock.now(),
      runtimeCalibration: scoringRulesCalibration,
      expected,
    });
    const reasons = [...release.reasons];
    if (
      process.env.SOURCE_TASTER_DOI_PREVIEW !== "uncalibrated" ||
      (configuration.enabledSources.length > 0 &&
        process.env.SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW !== "uncalibrated")
    )
      reasons.push("runtime-route-unavailable");
    if (!qualifiedAi(port?.model ?? null, port?.configuration))
      reasons.push("provider-not-qualified");
    const evidence = await evidenceDigest(evidenceInput);
    if (
      evidence !== before ||
      (await readConfigurationFile(entry.configuration)).digest !== file.digest
    )
      reasons.push("measurement-evidence-changed");
    // Process-wide dispatch settings cannot be switched per Check or silently
    // replaced by the currently running pool. Require deployment compatibility.
    const deployed = parseSearchSettings(
      process.env.SOURCE_TASTER_SEARCH_SETTINGS,
    );
    if (
      searchSettings.workerConcurrency !== deployed.workerConcurrency ||
      searchSettings.activeReferencesPerCheck !==
        deployed.activeReferencesPerCheck
    )
      reasons.push("worker-settings-mismatch");
    const ai = port?.configuration;
    const summary = MeasuredConfiguration.parse({
      provider: ai
        ? {
            path: ai.providerPath,
            region: ai.region,
            countries: ai.processingAndStorageCountries,
            zeroRetention: ai.zeroRetention,
          }
        : null,
      comparisonParameters: profile,
      searchSettings,
      id,
      codeVersion: code.sha,
      configurationDigest: file.digest,
      rulesVersion: scoringRules(profile).version,
      model: port?.model ?? null,
      sources: configuration.enabledSources,
      eligible: reasons.length === 0,
      reasons: [
        ...new Set(
          reasons.map((reason) =>
            reason.startsWith("reference-test-set-unavailable:")
              ? "reference-test-set-unavailable"
              : reason,
          ),
        ),
      ],
      evidenceDigest: evidence,
      checkedAt: new Date(clock.now()).toISOString(),
    });
    return { summary, configuration, port, searchSettings, profile };
  }
  async function invalid(entry: z.infer<typeof Registry>[number]) {
    const code = codeVersion();
    const bytes = await readFile(entry.configuration).catch(() =>
      Buffer.from("unavailable"),
    );
    const digest = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
    return MeasuredConfiguration.parse({
      id: configurationDigest({ invalid: digest, code }),
      codeVersion: code.sha,
      configurationDigest: digest,
      rulesVersion: "unavailable",
      model: null,
      provider: null,
      comparisonParameters: {},
      searchSettings: {},
      sources: [],
      eligible: false,
      reasons: ["configuration-invalid"],
      evidenceDigest: digest,
      checkedAt: new Date(clock.now()).toISOString(),
    });
  }
  return {
    async list() {
      return Promise.all(
        (await load()).map(async (entry) => {
          try {
            return (await inspect(entry)).summary;
          } catch {
            return invalid(entry);
          }
        }),
      );
    },
    async resolve(id: string, evidenceDigest?: string) {
      for (const entry of await load()) {
        try {
          const found = await inspect(entry);
          if (
            found.summary.id === id &&
            (!evidenceDigest || found.summary.evidenceDigest === evidenceDigest)
          )
            return found;
        } catch {
          /* An unrelated invalid deployment entry cannot revoke this configuration. */
        }
      }
      throw new Error("unknown-measured-configuration");
    },
    async executable(id: string, config: Config, evidenceDigest?: string) {
      const found = await this.resolve(id, evidenceDigest);
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
