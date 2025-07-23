import type {
  ApiResponse,
  ExtractionRequest,
  ExtractionResponse,
} from '@source-taster/types'
import type { Context } from 'hono'
import { ReferenceExtractionService } from '../services/referenceExtractionService'

export class ExtractionController {
  private extractionService: ReferenceExtractionService

  constructor() {
    this.extractionService = new ReferenceExtractionService()
  }

  /**
   * Extract references from text using AI
   * POST /api/extract
   */
  async extractReferences(c: Context) {
    try {
      const request = await c.req.json() as ExtractionRequest

      // Validation
      if (!request.text) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Text is required',
        }
        return c.json(errorResponse, 400)
      }

      if (!request.extractionSettings) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Extraction settings are required',
        }
        return c.json(errorResponse, 400)
      }

      // Extract references
      const references = await this.extractionService.extractReferences(
        request.text,
        request.extractionSettings,
      )

      const response: ApiResponse<ExtractionResponse> = {
        success: true,
        data: {
          references,
        },
      }

      return c.json(response)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorResponse: ApiResponse = {
        success: false,
        error: errorMessage,
      }
      return c.json(errorResponse, 500)
    }
  }
}
