import type { AIExtractionResponse, ExtractionSettings, OpenAIConfig } from '@source-taster/types'
import { OpenAI } from 'openai'
import { getExtractionInstructions } from './extractionInstructions'
import { createDynamicExtractionSchema } from './schemas/reference'

export class ExtractionService {
  private client: OpenAI
  private config: OpenAIConfig

  constructor(config: OpenAIConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      maxRetries: config.maxRetries,
      timeout: config.timeout,
    })
  }

  async extractReferences(text: string, extractionSettings?: ExtractionSettings): Promise<AIExtractionResponse> {
    let systemMessage = `You are an expert bibliographic reference extraction assistant. Your task is to identify and parse academic references from text.

CRITICAL REQUIREMENT - MODIFICATION TRACKING:
When you extract references, you MUST track every change you make in the "modifications" array. This is not optional!
- If you correct typos, fix capitalization, standardize formatting, or make ANY changes, add them to modifications
- Each modification needs: fieldPath, originalValue, extractedValue, modificationType
- If you make NO changes to a field, the modifications array should be empty
- Missing modification tracking is considered a critical error`

    // Add extraction mode instructions if provided
    if (extractionSettings?.extractionMode) {
      const modeInstructions = getExtractionInstructions(
        extractionSettings.extractionMode,
        extractionSettings.customSettings,
      )
      systemMessage += `\n\n${modeInstructions}`
      console.warn(`[Extraction Mode: ${extractionSettings.extractionMode}] Added instructions:`, `${modeInstructions.substring(0, 100)}...`)
    }

    // Add extraction settings instructions if provided
    if (extractionSettings) {
      const enabledFields = Object.entries(extractionSettings.enabledFields)
        .filter(([_, enabled]) => enabled)
        .map(([field, _]) => field)

      console.warn('Enabled fields:', enabledFields)

      if (enabledFields.length > 0) {
        systemMessage += `\n\nFocus ONLY on extracting the following fields: ${enabledFields.join(', ')}. Do not extract any other fields.`
      }
    }

    const userMessage = `Extract all bibliographic references from the following text. Return structured data according to the schema:

${text}`

    // Use dynamic schema based on extraction settings
    const schema = createDynamicExtractionSchema(extractionSettings)

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        temperature: this.config.temperature,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: schema,
        },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      let parsedResponse
      try {
        parsedResponse = JSON.parse(content)
      }
      catch {
        console.error('Failed to parse OpenAI response as JSON:', content)
        throw new Error('Invalid JSON response from OpenAI')
      }

      // Transform the response to match the expected structure
      const transformedResponse = {
        references: parsedResponse.references?.map((ref: any) => ({
          originalText: ref.originalText,
          metadata: {
            title: ref.metadata?.title,
            authors: ref.metadata?.authors,
            date: ref.metadata?.date || {},
            source: ref.metadata?.source || {},
            identifiers: ref.metadata?.identifiers,
          },
          modifications: ref.modifications,
        })) || [],
      }

      // Debug logging for modification tracking
      console.warn('🔍 DEBUG: OpenAI Response Analysis')
      transformedResponse.references.forEach((ref: any, index: number) => {
        const hasModifications = ref.modifications && ref.modifications.length > 0
        const titleChanged = ref.metadata.title && ref.originalText
          && ref.metadata.title.toLowerCase() !== ref.originalText.toLowerCase()

        console.warn(`📋 Reference ${index + 1}:`, {
          hasModifications,
          modificationCount: ref.modifications?.length || 0,
          titleChanged,
          originalLength: ref.originalText?.length || 0,
          extractedTitle: ref.metadata.title ? `"${ref.metadata.title.substring(0, 50)}..."` : 'null',
          suspiciousEmpty: !hasModifications && titleChanged,
        })

        if (!hasModifications && titleChanged) {
          console.warn('⚠️ SUSPICIOUS: Title changed but no modifications reported!')
          console.warn('   Original:', ref.originalText?.substring(0, 100))
          console.warn('   Extracted:', ref.metadata.title?.substring(0, 100))
        }
      })

      return transformedResponse
    }
    catch (error: any) {
      if (error.name === 'ZodError') {
        console.error('Validation error:', error.errors)
        // Return empty references array as fallback
        console.warn('Returning empty references array due to validation error')
        return { references: [] }
      }

      console.error('OpenAI extraction error:', error)
      throw new Error(`Failed to extract references: ${error.message}`)
    }
  }
}
