/**
 * Service for extracting references from text using AI
 */
import type { ApiExtractRequest, ApiExtractResponse } from '@source-taster/types'
import { ApiExtractRequestSchema } from '@source-taster/types'
import { API_CONFIG } from '../env'

const API_BASE_URL = API_CONFIG.baseUrl + API_CONFIG.endpoints.extract

export class ExtractionService {
  /**
   * Extract references from text using AI
   * @param request - The extraction request containing text and settings
   * @returns Extracted references
   */
  static async extractReferences(request: ApiExtractRequest): Promise<ApiExtractResponse> {
    const req = ApiExtractRequestSchema.parse(request)

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })

    const result = await response.json() as ApiExtractResponse

    if (!response.ok || !result.success) {
      throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`)
    }

    return result
  }
}
