import type { AIExtractionResponse, ExtractionRequest, ExtractionStrategy, OpenAIConfig } from '@source-taster/types'
import { createDynamicExtractionSchema } from '@/api/types/reference'
import { EXTRACTION_RULES_MAP } from '../../constants/extractionRules'
import { buildInstructionsFromActionTypes } from '../../utils/instructionGenerator'
import { BaseAIService } from './baseAIService'

export class ExtractionService extends BaseAIService {
  constructor(config: OpenAIConfig) {
    super(config)
  }

  async extractReferences(extractionRequest: ExtractionRequest): Promise<AIExtractionResponse> {
    const systemMessage = this.buildSystemMessage(extractionRequest.extractionSettings.extractionStrategy)
    const userMessage = this.buildUserMessage(extractionRequest.text)
    const schema = createDynamicExtractionSchema(extractionRequest.extractionSettings)

    try {
      const response = await this.callOpenAI(systemMessage, userMessage, schema.jsonSchema)
      return this.parseOpenAIResponse(response, schema.DynamicExtractionResponseSchema) as AIExtractionResponse
    }
    catch (error: any) {
      return this.handleExtractionError(error)
    }
  }

  private buildSystemMessage(extractionStrategy: ExtractionStrategy): string {
    const baseMessage = `You are an expert bibliographic reference extraction assistant. Your task is to identify and parse academic references from text.

CRITICAL REFERENCE IDENTIFICATION RULES:
• A bibliographic reference consists of ALL related bibliographic information that belongs together, including:
  - Author names
  - Title
  - Source details
  - Date details
  - Identifiers (DOI, PMID, etc.) that appear on the same line or immediately following lines
• DO NOT split a single reference into multiple references
• DOI lines, URLs, or other identifiers that appear immediately after bibliographic information belong to the SAME reference
• Only create separate references when there are clearly distinct works being cited`

    const modeInstructions = this.getExtractionInstructions(extractionStrategy)
    return `${baseMessage}\n\n${modeInstructions}`
  }

  private buildUserMessage(text: string): string {
    return `Extract all bibliographic references from the following text. Return structured data according to the schema.

Text to process:
${text}`
  }

  private handleExtractionError(error: any): AIExtractionResponse {
    if (error.name === 'ZodError') {
      console.error('Validation error:', error.errors)
      console.warn('Returning empty references array due to validation error')
      return { references: [] }
    }

    console.error('AI extraction error:', error)
    throw new Error(`Failed to extract references: ${error.message}`)
  }

  private getExtractionInstructions(extractionStrategy: ExtractionStrategy): string {
    return buildInstructionsFromActionTypes(
      extractionStrategy.actionTypes,
      EXTRACTION_RULES_MAP,
      `Apply only the specific modifications listed below to the source text.
If a modification rule leads to a change in a value that will be extracted, you must create an entry in the extractionResults array. Each entry must include:
• the fieldPath of the affected value (e.g., "metadata.title"),
• the originalValue before the modification,
• the extractedValue after the modification,
• and the list of applied actionTypes.

Do not add an entry to extractionResults if a rule was applied but resulted in no change to the value.
After applying all relevant modifications, perform the extraction on the modified version of the text.
Do not apply any changes beyond what is explicitly defined.
`,
      'Extract the content exactly as written in the source text. Do NOT apply any modifications, and do NOT track any changes in the "extractionResults" array. The extraction must be based strictly on the original, unmodified text.',
    )
  }
}
