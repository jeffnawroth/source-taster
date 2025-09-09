import type {
  ApiAIProvider,
  ApiUserAISecretsData,
  ApiUserAISecretsDeleteData,
  ApiUserAISecretsInfoData,
  ApiUserAISecretsRequest,
} from '@source-taster/types'
import { clientId } from '@/extension/logic/storage'
// extension/services/userService.ts
import { API_CONFIG } from '../env'
import { apiCall } from './http'

const BASE = API_CONFIG.baseUrl
const AI_SECRETS_URL = `${BASE}${API_CONFIG.endpoints.user.aiSecrets}`

export class UserService {
  static saveAISecrets(payload: ApiUserAISecretsRequest) {
    return apiCall<ApiUserAISecretsData>(AI_SECRETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Client-Id': typeof clientId === 'string' ? clientId : clientId.value },
      body: JSON.stringify(payload),
    })
  }

  static getAISecretsInfo(provider: ApiAIProvider) {
    return apiCall<ApiUserAISecretsInfoData>(`${AI_SECRETS_URL}?provider=${provider}`, {
      headers: { 'X-Client-Id': typeof clientId === 'string' ? clientId : clientId.value },
    })
  }

  static deleteAISecrets(provider: ApiAIProvider) {
    return apiCall<ApiUserAISecretsDeleteData>(`${AI_SECRETS_URL}?provider=${provider}`, {
      method: 'DELETE',
      headers: { 'X-Client-Id': typeof clientId === 'string' ? clientId : clientId.value },
    })
  }
}
