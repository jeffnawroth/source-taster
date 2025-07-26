import type { MatchingMode, MatchingRuleDefinition, MatchingStrategy } from './matching-strategy.types'
import { createModePresets, Mode } from '../common/mode'
import { MatchingActionType, MatchingRuleCategory } from './matching-strategy.types'

export const DEFAULT_MATCHING_MODE: MatchingMode = Mode.BALANCED as const

export const MATCHING_RULES: MatchingRuleDefinition[] = [
  {
    actionType: MatchingActionType.IGNORE_SPELLING_VARIATION,
    aiInstruction: {
      prompt: 'Ignore minor spelling variations in the text.',
      example: '"color" = "colour"',
    },
  },
  {
    actionType: MatchingActionType.IGNORE_TYPOGRAPHIC_VARIATION,
    aiInstruction: {
      prompt: 'Ignore typographic variations such as different quotation marks or dashes.',
      example: '“smart quotes” = "straight quotes", “John’s idea – brilliant!” = “John’s idea - brilliant!',
    },
  },
  {
    actionType: MatchingActionType.IGNORE_CASE_FORMAT,
    aiInstruction: {
      prompt: 'Ignore case differences in text. Treat capitalized and lowercased words as equivalent.',
      example: '"example" = "Example", "Machine Learning Methods" = "machine learning methods"',
    },
  },
  {
    actionType: MatchingActionType.IGNORE_ABBREVIATION_VARIANTS,
    aiInstruction: {
      prompt: 'Ignore variations in abbreviations.',
      example: '"Dr." = "Doctor", "Proc.” = “Proceedings"',
    },
  },

  {
    actionType: MatchingActionType.IGNORE_AUTHOR_NAME_FORMAT,
    aiInstruction: {
      prompt: 'Ignore variations in author name formatting.',
      example: '"John Smith" = "Smith, John", "Doe, J." = "John Doe"',
    },
  },

  {
    actionType: MatchingActionType.IGNORE_DATE_FORMAT,
    aiInstruction: {
      prompt: 'Ignore variations in date formats.',
      example: '"2023-01-01" = "01/01/2023", "January 1, 2023" = "2023-01-01"',
    },
  },
  {
    actionType: MatchingActionType.IGNORE_IDENTIFIER_FORMAT,
    aiInstruction: {
      prompt: 'Ignore variations in identifier formats such as DOIs or ISBNs.',
      example:
        '"10.1000/xyz123" = "https://doi.org/10.1000/XYZ123"',
    },
  },
  {
    actionType: MatchingActionType.IGNORE_CHARACTER_VARIATION,
    aiInstruction: {
      prompt: 'Ignore variations in characters that do not affect meaning.',
      example: '"café" = "cafe", "fiancé" = "fiance"',
    },
  },
  {
    actionType: MatchingActionType.IGNORE_WHITESPACE,
    aiInstruction: {
      prompt: 'Ignore extra whitespace in the text.',
      example: '"Hello   World" = "Hello World", "This is   a test." = "This is a test.", "DeepLearning" = "Deep Learning"',
    },
  },

] as const

const BALANCED_ACTIONS: MatchingActionType[] = [
  MatchingActionType.IGNORE_SPELLING_VARIATION,
  MatchingActionType.IGNORE_TYPOGRAPHIC_VARIATION,
  MatchingActionType.IGNORE_CASE_FORMAT,
  MatchingActionType.IGNORE_ABBREVIATION_VARIANTS,
  MatchingActionType.IGNORE_AUTHOR_NAME_FORMAT,
  MatchingActionType.IGNORE_DATE_FORMAT,
  MatchingActionType.IGNORE_IDENTIFIER_FORMAT,
  MatchingActionType.IGNORE_CHARACTER_VARIATION,
  MatchingActionType.IGNORE_WHITESPACE,
] as const

const TOLERANT_ACTIONS: MatchingActionType[] = [

] as const

export const MATCHING_MODE_PRESETS = createModePresets<MatchingActionType>(
  BALANCED_ACTIONS,
  TOLERANT_ACTIONS,
)
export const DEFAULT_MATCHING_STRATEGY: MatchingStrategy = {
  mode: DEFAULT_MATCHING_MODE,
  rules: getRulesForActionTypes(MATCHING_MODE_PRESETS[DEFAULT_MATCHING_MODE]),
} as const

export const categoryMapping: Record<MatchingRuleCategory, MatchingActionType[]> = {
  [MatchingRuleCategory.CONTENT_EQUIVALENCE]: [
    MatchingActionType.IGNORE_ABBREVIATION_VARIANTS,
    MatchingActionType.IGNORE_AUTHOR_NAME_FORMAT,
    MatchingActionType.IGNORE_DATE_FORMAT,
    MatchingActionType.IGNORE_IDENTIFIER_FORMAT,
  ],
  [MatchingRuleCategory.STYLE_INSENSITIVITY]: [
    MatchingActionType.IGNORE_SPELLING_VARIATION,
    MatchingActionType.IGNORE_CASE_FORMAT,
    MatchingActionType.IGNORE_CHARACTER_VARIATION,
  ],
  [MatchingRuleCategory.TOLERANCE]: [
  ],
}

// Helper functions

export function getRulesForActionTypes(actionTypes: MatchingActionType[]): MatchingRuleDefinition[] {
  return MATCHING_RULES.filter(rule => actionTypes.includes(rule.actionType))
}

export function getActionTypesFromRules(rules: MatchingRuleDefinition[]): MatchingActionType[] {
  return rules.map(rule => rule.actionType)
}

export function getActionTypesByCategory(category: MatchingRuleCategory): MatchingActionType[] {
  return categoryMapping[category] || []
}
