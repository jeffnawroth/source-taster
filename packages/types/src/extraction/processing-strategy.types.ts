/**
 * Extraction modes and custom settings configuration
 */

import z from 'zod'

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

export const FieldProcessingResultSchema = z.object({
  fieldPath: z.string().describe('The field path that was processed (e.g., "metadata.title", "metadata.source.containerTitle")'),
  originalValue: z.string().describe('The original value before processing'),
  processedValue: z.string().describe('The value after processing'),
  actionTypes: z.array(z.nativeEnum(ProcessingActionType)).describe('Type of processing actions applied'),
})

export type FieldProcessingResult = z.infer<typeof FieldProcessingResultSchema>
