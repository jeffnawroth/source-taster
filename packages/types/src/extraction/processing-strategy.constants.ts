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
    actionType: ProcessingActionType.TYPO_CORRECTION,
    aiInstruction: {
      prompt: 'Correct obvious typos and misspellings, including common spelling errors, transposed letters, and missing letters.',
      example: '"Jouranl" → "Journal", "artficial" → "artificial", "inteligence" → "intelligence", "medecine" → "medicine"',
    },
  },
  {
    actionType: ProcessingActionType.NORMALIZE_TITLE_CASE,
    aiInstruction: {
      prompt: 'ONLY normalize capitalization of titles and names. Change letter casing ONLY. Do NOT fix spelling errors, grammar, or change any words.',
      example: '"the quick brown fox" → "The Quick Brown Fox", "john smith" → "John Smith", "a study on AI" → "A Study on AI". Keep original spelling: "seevere" stays "Seevere", not "Severe"',
    },
  },
  {
    actionType: ProcessingActionType.EXPAND_ABBREVIATIONS,
    aiInstruction: {
      prompt: 'Expand common abbreviations.',
      example: '"J." → "Journal", "Vol." → "Volume"',
    },
  },
  {
    actionType: ProcessingActionType.STANDARDIZE_PUNCTUATION,
    aiInstruction: {
      prompt: 'Standardize punctuation usage, including spaces around punctuation, consistent use of commas and periods, and removal of unnecessary punctuation.',
      example: '"Title: A Study, on AI." → "Title: A Study on AI", "Author: John Smith, Ph.D." → "Author: John Smith, PhD"',
    },
  },
  {
    actionType: ProcessingActionType.FORMAT_AUTHOR_NAMES,
    aiInstruction: {
      prompt: 'Format author names to a consistent style',
      example: '"John Smith" → "Smith, John", "Mary Jane Doe" → "Doe, Mary Jane"',
    },
  },
  {
    actionType: ProcessingActionType.STANDARDIZE_DATE_FORMAT,
    aiInstruction: {
      prompt: 'Standardize date formats to ISO 8601 (YYYY-MM-DD) or similar formats',
      example: '"January 1, 2020" → "2020-01-01", "2020/01/01" → "2020-01-01", "1st Jan 2020" → "2020-01-01"',
    },
  },
  {
    actionType: ProcessingActionType.STANDARDIZE_IDENTIFIERS,
    aiInstruction: {
      prompt: 'Standardize external identifiers (DOI, ISBN, ISSN, PMID, PMCID, ARXIV) to a consistent format',
      example: '"https://doi.org/10.1000/xyz123" → "10.1000/xyz123", "978-3-16-148410-0" → "9783161484100", "ISSN 1234-5678" → "12345678", "PMID 123456" → "123456", "PMCID PMC123456" → "PMC123456", "ARXIV 1234.5678" → "1234.5678"',
    },
  },
  {
    actionType: ProcessingActionType.FIX_ENCODING_ISSUES,
    aiInstruction: {
      prompt: 'Fix common encoding issues such as smart quotes, em dashes, and other non-standard characters.',
      example: '"“Smart quotes”" → "Smart quotes", "—em dash" → "-", "…ellipsis" → "...", "â€" → "–"',
    },
  },
  {
    actionType: ProcessingActionType.REPAIR_LINE_BREAKS,
    aiInstruction: {
      prompt: 'Repair line breaks and paragraph formatting to ensure proper text flow.',
      example: '"This is a line.\n\nThis is another line." → "This is a line. This is another line."',
    },
  },
  {
    actionType: ProcessingActionType.REMOVE_ARTIFACTS,
    aiInstruction: {
      prompt: 'Remove artifacts such as HTML tags, XML tags, and other non-text elements.',
      example: '"<p>This is a paragraph.</p>" → "This is a paragraph.", [1] → ""',
    },
  },
] as const

const BALANCED_ACTIONS = [
  ProcessingActionType.TYPO_CORRECTION,
  ProcessingActionType.FIX_ENCODING_ISSUES,
  ProcessingActionType.REMOVE_ARTIFACTS,
  ProcessingActionType.STANDARDIZE_IDENTIFIERS,
] as const

const TOLERANT_ACTIONS = [
  ProcessingActionType.NORMALIZE_TITLE_CASE,
  ProcessingActionType.EXPAND_ABBREVIATIONS,
  ProcessingActionType.STANDARDIZE_PUNCTUATION,
  ProcessingActionType.FORMAT_AUTHOR_NAMES,
  ProcessingActionType.STANDARDIZE_DATE_FORMAT,
  ProcessingActionType.REPAIR_LINE_BREAKS,
] as const

export const MODE_PRESETS: Record<ProcessingMode, ProcessingActionType[]> = {
  strict: [],
  balanced: [...BALANCED_ACTIONS],
  tolerant: [...BALANCED_ACTIONS, ...TOLERANT_ACTIONS],
  custom: [],
} as const

export function getRulesForActionTypes(actionTypes: ProcessingActionType[]): ProcessingRuleDefinition[] {
  return PROCESSING_RULES.filter(rule => actionTypes.includes(rule.actionType))
}

export function getActionTypesFromRules(rules: ProcessingRuleDefinition[]): ProcessingActionType[] {
  return rules.map(rule => rule.actionType)
}

export const DEFAULT_PROCESSING_STRATEGY: ProcessingStrategy = {
  mode: DEFAULT_PROCESSING_MODE,
  rules: getRulesForActionTypes(MODE_PRESETS[DEFAULT_PROCESSING_MODE]),
}

export const categoryMapping: Record<ProcessingRuleCategory, ProcessingActionType[]> = {
  [ProcessingRuleCategory.TEXT_PROCESSING]: [
    ProcessingActionType.TYPO_CORRECTION,
    ProcessingActionType.NORMALIZE_TITLE_CASE,
    ProcessingActionType.EXPAND_ABBREVIATIONS,
    ProcessingActionType.STANDARDIZE_PUNCTUATION,
  ],
  [ProcessingRuleCategory.CONTENT_FORMATTING]: [
    ProcessingActionType.FORMAT_AUTHOR_NAMES,
    ProcessingActionType.STANDARDIZE_DATE_FORMAT,
    ProcessingActionType.STANDARDIZE_IDENTIFIERS,
  ],
  [ProcessingRuleCategory.TECHNICAL_PROCESSING]: [
    ProcessingActionType.FIX_ENCODING_ISSUES,
    ProcessingActionType.REPAIR_LINE_BREAKS,
    ProcessingActionType.REMOVE_ARTIFACTS,
  ],
}

// Helper function to get action types by category
export function getActionTypesByCategory(category: ProcessingRuleCategory): ProcessingActionType[] {
  return categoryMapping[category] || []
}
