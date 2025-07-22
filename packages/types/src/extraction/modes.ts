/**
 * Extraction modes and custom settings configuration
 */

/**
 * Extraction mode types for AI processing
 */
export enum ModificationMode {
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
 * Default modification mode
 */
export const DEFAULT_MODIFICATION_MODE: ModificationMode = ModificationMode.BALANCED

/**
 * Custom modification configuration for user-defined extraction rules
 * Allows users to build their own extraction behavior by selecting specific options
 */
export interface ModificationOptions {
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
 * Default settings for strict extraction mode
 */
export const STRICT_MODIFICATIONS: ModificationOptions = {
  correctTypos: false,
  normalizeCapitalization: false,
  standardizeAbbreviations: false,
  standardizePunctuation: false,
  formatAuthorNames: false,
  removeDuplicateAuthors: false,
  standardizeDateFormatting: false,
  standardizeIdentifiers: false,
  addDerivableFields: false,
  interpretIncompleteInfo: false,
  recognizeSourceTypes: false,
  convertToTitleCase: false,
  fixUnicodeIssues: false,
  handleOcrErrors: false,
  reconstructSeparatedInfo: false,
  completeIncompleteData: false,
  fixFormattingProblems: false,
}

/**
 * Default settings for balanced extraction mode
 */
export const BALANCED_MODIFICATIONS: ModificationOptions = {
  correctTypos: true,
  normalizeCapitalization: true,
  standardizeAbbreviations: true,
  standardizePunctuation: true,
  formatAuthorNames: true,
  removeDuplicateAuthors: true,
  standardizeDateFormatting: true,
  standardizeIdentifiers: true,
  addDerivableFields: false,
  interpretIncompleteInfo: false,
  recognizeSourceTypes: true,
  convertToTitleCase: true,
  fixUnicodeIssues: true,
  handleOcrErrors: false,
  reconstructSeparatedInfo: false,
  completeIncompleteData: false,
  fixFormattingProblems: true,
}

/**
 * Default settings for tolerant extraction mode
 */
export const TOLERANT_MODIFICATIONS: ModificationOptions = {
  correctTypos: true,
  normalizeCapitalization: true,
  standardizeAbbreviations: true,
  standardizePunctuation: true,
  formatAuthorNames: true,
  removeDuplicateAuthors: true,
  standardizeDateFormatting: true,
  standardizeIdentifiers: true,
  addDerivableFields: true,
  interpretIncompleteInfo: true,
  recognizeSourceTypes: true,
  convertToTitleCase: true,
  fixUnicodeIssues: true,
  handleOcrErrors: true,
  reconstructSeparatedInfo: true,
  completeIncompleteData: true,
  fixFormattingProblems: true,
}

/**
 * Types of modifications that can be applied during extraction
 */
export enum ModificationType {
  TYPO_CORRECTION = 'typo-correction',
  CAPITALIZATION = 'capitalization',
  ABBREVIATION_EXPANSION = 'abbreviation-expansion',
  PUNCTUATION_STANDARDIZATION = 'punctuation-standardization',
  FORMAT_STANDARDIZATION = 'format-standardization',
  DERIVATION = 'derivation',
  INTERPRETATION = 'interpretation',
  AUTHOR_NAME_FORMATTING = 'author-name-formatting',
  DATE_FORMATTING = 'date-formatting',
  IDENTIFIER_STANDARDIZATION = 'identifier-standardization',
  UNICODE_FIXING = 'unicode-fixing',
  OCR_ERROR_CORRECTION = 'ocr-error-correction',
  TITLE_CASE_CONVERSION = 'title-case-conversion',
  DUPLICATE_REMOVAL = 'duplicate-removal',
  FIELD_DERIVATION = 'field-derivation',
  INFORMATION_RECONSTRUCTION = 'information-reconstruction',
  FORMATTING_CORRECTION = 'formatting-correction',
}

/**
 * Information about changes made during extraction
 */
export interface FieldModification {
  /** The field path that was modified (e.g., "metadata.title", "metadata.source.containerTitle") */
  fieldPath: string
  /** The original value before extraction */
  originalValue: string
  /** The extracted/corrected value */
  extractedValue: string
  /** Type of modification applied */
  modificationType: ModificationType
}
