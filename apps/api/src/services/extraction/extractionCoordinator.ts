import type { ApiExtractRequest } from '@source-taster/types'
import { ReferenceExtractionService } from './referenceExtractionService'

export async function extractReferences(userId: string, request: ApiExtractRequest) {
  const svc = new ReferenceExtractionService(userId)
  return await svc.extractReferences(request)
}
