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
 * Custom modification configuration for user-defined extraction rules
 * Allows users to build their own extraction behavior by selecting specific options
 */
export interface ProcessingRules {
  /** Enable typo correction (e.g., "Jouranl" → "Journal") */
  correctTypos: boolean
  /** Normalize capitalization for standards */
  normalizeCapitalization: boolean
  /** Standardize common abbreviations (e.g., "J." → "Journal") */
  standardizeAbbreviations: boolean
  /** Clean up and standardize punctuation */
  standardizePunctuation: boolean
  /** Format author names consistently */
  formatAuthorNames: boolean
  /** Remove duplicate authors */
  removeDuplicateAuthors: boolean
  /** Standardize date formatting */
  standardizeDateFormatting: boolean
  /** Validate and standardize identifier formats (DOI/ISSN/etc.) */
  standardizeIdentifiers: boolean
  /** Add missing, clearly derivable fields */
  addDerivableFields: boolean
  /** Interpret incomplete or abbreviated information */
  interpretIncompleteInfo: boolean
  /** Recognize and standardize source types */
  recognizeSourceTypes: boolean
  /** Convert titles to appropriate Title Case */
  convertToTitleCase: boolean
  /** Fix Unicode and encoding issues */
  fixUnicodeIssues: boolean
  /** Handle OCR errors and copy-paste artifacts */
  handleOcrErrors: boolean
  /** Reconstruct information separated by line breaks */
  reconstructSeparatedInfo: boolean
  /** Complete obviously incomplete data */
  completeIncompleteData: boolean
  /** Fix common formatting problems */
  fixFormattingProblems: boolean
}

/**
 * Defines how extracted metadata should be processed
 */
export interface ProcessingStrategy {
  mode: ProcessingMode
  rules: ProcessingRules
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
  /** Confidence level of the processing action (0-1) */
  confidence?: number
}
