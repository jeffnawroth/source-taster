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
    id: 'typo-correction',
    actionType: ProcessingActionType.TYPO_CORRECTION,
    category: ProcessingRuleCategory.TEXT_PROCESSING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Correct obvious typos and misspellings, including common spelling errors, transposed letters, and missing letters.',
      example: '"Jouranl" → "Journal", "artficial" → "artificial", "inteligence" → "intelligence", "medecine" → "medicine"',
    },
  },
  {
    id: 'convert-to-title-case',
    actionType: ProcessingActionType.NORMALIZE_TITLE_CASE,
    category: ProcessingRuleCategory.TEXT_PROCESSING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Normalize capitalization of titles, names, and other text to standard formats.',
      example: '"the quick brown fox" → "The Quick Brown Fox", "john smith" → "John Smith", "a study on AI" → "A Study on AI"',
    },
  },
  {
    id: 'standardize-abbreviations',
    actionType: ProcessingActionType.EXPAND_ABBREVIATIONS,
    category: ProcessingRuleCategory.TEXT_PROCESSING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Expand common abbreviations.',
      example: '"J." → "Journal", "Vol." → "Volume"',
    },
  },
  {
    id: 'standardize-punctuation',
    actionType: ProcessingActionType.STANDARDIZE_PUNCTUATION,
    category: ProcessingRuleCategory.TEXT_PROCESSING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Standardize punctuation usage, including spaces around punctuation, consistent use of commas and periods, and removal of unnecessary punctuation.',
      example: '"Title: A Study, on AI." → "Title: A Study on AI", "Author: John Smith, Ph.D." → "Author: John Smith, PhD"',
    },
  },
  {
    id: 'format-author-names',
    actionType: ProcessingActionType.FORMAT_AUTHOR_NAMES,
    category: ProcessingRuleCategory.CONTENT_FORMATTING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Format author names to a consistent style',
      example: '"John Smith" → "Smith, John", "Mary Jane Doe" → "Doe, Mary Jane"',
    },
  },
  {
    id: 'standardize-date-formatting',
    actionType: ProcessingActionType.STANDARDIZE_DATE_FORMAT,
    category: ProcessingRuleCategory.CONTENT_FORMATTING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Standardize date formats to ISO 8601 (YYYY-MM-DD) or similar formats',
      example: '"January 1, 2020" → "2020-01-01", "2020/01/01" → "2020-01-01", "1st Jan 2020" → "2020-01-01"',
    },
  },
  {
    id: 'standardize-identifiers',
    actionType: ProcessingActionType.STANDARDIZE_IDENTIFIERS,
    category: ProcessingRuleCategory.CONTENT_FORMATTING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Standardize external identifiers (DOI, ISBN, ISSN, PMID, PMCID, ARXIV) to a consistent format',
      example: '"https://doi.org/10.1000/xyz123" → "10.1000/xyz123", "978-3-16-148410-0" → "9783161484100", "ISSN 1234-5678" → "12345678", "PMID 123456" → "123456", "PMCID PMC123456" → "PMC123456", "ARXIV 1234.5678" → "1234.5678"',
    },
  },
  {
    id: 'fix-encoding-issues',
    actionType: ProcessingActionType.FIX_ENCODING_ISSUES,
    category: ProcessingRuleCategory.TECHNICAL_PROCESSING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Fix common encoding issues such as smart quotes, em dashes, and other non-standard characters.',
      example: '"“Smart quotes”" → "Smart quotes", "—em dash" → "-", "…ellipsis" → "...", "â€" → "–"',
    },
  },
  {
    id: 'reconstruct-separated-info',
    actionType: ProcessingActionType.REPAIR_LINE_BREAKS,
    category: ProcessingRuleCategory.TECHNICAL_PROCESSING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Repair line breaks and paragraph formatting to ensure proper text flow.',
      example: '"This is a line.\n\nThis is another line." → "This is a line. This is another line."',
    },
  },
  {
    id: 'remove-artifacts',
    actionType: ProcessingActionType.REMOVE_ARTIFACTS,
    category: ProcessingRuleCategory.TECHNICAL_PROCESSING,
    supportedModes: [ProcessingMode.BALANCED, ProcessingMode.TOLERANT],
    aiInstruction: {
      prompt: 'Remove artifacts such as HTML tags, XML tags, and other non-text elements.',
      example: '"<p>This is a paragraph.</p>" → "This is a paragraph.", [1] → ""',
    },
  },
] as const

// Hilfsfunktionen
export function getDefaultRulesForMode(mode: ProcessingMode): ProcessingRuleDefinition[] {
  return PROCESSING_RULES
    .filter(rule => rule.supportedModes.includes(mode))
}

export function getRulesForCategory(category: ProcessingRuleCategory): ProcessingRuleDefinition[] {
  return PROCESSING_RULES
    .filter(rule => rule.category === category)
}

// Vordefinierte Regelsets
export const STRICT_PROCESSING_RULES = getDefaultRulesForMode(ProcessingMode.STRICT)
export const BALANCED_PROCESSING_RULES = getDefaultRulesForMode(ProcessingMode.BALANCED)
export const TOLERANT_PROCESSING_RULES = getDefaultRulesForMode(ProcessingMode.TOLERANT)

export const DEFAULT_PROCESSING_STRATEGY: ProcessingStrategy = {
  mode: DEFAULT_PROCESSING_MODE,
  rules: BALANCED_PROCESSING_RULES,
}
