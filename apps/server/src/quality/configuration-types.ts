// SPDX-License-Identifier: AGPL-3.0-or-later
export const optionalSources = [
  "url",
  "internetarchive",
  "openalex",
  "europepmc",
  "semanticscholar",
  "arxiv",
  "openlibrary",
  "googlebooks",
] as const;
export type OptionalSource = (typeof optionalSources)[number];
/** The operator-chosen part of a Measured configuration. */
export interface GateConfiguration {
  enabledSources: OptionalSource[];
  /** ADR-0025 free comparison parameters (SOURCE_TASTER_COMPARISON_PARAMETERS). */
  comparisonParameters?: Record<string, number>;
  /** ADR-0007 search operating settings snapshot. */
  searchSettings?: Record<string, unknown>;
  /** The ADR-0025 calibration record whose selected values are measured. */
  calibration?: { record: string; selected: Record<string, number> };
}
