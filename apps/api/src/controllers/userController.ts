import type { Context } from 'hono'
import {
  ApiUserAISecretsDeleteResponseSchema,
  ApiUserAISecretsInfoResponseSchema,
  ApiUserAISecretsRequestSchema,
  ApiUserAISecretsResponseSchema,
} from '@source-taster/types'
import { userSecretsService } from '../services/userSecretsService'

/**
 * POST /api/user/ai-secrets
 * Body: { provider, apiKey }
 */
export async function saveAISecrets(c: Context): Promise<Response> {
  const userId = c.get('userId') as string
  const { provider, apiKey } = ApiUserAISecretsRequestSchema.parse(await c.req.json())

  const saved = await userSecretsService.saveUserAISecret(userId, provider, apiKey)

  const payload = ApiUserAISecretsResponseSchema.parse({
    success: true,
    data: { saved },
  })
  return c.json(payload)
}

/**
 * GET /api/user/ai-secrets?provider=...
 */
export async function getAISecretsInfo(c: Context): Promise<Response> {
  const userId = c.get('userId') as string
  const provider = userSecretsService.validateProvider(c.req.query('provider'))

  const data = await userSecretsService.getUserAISecretInfo(userId, provider)

  const payload = ApiUserAISecretsInfoResponseSchema.parse({
    success: true,
    data,
  })
  return c.json(payload)
}

/**
 * DELETE /api/user/ai-secrets?provider=...
 */
export async function deleteAISecrets(c: Context): Promise<Response> {
  const userId = c.get('userId') as string
  const provider = userSecretsService.validateProvider(c.req.query('provider'))

  const deleted = await userSecretsService.deleteUserAISecret(userId, provider)

  const payload = ApiUserAISecretsDeleteResponseSchema.parse({
    success: true,
    data: { deleted },
  })
  return c.json(payload)
}
