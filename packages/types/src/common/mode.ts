import z from 'zod'

/**
 * Generic mode types for controlling AI behavior
 * Used across extraction and matching domains
 */
export const ModeSchema = z.enum([
  'strict',
  'balanced',
  'custom',
]).describe('Mode for controlling AI behavior in extraction and matching')

export type Mode = z.infer<typeof ModeSchema>

export function createModePresets<ActionType>(
  balancedActions: ActionType[],
): Record<Mode, ActionType[]> {
  return {
    strict: [],
    balanced: [...balancedActions],
    custom: [],
  }
}
