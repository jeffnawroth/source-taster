import type { AppEnv } from '../types/hono'
// src/routes/userRouter.ts
import { Hono } from 'hono'
import {
  deleteAISecrets,
  getAISecretsInfo,
  saveAISecrets,
} from '../controllers/userController'

export const userRouter = new Hono<AppEnv>()

// POST /api/user/ai-secrets
userRouter.post('/ai-secrets', saveAISecrets)

// GET /api/user/ai-secrets?provider=...
userRouter.get('/ai-secrets', getAISecretsInfo)

// DELETE /api/user/ai-secrets?provider=...
userRouter.delete('/ai-secrets', deleteAISecrets)
