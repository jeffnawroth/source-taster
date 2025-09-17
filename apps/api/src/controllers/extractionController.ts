import type {
  ApiResponse,
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
    // Get decrypted body from middleware or fall back to regular parsing
    const rawBody = c.get('decryptedBody') || await c.req.json()

    // Validate the request body (now with decrypted API key)
    const parseResult = ExtractionRequestSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return c.json({
        success: false,
        error: parseResult.error,
      }, 400)
    }

    const request = parseResult.data

    // Perform extraction
    const references = await extractionService.extractReferences(request)

    // Create success response
    const response: ApiResponse<ExtractionResponse> = {
      success: true,
      data: {
        references,
      },
    }

    return c.json(response)
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorResponse: ApiResponse = {
      success: false,
      error: errorMessage,
    }
    return c.json(errorResponse, 500)
  }
}
