// extension/services/matchingService.ts
/**
 * Service for matching references against external databases
 */
import type { ApiMatchData, ApiMatchRequest } from '@source-taster/types'
import { ApiMatchRequestSchema } from '@source-taster/types'
import { API_CONFIG } from '../env'
import { apiCall } from './http'

const API_BASE_URL = API_CONFIG.baseUrl + API_CONFIG.endpoints.match

export class MatchingService {
  /**
   * Match reference against candidates using specified matching settings
   * @param request - The matching request containing references and settings
   * @returns ApiResult<ApiMatchData>
   */
  static async matchReference(request: ApiMatchRequest, options?: { signal?: AbortSignal }) {
    const req = ApiMatchRequestSchema.parse(request)

    return apiCall<ApiMatchData>(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req),
      signal: options?.signal,
    })
  }
}
