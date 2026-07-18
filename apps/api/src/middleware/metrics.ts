import type { MiddlewareHandler } from 'hono'
import client from 'prom-client'

const register = new client.Registry()

client.collectDefaultMetrics({ register })

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [register],
})

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
})

const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['error_code', 'route'] as const,
  registers: [register],
})

const searchesTotal = new client.Counter({
  name: 'searches_total',
  help: 'Total number of database searches performed',
  labelNames: ['provider', 'status'] as const,
  registers: [register],
})

const searchDurationSeconds = new client.Histogram({
  name: 'search_duration_seconds',
  help: 'Search duration in seconds per provider',
  labelNames: ['provider'] as const,
  buckets: [0.1, 0.5, 1, 2.5, 5, 10, 30],
  registers: [register],
})

const referencesExtractedTotal = new client.Counter({
  name: 'references_extracted_total',
  help: 'Total number of AI-powered extractions',
  labelNames: ['ai_provider'] as const,
  registers: [register],
})

const matchCandidatesEvaluatedTotal = new client.Counter({
  name: 'match_candidates_evaluated_total',
  help: 'Total number of match candidates evaluated',
  registers: [register],
})

const matchDurationSeconds = new client.Histogram({
  name: 'match_duration_seconds',
  help: 'Match evaluation duration in seconds',
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5],
  registers: [register],
})

const extractionTokenUsageTotal = new client.Counter({
  name: 'extraction_token_usage_total',
  help: 'Total number of tokens used for AI extraction',
  labelNames: ['ai_provider', 'model'] as const,
  registers: [register],
})

const activeRequests = new client.Gauge({
  name: 'active_requests',
  help: 'Number of requests currently being processed',
  registers: [register],
})

const anystyleRequestsTotal = new client.Counter({
  name: 'anystyle_requests_total',
  help: 'Total number of AnyStyle requests',
  labelNames: ['operation', 'status'] as const,
  registers: [register],
})

const anystyleDurationSeconds = new client.Histogram({
  name: 'anystyle_duration_seconds',
  help: 'AnyStyle request duration in seconds',
  labelNames: ['operation'] as const,
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
})

const secretsOperationsTotal = new client.Counter({
  name: 'secrets_operations_total',
  help: 'Total number of user secrets operations',
  labelNames: ['operation'] as const,
  registers: [register],
})

function normalizePath(path: string): string {
  return path.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
}

export function metricsMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const start = Date.now()
    const method = c.req.method
    const route = normalizePath(c.req.path)

    activeRequests.inc()

    try {
      await next()
    }
    finally {
      const status = c.res.status
      const duration = (Date.now() - start) / 1000

      httpRequestsTotal.inc({ method, route, status_code: String(status) })
      httpRequestDurationSeconds.observe({ method, route, status_code: String(status) }, duration)
      activeRequests.dec()
    }
  }
}

export function incrementErrorCounter(errorCode: string, route?: string) {
  httpErrorsTotal.inc({ error_code: errorCode, route: route ?? 'unknown' })
}

export async function metricsHandler() {
  return register.metrics()
}

export {
  activeRequests,
  anystyleDurationSeconds,
  anystyleRequestsTotal,
  extractionTokenUsageTotal,
  matchCandidatesEvaluatedTotal,
  matchDurationSeconds,
  referencesExtractedTotal,
  register,
  searchDurationSeconds,
  searchesTotal,
  secretsOperationsTotal,
}
