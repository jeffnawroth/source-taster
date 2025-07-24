import type { ProcessingRuleDefinition, ProcessingStrategy } from './processing-strategy.types'
import { ProcessingActionType, ProcessingMode, ProcessingRuleCategory } from './processing-strategy.types'
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
    category: ProcessingRuleCategory.TEXT_PROCESSING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Correct obvious typos and misspellings, including common spelling errors, transposed letters, and missing letters.',
      example: '"Jouranl" → "Journal", "artficial" → "artificial", "inteligence" → "intelligence", "medecine" → "medicine"',
    },
  },
] as const

// Hilfsfunktionen
export function getDefaultRulesForMode(mode: ProcessingMode): ProcessingRuleDefinition[] {
  return PROCESSING_RULES
    .filter(rule => rule.supportedModes.includes(mode))
}

// Vordefinierte Regelsets
export const STRICT_PROCESSING_RULES = getDefaultRulesForMode(ProcessingMode.STRICT)
export const BALANCED_PROCESSING_RULES = getDefaultRulesForMode(ProcessingMode.BALANCED)
export const TOLERANT_PROCESSING_RULES = getDefaultRulesForMode(ProcessingMode.TOLERANT)

export const DEFAULT_PROCESSING_STRATEGY: ProcessingStrategy = {
  mode: DEFAULT_PROCESSING_MODE,
  rules: BALANCED_PROCESSING_RULES,
}
