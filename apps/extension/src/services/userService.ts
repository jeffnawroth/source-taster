import type {
  ApiResult,
  ApiUserAISecretsData,
  ApiUserAISecretsDeleteData,
  ApiUserAISecretsInfoData,
  ApiUserAISecretsRequest,
} from '@source-taster/types'
import { clientId } from '@/extension/logic/storage'
import { API_CONFIG } from '../env'
import { apiCall } from './http'

const AI_SECRETS_URL = API_CONFIG.baseUrl + API_CONFIG.endpoints.user.aiSecrets

export class UserService {
  static async saveAISecrets(payload: ApiUserAISecretsRequest): Promise<ApiResult<ApiUserAISecretsData>> {
    return apiCall<ApiUserAISecretsData>(AI_SECRETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': typeof clientId === 'string' ? clientId : clientId.value,
      },
      body: JSON.stringify(payload),
    })
  }

  static async getAISecretsInfo(): Promise<ApiResult<ApiUserAISecretsInfoData>> {
    return apiCall<ApiUserAISecretsInfoData>(AI_SECRETS_URL, {
      method: 'GET',
      headers: {
        'X-Client-Id': typeof clientId === 'string' ? clientId : clientId.value,
      },
    })
  }

  static async deleteAISecrets(): Promise<ApiResult<ApiUserAISecretsDeleteData>> {
    return apiCall<ApiUserAISecretsDeleteData>(AI_SECRETS_URL, {
      method: 'DELETE',
      headers: {
        'X-Client-Id': typeof clientId === 'string' ? clientId : clientId.value,
      },
    })
  }
}
