import process from 'node:process'
import { serve } from '@hono/node-server'
import { httpInstrumentationMiddleware } from '@hono/otel'
import { Hono } from 'hono'
import { registerOnError } from './errors/registerOnError.js'
import { keyAuth } from './middleware/auth.js'
import { withClientId } from './middleware/clientId.js'
import { corsMiddleware } from './middleware/cors.js'
import { logger } from './middleware/logger.js'
import { metricsMiddleware } from './middleware/metrics.js'
import { rateLimit } from './middleware/rateLimit.js'
import { requestId } from './middleware/requestId.js'
import { requestLogger } from './middleware/requestLogger.js'
import { anystyleRouter } from './routes/anystyleRouter.js'
import extractionRouter from './routes/extractionRouter.js'
import { healthRouter } from './routes/healthRouter.js'
import matchingRouter from './routes/matchingRouter.js'
import searchRouter from './routes/searchRouter.js'
import { userRouter } from './routes/userRouter.js'
import { findApiKeyByHash } from './services/apiKeyService.js'
import './telemetry/instrumentation.js'

const app = new Hono()

registerOnError(app)

app.use('*', httpInstrumentationMiddleware())
app.use('*', requestId())
app.use('*', requestLogger())
app.use('*', metricsMiddleware())
app.use('/v1/*', corsMiddleware)

// Mount health & metrics — not protected by CORS so monitoring tools work
app.route('/', healthRouter)

// API-Key-Auth: optional-invalidierend — fehlt der Key, läuft der Browser-Pfad
app.use('/v1/*', keyAuth(findApiKeyByHash))

// Rate-Limiting: Bucket pro API-Key, geteilter Bucket für anonyme Caller (nach keyAuth, vor den Routen)
app.use('/v1/*', rateLimit())

// Browser-Clients: X-Client-Id bleibt Pflicht für diese Routen
app.use('/v1/user/*', withClientId)
app.use('/v1/extract', withClientId)

// Mount API routes (versioned namespace)
app.route('/v1/anystyle', anystyleRouter)
app.route('/v1/extract', extractionRouter)
app.route('/v1/match', matchingRouter)
app.route('/v1/search', searchRouter)
app.route('/v1/user', userRouter)

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Source Taster API',
    endpoints: {
      anystyle: '/v1/anystyle',
      extract: '/v1/extract',
      search: '/v1/search',
      match: '/v1/match',
    },
  })
})

const port = Number(process.env.PORT || '') || 8000
logger.info(`API running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
