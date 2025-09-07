/**
 * Service for matching references against external databases
 */
import type {
  ApiResponse,
  MatchingRequest,
  MatchingResponse,
} from '@source-taster/types'
import { API_CONFIG } from '../env'

const API_BASE_URL = API_CONFIG.baseUrl + API_CONFIG.endpoints.match

export class MatchingService {
  /**
   * Match references against external databases
   * @param request - The matching request containing references and settings
   * @returns Matching results
   */
  static async matchReferences(request: MatchingRequest): Promise<ApiResponse<MatchingResponse>> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    const result = await response.json() as ApiResponse<MatchingResponse>

    if (!response.ok || !result.success) {
      throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`)
    }

    return result
  }
}
