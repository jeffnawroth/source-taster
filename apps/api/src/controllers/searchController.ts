import type { ApiResponse, ApiSearchRequest, ApiSearchResponse, ApiSearchResult } from '@source-taster/types'
import type { Context } from 'hono'
import { ApiSearchRequestSchema } from '@source-taster/types'
import searchCoordinator from '../services/search/searchCoordinator'

/**
 * Search for references in all external databases
 * POST /api/search
 */
export async function searchAllDatabases(c: Context) {
  try {
    const request = await parseAndValidateRequest(c)
    const results = await searchCoordinator.searchAllDatabases(request.references)
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
    const databases = await searchCoordinator.getDatabases()
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
    const results = await searchCoordinator.searchSingleDatabase(request.references, database)
    return createSuccessResponse(c, results)
  }
  catch (error) {
    return handleError(c, error)
  }
}

/**
 * Parse and validate the incoming request
 */
async function parseAndValidateRequest(c: Context): Promise<ApiSearchRequest> {
  const rawBody = await c.req.json()
  const parseResult = ApiSearchRequestSchema.safeParse(rawBody)

  if (!parseResult.success) {
    throw new ValidationError('Request validation failed', parseResult.error)
  }

  return parseResult.data
}

/**
 * Create a successful API response
 */
function createSuccessResponse(c: Context, results: ApiSearchResult[]) {
  const response: ApiSearchResponse = {
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
