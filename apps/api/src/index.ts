import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { corsMiddleware } from './middleware/common'
import { errorHandler } from './middleware/errorHandler'
import extractionRouter from './routes/extraction'
import verificationRouter from './routes/verification'

const app = new Hono()

// Apply middleware
app.use('*', corsMiddleware)
app.use('*', errorHandler)

// Mount API routes
app.route('/api/extract', extractionRouter)
app.route('/api/verify', verificationRouter)

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  })
})

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Source Taster API',
    endpoints: {
      health: '/api/health',
      extract: '/api/extract',
      verify: '/api/verify',
      verifyWebsites: '/api/verify/websites',
    },
  })
})

const port = Number(process.env.PORT || '') || 8000
console.warn(`🚀 API running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
