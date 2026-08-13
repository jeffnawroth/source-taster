import type { MiddlewareHandler } from 'hono'

const HSTS_VALUE = 'max-age=31536000; includeSubDomains'

export function securityHeaders(): MiddlewareHandler {
  return async (c, next) => {
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-Frame-Options', 'DENY')
    c.header('Referrer-Policy', 'no-referrer')
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    if (c.req.raw.headers.get('x-forwarded-proto') === 'https' || new URL(c.req.url).protocol === 'https:')
      c.header('Strict-Transport-Security', HSTS_VALUE)
    if (c.req.path.startsWith('/v1/'))
      c.header('Cache-Control', 'no-store')
    await next()
  }
}
