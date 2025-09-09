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
   * Body: { provider, apiKey }
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
   */
  static async getAISecretsInfo(c: Context): Promise<Response> {
    const userId = c.get('userId') as string
    const provider = userService.validateProvider(c.req.query('provider'))

    const data = await userService.getUserAISecretInfo(userId, provider)

    const payload = ApiUserAISecretsInfoResponseSchema.parse({
      success: true,
      data,
    })
    return c.json(payload)
  }

  /**
   * DELETE /api/user/ai-secrets?provider=...
   */
  static async deleteAISecrets(c: Context): Promise<Response> {
    const userId = c.get('userId') as string
    const provider = userService.validateProvider(c.req.query('provider'))

    const deleted = await userService.deleteUserAISecret(userId, provider)

    const payload = ApiUserAISecretsDeleteResponseSchema.parse({
      success: true,
      data: { deleted },
    })
    return c.json(payload)
  }
}
