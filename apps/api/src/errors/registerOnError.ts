// src/errors/registerOnError.ts
import type { Hono } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'

export function registerOnError(app: Hono) {
  app.onError((err, c) => {
    // Zod → 400
    if (err instanceof ZodError) {
      const message = err.issues
        .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; ')
      c.status(400 as StatusCode)
      return c.json({ success: false, error: 'validation_error', message })
    }

    // Hono HTTPException → Status & Message ins JSON gießen
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
      c.status(status)
      return c.json({ success: false, error: map, message: err.message || 'HTTP error' })
    }

    // Fallback → 500
    console.error('Unhandled error (onError):', err)
    c.status(500 as StatusCode)
    return c.json({ success: false, error: 'internal_error', message: 'Unexpected server error' })
  })
}
