import type { AppEnv } from '../types/hono'
import {
  ApiAIProviderSchema,
  ApiUserAISecretsDeleteResponseSchema,
  ApiUserAISecretsInfoResponseSchema,
  ApiUserAISecretsRequestSchema,
  ApiUserAISecretsResponseSchema,
} from '@source-taster/types'
// src/routes/userRouter.ts
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { deleteApiKey, loadApiKey, saveApiKey } from '../secrets/keystore'

export const userRouter = new Hono<AppEnv>()

// POST /api/user/ai-secrets
userRouter.post('/ai-secrets', async (c) => {
  const userId = c.get('userId')
  const { provider, apiKey } = ApiUserAISecretsRequestSchema.parse(await c.req.json())
  await saveApiKey(userId, provider, apiKey)
  return c.json(ApiUserAISecretsResponseSchema.parse({ success: true, data: { saved: true } }))
})

// GET /api/user/ai-secrets?provider=...
userRouter.get('/ai-secrets', async (c) => {
  const providerQ = c.req.query('provider')
  if (!providerQ)
    throw new HTTPException(400, { message: 'Missing ?provider' })
  const provider = ApiAIProviderSchema.parse(providerQ)
  const userId = c.get('userId')
  const hasApiKey = !!(await loadApiKey(userId, provider))
  return c.json(ApiUserAISecretsInfoResponseSchema.parse({
    success: true,
    data: { hasApiKey, provider },
  }))
})

// DELETE /api/user/ai-secrets?provider=...
userRouter.delete('/ai-secrets', async (c) => {
  const providerQ = c.req.query('provider')
  if (!providerQ)
    throw new HTTPException(400, { message: 'Missing ?provider' })
  const provider = ApiAIProviderSchema.parse(providerQ)
  const userId = c.get('userId')
  await deleteApiKey(userId, provider)
  return c.json(ApiUserAISecretsDeleteResponseSchema.parse({
    success: true,
    data: { deleted: true },
  }))
})
