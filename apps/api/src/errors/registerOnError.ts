import type { Hono } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { logger } from '../middleware/logger.js'
import { incrementErrorCounter } from '../middleware/metrics.js'

export function registerOnError(app: Hono) {
  app.onError((err, c) => {
    const requestId = (c as any).get('requestId') as string | undefined
    const log = requestId ? logger.child({ requestId }) : logger
    const route = c.req.path.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')

    if (err instanceof ZodError) {
      const message = err.issues
        .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; ')
      incrementErrorCounter('validation_error', route)
      log.warn({ err }, `Validation error: ${message}`)
      c.status(400 as StatusCode)
      return c.json({ success: false, error: 'validation_error', message })
    }

    if (err instanceof HTTPException) {
      const status = err.status as StatusCode
      const map
        = status === 400
          ? 'bad_request'
          : status === 401
            ? 'unauthorized'
            : status === 403
              ? 'forbidden'
              : status === 404
                ? 'not_found'
                : status === 409
                  ? 'conflict'
                  : status === 422
                    ? 'unprocessable'
                    : status === 429
                      ? 'rate_limited'
                      : status >= 500 ? 'server_error' : 'http_error'
      if (status >= 500) {
        incrementErrorCounter(map, route)
        log.error({ err, status }, `HTTP ${status}: ${err.message}`)
      }
      else {
        log.warn({ err, status }, `HTTP ${status}: ${err.message}`)
      }
      c.status(status)
      return c.json({ success: false, error: map, message: err.message || 'HTTP error' })
    }

    incrementErrorCounter('internal_error', route)
    log.error({ err }, 'Unhandled error')
    c.status(500 as StatusCode)
    return c.json({ success: false, error: 'internal_error', message: 'Unexpected server error' })
  })
}
