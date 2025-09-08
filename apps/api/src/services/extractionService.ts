import type { ApiExtractRequest } from '@source-taster/types'
import { ReferenceExtractionService } from './referenceExtractionService'

// Service instance
const referenceExtractionService = new ReferenceExtractionService()

/**
 * Extract references from text using AI
 */
export async function extractReferences(request: ApiExtractRequest) {
  return await referenceExtractionService.extractReferences(request)
}
