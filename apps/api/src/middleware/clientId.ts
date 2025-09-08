// src/middleware/clientId.ts
import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

export interface AppEnv { Variables: { userId: string } }

// UUID v4 Check via Zod
const ClientIdSchema = z.string().uuid()

export const withClientId: MiddlewareHandler<AppEnv> = async (c, next) => {
  // OPTIONS (Preflight) durchlassen
  if (c.req.method === 'OPTIONS') {
    return next()
  }

  const clientId = c.req.header('X-Client-Id')
  if (!clientId) {
    throw new HTTPException(401, { message: 'Missing X-Client-Id' })
  }

  const ok = ClientIdSchema.safeParse(clientId)
  if (!ok.success) {
    throw new HTTPException(400, { message: 'Invalid X-Client-Id (must be UUIDv4)' })
  }

  c.set('userId', clientId)
  await next()
}
