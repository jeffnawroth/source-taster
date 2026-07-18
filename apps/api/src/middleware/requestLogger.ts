import type { MiddlewareHandler } from 'hono'
import { logger } from './logger.js'

export function requestLogger(): MiddlewareHandler {
  return async (c, next) => {
    const path = c.req.path

    if (path === '/health' || path === '/metrics') {
      await next()
      return
    }

    const start = Date.now()
    const method = c.req.method
    const route = path.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
    const userId = c.get('userId') as string | undefined

    await next()

    const duration = Date.now() - start
    const status = c.res.status
    const requestId = c.get('requestId') as string | undefined
    const childLogger = requestId ? logger.child({ requestId }) : logger

    if (status >= 500) {
      childLogger.error({ method, path, route, status, duration, userId }, `${method} ${path} → ${status} (${duration}ms)`)
    }
    else if (status >= 400) {
      childLogger.warn({ method, path, route, status, duration, userId }, `${method} ${path} → ${status} (${duration}ms)`)
    }
    else {
      childLogger.info({ method, path, route, status, duration, userId }, `${method} ${path} → ${status} (${duration}ms)`)
    }
  }
}
