import type { ExtractionActionType } from '@source-taster/types'
import { ExtractionRuleCategory } from '@source-taster/types'

/**
 * UI-specific category mapping for organizing extraction action types in the interface
 * This mapping is used to group action types into logical categories for the settings UI
 */
export const EXTRACTION_UI_CATEGORIES: Record<ExtractionRuleCategory, ExtractionActionType[]> = {
  [ExtractionRuleCategory.CONTENT_NORMALIZATION]: [
    'normalize-spelling',
    'normalize-title-case',
    'normalize-abbreviations',
    'normalize-typography',
  ],
  [ExtractionRuleCategory.STYLE_FORMATTING]: [
    'normalize-author-names',
    'normalize-date-format',
    'normalize-identifiers',
  ],
  [ExtractionRuleCategory.TECHNICAL_PROCESSING]: [
    'normalize-characters',
    'normalize-whitespace',
  ],
}

/**
 * Get extraction action types for a specific UI category
 * @param category - The extraction rule category
 * @returns Array of action types in that category
 */
export function getExtractionActionTypesByCategory(category: ExtractionRuleCategory): ExtractionActionType[] {
  return EXTRACTION_UI_CATEGORIES[category] || []
}
