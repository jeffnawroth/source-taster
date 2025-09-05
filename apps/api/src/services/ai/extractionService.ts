import type { AIExtractionResponse, ExtractionRequest, OpenAIConfig } from '@source-taster/types'
import { createDynamicExtractionSchema } from '@/api/types/reference'
import { BaseAIService } from './baseAIService'

export class ExtractionService extends BaseAIService {
  constructor(config: OpenAIConfig) {
    super(config)
  }

  async extractReferences(extractionRequest: ExtractionRequest): Promise<AIExtractionResponse> {
    const systemMessage = this.buildExtractionSystemMessage()
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

  private buildExtractionSystemMessage(): string {
    return `You are an expert bibliographic reference extraction assistant. Your task is to identify and parse academic references from text.

CRITICAL REFERENCE IDENTIFICATION RULES:
• A bibliographic reference consists of ALL related bibliographic information that belongs together, including:
  - Author names
  - Title
  - Source details
  - Date details
  - Identifiers (DOI, PMID, etc.) that appear on the same line or immediately following lines
• DO NOT split a single reference into multiple references
• DOI lines, URLs, or other identifiers that appear immediately after bibliographic information belong to the SAME reference
• Only create separate references when there are clearly distinct works being cited

Extract the content exactly as written in the source text. Do NOT apply any modifications or normalizations. The extraction must be based strictly on the original, unmodified text.`
  }

  private buildUserMessage(text: string): string {
    return `Extract all bibliographic references from the following text. Return structured data according to the schema.

Text to process:
${text}`
  }
}
