import z from 'zod'
import { ModeSchema } from '../common/mode'

export enum MatchingRuleCategory {
  CONTENT_EQUIVALENCE = 'content-equivalence',
  STYLE_INSENSITIVITY = 'style-insensitivity',
  TOLERANCE = 'tolerance',
}

export const MatchingActionTypeSchema = z.enum([
  'ignore-spelling-variation',
  'ignore-typographic-variation',
  'ignore-case-format',
  'ignore-abbreviation-variants',
  'ignore-author-name-format',
  'ignore-date-format',
  'ignore-identifier-variation',
  'ignore-character-variation',
  'ignore-whitespace',
]).describe('Matching rule action type')

export const MatchingRuleDefinitionSchema = z.object({
  actionType: MatchingActionTypeSchema,
  aiInstruction: z.object({
    prompt: z.string().describe('Instruction for AI on how to apply this rule'),
    example: z.string().optional().describe('Optional example to clarify the rule'),
  }),
}).describe('Definition of a matching rule for AI extraction')

export const MatchingStrategySchema = z.object({
  mode: ModeSchema.describe('Strategy mode to control behavior'),
  actionTypes: z.array(MatchingActionTypeSchema).describe('Selected action types for matching behavior'),
}).describe('Matching strategy schema for AI extraction')

export type MatchingActionType = z.infer<typeof MatchingActionTypeSchema>
export type MatchingRuleDefinition = z.infer<typeof MatchingRuleDefinitionSchema>
export type MatchingStrategy = z.infer<typeof MatchingStrategySchema>
