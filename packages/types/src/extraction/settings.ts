/**
 * Main extraction settings configuration
 * Combines extraction modes, custom options, and field selections
 */

import type { ModificationMode, ModificationOptions } from './modification'
import { ESSENTIAL_EXTRACTION_FIELDS, type ExtractionFields } from './fields'
import { BALANCED_MODIFICATIONS, DEFAULT_MODIFICATION_MODE } from './modification'

/**
 * User-configurable extraction settings
 * Controls both AI behavior and which metadata fields should be extracted
 */
export interface ExtractionSettings {
  modificationSettings: ModificationSettings // Instead of extractionMode + customSettings

  /** Which metadata fields to extract */
  enabledFields: ExtractionFields
}

export interface ModificationSettings {
  mode: ModificationMode // ← Enum/Union Type
  options: ModificationOptions // ← Die spezifischen Regeln
}

export const DEFAULT_MODIFICATION_SETTINGS: ModificationSettings = {
  mode: DEFAULT_MODIFICATION_MODE,
  options: BALANCED_MODIFICATIONS,
}

/**
 * Complete default extraction settings
 * Uses balanced mode with standard field selection
 */
export const DEFAULT_EXTRACTION_SETTINGS: ExtractionSettings = {
  modificationSettings: DEFAULT_MODIFICATION_SETTINGS,
  enabledFields: ESSENTIAL_EXTRACTION_FIELDS,
}
