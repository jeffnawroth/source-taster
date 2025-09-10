import type { ApiExtractData, ApiExtractReference, ApiExtractRequest } from '@source-taster/types'

import type { Context } from 'hono'
import { ApiExtractRequestSchema } from '@source-taster/types'
import * as extractionService from '../services/extraction/extractionCoordinator'

/**
 * Extract references from text using AI
 * POST /api/extract
 */
export async function extractReferences(c: Context) {
  const userId = c.get('userId') as string

  const request = await parseAndValidateRequest(c)

  const references = await extractionService.extractReferences(userId, request)
  return createSuccessResponse(c, references)
}

// extractionController.ts (oder wo die Funktion ist)
async function parseAndValidateRequest(c: Context): Promise<ApiExtractRequest> {
  const rawBody = await c.req.json()
  return ApiExtractRequestSchema.parse(rawBody)
}
/**
 * Create a successful response
 */
function createSuccessResponse(c: Context, references: ApiExtractReference[]) {
  const response = { references } as ApiExtractData
  return c.json({
    success: true,
    data: response,
  })
}
