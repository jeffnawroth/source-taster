import type {
  ApiResponse,
  ExtractionRequest,
  ExtractionResponse,
} from '@source-taster/types'
import type { Context } from 'hono'
import { ExtractionRequestSchema } from '@source-taster/types'

import * as extractionService from '../services/extractionService'

/**
 * Extract references from text using AI
 * POST /api/extract
 */
export async function extractReferences(c: Context) {
  try {
    const request = await parseAndValidateRequest(c)
    const references = await extractionService.extractReferences(request)
    return createSuccessResponse(c, references)
  }
  catch (error) {
    return handleError(c, error)
  }
}

/**
 * Parse and validate the incoming request
 */
async function parseAndValidateRequest(c: Context): Promise<ExtractionRequest> {
  // Get decrypted body from middleware or fall back to regular parsing
  const rawBody = c.get('decryptedBody') || await c.req.json()
  const parseResult = ExtractionRequestSchema.safeParse(rawBody)

  if (!parseResult.success) {
    throw new ValidationError('Validation failed', parseResult.error)
  }

  return parseResult.data
}

/**
 * Create a successful response
 */
function createSuccessResponse(c: Context, references: any) {
  const response: ExtractionResponse = { references }
  return c.json({
    success: true,
    data: response,
  })
}

/**
 * Handle errors and create error response
 */
function handleError(c: Context, error: unknown) {
  console.error('Error in extractReferences:', error)

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
