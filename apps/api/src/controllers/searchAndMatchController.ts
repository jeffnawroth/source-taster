import type { MatchingResponse, MatchingResult, ValidatedSearchAndMatchRequest } from '@source-taster/types'
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
    const result = await searchAndMatchService.processSearchAndMatch(request.reference, request.matchingSettings)
    return createSuccessResponse(c, result)
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
    throw new Error(`Validation failed: ${JSON.stringify(parseResult.error)}`)
  }

  return parseResult.data
}

/**
 * Create a successful response
 */
function createSuccessResponse(c: Context, result: MatchingResult) {
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
  console.error('Error in searchAndMatch:', error)
  return c.json({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error occurred',
  }, 500)
}
