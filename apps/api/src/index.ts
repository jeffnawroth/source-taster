import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { registerOnError } from './errors/registerOnError.js'
import { withClientId } from './middleware/clientId.js'
import { corsMiddleware } from './middleware/cors.js'
import { anystyleRouter } from './routes/anystyleRouter.js'
import extractionRouter from './routes/extractionRouter.js'
import matchingRouter from './routes/matchingRouter.js'
import searchRouter from './routes/searchRouter.js'
import { userRouter } from './routes/userRouter.js'

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
