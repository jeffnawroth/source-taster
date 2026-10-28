// SPDX-License-Identifier: AGPL-3.0-or-later
// No environment setting, synthetic test or receipt can promote this profile.
// #94 must supply the real exact-configuration calibration/measurement gate.
console.error(
  "Release refused: DOI tracer rules are uncalibrated. ADR-0006/0025 and #94 qualification are required.",
);
process.exit(78);
