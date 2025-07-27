import z from 'zod'

export function createModePresets<ActionType>(
  balancedActions: ActionType[],
  tolerantActions: ActionType[],
): Record<Mode, ActionType[]> {
  return {
    strict: [],
    balanced: [...balancedActions],
    tolerant: [...balancedActions, ...tolerantActions],
    custom: [],
  }
}

export const ModeSchema = z.enum([
  'strict',
  'balanced',
  'tolerant',
  'custom',
]).describe('Mode for controlling AI behavior in extraction and matching')

export type Mode = z.infer<typeof ModeSchema>
