/**
 * Type definitions for field categorization and metadata
 */

import type { CSLVariable } from '@source-taster/types'

// Field categories for organizing metadata fields
export enum FieldCategory {
  ESSENTIAL = 'essential',
  CORE = 'core',
  IDENTIFIER = 'identifier',
  DATE = 'date',
  PUBLICATION = 'publication',
  ACADEMIC = 'academic',
  TECHNICAL = 'technical',
}

// Central category definition for consistent use across components
export interface FieldCategoryDefinition {
  readonly key: FieldCategory
  readonly fields: readonly CSLVariable[]
  readonly labelKey: string
  readonly descriptionKey: string
  readonly icon: string
}

// Field metadata for UI display and configuration
export interface FieldMetadata {
  readonly field: CSLVariable
  readonly categories: readonly FieldCategory[]
  readonly labelKey: string
  readonly descriptionKey: string
  readonly defaultWeight: number
}
