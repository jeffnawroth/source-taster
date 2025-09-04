/**
 * Centralized field definitions for weight configuration
 * Automatically derived from CSL Schema for consistency
 */

import type { CSLVariable } from '@source-taster/types'
import { CSLVariableSchema } from '@source-taster/types'

// Default weight values for different field types
const DEFAULT_WEIGHTS: Partial<Record<CSLVariable, number>> = {
  // Core identification fields
  'title': 25,
  'author': 20,
  'issued': 5,

  // Strong identifiers
  'DOI': 15,

  // Medium identifiers
  'PMID': 8,
  'PMCID': 3,
  'ISBN': 2,
  'ISSN': 2,

  // Publication details
  'container-title': 10,
  'volume': 5,
  'event-title': 5, // Conference title in CSL
  'publisher': 3,
  'issue': 3,
  'page': 2,
  'URL': 2,

  // Other important fields
  'abstract': 1,
  'genre': 1, // Source type equivalent
  'event': 3, // Conference/event name
}

// Generate field definitions from CSL schema
export const FIELD_DEFINITIONS: readonly FieldDefinition[] = CSLVariableSchema.options
  .filter((variable: CSLVariable) => variable !== 'id') // Exclude technical 'id' field
  .sort() // Alphabetical order
  .map((variable: CSLVariable): FieldDefinition => ({
    key: variable,
    labelKey: variable,
    descriptionKey: `field-description-${variable}`,
    defaultValue: DEFAULT_WEIGHTS[variable as keyof typeof DEFAULT_WEIGHTS] || 0,
  }))

// Type definitions
export interface FieldDefinition {
  readonly key: string
  readonly labelKey: string
  readonly descriptionKey: string
  readonly defaultValue: number
}
