import type { StatusCode } from 'hono/utils/http-status'
import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { ZodError } from 'zod'
import { AppError, isAppError } from './errors/AppError'
import { withClientId } from './middleware/clientId'
import { corsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/errorHandler'
import { anystyleRouter } from './routes/anystyleRouter'
import extractionRouter from './routes/extractionRouter'
import matchingRouter from './routes/matchingRouter'
import searchRouter from './routes/searchRouter'
import { userRouter } from './routes/userRouter'

const app = new Hono()

app.onError((err, c) => {
  try {
    // Zod
    if (err instanceof ZodError) {
      const message = err.issues
        .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; ')
      c.status(400 as StatusCode)
      return c.json({ success: false, error: 'validation_error', message })
    }

    // AppError
    if (isAppError(err)) {
      const e = err as AppError
      const status = (typeof e.status === 'number' ? e.status : 500) as StatusCode
      c.status(status)
      return c.json({
        success: false,
        error: e.code ?? 'app_error',
        message: e.message,
      })
    }

    // Fallback
    console.error('Unhandled error (onError):', err)
    c.status(500 as StatusCode)
    return c.json({
      success: false,
      error: 'internal_error',
      message: 'Unexpected server error',
    })
  }
  catch (respondError) {
    console.error('Error inside errorHandler:', respondError)
    c.status(500 as StatusCode)
    return c.json({
      success: false,
      error: 'handler_error',
      message: 'Error in error handler',
    })
  }
})

app.use('*', errorHandler)
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

app.get('/__error-test', () => {
  throw new AppError('Test error from endpoint', 401, 'test_error')
})

const port = Number(process.env.PORT || '') || 8000
console.warn(`🚀 API running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
