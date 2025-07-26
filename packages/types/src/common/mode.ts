/**
 * Generic mode types for controlling AI behavior
 * Used across extraction and matching domains
 */
export enum Mode {
  STRICT = 'strict',
  BALANCED = 'balanced',
  TOLERANT = 'tolerant',
  CUSTOM = 'custom',
}

export function createModePresets<ActionType>(
  balancedActions: ActionType[],
  tolerantActions: ActionType[],
): Record<Mode, ActionType[]> {
  return {
    [Mode.STRICT]: [],
    [Mode.BALANCED]: [...balancedActions],
    [Mode.TOLERANT]: [...balancedActions, ...tolerantActions],
    [Mode.CUSTOM]: [],
  }
}
