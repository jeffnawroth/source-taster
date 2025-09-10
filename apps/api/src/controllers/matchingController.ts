import type { ApiMatchData } from '@source-taster/types'
// src/controllers/matchingController.ts
import type { Context } from 'hono'
import { ApiMatchRequestSchema } from '@source-taster/types'
import { MatchingCoordinator } from '../services/matching/matchingCoordinator'

/**
 * POST /api/match
 */
export async function matchReference(c: Context) {
  const req = ApiMatchRequestSchema.parse(await c.req.json())

  const coordinator = new MatchingCoordinator()
  const result: ApiMatchData = coordinator.evaluateAllCandidates(
    req.reference,
    req.candidates,
    req.matchingSettings,
  )

  return c.json({
    success: true,
    data: result,
  })
}
