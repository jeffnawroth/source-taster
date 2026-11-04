// SPDX-License-Identifier: AGPL-3.0-or-later
// One identity for execution and the configuration authority; never a client label.
import { createHash } from "node:crypto";
import {
  comparisonLimits,
  journalAbbreviationRules,
  type ComparisonProfile,
} from "@source-taster/core";
import { scoringRulesCalibration } from "./scoring-calibration.ts";
export function scoringRules(profile: ComparisonProfile) {
  return {
    version: `comparison-75-3-date-ranges-20261028-${journalAbbreviationRules.version}-entities-4.5.0-uncalibrated-${createHash(
      "sha256",
    )
      .update(
        JSON.stringify({
          parameters: profile,
          limits: comparisonLimits,
          journalAbbreviations: journalAbbreviationRules,
        }),
      )
      .digest(
        "hex",
      )}-unicode-${process.versions.unicode}-icu-${process.versions.icu}`,
    calibration: scoringRulesCalibration,
    unicode: process.versions.unicode!,
    icu: process.versions.icu!,
    profile: { ...profile },
  } as const;
}
