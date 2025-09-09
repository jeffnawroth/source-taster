import type { AppEnv } from '../types/hono'
// src/routes/userRouter.ts
import { Hono } from 'hono'
import { UserController } from '../controllers/userController'

export const userRouter = new Hono<AppEnv>()

// POST /api/user/ai-secrets
userRouter.post('/ai-secrets', UserController.saveAISecrets)

// GET /api/user/ai-secrets?provider=...
userRouter.get('/ai-secrets', UserController.getAISecretsInfo)

// DELETE /api/user/ai-secrets?provider=...
userRouter.delete('/ai-secrets', UserController.deleteAISecrets)
