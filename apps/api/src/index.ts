import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { registerOnError } from './errors/registerOnError'
import { withClientId } from './middleware/clientId'
import { corsMiddleware } from './middleware/cors'
import { anystyleRouter } from './routes/anystyleRouter'
import extractionRouter from './routes/extractionRouter'
import matchingRouter from './routes/matchingRouter'
import searchRouter from './routes/searchRouter'
import { userRouter } from './routes/userRouter'

const app = new Hono()

registerOnError(app)

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
