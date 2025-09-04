import type { AIExtractionResponse, ExtractionRequest, ExtractionStrategy, OpenAIConfig } from '@source-taster/types'
import { createDynamicExtractionSchema } from '@/api/types/reference'
import { EXTRACTION_RULES_MAP } from '../../constants/extractionRules'
import { BaseAIService } from './baseAIService'

export class ExtractionService extends BaseAIService {
  constructor(config: OpenAIConfig) {
    super(config)
  }

  async extractReferences(extractionRequest: ExtractionRequest): Promise<AIExtractionResponse> {
    const systemMessage = this.buildExtractionSystemMessage(extractionRequest.extractionSettings.extractionStrategy)
    const userMessage = this.buildUserMessage(extractionRequest.text)
    const schema = this.createExtractionSchema(extractionRequest.extractionSettings)

    return this.performAIOperation(
      systemMessage,
      userMessage,
      schema,
      { references: [] }, // empty result
      'extraction',
    )
  }

  private createExtractionSchema(extractionSettings: any) {
    const schema = createDynamicExtractionSchema(extractionSettings)
    return {
      jsonSchema: schema.jsonSchema,
      responseSchema: schema.DynamicExtractionResponseSchema,
    }
  }

  private buildExtractionSystemMessage(extractionStrategy: ExtractionStrategy): string {
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

    return this.buildSystemMessage(
      baseMessage,
      extractionStrategy.normalizationRules,
      EXTRACTION_RULES_MAP,
      `Apply only the specific modifications listed below to the source text.
If a modification rule leads to a change in a value that will be extracted, you must create an entry in the extractionResults array. Each entry must include:
• the fieldPath of the affected value (e.g., "metadata.title"),
• the originalValue before the modification,
• the extractedValue after the modification,
• and the list of applied normalization rules.

Do not add an entry to extractionResults if a rule was applied but resulted in no change to the value.
After applying all relevant modifications, perform the extraction on the modified version of the text.
Do not apply any changes beyond what is explicitly defined.
`,
      'Extract the content exactly as written in the source text. Do NOT apply any modifications, and do NOT track any changes in the "extractionResults" array. The extraction must be based strictly on the original, unmodified text.',
    )
  }

  private buildUserMessage(text: string): string {
    return `Extract all bibliographic references from the following text. Return structured data according to the schema.

Text to process:
${text}`
  }
}
