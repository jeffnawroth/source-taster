/**
 * Shared AI settings schemas for API requests
 */

import z from 'zod'
import { OPENAI_MODELS_SCHEMA } from '../ai'

// Schema for user AI settings in requests
export const UserAISettingsSchema = z.object({
  apiKey: z.string().min(1).describe('User\'s OpenAI API key (required)'),
  model: OPENAI_MODELS_SCHEMA.describe('Selected OpenAI model'),
})

export type UserAISettingsSchemaType = z.infer<typeof UserAISettingsSchema>
