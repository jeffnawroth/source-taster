/**
 * Centralized field definitions for weight configuration
 * Automatically derived from CSL Schema for consistency
 */

import type { CSLVariable } from '@source-taster/types'
import { CSLVariableSchema } from '@source-taster/types'
import { DEFAULT_FIELDS_CONFIG } from './defaults/defaultFieldConfig'

// Generate field definitions from CSL schema
export const FIELD_DEFINITIONS: readonly FieldDefinition[] = CSLVariableSchema.options
  .filter((variable: CSLVariable) => variable !== 'id') // Exclude technical 'id' field
  .sort() // Alphabetical order
  .map((variable: CSLVariable): FieldDefinition => ({
    key: variable,
    labelKey: variable,
    descriptionKey: `field-description-${variable}`,
    defaultValue: DEFAULT_FIELDS_CONFIG[variable as keyof typeof DEFAULT_FIELDS_CONFIG]?.weight || 0,
  }))

// Type definitions
export interface FieldDefinition {
  readonly key: string
  readonly labelKey: string
  readonly descriptionKey: string
  readonly defaultValue: number
}
