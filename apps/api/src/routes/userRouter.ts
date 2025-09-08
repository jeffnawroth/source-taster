import type { AppEnv } from '../types/hono'
import { ApiAIProviderSchema, ApiUserAISecretsSchema } from '@source-taster/types'
import { Hono } from 'hono'
import { withClientId } from '../middleware/clientId'
import { deleteApiKey, loadApiKey, saveApiKey } from '../secrets/keystore'

const userRouter = new Hono<AppEnv>()

userRouter.use('*', withClientId)

// POST /api/user/ai-secrets  -> save/update encrypted key
userRouter.post('/ai-secrets', async (c) => {
  const body = await c.req.json()
  const { provider, apiKey } = ApiUserAISecretsSchema.parse(body)
  const userId = c.get('userId') as string
  await saveApiKey(userId, provider, apiKey)
  return c.json({ success: true, message: 'Saved' })
})

// GET /api/user/ai-settings?provider=openai  -> hasApiKey flag
userRouter.get('/ai-settings', async (c) => {
  const provider = ApiAIProviderSchema.parse(c.req.query('provider') ?? 'openai')
  const userId = c.get('userId') as string
  const hasApiKey = !!(await loadApiKey(userId, provider))
  return c.json({ success: true, provider, hasApiKey })
})

// DELETE /api/user/ai-secrets?provider=openai
userRouter.delete('/ai-secrets', async (c) => {
  const provider = ApiAIProviderSchema.parse(c.req.query('provider') ?? 'openai')
  const userId = c.get('userId') as string
  await deleteApiKey(userId, provider)
  return c.json({ success: true, message: 'Deleted' })
})

export { userRouter }
