import type {
  ApiResponse,
  SearchRequest,
  SearchResponse,
  SearchResult,
} from '@source-taster/types'
import type { Context } from 'hono'
import { SearchRequestSchema } from '@source-taster/types'
import * as searchService from '../services/searchService'

/**
 * Search for references in all external databases
 * POST /api/search
 */
export async function searchAllDatabases(c: Context) {
  try {
    const request = await parseAndValidateRequest(c)
    const results = await searchService.searchAllDatabases(request.references)
    return createSuccessResponse(c, results)
  }
  catch (error) {
    return handleError(c, error)
  }
}

/**
 * Get list of available databases
 * GET /api/search/databases
 */
export async function getDatabases(c: Context) {
  try {
    const databases = await searchService.getDatabases()
    return c.json({
      success: true,
      data: databases,
    })
  }
  catch (error) {
    return handleError(c, error)
  }
}

/**
 * Search for references in a specific database
 * POST /api/search/:database
 */
export async function searchSingleDatabase(c: Context) {
  try {
    const database = c.req.param('database')
    const request = await parseAndValidateRequest(c)

    // Process all references in the specified database
    const results = await searchService.searchSingleDatabase(request.references, database)
    return createSuccessResponse(c, results)
  }
  catch (error) {
    return handleError(c, error)
  }
}

/**
 * Parse and validate the incoming request
 */
async function parseAndValidateRequest(c: Context): Promise<SearchRequest> {
  const rawBody = await c.req.json()
  const parseResult = SearchRequestSchema.safeParse(rawBody)

  if (!parseResult.success) {
    console.warn('SearchController: Validation failed:', parseResult.error)
    throw new ValidationError('Request validation failed', parseResult.error)
  }

  console.warn(`SearchController: Processing search request for ${parseResult.data.references.length} references`)
  return parseResult.data
}

/**
 * Create a successful API response
 */
function createSuccessResponse(c: Context, results: SearchResult[]) {
  const response: ApiResponse<SearchResponse> = {
    success: true,
    data: {
      results,
    },
  }
  return c.json(response)
}

/**
 * Handle errors and create appropriate error responses
 */
function handleError(c: Context, error: unknown) {
  console.error('SearchController: Error during search:', error)

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
