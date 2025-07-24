import type { ProcessingRuleDefinition, ProcessingStrategy } from './processing-strategy.types'
import { ProcessingActionType, ProcessingMode } from './processing-strategy.types'
/**
 * Default processing mode
 */
export const DEFAULT_PROCESSING_MODE: ProcessingMode = ProcessingMode.BALANCED

/**
 * Default processing rules for each extraction mode
 * These rules define how the AI should handle various aspects of metadata extraction
 */

// Zentrale Regeldefinition
export const PROCESSING_RULES: ProcessingRuleDefinition[] = [
  {
    id: 'correctTypos',
    actionType: ProcessingActionType.TYPO_CORRECTION,
    category: 'text-processing',
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Correct obvious typos and misspellings, including common spelling errors, transposed letters, and missing letters.',
      example: '"Jouranl" → "Journal", "artficial" → "artificial", "inteligence" → "intelligence", "medecine" → "medicine"',
    },
  },
] as const

export const DEFAULT_PROCESSING_STRATEGY: ProcessingStrategy = {
  mode: DEFAULT_PROCESSING_MODE,
  rules: PROCESSING_RULES,
}
