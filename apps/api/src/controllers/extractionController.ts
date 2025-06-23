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
   * POST /api/v1/extract
   */
  async extractReferences(c: Context) {
    try {
      const startTime = Date.now()
      const request = await c.req.json() as ExtractionRequest

      // Validation
      if (!request.text || !request.aiService) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Text and aiService are required',
        }
        return c.json(errorResponse, 400)
      }

      // Extract references
      const references = await this.extractionService.extractReferences(
        request.text,
        request.aiService,
        request.model,
        request.options,
      )

      const processingTime = Date.now() - startTime

      const response: ApiResponse<ExtractionResponse> = {
        success: true,
        data: {
          references,
          totalFound: references.length,
          processingTime,
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

  /**
   * Get extraction job status
   * GET /api/v1/extract/status/:jobId
   */
  async getExtractionStatus(c: Context) {
    try {
      const jobId = c.req.param('jobId')
      const status = await this.extractionService.getJobStatus(jobId)

      if (!status) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Job not found',
        }
        return c.json(errorResponse, 404)
      }

      const response: ApiResponse = {
        success: true,
        data: status,
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
