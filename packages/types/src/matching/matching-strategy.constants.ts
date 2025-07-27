import type { Mode } from '../common/mode'
import type { MatchingActionType, MatchingRuleDefinition, MatchingStrategy } from './matching-strategy.types'
import { getActionTypesByCategory, getActionTypesFromRules, getRulesForActionTypes } from '../common'
import { createModePresets } from '../common/mode'
import { MatchingRuleCategory } from './matching-strategy.types'

export const DEFAULT_MATCHING_MODE: Mode = 'balanced'

export const MATCHING_RULES: MatchingRuleDefinition[] = [
  {
    actionType: 'ignore-spelling-variation',
    aiInstruction: {
      prompt: 'Ignore minor spelling variations in the text.',
      example: '"color" = "colour"',
    },
  },
  {
    actionType: 'ignore-typographic-variation',
    aiInstruction: {
      prompt: 'Ignore typographic variations such as different quotation marks or dashes.',
      example: '“smart quotes” = "straight quotes", “John’s idea – brilliant!” = “John’s idea - brilliant!',
    },
  },
  {
    actionType: 'ignore-case-format',
    aiInstruction: {
      prompt: 'Ignore case differences in text. Treat capitalized and lowercased words as equivalent.',
      example: '"example" = "Example", "Machine Learning Methods" = "machine learning methods"',
    },
  },
  {
    actionType: 'ignore-abbreviation-variants',
    aiInstruction: {
      prompt: 'Ignore variations in abbreviations.',
      example: '"Dr." = "Doctor", "Proc.” = “Proceedings"',
    },
  },

  {
    actionType: 'ignore-author-name-format',
    aiInstruction: {
      prompt: 'Ignore variations in author name formatting.',
      example: '"John Smith" = "Smith, John", "Doe, J." = "John Doe"',
    },
  },

  {
    actionType: 'ignore-date-format',
    aiInstruction: {
      prompt: 'Ignore variations in date formats.',
      example: '"2023-01-01" = "01/01/2023", "January 1, 2023" = "2023-01-01"',
    },
  },
  {
    actionType: 'ignore-identifier-variation',
    aiInstruction: {
      prompt: 'Ignore variations in identifier formats such as DOIs or ISBNs.',
      example:
        '"10.1000/xyz123" = "https://doi.org/10.1000/XYZ123"',
    },
  },
  {
    actionType: 'ignore-character-variation',
    aiInstruction: {
      prompt: 'Ignore variations in characters that do not affect meaning.',
      example: '"café" = "cafe", "fiancé" = "fiance"',
    },
  },
  {
    actionType: 'ignore-whitespace',
    aiInstruction: {
      prompt: 'Ignore extra whitespace in the text.',
      example: '"Hello   World" = "Hello World", "This is   a test." = "This is a test.", "DeepLearning" = "Deep Learning"',
    },
  },

] as const

const BALANCED_ACTIONS: MatchingActionType[] = [
  'ignore-spelling-variation',
  'ignore-typographic-variation',
  'ignore-case-format',
  'ignore-abbreviation-variants',
  'ignore-author-name-format',
  'ignore-date-format',
  'ignore-identifier-variation',
  'ignore-character-variation',
  'ignore-whitespace',
] as const

const TOLERANT_ACTIONS: MatchingActionType[] = [

] as const

export const MATCHING_MODE_PRESETS = createModePresets<MatchingActionType>(
  BALANCED_ACTIONS,
  TOLERANT_ACTIONS,
)
export const DEFAULT_MATCHING_STRATEGY: MatchingStrategy = {
  mode: DEFAULT_MATCHING_MODE,
  rules: getMatchingRulesForActionTypes(MATCHING_MODE_PRESETS[DEFAULT_MATCHING_MODE]),
} as const

export const categoryMapping: Record<MatchingRuleCategory, MatchingActionType[]> = {
  [MatchingRuleCategory.CONTENT_EQUIVALENCE]: [
    'ignore-abbreviation-variants',
    'ignore-author-name-format',
    'ignore-date-format',
    'ignore-identifier-variation',
  ],
  [MatchingRuleCategory.STYLE_INSENSITIVITY]: [
    'ignore-spelling-variation',
    'ignore-case-format',
    'ignore-character-variation',
  ],
  [MatchingRuleCategory.TOLERANCE]: [
  ],
}

// Helper functions

export function getMatchingRulesForActionTypes(actionTypes: MatchingActionType[]): MatchingRuleDefinition[] {
  return getRulesForActionTypes(MATCHING_RULES, actionTypes)
}

export function getMatchingActionTypesFromRules(rules: MatchingRuleDefinition[]): MatchingActionType[] {
  return getActionTypesFromRules(rules)
}

export function getMatchingActionTypesByCategory(category: MatchingRuleCategory): MatchingActionType[] {
  return getActionTypesByCategory(categoryMapping, category)
}
