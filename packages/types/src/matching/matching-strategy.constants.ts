import type { Mode } from '../common/mode'
import type { MatchingActionType, MatchingStrategy } from './matching-strategy.types'
import { createModePresets } from '../common/mode'
import { MatchingRuleCategory } from './matching-strategy.types'

export const DEFAULT_MATCHING_MODE: Mode = 'balanced'

// Mode presets - only actionTypes needed for frontend

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
  actionTypes: MATCHING_MODE_PRESETS.balanced,
} as const

// Category mapping for UI purposes only
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

// Helper function for UI only
export function getMatchingActionTypesByCategory(category: MatchingRuleCategory): MatchingActionType[] {
  return categoryMapping[category] || []
}
