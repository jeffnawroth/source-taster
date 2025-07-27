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
      // @ts-expect-error Hono types don't infer properly for separate controller methods
      const request = c.req.valid('json') as ExtractionRequest

      // Perform extraction
      const references = await this.extractionService.extractReferences(request)

      // Create success response
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
