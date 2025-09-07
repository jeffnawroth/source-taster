/**
 * Service for searching references in external databases
 */
import type {
  ApiResponse,
  SearchRequest,
  SearchResponse,
} from '@source-taster/types'
import { API_CONFIG } from '../env'

const API_BASE_URL = API_CONFIG.baseUrl + API_CONFIG.endpoints.search

export class SearchService {
  /**
   * Search for candidates in external databases for given references
   * @param request - The search request containing references to find candidates for
   * @returns Search results with candidates from external databases
   */
  static async searchCandidates(request: SearchRequest): Promise<ApiResponse<SearchResponse>> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    const result = await response.json() as ApiResponse<SearchResponse>

    if (!response.ok || !result.success) {
      throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`)
    }

    return result
  }
}
