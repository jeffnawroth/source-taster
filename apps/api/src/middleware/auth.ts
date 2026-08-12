import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { hashApiKey } from '../services/apiKeyService.js'

export interface ApiKeyContext { apiKey: { id: string, keyPrefix: string } }

export function keyAuth(lookup: (hash: string) => Promise<{ id: string, keyPrefix: string, status: string } | null>): MiddlewareHandler<{ Variables: ApiKeyContext }> {
  return async (c, next) => {
    const header = c.req.header('X-API-Key')

    // kein Key -> Browser-Pfad (CORS + X-Client-Id) läuft weiter
    if (!header)
      return next()

    const row = await lookup(hashApiKey(header))
    if (!row || row.status !== 'active') {
      throw new HTTPException(401, { message: 'Invalid API key' })
    }

    c.set('apiKey', { id: row.id, keyPrefix: row.keyPrefix })
    await next()
  }
}
