import type { AppEnv } from '../types/hono'
// src/routes/userRouter.ts
import { Hono } from 'hono'
import {
  deleteAISecrets,
  getAISecretsInfo,
  saveAISecrets,
} from '../controllers/userController.js'

export const userRouter = new Hono<AppEnv>()

// POST /v1/user/ai-secrets
userRouter.post('/ai-secrets', saveAISecrets)

// GET /v1/user/ai-secrets?provider=...
userRouter.get('/ai-secrets', getAISecretsInfo)

// DELETE /v1/user/ai-secrets?provider=...
userRouter.delete('/ai-secrets', deleteAISecrets)
