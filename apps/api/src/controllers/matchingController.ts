import type { Context } from 'hono'
import {
  type MatchingResponse,
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
      const rawBody = await c.req.json()

      // Use the new pure matching schema that accepts candidates
      const parseResult = ValidatedMatchingRequestSchema.safeParse(rawBody)

      if (!parseResult.success) {
        return c.json({
          success: false,
          error: parseResult.error,
        }, 400)
      }

      const request = parseResult.data

      // Pure matching: evaluate candidates against references
      const results = []

      for (const reference of request.references) {
        // Use the provided candidates for matching
        const result = await this.matchingService.evaluateAllCandidates(
          reference,
          request.candidates,
          request.matchingSettings,
        )
        results.push(result)
      }

      const response: MatchingResponse = {
        results,
      }

      return c.json({
        success: true,
        data: response,
      })
    }
    catch (error) {
      console.error('Error in matchReferences:', error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }, 500)
    }
  }
}
