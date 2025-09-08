import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../types/hono'

export const withClientId: MiddlewareHandler<AppEnv> = async (c, next) => {
  const clientId = c.req.header('X-Client-Id')
  if (!clientId)
    return c.json({ success: false, message: 'Missing X-Client-Id' }, 401)

  // simpler Check; kannst du anpassen
  if (!/^[a-z0-9-]{10,}$/i.test(clientId) || clientId.length > 128) {
    return c.json({ success: false, message: 'Invalid client id' }, 400)
  }

  c.set('userId', clientId)
  await next()
}
