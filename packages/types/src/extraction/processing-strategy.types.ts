/**
 * Extraction modes and custom settings configuration
 */

/**
 * Extraction mode types for AI processing
 */
export enum ProcessingMode {
  /** Strict mode: 1:1 extraction without any corrections or interpretations */
  STRICT = 'strict',
  /** Balanced mode: Fix formatting/typos but maintain content accuracy */
  BALANCED = 'balanced',
  /** Tolerant mode: Extract even from incomplete/erroneous sources with intelligent inference */
  TOLERANT = 'tolerant',
  /** Custom mode: User-defined extraction rules and preferences */
  CUSTOM = 'custom',
}
/**
 * Defines how extracted metadata should be processed
 */
export interface ProcessingStrategy {
  mode: ProcessingMode
  rules: ProcessingRuleDefinition[]
}

export interface ProcessingRuleDefinition {
  id: string
  actionType: ProcessingActionType
  category: ProcessingRuleCategory
  supportedModes: ProcessingMode[]
  aiInstruction: {
    prompt: string
    example: string
  }
}

export enum ProcessingRuleCategory {
  TEXT_PROCESSING = 'text-processing',
  CONTENT_FORMATTING = 'content-formatting',
  TECHNICAL_PROCESSING = 'technical-processing',

}

export enum ProcessingActionType {
  TYPO_CORRECTION = 'typo-correction',
  NORMALIZE_TITLE_CASE = 'normalize-title-case',
  EXPAND_ABBREVIATIONS = 'expand-abbreviations',
  STANDARDIZE_PUNCTUATION = 'standardize-punctuation',
  FORMAT_AUTHOR_NAMES = 'format-author-names',
  STANDARDIZE_DATE_FORMAT = 'standardize-date-format',
  STANDARDIZE_IDENTIFIERS = 'standardize-identifiers',
  FIX_ENCODING_ISSUES = 'fix-encoding-issues',
  REPAIR_LINE_BREAKS = 'repair-line-breaks',
  REMOVE_ARTIFACTS = 'remove-artifacts',
}
