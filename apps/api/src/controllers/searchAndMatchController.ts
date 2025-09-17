import type { ApiResponse, MatchingResult, SearchAndMatchResponse, ValidatedSearchAndMatchRequest } from '@source-taster/types'
import type { Context } from 'hono'
import { ValidatedSearchAndMatchRequestSchema } from '@source-taster/types'
import * as searchAndMatchService from '../services/searchAndMatchService'

/**
 * Search for candidates and then match them against references
 * POST /api/search-and-match
 */
export async function searchAndMatch(c: Context) {
  try {
    const request = await parseAndValidateRequest(c)
    const results = await searchAndMatchService.processSearchAndMatchBatch(request.references, request.matchingSettings)
    return createSuccessResponse(c, results)
  }
  catch (error) {
    return handleError(c, error)
  }
}

/**
 * Parse and validate the incoming request
 */
async function parseAndValidateRequest(c: Context): Promise<ValidatedSearchAndMatchRequest> {
  const rawBody = await c.req.json()
  const parseResult = ValidatedSearchAndMatchRequestSchema.safeParse(rawBody)

  if (!parseResult.success) {
    throw new ValidationError('Request validation failed', parseResult.error)
  }

  console.warn(`SearchAndMatchController: Processing search-and-match for ${parseResult.data.references.length} references`)
  return parseResult.data
}

/**
 * Create a successful response
 */
function createSuccessResponse(c: Context, results: MatchingResult[]) {
  const response: SearchAndMatchResponse = { results }
  return c.json({
    success: true,
    data: response,
  })
}

/**
 * Handle errors and create appropriate error responses
 */
function handleError(c: Context, error: unknown) {
  console.error('SearchAndMatch: Error:', error)

  if (error instanceof ValidationError) {
    return c.json({
      success: false,
      error: error.validationError,
    }, 400)
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
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
