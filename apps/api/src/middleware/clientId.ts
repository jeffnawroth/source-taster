// src/middleware/clientId.ts
import type { MiddlewareHandler } from 'hono'
import { z } from 'zod'
import { BadRequest, Unauthorized } from '../errors/AppError'

export interface AppEnv { Variables: { userId: string } }

// Schema für den Header
const ClientIdHeaderSchema = z.string().uuid({
  message: 'Invalid X-Client-Id (must be a valid UUID)',
})

export const withClientId: MiddlewareHandler<AppEnv> = async (c, next) => {
  // Preflight-Requests nicht blockieren
  if (c.req.method === 'OPTIONS') {
    return next()
  }

  const clientIdHeader = c.req.header('X-Client-Id')

  if (!clientIdHeader) {
    throw Unauthorized('Missing X-Client-Id')
  }

  const result = ClientIdHeaderSchema.safeParse(clientIdHeader.trim())
  if (!result.success) {
    throw BadRequest(result.error.issues[0]?.message ?? 'Invalid X-Client-Id')
  }

  // Setze validierte UUID in den Context
  c.set('userId', result.data)

  await next()
}
