/**
 * Centralized field definitions for weight configuration
 * Automatically derived from CSL Schema for consistency
 */

import type { CSLVariableWithoutId } from '@source-taster/types'
import { CSLVariableWithoutIdSchema, DEFAULT_UI_SETTINGS } from '@source-taster/types'

const DEFAULT_FIELDS_CONFIG = DEFAULT_UI_SETTINGS.matching.matchingConfig.fieldConfigurations

// Generate field definitions from CSL schema
export const FIELD_DEFINITIONS: readonly FieldDefinition[] = CSLVariableWithoutIdSchema.options
  .map((variable: CSLVariableWithoutId): FieldDefinition => ({
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
