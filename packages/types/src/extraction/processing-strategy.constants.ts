import type { ProcessingRules, ProcessingStrategy } from './processing-strategy.types'
import { ProcessingMode } from './processing-strategy.types'
/**
 * Default processing mode
 */
export const DEFAULT_PROCESSING_MODE: ProcessingMode = ProcessingMode.BALANCED

/**
 * Default settings for strict extraction mode
 */
export const STRICT_PROCESSING_RULES: ProcessingRules = {
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
export const BALANCED_PROCESSING_RULES: ProcessingRules = {
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
export const TOLERANT_PROCESSING_RULES: ProcessingRules = {
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
 * Default settings for custom extraction mode
 */
export const CUSTOM_PROCESSING_RULES: ProcessingRules = {
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

export const DEFAULT_PROCESSING_STRATEGY: ProcessingStrategy = {
  mode: DEFAULT_PROCESSING_MODE,
  rules: BALANCED_PROCESSING_RULES,
}

/**
 * Mapping of extraction modes to their default settings
 */
export const PROCESSING_MODE_DEFAULTS: Record<ProcessingMode, ProcessingRules> = {
  [ProcessingMode.STRICT]: STRICT_PROCESSING_RULES,
  [ProcessingMode.BALANCED]: BALANCED_PROCESSING_RULES,
  [ProcessingMode.TOLERANT]: TOLERANT_PROCESSING_RULES,
  [ProcessingMode.CUSTOM]: CUSTOM_PROCESSING_RULES,
}
