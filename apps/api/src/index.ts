import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { corsMiddleware, requestLogger } from './middleware/common'
import { errorHandler } from './middleware/errorHandler'
import v1Router from './routes/v1'

const app = new Hono()

// Apply middleware
app.use('*', corsMiddleware)
app.use('*', requestLogger)
app.use('*', errorHandler)

// Mount API routes
app.route('/api/v1', v1Router)

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Source Taster API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/v1/health',
      extract: '/api/v1/extract',
      verify: '/api/v1/verify',
      verifyWebsites: '/api/v1/verify/websites',
    },
  })
})

const port = Number(process.env.PORT || '') || 8000
// eslint-disable-next-line no-console
console.log(`🚀 Source Taster API is running on http://localhost:${port}`)
// eslint-disable-next-line no-console
console.log(`📚 API Documentation: http://localhost:${port}/api/v1/health`)

serve({
  fetch: app.fetch,
  port,
})
