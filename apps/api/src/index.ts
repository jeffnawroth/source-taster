import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/errorHandler'
import extractionRouter from './routes/extractionRouter'
import matchingRouter from './routes/matchingRouter'

const app = new Hono()

// Apply CORS middleware
app.use('*', corsMiddleware)

app.use('*', errorHandler)

// Mount API routes
app.route('/api/extract', extractionRouter)
app.route('/api/match', matchingRouter)

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Source Taster API',
    endpoints: {
      extract: '/api/extract',
      match: '/api/match',
      matchWebsite: '/api/match/website',
    },
  })
})

const port = Number(process.env.PORT || '') || 8000
console.warn(`🚀 API running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
