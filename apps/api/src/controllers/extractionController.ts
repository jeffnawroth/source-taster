// src/controllers/extractionController.ts

import type {
  ApiExtractResponse,
} from '@source-taster/types'
import type { Context } from 'hono'

import { ApiExtractRequestSchema } from '@source-taster/types'
import { ReferenceExtractionCoordinator } from '../services/extraction/referenceExtractionCoordinator.js'

/**
 * Extract references from text using AI
 * POST /api/extract
 */
export async function extractReferences(c: Context) {
  const userId = c.get('userId') as string
  const req = ApiExtractRequestSchema.parse(await c.req.json())

  const coordinator = new ReferenceExtractionCoordinator(userId)
  const references = await coordinator.extractReferences(req)

  return c.json({ success: true, data: { references } } as ApiExtractResponse)
}
