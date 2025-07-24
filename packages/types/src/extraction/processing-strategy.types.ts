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
  category: string
  supportedModes: ProcessingMode[]
  aiInstruction: {
    prompt: string
    example: string
  }
}

/**
 * Types of processing actions applied during extraction
 * Represents specific transformations/enhancements performed on extracted data
 */
export enum ProcessingActionType {
  TYPO_CORRECTION = 'typo-correction',
  CAPITALIZATION_STANDARDIZATION = 'capitalization-standardization',
  ABBREVIATION_EXPANSION = 'abbreviation-expansion',
  PUNCTUATION_STANDARDIZATION = 'punctuation-standardization',
  FORMAT_STANDARDIZATION = 'format-standardization',
  FIELD_DERIVATION = 'field-derivation',
  CONTEXTUAL_INTERPRETATION = 'contextual-interpretation',
  AUTHOR_NAME_FORMATTING = 'author-name-formatting',
  DATE_FORMATTING = 'date-formatting',
  IDENTIFIER_STANDARDIZATION = 'identifier-standardization',
  UNICODE_NORMALIZATION = 'unicode-normalization',
  OCR_ERROR_CORRECTION = 'ocr-error-correction',
  TITLE_CASE_CONVERSION = 'title-case-conversion',
  DUPLICATE_REMOVAL = 'duplicate-removal',
  INFORMATION_RECONSTRUCTION = 'information-reconstruction',
  FORMATTING_CORRECTION = 'formatting-correction',
  DATA_COMPLETION = 'data-completion',
  SOURCE_TYPE_INFERENCE = 'source-type-inference',
}

/**
 * Record of a processing action applied to a specific field
 */
export interface FieldProcessingResult {
  /** The field path that was processed (e.g., "metadata.title", "metadata.source.containerTitle") */
  fieldPath: string
  /** The original value before processing */
  originalValue: string
  /** The value after processing */
  processedValue: string
  /** Type of processing action applied */
  actionType: ProcessingActionType
}
