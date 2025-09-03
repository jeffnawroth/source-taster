import type { Context } from 'hono'
import {
  type MatchingResponse,
  type ValidatedMatchingRequest,
  ValidatedMatchingRequestSchema,
} from '@source-taster/types'
import { DatabaseMatchingService } from '../services/databaseMatchingService'

export class MatchingController {
  private matchingService: DatabaseMatchingService

  constructor() {
    this.matchingService = new DatabaseMatchingService()
  }

  /**
   * Pure matching - evaluates provided candidates against a reference
   * POST /api/match
   */
  async matchReferences(c: Context) {
    try {
      const request = await this.parseAndValidateRequest(c)
      const result = this.matchReferenceAgainstCandidates(request)
      return this.createSuccessResponse(c, result)
    }
    catch (error) {
      return this.handleError(c, error)
    }
  }

  /**
   * Parse and validate the incoming request
   */
  private async parseAndValidateRequest(c: Context): Promise<ValidatedMatchingRequest> {
    const rawBody = await c.req.json()
    const parseResult = ValidatedMatchingRequestSchema.safeParse(rawBody)

    if (!parseResult.success) {
      throw new Error(`Validation failed: ${JSON.stringify(parseResult.error)}`)
    }

    return parseResult.data
  }

  /**
   * Match the single reference against all candidates
   */
  private matchReferenceAgainstCandidates(request: ValidatedMatchingRequest) {
    return this.matchingService.evaluateAllCandidates(
      request.reference,
      request.candidates,
      request.matchingSettings,
    )
  }

  /**
   * Create a successful response
   */
  private createSuccessResponse(c: Context, result: any) {
    const response: MatchingResponse = { result }
    return c.json({
      success: true,
      data: response,
    })
  }

  /**
   * Handle errors and create error response
   */
  private handleError(c: Context, error: unknown) {
    console.error('Error in matchReferences:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, 500)
  }
}
