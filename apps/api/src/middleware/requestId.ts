import type { MiddlewareHandler } from 'hono'
import crypto from 'node:crypto'

export function requestId(): MiddlewareHandler {
  return async (c, next) => {
    const id = c.req.header('X-Request-Id') || crypto.randomUUID()
    c.set('requestId', id)
    c.res.headers.set('X-Request-Id', id)
    await next()
  }
}
