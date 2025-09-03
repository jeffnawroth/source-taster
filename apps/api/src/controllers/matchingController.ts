import type { Context } from 'hono'
import {
  type MatchingResponse,
  type ValidatedMatchingRequest,
  ValidatedMatchingRequestSchema,
} from '@source-taster/types'
import * as matchingService from '../services/matchingService'

/**
 * Pure matching - evaluates provided candidates against a reference
 * POST /api/match
 */
export async function matchReferences(c: Context) {
  try {
    const request = await parseAndValidateRequest(c)
    const result = matchingService.matchReferenceAgainstCandidates(request)
    return createSuccessResponse(c, result)
  }
  catch (error) {
    return handleError(c, error)
  }
}

/**
 * Parse and validate the incoming request
 */
async function parseAndValidateRequest(c: Context): Promise<ValidatedMatchingRequest> {
  const rawBody = await c.req.json()
  const parseResult = ValidatedMatchingRequestSchema.safeParse(rawBody)

  if (!parseResult.success) {
    throw new Error(`Validation failed: ${JSON.stringify(parseResult.error)}`)
  }

  return parseResult.data
}

/**
 * Create a successful response
 */
function createSuccessResponse(c: Context, result: any) {
  const response: MatchingResponse = { result }
  return c.json({
    success: true,
    data: response,
  })
}

/**
 * Handle errors and create error response
 */
function handleError(c: Context, error: unknown) {
  console.error('Error in matchReferences:', error)
  return c.json({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error occurred',
  }, 500)
}
