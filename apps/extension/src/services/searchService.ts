// extension/services/searchService.ts
/**
 * Service for searching references in external databases
 */
import type {
  ApiResult,
  ApiSearchData,
  ApiSearchRequest,
} from '@source-taster/types'
import { ApiSearchRequestSchema } from '@source-taster/types'
import { API_CONFIG } from '../env'
import { apiCall } from './http'

const API_BASE_URL = API_CONFIG.baseUrl + API_CONFIG.endpoints.search

export class SearchService {
  /**
   * Search for candidates in external databases for given references
   * @param request - The search request containing references to find candidates for
   * @returns ApiResult with { results: ApiSearchResult[] }
   */
  static async searchCandidates(
    request: ApiSearchRequest,
  ): Promise<ApiResult<ApiSearchData>> {
    const req = ApiSearchRequestSchema.parse(request)

    return apiCall<ApiSearchData>(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })
  }
}
