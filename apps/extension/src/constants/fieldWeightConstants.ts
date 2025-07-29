/**
 * Centralized field definitions for weight configuration
 * This ensures consistency between FieldWeightsSettings.vue and FieldWeightsPanels.vue
 */

// Field groups for weight calculations
export const FIELD_GROUPS = {
  core: ['title', 'authors', 'year'],
  identifier: ['doi', 'arxivId', 'pmid', 'pmcid', 'isbn', 'issn'],
  source: ['containerTitle', 'volume', 'issue', 'pages', 'publisher', 'url'],
  additional: ['sourceType', 'conference', 'institution', 'edition', 'articleNumber', 'subtitle'],
} as const

// Field definitions for UI rendering
export const FIELD_DEFINITIONS = {
  core: [
    { key: 'title', labelKey: 'title', descriptionKey: 'field-description-title', defaultValue: 25 },
    { key: 'authors', labelKey: 'authors', descriptionKey: 'field-description-authors', defaultValue: 20 },
    { key: 'year', labelKey: 'year', descriptionKey: 'field-description-year', defaultValue: 5 },
  ],
  identifier: [
    { key: 'doi', label: 'DOI', descriptionKey: 'field-description-doi', defaultValue: 15 },
    { key: 'arxivId', label: 'ArXiv ID', descriptionKey: 'field-description-arxivId', defaultValue: 8 },
    { key: 'pmid', label: 'PMID', descriptionKey: 'field-description-pmid', defaultValue: 3 },
    { key: 'pmcid', label: 'PMC ID', descriptionKey: 'field-description-pmcid', defaultValue: 2 },
    { key: 'isbn', label: 'ISBN', descriptionKey: 'field-description-isbn', defaultValue: 1 },
    { key: 'issn', label: 'ISSN', descriptionKey: 'field-description-issn', defaultValue: 1 },
  ],
  source: [
    { key: 'containerTitle', labelKey: 'container-title', descriptionKey: 'field-description-containerTitle', defaultValue: 10 },
    { key: 'volume', labelKey: 'volume', descriptionKey: 'field-description-volume', defaultValue: 5 },
    { key: 'issue', labelKey: 'issue', descriptionKey: 'field-description-issue', defaultValue: 3 },
    { key: 'pages', labelKey: 'pages', descriptionKey: 'field-description-pages', defaultValue: 2 },
    { key: 'publisher', labelKey: 'publisher', descriptionKey: 'field-description-publisher', defaultValue: 3 },
    { key: 'url', label: 'URL', descriptionKey: 'field-description-url', defaultValue: 2 },
  ],
  additional: {
    main: [
      { key: 'sourceType', labelKey: 'source-type', descriptionKey: 'field-description-sourceType', defaultValue: 2 },
      { key: 'conference', labelKey: 'conference', descriptionKey: 'field-description-conference', defaultValue: 5 },
      { key: 'subtitle', labelKey: 'subtitle', descriptionKey: 'field-description-subtitle', defaultValue: 3 },
    ],
    advanced: [
      { key: 'institution', labelKey: 'institution', descriptionKey: 'field-description-institution', defaultValue: 3 },
      { key: 'edition', labelKey: 'edition', descriptionKey: 'field-description-edition', defaultValue: 2 },
      { key: 'articleNumber', labelKey: 'article-number', descriptionKey: 'field-description-articleNumber', defaultValue: 1 },
    ],
  },
} as const

// Type definitions
export interface FieldDefinition {
  readonly key: string
  readonly label?: string
  readonly labelKey?: string
  readonly descriptionKey: string
  readonly defaultValue: number
}
