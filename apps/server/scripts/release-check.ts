// SPDX-License-Identifier: AGPL-3.0-or-later
// Release guard (#94, ADR-0006/0025). No environment setting, synthetic test
// or receipt can promote a build: the code version and the Scoring rules
// calibration come from the code, and the Quality gate is recomputed from the
// private measurement log for exactly this code version. Exit 78 refuses.
import { scoringRulesCalibration } from "../src/checks/scoring-calibration.ts";
import { codeVersion } from "./quality/code-version.ts";
import { checkRelease } from "./quality/release.ts";

const result = await checkRelease({
  root: process.env.SOURCE_TASTER_QUALITY_ROOT || undefined,
  code: codeVersion(),
  runtimeCalibration: scoringRulesCalibration,
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
console.log("Release check passed: an eligible measurement exists for this code version.");
