import type { ProcessingMode, ProcessingRuleDefinition, ProcessingStrategy } from './processing-strategy.types'
import { Mode } from '../common/mode'
import { ProcessingActionType, ProcessingRuleCategory } from './processing-strategy.types'
/**
 * Default processing mode
 */
export const DEFAULT_PROCESSING_MODE: ProcessingMode = Mode.BALANCED

/**
 * Default processing rules for each extraction mode
 * These rules define how the AI should handle various aspects of metadata extraction
 */

export const PROCESSING_RULES: ProcessingRuleDefinition[] = [
  {
    actionType: ProcessingActionType.NORMALIZE_SPELLING,
    aiInstruction: {
      prompt: 'Correct obvious typos and misspellings, including common spelling errors, transposed letters, and missing letters.',
      example: '"Jouranl" → "Journal", "artficial" → "artificial", "inteligence" → "intelligence", "medecine" → "medicine"',
    },
  },
  {
    actionType: ProcessingActionType.NORMALIZE_TYPOGRAPHY,
    aiInstruction: {
      prompt: 'Fix common encoding issues such as smart quotes, em dashes, and other non-standard characters.',
      example: '"“Smart quotes”" → "Smart quotes", "—em dash" → "-", "…ellipsis" → "...", "â€" → "–"',
    },
  },
  {
    actionType: ProcessingActionType.NORMALIZE_TITLE_CASE,
    aiInstruction: {
      prompt: 'Normalize capitalization of titles, names, and other text to standard formats (Title Case).',
      example: '"the quick brown fox" → "The Quick Brown Fox", "john smith" → "John Smith", "a study on AI" → "A Study on AI"',
    },
  },
  {
    actionType: ProcessingActionType.NORMALIZE_ABBREVIATIONS,
    aiInstruction: {
      prompt: 'Expand common abbreviations.',
      example: '"J." → "Journal", "Vol." → "Volume"',
    },
  },
  {
    actionType: ProcessingActionType.NORMALIZE_AUTHOR_NAMES,
    aiInstruction: {
      prompt: 'Format author names to a consistent style',
      example: '"John Smith" → "Smith, John", "Mary Jane Doe" → "Doe, Mary Jane"',
    },
  },
  {
    actionType: ProcessingActionType.NORMALIZE_DATE_FORMAT,
    aiInstruction: {
      prompt: 'Standardize date formats to ISO 8601 (YYYY-MM-DD) or similar formats',
      example: '"January 1, 2020" → "2020-01-01", "2020/01/01" → "2020-01-01", "1st Jan 2020" → "2020-01-01"',
    },
  },
  {
    actionType: ProcessingActionType.NORMALIZE_IDENTIFIERS,
    aiInstruction: {
      prompt: 'Standardize external identifiers (DOI, ISBN, ISSN, PMID, PMCID, ARXIV) to a consistent format',
      example: '"https://doi.org/10.1000/xyz123" → "10.1000/xyz123"',
    },
  },
  {
    actionType: ProcessingActionType.NORMALIZE_CHARACTERS,
    aiInstruction: {
      prompt: 'Normalize corrupted or misencoded characters caused by encoding issues (e.g., UTF-8 artifacts). Replace them with their intended character equivalents.',
      example: '"GrÃ¼n" → "Grün"',
    },
  },
  {
    actionType: ProcessingActionType.NORMALIZE_WHITESPACE,
    aiInstruction: {
      prompt: 'Normalize whitespace by removing duplicated spaces, leading/trailing spaces, unnecessary tabs, and soft line breaks within inline text. Preserve paragraph breaks',
      example: '"This is a line.\n\nThis is another line." → "This is a line. This is another line.", "This    is a  test." → "This is a test."',
    },
  },
] as const

const BALANCED_ACTIONS = [
  ProcessingActionType.NORMALIZE_SPELLING,
  ProcessingActionType.NORMALIZE_TYPOGRAPHY,
  ProcessingActionType.NORMALIZE_TITLE_CASE,
  ProcessingActionType.NORMALIZE_ABBREVIATIONS,
  ProcessingActionType.NORMALIZE_AUTHOR_NAMES,
  ProcessingActionType.NORMALIZE_DATE_FORMAT,
  ProcessingActionType.NORMALIZE_IDENTIFIERS,
  ProcessingActionType.NORMALIZE_CHARACTERS,
  ProcessingActionType.NORMALIZE_WHITESPACE,
] as const

const TOLERANT_ACTIONS = [

] as const

export const MODE_PRESETS: Record<ProcessingMode, ProcessingActionType[]> = {
  strict: [],
  balanced: [...BALANCED_ACTIONS],
  tolerant: [...BALANCED_ACTIONS, ...TOLERANT_ACTIONS],
  custom: [],
} as const

export const DEFAULT_PROCESSING_STRATEGY: ProcessingStrategy = {
  mode: DEFAULT_PROCESSING_MODE,
  rules: getRulesForActionTypes(MODE_PRESETS[DEFAULT_PROCESSING_MODE]),
}

export const RULE_CATEGORY_MAPPING: Record<ProcessingRuleCategory, ProcessingActionType[]> = {
  [ProcessingRuleCategory.CONTENT_NORMALIZATION]: [
    ProcessingActionType.NORMALIZE_SPELLING,
    ProcessingActionType.NORMALIZE_TITLE_CASE,
    ProcessingActionType.NORMALIZE_ABBREVIATIONS,
    ProcessingActionType.NORMALIZE_TYPOGRAPHY,
  ],
  [ProcessingRuleCategory.STYLE_FORMATTING]: [
    ProcessingActionType.NORMALIZE_AUTHOR_NAMES,
    ProcessingActionType.NORMALIZE_DATE_FORMAT,
    ProcessingActionType.NORMALIZE_IDENTIFIERS,
  ],
  [ProcessingRuleCategory.TECHNICAL_PROCESSING]: [
    ProcessingActionType.NORMALIZE_CHARACTERS,
    ProcessingActionType.NORMALIZE_WHITESPACE,
  ],
} as const

// Helper function to get action types by category
export function getActionTypesByCategory(category: ProcessingRuleCategory): ProcessingActionType[] {
  return RULE_CATEGORY_MAPPING[category] || []
}

export function getRulesForActionTypes(actionTypes: ProcessingActionType[]): ProcessingRuleDefinition[] {
  return PROCESSING_RULES.filter(rule => actionTypes.includes(rule.actionType))
}

export function getActionTypesFromRules(rules: ProcessingRuleDefinition[]): ProcessingActionType[] {
  return rules.map(rule => rule.actionType)
}
