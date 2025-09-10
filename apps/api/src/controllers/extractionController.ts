// src/controllers/extractionController.ts

import type {
  ApiExtractData,
  ApiExtractReference,
  ApiExtractRequest,
} from '@source-taster/types'
import type { Context } from 'hono'

import { ApiExtractRequestSchema } from '@source-taster/types'
import { ReferenceExtractionCoordinator } from '../services/extraction/referenceExtractionCoordinator'

/**
 * Extract references from text using AI
 * POST /api/extract
 */
export async function extractReferences(c: Context) {
  const userId = c.get('userId') as string
  const request = await parseAndValidateRequest(c)

  const coordinator = new ReferenceExtractionCoordinator(userId)
  const references = await coordinator.extractReferences(request)

  return createSuccessResponse(c, references)
}

async function parseAndValidateRequest(c: Context): Promise<ApiExtractRequest> {
  const rawBody = await c.req.json()
  return ApiExtractRequestSchema.parse(rawBody)
}

function createSuccessResponse(c: Context, references: ApiExtractReference[]) {
  const response: ApiExtractData = { references }
  return c.json({ success: true, data: response })
}
