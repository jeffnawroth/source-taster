import type {
  ApiResponse,
  VerificationRequest,
  VerificationResponse,
  WebsiteVerificationRequest,
  WebsiteVerificationResponse,
} from '@source-taster/types'
import type { Context } from 'hono'
import { DatabaseVerificationService } from '../services/databaseVerificationService'

export class VerificationController {
  private verificationService: DatabaseVerificationService

  constructor() {
    this.verificationService = new DatabaseVerificationService()
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
        request.databases || ['openalex', 'crossref'],
        request.verificationMethod,
        request.aiService,
      )

      const response: ApiResponse<VerificationResponse> = {
        success: true,
        data: {
          results,
          totalVerified: results.filter(r => r.isVerified).length,
          totalFailed: results.filter(r => !r.isVerified).length,
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
   * Verify website references
   * POST /api/verify/websites
   */
  async verifyWebsites(c: Context) {
    try {
      const request = await c.req.json() as WebsiteVerificationRequest

      const results = await this.verificationService.verifyWebsiteReferences(
        request.references,
        request.aiService,
      )

      const response: ApiResponse<WebsiteVerificationResponse> = {
        success: true,
        data: {
          results,
          totalChecked: results.length,
          totalAccessible: results.filter(r => r.isAccessible).length,
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
