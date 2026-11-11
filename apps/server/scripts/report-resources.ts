// SPDX-License-Identifier: AGPL-3.0-or-later
// Local, synthetic resource observations through the actual production worker.
// This is repeatable evidence, not a deployment or release qualification.
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import {
  generateReport,
  ReportFailed,
  reportLimits,
} from "../src/reports/generate.ts";
import { finalSample } from "../test/support/report-samples.ts";
import { inspectPdf } from "../test/support/pdf-inspect.ts";
const directory = new URL("../../../.tmp/pdf-resources/", import.meta.url);
await mkdir(directory, { recursive: true });
const observations: object[] = [];
const base = finalSample();
for (const language of ["de", "en"] as const) {
  const check = structuredClone(base);
  check.references = Array.from({ length: 1000 }, (_, i) => ({
    ...structuredClone(base.references[i % base.references.length]!),
    slot: i + 1,
  }));
  const input = {
    check,
    language,
    style: "apa" as const,
    documentName: "Synthetic 1000-reference resource sample",
    capturedAt: "2026-11-11T04:30:00.000Z",
  };
  const start = performance.now();
  const pdf = await generateReport(input);
  const generatedMs = Math.round(performance.now() - start);
  const maxRssBeforeInspectionKiB = process.resourceUsage().maxRSS;
  const inspected = await inspectPdf(pdf);
  if (
    !inspected.text.includes(
      language === "de" ? "Referenz 1000" : "Reference 1000",
    )
  )
    throw new Error("Missing final Reference");
  await writeFile(new URL(`report-1000-${language}.pdf`, directory), pdf);
  observations.push({
    language,
    references: 1000,
    pages: inspected.pageCount,
    bytes: pdf.byteLength,
    generatedMs,
    maxRssBeforeInspectionKiB,
    inputSha256: createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex"),
    pdfSha256: createHash("sha256").update(pdf).digest("hex"),
  });
}
// Deliberately adversarial renderer input; no partial PDF may escape on limits.
const oversized = structuredClone(base);
oversized.references = Array.from({ length: 1000 }, (_, i) => ({
  ...structuredClone(base.references[4]!),
  slot: i + 1,
  originalText:
    "Long original reference with preserved bibliographic evidence. ".repeat(
      1500,
    ),
}));
const start = performance.now();
try {
  await generateReport({
    check: oversized,
    language: "en",
    style: "apa",
    capturedAt: "2026-11-11T04:30:00.000Z",
  });
  throw new Error("An oversized report unexpectedly produced a file");
} catch (error) {
  if (!(error instanceof ReportFailed) || error.failure !== "limit-exceeded")
    throw error;
  observations.push({
    references: 1000,
    charactersPerReference: oversized.references[0]!.originalText.length,
    failure: error.failure,
    elapsedMs: Math.round(performance.now() - start),
  });
}
const evidence = {
  provenance: "synthetic-local-observation",
  node: process.version,
  platform: process.platform,
  architecture: process.arch,
  limits: reportLimits,
  observations,
  limitation:
    "Process high-water RSS includes earlier samples and independent PDF inspection; it is not an isolated renderer heap measurement or a deployment concurrency qualification.",
};
await writeFile(
  new URL("observations.json", directory),
  JSON.stringify(evidence, null, 2) + "\n",
);
console.log(JSON.stringify(evidence, null, 2));
