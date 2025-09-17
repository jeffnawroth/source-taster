/**
 * Generic category mapping utilities
 * Used across extraction and matching domains for rule categorization
 */

/**
 * Generic function to get action types by category from a mapping
 * @param mapping - Record mapping categories to action type arrays
 * @param category - The category to get action types for
 * @returns Array of action types for the given category
 */
export function getActionTypesByCategory<TCategory extends string, TActionType>(
  mapping: Record<TCategory, TActionType[]>,
  category: TCategory,
): TActionType[] {
  return mapping[category] || []
}

/**
 * Generic function to get rules for specific action types
 * @param rules - Array of rule definitions
 * @param actionTypes - Array of action types to filter by
 * @returns Filtered array of rules matching the action types
 */
export function getRulesForActionTypes<TRule extends { actionType: TActionType }, TActionType>(
  rules: readonly TRule[],
  actionTypes: TActionType[],
): TRule[] {
  return rules.filter(rule => actionTypes.includes(rule.actionType))
}

/**
 * Generic function to extract action types from rules
 * @param rules - Array of rule definitions
 * @returns Array of action types from the rules
 */
export function getActionTypesFromRules<TRule extends { actionType: TActionType }, TActionType>(
  rules: TRule[],
): TActionType[] {
  return rules.map(rule => rule.actionType)
}
