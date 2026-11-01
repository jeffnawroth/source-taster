// SPDX-License-Identifier: AGPL-3.0-or-later
// Reuse #94's exact-configuration release guard. Loading an eligible adapter is
// not qualification; the uncalibrated runtime still refuses activation (#114).
import { isDeepStrictEqual } from "node:util";
import {
  loadExtraction,
  resolveConfiguration,
} from "../quality/configuration.ts";
import { codeVersion } from "../quality/code-version.ts";
import { checkRelease } from "../quality/release.ts";
import { qualifiedAi } from "../quality/extraction.ts";
import { scoringRulesCalibration } from "../checks/scoring-calibration.ts";
import type { ExtractionPort } from "./port.ts";
export async function activeExtraction(): Promise<ExtractionPort | undefined> {
  const module = process.env.SOURCE_TASTER_AI_EXTRACTION;
  if (!module) return undefined;
  try {
    const port = await loadExtraction(module);
    if (!port.extractSpans || !qualifiedAi(port.model, port.configuration))
      return undefined;
    const file = process.env.SOURCE_TASTER_QUALITY_CONFIGURATION;
    const measuredModule = process.env.SOURCE_TASTER_QUALITY_EXTRACTION;
    if (!file || !measuredModule) return undefined;
    const measured = await loadExtraction(measuredModule);
    if (
      measured.model !== port.model ||
      !isDeepStrictEqual(measured.configuration, port.configuration)
    )
      return undefined;
    const release = await checkRelease({
      root: process.env.SOURCE_TASTER_QUALITY_ROOT,
      code: codeVersion(),
      runtimeCalibration: scoringRulesCalibration,
      expected: {
        configuration: await resolveConfiguration(
          file,
          port.model,
          port.configuration,
        ),
        aiModel: port.model,
        aiConfiguration: port.configuration ?? null,
      },
    });
    if (!release.releasable) return undefined;
    await port.warmup?.();
    return port;
  } catch {
    // Fixed diagnostic only; private paths and adapter/provider errors can
    // contain content or secrets. Users receive configuration-unavailable.
    console.error(JSON.stringify({ code: "ai-configuration-unavailable" }));
    return undefined;
  }
}
