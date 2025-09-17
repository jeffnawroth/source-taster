import type { AIMatchingResponse, APIMatchingSettings, OpenAIConfig } from '@source-taster/types'
import type { ReferenceMetadataFields } from 'node_modules/@source-taster/types/dist/reference/reference.constants'
import { MATCHING_RULES_MAP } from '../../constants/matchingRules'
import { createMatchingSchema } from '../../types/matching'
import { BaseAIService } from './baseAIService'

export class MatchingService extends BaseAIService {
  constructor(config: OpenAIConfig) {
    super(config)
  }

  async matchFields(
    prompt: string,
    matchingSettings: APIMatchingSettings,
    availableFields: ReferenceMetadataFields[],
  ): Promise<AIMatchingResponse> {
    const systemMessage = this.buildMatchingSystemMessage(matchingSettings, availableFields)
    const schema = this.createMatchingSchema(availableFields)

    return this.performAIOperation(
      systemMessage,
      prompt,
      schema,
      { fieldDetails: [] }, // empty result
      'matching',
    )
  }

  private createMatchingSchema(availableFields: ReferenceMetadataFields[]) {
    const schema = createMatchingSchema(availableFields)
    return {
      jsonSchema: schema.jsonSchema,
      responseSchema: schema.MatchingResponseSchema,
    }
  }

  private buildMatchingSystemMessage(
    matchingSettings: APIMatchingSettings,
    availableFields: ReferenceMetadataFields[],
  ): string {
    const baseMessage = `You are an expert bibliographic matching assistant. Your task is to provide field-by-field matching scores.

CRITICAL INSTRUCTIONS:
- You MUST evaluate ALL of the ${availableFields.length} available fields provided in the prompt
- Return EXACTLY ${availableFields.length} field evaluations - one for each field listed in the prompt
- Evaluate each field independently, even if other fields don't match
- A DOI match does NOT mean you can skip evaluating title, authors, etc.
- Each field gets its own individual score from 0-100 based on how well that specific field matches
- If a field is missing in either reference or source, give it a score of 0
- Do NOT skip any of the ${availableFields.length} required fields in your response`

    return this.buildSystemMessage(
      baseMessage,
      matchingSettings.matchingStrategy.actionTypes,
      MATCHING_RULES_MAP,
      'IMPORTANT: Apply the following rules when comparing fields. Do NOT apply any other rules beyond what is explicitly listed below. The field score should be given after applying the rules:',
      'Compare fields as they are without modifications.',
    )
  }
}
