import type { Mode } from '../common/mode'
import type { RuleDefinition } from '../common/rule-definition'
import type { Strategy } from '../common/strategy'

export type MatchingMode = Mode
export type MatchingStrategy = Strategy<MatchingMode, MatchingActionType>
export type MatchingRuleDefinition = RuleDefinition<MatchingActionType>

export enum MatchingRuleCategory {
  CONTENT_EQUIVALENCE = 'content-equivalence',
  STYLE_INSENSITIVITY = 'style-insensitivity',
  TOLERANCE = 'tolerance',
}

export enum MatchingActionType {
  IGNORE_SPELLING_VARIATION = 'ignore-spelling-variation',
  IGNORE_TYPOGRAPHIC_VARIATION = 'ignore-typographic-variation',
  IGNORE_CASE_FORMAT = 'ignore-case-format',
  IGNORE_ABBREVIATION_VARIANTS = 'ignore-abbreviation-variants',
  IGNORE_AUTHOR_NAME_FORMAT = 'ignore-author-name-format',
  IGNORE_DATE_FORMAT = 'ignore-date-format',
  IGNORE_IDENTIFIER_FORMAT = 'ignore-identifier-variation',
  IGNORE_CHARACTER_VARIATION = 'ignore-character-variation',
  IGNORE_WHITESPACE = 'ignore-whitespace',
}
