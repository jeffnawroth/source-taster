// SPDX-License-Identifier: AGPL-3.0-or-later
// Validates the DE and EN report samples against PDF/UA-1 with veraPDF, the
// reference validator. veraPDF is an external CI/dev tool: it is run as a
// separate process on files, never linked, bundled or shipped (see
// docs/dependency-policy.md). The samples are made by the production report
// code; nothing is relaxed or disabled to make them pass.
//
//   VERAPDF_BIN   path to the `verapdf` launcher (required)
//
//   pnpm reports:pdfua
//
// Writes the PDFs and veraPDF's JSON report to `.tmp/pdfua/`.
import { execFile } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { generateSamples } from "../test/support/report-samples.ts";

/** Keep in step with the pinned installer in .github/workflows/ci.yml. */
export const expectedVeraPdfVersion = "1.30.3";
const outDir = fileURLToPath(new URL("../../../.tmp/pdfua/", import.meta.url));

interface RuleSummary {
  clause: string;
  testNumber: number;
  description: string;
  failedChecks: number;
  checks?: { context?: string }[];
}
interface VeraJob {
  itemDetails: { name: string };
  validationResult?: {
    compliant: boolean;
    jobEndStatus: string;
    profileName: string;
    details: {
      passedRules: number;
      failedRules: number;
      ruleSummaries: RuleSummary[];
    };
  }[];
  taskException?: unknown;
}
interface VeraReport {
  report: {
    buildInformation: { releaseDetails: { id: string; version: string }[] };
    jobs: VeraJob[];
  };
}

/** The failures of one veraPDF run, empty when every sample validated. */
export function problems(
  report: VeraReport,
  expectedFiles: string[],
  version = expectedVeraPdfVersion,
): string[] {
  const out: string[] = [];
  const core = report.report.buildInformation.releaseDetails.find(
    (detail) => detail.id === "core",
  );
  if (core?.version !== version)
    out.push(
      `veraPDF version ${core?.version ?? "unknown"}, expected ${version}`,
    );
  const jobs = new Map(
    report.report.jobs.map((job) => [basename(job.itemDetails.name), job]),
  );
  for (const file of expectedFiles) {
    const job = jobs.get(file);
    if (!job) {
      out.push(`${file}: not validated`);
      continue;
    }
    const results = job.validationResult ?? [];
    const result = results[0];
    if (results.length !== 1 || !result || job.taskException !== undefined) {
      out.push(`${file}: no single validation result`);
      continue;
    }
    if (result.jobEndStatus !== "normal")
      out.push(`${file}: job ended ${result.jobEndStatus}`);
    if (!result.profileName.includes("PDF/UA-1"))
      out.push(`${file}: validated against "${result.profileName}"`);
    if (!result.compliant) {
      for (const rule of result.details.ruleSummaries) {
        const where = (rule.checks ?? [])
          .slice(0, 2)
          .map((check) => check.context)
          .join(" | ");
        out.push(
          `${file}: rule ${rule.clause}-${rule.testNumber} failed ${rule.failedChecks}x: ${rule.description}${where ? ` [${where}]` : ""}`,
        );
      }
    }
  }
  if (jobs.size !== expectedFiles.length)
    out.push(`validated ${jobs.size} files, expected ${expectedFiles.length}`);
  return out;
}

async function main() {
  const bin = process.env.VERAPDF_BIN;
  if (!bin) {
    console.error(
      "VERAPDF_BIN is not set. Point it at the veraPDF launcher (CI installs it; see docs/dependency-policy.md).",
    );
    process.exit(2);
  }
  mkdirSync(outDir, { recursive: true });
  const samples = await generateSamples();
  const files = samples.map((sample) => {
    const file = `${sample.name}.pdf`;
    writeFileSync(`${outDir}${file}`, sample.pdf);
    return file;
  });
  const run = promisify(execFile);
  // veraPDF exits non-zero for a non-compliant file but still prints the report.
  const result = await run(
    bin,
    [
      "--flavour",
      "ua1",
      "--format",
      "json",
      ...files.map((file) => `${outDir}${file}`),
    ],
    { maxBuffer: 256 * 1024 * 1024 },
  ).catch((error: { stdout?: string; message: string }) => {
    if (!error.stdout) throw error;
    return { stdout: error.stdout };
  });
  writeFileSync(`${outDir}verapdf-report.json`, result.stdout);
  const failures = problems(JSON.parse(result.stdout) as VeraReport, files);
  if (failures.length) {
    console.error(
      `PDF/UA-1 validation failed (veraPDF ${expectedVeraPdfVersion}):`,
    );
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(
    `veraPDF ${expectedVeraPdfVersion} PDF/UA-1 validation passes for ${files.length} samples: ${files.join(", ")}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
