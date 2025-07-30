import type { AIMatchingResponse, APIMatchingSettings, MatchingActionType, OpenAIConfig } from '@source-taster/types'
import type { ReferenceMetadataFields } from 'node_modules/@source-taster/types/dist/reference/reference.constants'
import { MATCHING_RULES_MAP } from '../../constants/matchingRules'
import { createMatchingSchema } from '../../types/matching'
import { buildInstructionsFromActionTypes } from '../../utils/instructionGenerator'
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
    const systemMessage = this.buildSystemMessage(matchingSettings, availableFields)
    const schema = createMatchingSchema(availableFields)

    try {
      const response = await this.callOpenAI(systemMessage, prompt, schema.jsonSchema)
      return this.parseOpenAIResponse(response, schema.MatchingResponseSchema) as AIMatchingResponse
    }
    catch (error: any) {
      return this.handleMatchingError(error)
    }
  }

  private buildSystemMessage(
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

    const modeInstructions = this.getMatchingInstructions(matchingSettings.matchingStrategy.actionTypes)
    return `${baseMessage}\n\n${modeInstructions}`
  }

  private handleMatchingError(error: any): AIMatchingResponse {
    if (error.name === 'ZodError') {
      console.error('Matching validation error:', error.errors)
      console.warn('Returning empty fieldDetails array due to validation error')
      return { fieldDetails: [] }
    }

    console.error('AI matchFields error:', error)
    throw new Error(`Failed to match fields: ${error.message}`)
  }

  private getMatchingInstructions(actionTypes: MatchingActionType[]): string {
    return buildInstructionsFromActionTypes(
      actionTypes,
      MATCHING_RULES_MAP,
      'IMPORTANT: Apply the following rules when comparing fields. Do NOT apply any other rules beyond what is explicitly listed below. The field score should be given after applying the rules:',
      'Compare fields as they are without modifications.',
    )
  }
}
