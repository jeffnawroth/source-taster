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
      return await this.processExtractionRequest(c)
    }
    catch (error) {
      return this.handleExtractionError(c, error)
    }
  }

  private async processExtractionRequest(c: Context) {
    const request = await this.parseRequest(c)
    this.validateExtractionRequest(request)

    const references = await this.performExtraction(request)

    return this.createSuccessResponse(c, references)
  }

  private async parseRequest(c: Context): Promise<ExtractionRequest> {
    return await c.req.json() as ExtractionRequest
  }

  private validateExtractionRequest(request: ExtractionRequest): void {
    if (!request.text) {
      throw new Error('Text is required')
    }

    if (!request.extractionSettings) {
      throw new Error('Extraction settings are required')
    }
  }

  private async performExtraction(extractionRequest: ExtractionRequest) {
    return await this.extractionService.extractReferences(
      extractionRequest,
    )
  }

  private createSuccessResponse(c: Context, references: any) {
    const response: ApiResponse<ExtractionResponse> = {
      success: true,
      data: {
        references,
      },
    }

    return c.json(response)
  }

  private handleExtractionError(c: Context, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorResponse: ApiResponse = {
      success: false,
      error: errorMessage,
    }

    const statusCode = this.determineErrorStatusCode(error)
    return c.json(errorResponse, statusCode as any)
  }

  private determineErrorStatusCode(error: unknown): number {
    if (error instanceof Error) {
      const message = error.message
      if (message === 'Text is required' || message === 'Extraction settings are required') {
        return 400
      }
    }
    return 500
  }
}
