// extension/services/searchService.ts
/**
 * Service for searching references in external databases
 */
import type {
  ApiResult,
  ApiSearchData,
  ApiSearchRequest,
  ApiSearchSource,
} from '@source-taster/types'
import { ApiSearchRequestSchema } from '@source-taster/types'
import { API_CONFIG } from '../env'
import { apiCall } from './http'

const API_BASE_URL = API_CONFIG.baseUrl + API_CONFIG.endpoints.search

export class SearchService {
  /**
   * Search in a single database by name
   */
  static async searchInDatabase(
    database: ApiSearchSource,
    request: ApiSearchRequest,
  ): Promise<ApiResult<ApiSearchData>> {
    const req = ApiSearchRequestSchema.parse(request)

    return apiCall<ApiSearchData>(`${API_BASE_URL}/${encodeURIComponent(database)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
  }
}
