// SPDX-License-Identifier: AGPL-3.0-or-later
// What the running Scoring rules report about their ADR-0025 calibration.
// Development placeholders are "uncalibrated"; the release check reads this
// value from the code, never from a measurement log (#94). Calibrated values
// and their activation belong to #114.
export const scoringRulesCalibration = "uncalibrated" as const;
