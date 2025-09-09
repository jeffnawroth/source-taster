import type { AppEnv } from '../types/hono'
import {
  ApiAIProviderSchema,
  type ApiUserAISecretsDeleteResponse,
  type ApiUserAISecretsInfoResponse,
  ApiUserAISecretsRequestSchema,
  type ApiUserAISecretsResponse,
} from '@source-taster/types'
// src/routes/userRouter.ts
import { Hono } from 'hono'
import { deleteApiKey, loadApiKey, saveApiKey } from '../secrets/keystore'

export const userRouter = new Hono<AppEnv>()

// POST /api/user/ai-secrets  -> save/update key
userRouter.post('/ai-secrets', async (c) => {
  const body = await c.req.json()
  const { provider, apiKey } = ApiUserAISecretsRequestSchema.parse(body)
  const userId = c.get('userId') as string

  await saveApiKey(userId, provider, apiKey)

  return c.json<ApiUserAISecretsResponse>({
    success: true,
    data: { saved: true },
  })
})

// GET /api/user/ai-secrets?provider=openai  -> info
userRouter.get('/ai-secrets', async (c) => {
  const provider = ApiAIProviderSchema.parse(c.req.query('provider') ?? 'openai')
  const userId = c.get('userId') as string

  const key = await loadApiKey(userId, provider)
  const hasApiKey = Boolean(key)

  return c.json<ApiUserAISecretsInfoResponse>({
    success: true,
    data: { hasApiKey, provider },
  })
})

// DELETE /api/user/ai-secrets?provider=openai
userRouter.delete('/ai-secrets', async (c) => {
  const provider = ApiAIProviderSchema.parse(c.req.query('provider') ?? 'openai')
  const userId = c.get('userId') as string

  await deleteApiKey(userId, provider)

  return c.json<ApiUserAISecretsDeleteResponse>({
    success: true,
    data: { deleted: true },
  })
})
