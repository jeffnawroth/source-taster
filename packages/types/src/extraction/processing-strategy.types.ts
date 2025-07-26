/**
 * Extraction modes and custom settings configuration
 */

import type { Mode } from '../common/mode'
import type { RuleDefinition } from '../common/rule-definition'
import type { Strategy } from '../common/strategy'

export type ProcessingMode = Mode
export type ProcessingStrategy = Strategy<ProcessingMode, ProcessingActionType>
export type ProcessingRuleDefinition = RuleDefinition<ProcessingActionType>

export enum ProcessingRuleCategory {
  CONTENT_NORMALIZATION = 'content-normalization',
  STYLE_FORMATTING = 'style-formatting',
  TECHNICAL_PROCESSING = 'technical-processing',
}

export enum ProcessingActionType {
  NORMALIZE_SPELLING = 'normalize-spelling',
  NORMALIZE_TYPOGRAPHY = 'normalize-typography',
  NORMALIZE_TITLE_CASE = 'normalize-title-case',
  NORMALIZE_ABBREVIATIONS = 'normalize-abbreviations',
  NORMALIZE_AUTHOR_NAMES = 'normalize-author-names',
  NORMALIZE_DATE_FORMAT = 'normalize-date-format',
  NORMALIZE_IDENTIFIERS = 'normalize-identifiers',
  NORMALIZE_CHARACTERS = 'normalize-characters',
  NORMALIZE_WHITESPACE = 'normalize-whitespace',
}
