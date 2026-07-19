import type {
  ApiExtractResponse,
} from '@source-taster/types'
import type { Context } from 'hono'
import { trace } from '@opentelemetry/api'
import { ApiExtractRequestSchema } from '@source-taster/types'
import { referencesExtractedTotal } from '../middleware/metrics.js'
import { ReferenceExtractionCoordinator } from '../services/extraction/referenceExtractionCoordinator.js'

const tracer = trace.getTracer('source-taster-api', '2.1.3')

/**
 * Extract references from text using AI
 * POST /api/extract
 */
export async function extractReferences(c: Context) {
  return tracer.startActiveSpan('extract.references', async (span) => {
    const userId = c.get('userId') as string
    const req = ApiExtractRequestSchema.parse(await c.req.json())

    span.setAttribute('ai_provider', req.aiSettings?.provider ?? 'unknown')
    span.setAttribute('user_id', userId)

    const coordinator = new ReferenceExtractionCoordinator(userId)
    const references = await coordinator.extractReferences(req)

    span.setAttribute('references_count', references.length)
    referencesExtractedTotal.inc({ ai_provider: req.aiSettings?.provider ?? 'unknown' })

    span.end()
    return c.json({ success: true, data: { references } } as ApiExtractResponse)
  })
}
