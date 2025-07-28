import type { MatchingActionType } from '@source-taster/types'
import { MatchingRuleCategory } from '@source-taster/types'

/**
 * UI-specific category mapping for organizing action types in the interface
 * This mapping is used to group action types into logical categories for the settings UI
 */
export const MATCHING_UI_CATEGORIES: Record<MatchingRuleCategory, MatchingActionType[]> = {
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
    // Currently empty - can be extended with tolerance-specific action types
  ],
}

/**
 * Get action types for a specific UI category
 * @param category - The matching rule category
 * @returns Array of action types in that category
 */
export function getMatchingActionTypesByCategory(category: MatchingRuleCategory): MatchingActionType[] {
  return MATCHING_UI_CATEGORIES[category] || []
}
