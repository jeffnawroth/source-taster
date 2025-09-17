/**
 * Default field configurations for matching
 * Frontend-specific default weights and enabled states for reference metadata fields
 */

import type { FieldConfigurations } from '@source-taster/types'

// Default field configurations for matching
export const DEFAULT_FIELDS_CONFIG: FieldConfigurations = {
  'title': { enabled: true, weight: 25 },
  'author': { enabled: true, weight: 20 },
  'issued': { enabled: true, weight: 5 },
  'DOI': { enabled: true, weight: 15 },
  'arxivId': { enabled: true, weight: 8 },
  'PMID': { enabled: true, weight: 3 },
  'PMCID': { enabled: true, weight: 2 },
  'ISBN': { enabled: true, weight: 1 },
  'ISSN': { enabled: true, weight: 1 },
  'container-title': { enabled: true, weight: 10 },
  'volume': { enabled: true, weight: 5 },
  'issue': { enabled: true, weight: 3 },
  'page': { enabled: true, weight: 2 },
}
