import type { ApiMatchData, ApiMatchRequest, ApiResponse } from '@source-taster/types'
import type { Context } from 'hono'
import { ApiMatchRequestSchema } from '@source-taster/types'
import { MatchingCoordinator } from '../services/matching/matchingCoordinator'

/**
 * Evaluates provided candidates against a reference
 * POST /api/match
 */
export async function matchReferences(c: Context) {
  try {
    const request = await parseAndValidateRequest(c)
    const coordinator = new MatchingCoordinator()
    const result = coordinator.evaluateAllCandidates(
      request.reference,
      request.candidates,
      request.matchingSettings,
    )
    return createSuccessResponse(c, result)
  }
  catch (error) {
    return handleError(c, error)
  }
}

/**
 * Parse and validate the incoming request
 */
async function parseAndValidateRequest(c: Context): Promise<ApiMatchRequest> {
  const rawBody = await c.req.json()
  const parseResult = ApiMatchRequestSchema.safeParse(rawBody)

  if (!parseResult.success) {
    throw new ValidationError('Validation failed', parseResult.error)
  }

  return parseResult.data
}

/**
 * Create a successful response
 */
function createSuccessResponse(c: Context, result: ApiMatchData) {
  return c.json({
    success: true,
    data: result,
  })
}
/**
 * Handle errors and create error response
 */
function handleError(c: Context, error: unknown) {
  console.error('Error in matchReferences:', error)

  if (error instanceof ValidationError) {
    return c.json({
      success: false,
      error: error.validationError,
    }, 400)
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

  const errorResponse: ApiResponse = {
    success: false,
    error: errorMessage,
  }
  return c.json(errorResponse, 500)
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message: string, public validationError: any) {
    super(message)
    this.name = 'ValidationError'
  }
}
