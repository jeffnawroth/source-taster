import type { RuleDefinition } from './rule-definition'

/**
 * Generic strategy pattern for AI-based extraction
 * Used across extraction and matching domains
 */
export interface Strategy<TMode, TActionType> {
  /** Strategy mode to control behavior */
  mode: TMode
  /** Custom rules for fine-tuning behavior */
  rules: RuleDefinition<TActionType>[]
}
