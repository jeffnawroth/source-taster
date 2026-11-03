// SPDX-License-Identifier: AGPL-3.0-or-later
// Bind only this configuration's measurement and approvals. Adding or revoking
// unrelated configurations never invalidates an already selected one.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import type { ReleaseInput } from "./release.ts";
import {
  qualificationDirectory,
  qualificationArtifact,
} from "./source-qualification.ts";
export async function evidenceDigest(
  input: Pick<
    ReleaseInput,
    "root" | "loadReport" | "configurationDigest" | "expected" | "code"
  >,
) {
  const hash = createHash("sha256");
  async function file(path: string, label: string) {
    let bytes: Buffer;
    try {
      bytes = await readFile(path);
    } catch {
      bytes = Buffer.from("missing");
    }
    hash.update(JSON.stringify([label, bytes.length])).update(bytes);
    return bytes;
  }
  if (input.root) {
    let version: string | undefined;
    for (const name of ["manifest", "records", "fixtures"]) {
      const bytes = await file(
        join(input.root, "reference-test-set", `${name}.json`),
        name,
      );
      if (name === "manifest") {
        try {
          const manifest = JSON.parse(bytes.toString()) as {
            version?: unknown;
          };
          if (
            typeof manifest.version === "string" &&
            /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(manifest.version)
          )
            version = manifest.version;
        } catch {
          /* The release validator reports malformed/missing evidence. */
        }
      }
    }
    if (version && input.expected) {
      const directory = join(input.root, "measurement-logs", version);
      for (const name of (await readdir(directory).catch(() => [] as string[]))
        .filter((n) => n.endsWith(".json"))
        .sort()) {
        const bytes = await readFile(join(directory, name));
        let config: Record<string, unknown>;
        try {
          const log = JSON.parse(bytes.toString()) as {
            configuration?: Record<string, unknown>;
          };
          if (!log.configuration) continue;
          config = log.configuration;
        } catch {
          continue;
        }
        const wanted = input.expected;
        if (
          isDeepStrictEqual(
            {
              code: config.codeVersion,
              model: config.aiModel,
              ai: config.aiConfiguration ?? null,
              adapter: config.extractionCodeDigest ?? null,
              sources: Array.isArray(config.enabledSources)
                ? [...(config.enabledSources as unknown[])].sort()
                : config.enabledSources,
              parameters: config.comparisonParameters,
              search: config.searchSettings,
              calibration: config.calibration,
            },
            {
              code: input.code,
              model: wanted.aiModel,
              ai: wanted.aiConfiguration,
              adapter: wanted.extractionCodeDigest ?? null,
              sources: [...wanted.configuration.enabledSources].sort(),
              parameters: wanted.configuration.comparisonParameters ?? {},
              search: wanted.configuration.searchSettings ?? null,
              calibration: wanted.configuration.calibration ?? null,
            },
          )
        )
          hash.update(JSON.stringify([name, bytes.length])).update(bytes);
      }
    }
    const directory = qualificationDirectory(
      input.root,
      input.configurationDigest,
    );
    async function approval(name: string) {
      const bytes = await file(join(directory, name), name);
      try {
        const value = JSON.parse(bytes.toString()) as {
          contractRecord?: string;
          rightsRecord?: string;
          replay?: { recordings?: string; report?: string };
        };
        for (const digest of [
          value.contractRecord,
          value.rightsRecord,
          value.replay?.recordings,
          value.replay?.report,
        ])
          if (digest) {
            try {
              hash.update(await qualificationArtifact(input.root!, digest));
            } catch {
              hash.update(`unavailable:${digest}`);
            }
          }
      } catch {
        /* The release validator owns refusal diagnostics. */
      }
    }
    if (input.expected?.aiModel) await approval("provider-approval.json");
    for (const source of [
      ...(input.expected?.configuration.enabledSources ?? []),
    ].sort())
      if (
        [
          "openlibrary",
          "googlebooks",
          "url",
          "internetarchive",
          "semanticscholar",
        ].includes(source)
      )
        await approval(`${source}.json`);
  }
  if (input.loadReport) await file(input.loadReport, "load-report");
  return `sha256:${hash.digest("hex")}`;
}
