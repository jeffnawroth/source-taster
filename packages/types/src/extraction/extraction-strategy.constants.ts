import { getActionTypesByCategory, getActionTypesFromRules, getRulesForActionTypes } from '../common'
import { createModePresets, type Mode } from '../common/mode'
import { type ExtractionActionType, type ExtractionRuleDefinition, type ExtractionStrategy, ProcessingRuleCategory } from './extraction-strategy.types'
/**
 * Default processing mode
 */
export const DEFAULT_PROCESSING_MODE: Mode = 'balanced'

/**
 * Default processing rules for each extraction mode
 * These rules define how the AI should handle various aspects of metadata extraction
 */

export const PROCESSING_RULES: ExtractionRuleDefinition[] = [
  {
    actionType: 'normalize-spelling',
    aiInstruction: {
      prompt: 'Correct obvious typos and misspellings, including common spelling errors, transposed letters, and missing letters.',
      example: '"Jouranl" → "Journal", "artficial" → "artificial", "inteligence" → "intelligence", "medecine" → "medicine"',
    },
  },
  {
    actionType: 'normalize-typography',
    aiInstruction: {
      prompt: 'Fix common encoding issues such as smart quotes, em dashes, and other non-standard characters.',
      example: '"“Smart quotes”" → "Smart quotes", "—em dash" → "-", "…ellipsis" → "...", "â€" → "–"',
    },
  },
  {
    actionType: 'normalize-title-case',
    aiInstruction: {
      prompt: 'Normalize capitalization of titles, names, and other text to standard formats (Title Case).',
      example: '"the quick brown fox" → "The Quick Brown Fox", "john smith" → "John Smith", "a study on AI" → "A Study on AI"',
    },
  },
  {
    actionType: 'normalize-abbreviations',
    aiInstruction: {
      prompt: 'Expand common abbreviations.',
      example: '"J." → "Journal", "Vol." → "Volume"',
    },
  },
  {
    actionType: 'normalize-author-names',
    aiInstruction: {
      prompt: 'Format author names to a consistent style',
      example: '"John Smith" → "Smith, John", "Mary Jane Doe" → "Doe, Mary Jane"',
    },
  },
  {
    actionType: 'normalize-date-format',
    aiInstruction: {
      prompt: 'Standardize date formats to ISO 8601 (YYYY-MM-DD) or similar formats',
      example: '"January 1, 2020" → "2020-01-01", "2020/01/01" → "2020-01-01", "1st Jan 2020" → "2020-01-01"',
    },
  },
  {
    actionType: 'normalize-identifiers',
    aiInstruction: {
      prompt: 'Standardize external identifiers (DOI, ISBN, ISSN, PMID, PMCID, ARXIV) to a consistent format',
      example: '"https://doi.org/10.1000/xyz123" → "10.1000/xyz123"',
    },
  },
  {
    actionType: 'normalize-characters',
    aiInstruction: {
      prompt: 'Normalize corrupted or misencoded characters caused by encoding issues (e.g., UTF-8 artifacts). Replace them with their intended character equivalents.',
      example: '"GrÃ¼n" → "Grün"',
    },
  },
  {
    actionType: 'normalize-whitespace',
    aiInstruction: {
      prompt: 'Normalize whitespace by removing duplicated spaces, leading/trailing spaces, unnecessary tabs, and soft line breaks within inline text. Preserve paragraph breaks',
      example: '"This is a line.\n\nThis is another line." → "This is a line. This is another line.", "This    is a  test." → "This is a test."',
    },
  },
] as const

const BALANCED_ACTIONS: ExtractionActionType[] = [
  'normalize-spelling',
  'normalize-typography',
  'normalize-title-case',
  'normalize-abbreviations',
  'normalize-author-names',
  'normalize-date-format',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
] as const

const TOLERANT_ACTIONS: ExtractionActionType[] = [

] as const

export const PROCESSING_MODE_PRESETS = createModePresets<ExtractionActionType>(
  BALANCED_ACTIONS,
  TOLERANT_ACTIONS,
)

export const DEFAULT_PROCESSING_STRATEGY: ExtractionStrategy = {
  mode: DEFAULT_PROCESSING_MODE,
  rules: getProcessingRulesForActionTypes(PROCESSING_MODE_PRESETS[DEFAULT_PROCESSING_MODE]),
}

export const RULE_CATEGORY_MAPPING: Record<ProcessingRuleCategory, ExtractionActionType[]> = {
  [ProcessingRuleCategory.CONTENT_NORMALIZATION]: [
    'normalize-spelling',
    'normalize-title-case',
    'normalize-abbreviations',
    'normalize-typography',
  ],
  [ProcessingRuleCategory.STYLE_FORMATTING]: [
    'normalize-author-names',
    'normalize-date-format',
    'normalize-identifiers',
  ],
  [ProcessingRuleCategory.TECHNICAL_PROCESSING]: [
    'normalize-characters',
    'normalize-whitespace',
  ],
} as const

// Helper function to get action types by category
export function getProcessingActionTypesByCategory(category: ProcessingRuleCategory): ExtractionActionType[] {
  return getActionTypesByCategory(RULE_CATEGORY_MAPPING, category)
}

export function getProcessingRulesForActionTypes(actionTypes: ExtractionActionType[]): ExtractionRuleDefinition[] {
  return getRulesForActionTypes(PROCESSING_RULES, actionTypes)
}

export function getProcessingActionTypesFromRules(rules: ExtractionRuleDefinition[]): ExtractionActionType[] {
  return getActionTypesFromRules(rules)
}
