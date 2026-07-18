import type { ApiMatchData } from '@source-taster/types'
import type { Context } from 'hono'
import { ApiMatchRequestSchema } from '@source-taster/types'
import { matchCandidatesEvaluatedTotal, matchDurationSeconds } from '../middleware/metrics.js'
import { MatchingCoordinator } from '../services/matching/matchingCoordinator.js'

/**
 * POST /api/match
 */
export async function matchReference(c: Context) {
  const req = ApiMatchRequestSchema.parse(await c.req.json())
  const start = Date.now()

  const coordinator = new MatchingCoordinator()
  const result: ApiMatchData = coordinator.evaluateAllCandidates(
    req.reference,
    req.candidates,
    req.matchingSettings,
  )

  matchCandidatesEvaluatedTotal.inc(req.candidates.length)
  matchDurationSeconds.observe((Date.now() - start) / 1000)

  return c.json({
    success: true,
    data: result,
  })
}
