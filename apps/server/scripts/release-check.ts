// SPDX-License-Identifier: AGPL-3.0-or-later
// Release guard (#94, ADR-0006/0025). No environment setting, synthetic test
// or receipt can promote a build: the code version and the Scoring rules
// calibration come from the code, and the Quality gate is recomputed from the
// private measurement log for exactly this code version. The fifty-Check replay
// of the same configuration (#117, ADR-0007) is required on every release and
// is recomputed from its private report. Exit 78 refuses.
import { scoringRulesCalibration } from "../src/checks/scoring-calibration.ts";
import { codeVersion } from "./quality/code-version.ts";
import { checkRelease } from "./quality/release.ts";
import {
  loadExtraction,
  resolveConfiguration,
  readConfigurationFile,
} from "./quality/configuration.ts";

let expected;
let configurationDigest: string | undefined;
try {
  const file = process.env.SOURCE_TASTER_QUALITY_CONFIGURATION;
  if (file) {
    configurationDigest = (await readConfigurationFile(file)).digest;
    const extraction = process.env.SOURCE_TASTER_QUALITY_EXTRACTION
      ? await loadExtraction(process.env.SOURCE_TASTER_QUALITY_EXTRACTION)
      : undefined;
    expected = {
      extractionCodeDigest: extraction?.codeDigest,
      configuration: await resolveConfiguration(
        file,
        extraction?.model ?? null,
        extraction?.configuration ?? null,
      ),
      aiModel: extraction?.model ?? null,
      aiConfiguration: extraction?.configuration ?? null,
    };
  }
} catch (error) {
  console.error(
    `Release refused: invalid Measured configuration: ${(error as Error).message}`,
  );
  process.exit(78);
}

const result = await checkRelease({
  root: process.env.SOURCE_TASTER_QUALITY_ROOT || undefined,
  loadReport: process.env.SOURCE_TASTER_LOAD_REPORT || undefined,
  code: codeVersion(),
  runtimeCalibration: scoringRulesCalibration,
  expected,
  configurationDigest,
});
if (!result.releasable) {
  console.error(
    [
      "Release refused: no eligible Measured configuration (ADR-0006/0025, #94).",
      ...result.reasons.map((reason) => `- ${reason}`),
    ].join("\n"),
  );
  process.exit(78);
}
console.log(
  "Release check passed: an eligible measurement exists for this code version.",
);
