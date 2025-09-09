// extension/services/extractionService.ts
/**
 * Service for extracting references from text using AI
 */
import type { ApiExtractRequest, ApiExtractResponse, ApiResult } from '@source-taster/types'
import { ApiExtractRequestSchema } from '@source-taster/types'
import { clientId } from '@/extension/logic/storage' // UUIDv4
import { API_CONFIG } from '../env'
import { apiCall } from './http'

const API_BASE_URL = API_CONFIG.baseUrl + API_CONFIG.endpoints.extract

export class ExtractionService {
  static async extractReferences(request: ApiExtractRequest): Promise<ApiResult<ApiExtractResponse['data']>> {
    const req = ApiExtractRequestSchema.parse(request)

    return apiCall<ApiExtractResponse['data']>(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': typeof clientId === 'string' ? clientId : clientId.value,
      },
      body: JSON.stringify(req),
    })
  }
}
