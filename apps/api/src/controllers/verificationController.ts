import type {
  ApiResponse,
  VerificationRequest,
  VerificationResponse,
  WebsiteVerificationResult,
} from '@source-taster/types'
import type { Context } from 'hono'
import { DatabaseVerificationService } from '../services/databaseVerificationService'
import { ExtendedVerificationService } from '../services/extendedVerificationService'
import { WebsiteVerificationService } from '../services/websiteVerificationService'

export class VerificationController {
  private verificationService: DatabaseVerificationService
  private websiteVerificationService: WebsiteVerificationService
  private extendedVerificationService: ExtendedVerificationService

  constructor() {
    this.verificationService = new DatabaseVerificationService()
    this.websiteVerificationService = new WebsiteVerificationService()
    this.extendedVerificationService = new ExtendedVerificationService()
  }

  /**
   * Verify references against academic databases
   * POST /api/verify
   */
  async verifyReferences(c: Context) {
    try {
      const request = await c.req.json() as VerificationRequest

      // Validation
      if (!request.references || !Array.isArray(request.references)) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'References array is required',
        }
        return c.json(errorResponse, 400)
      }

      // Verify references
      const results = await this.verificationService.verifyReferences(
        request.references,
        request.aiService,
      )

      const response: ApiResponse<VerificationResponse> = {
        success: true,
        data: {
          results,
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
   * Verify a reference against a website URL
   * POST /api/verify/website
   */
  async verifyWebsiteReference(c: Context) {
    try {
      const request = await c.req.json() as {
        reference: any
        url: string
        aiService: 'openai' | 'gemini'
        options?: any
      }

      // Validation
      if (!request.reference) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Reference is required',
        }
        return c.json(errorResponse, 400)
      }

      if (!request.url) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'URL is required',
        }
        return c.json(errorResponse, 400)
      }

      if (!request.aiService) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'AI service is required',
        }
        return c.json(errorResponse, 400)
      }

      // Verify website reference
      const result = await this.websiteVerificationService.verifyWebsiteReference(
        request.reference,
        request.url,
        request.aiService,
        request.options,
      )

      const response: ApiResponse<WebsiteVerificationResult> = {
        success: true,
        data: result,
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
   * Verify references with extended strategy (database + website fallback)
   * POST /api/verify/extended
   */
  async verifyReferencesExtended(c: Context) {
    try {
      const request = await c.req.json() as VerificationRequest

      // Validation
      if (!request.references || !Array.isArray(request.references)) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'References array is required',
        }
        return c.json(errorResponse, 400)
      }

      if (!request.aiService) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'AI service is required',
        }
        return c.json(errorResponse, 400)
      }

      // Verify references with extended strategy
      const results = await this.extendedVerificationService.verifyReferencesExtended(
        request.references,
        request.aiService,
      )

      const response: ApiResponse = {
        success: true,
        data: {
          results,
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
