import type { StatusCode } from 'hono/utils/http-status'
import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { withClientId } from './middleware/clientId'
import { corsMiddleware } from './middleware/cors'
import { anystyleRouter } from './routes/anystyleRouter'
import extractionRouter from './routes/extractionRouter'
import matchingRouter from './routes/matchingRouter'
import searchRouter from './routes/searchRouter'
import { userRouter } from './routes/userRouter'

const app = new Hono()

app.onError((err, c) => {
  if (err instanceof ZodError) {
    const message = err.issues
      .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ')
    c.status(400 as StatusCode)
    return c.json({ success: false, error: 'validation_error', message })
  }

  if (err instanceof HTTPException) {
    const status = err.status as StatusCode
    const message = err.message || 'HTTP error'
    c.status(status)
    // simple Mapping von Status → Error-Code
    const error
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

    return c.json({ success: false, error, message })
  }

  // 3) Fallback → 500 JSON
  console.error('Unhandled error (onError):', err)
  c.status(500 as StatusCode)
  return c.json({ success: false, error: 'internal_error', message: 'Unexpected server error' })
})

app.use('*', corsMiddleware)

app.use('/api/user/*', withClientId)
app.use('/api/extract', withClientId)

// Mount API routes
app.route('/api/anystyle', anystyleRouter)
app.route('/api/extract', extractionRouter)
app.route('/api/match', matchingRouter)
app.route('/api/search', searchRouter)
app.route('/api/user', userRouter)

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Source Taster API',
    endpoints: {
      anystyle: '/api/anystyle',
      extract: '/api/extract',
      search: '/api/search',
      match: '/api/match',
    },
  })
})

const port = Number(process.env.PORT || '') || 8000
console.warn(`🚀 API running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
