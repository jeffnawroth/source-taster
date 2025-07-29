import type { MatchingActionType } from '@source-taster/types'
import { createModePresets } from '@source-taster/types'

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
