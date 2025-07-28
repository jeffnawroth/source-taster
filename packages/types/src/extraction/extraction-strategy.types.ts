/**
 * Extraction modes and custom settings configuration
 */

import z from 'zod'
import { ModeSchema } from '../common/mode'

export enum ExtractionRuleCategory {
  CONTENT_NORMALIZATION = 'content-normalization',
  STYLE_FORMATTING = 'style-formatting',
  TECHNICAL_PROCESSING = 'technical-extraction',
}

export const ExtractionActionTypeSchema = z.enum([
  'normalize-spelling',
  'normalize-typography',
  'normalize-title-case',
  'normalize-abbreviations',
  'normalize-author-names',
  'normalize-date-format',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
]).describe('Extraction rule action type')

export const ExtractionRuleDefinitionSchema = z.object({
  actionType: ExtractionActionTypeSchema,
  aiInstruction: z.object({
    prompt: z.string().describe('AI prompt for this action type'),
    example: z.string().describe('Example input for this action type'),
  }).describe('AI instruction for the action type'),
}).describe('Definition of an extraction rule with AI instructions')

export const ExtractionStrategySchema = z.object({
  mode: ModeSchema.describe('Extraction mode for extraction'),
  rules: z.array(ExtractionRuleDefinitionSchema).describe('Custom extraction rules'),
})

export type ExtractionActionType = z.infer<typeof ExtractionActionTypeSchema>
export type ExtractionRuleDefinition = z.infer<typeof ExtractionRuleDefinitionSchema>
export type ExtractionStrategy = z.infer<typeof ExtractionStrategySchema>
// export type ExtractionRuleDefinition = RuleDefinition<ExtractionActionType>
