import type { Context } from 'hono'
import {
  ApiUserAISecretsDeleteResponseSchema,
  ApiUserAISecretsInfoResponseSchema,
  ApiUserAISecretsRequestSchema,
  ApiUserAISecretsResponseSchema,
} from '@source-taster/types'
import { userService } from '../services/userService'

export class UserController {
  /**
   * POST /api/user/ai-secrets
   * Save AI API key for user
   */
  static async saveAISecrets(c: Context): Promise<Response> {
    const userId = c.get('userId') as string
    const { provider, apiKey } = ApiUserAISecretsRequestSchema.parse(await c.req.json())

    const saved = await userService.saveUserAISecret(userId, provider, apiKey)

    const payload = ApiUserAISecretsResponseSchema.parse({
      success: true,
      data: { saved },
    })

    return c.json(payload)
  }

  /**
   * GET /api/user/ai-secrets?provider=...
   * Get information about user's AI secrets for a specific provider
   */
  static async getAISecretsInfo(c: Context): Promise<Response> {
    const userId = c.get('userId') as string
    const providerQuery = c.req.query('provider')

    const provider = userService.validateProvider(providerQuery)
    const data = await userService.getUserAISecretInfo(userId, provider)

    const payload = ApiUserAISecretsInfoResponseSchema.parse({
      success: true,
      data,
    })

    return c.json(payload)
  }

  /**
   * DELETE /api/user/ai-secrets?provider=...
   * Delete AI API key for user and provider
   */
  static async deleteAISecrets(c: Context): Promise<Response> {
    const userId = c.get('userId') as string
    const providerQuery = c.req.query('provider')

    const provider = userService.validateProvider(providerQuery)
    const deleted = await userService.deleteUserAISecret(userId, provider)

    const payload = ApiUserAISecretsDeleteResponseSchema.parse({
      success: true,
      data: { deleted },
    })

    return c.json(payload)
  }
}
