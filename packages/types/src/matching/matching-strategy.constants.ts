import type { Mode } from '../common/mode'
import type { MatchingActionType, MatchingStrategy } from './matching-strategy.types'
import { createModePresets } from '../common/mode'

export const DEFAULT_MATCHING_MODE: Mode = 'balanced'

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
