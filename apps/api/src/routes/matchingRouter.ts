import { Hono } from 'hono'
import { MatchingController } from '../controllers/matchingController'

const router = new Hono()
const controller = new MatchingController()

/**
 * @route POST /api/match
 * @desc Pure matching - evaluates provided candidates against references (no AI, no API keys needed)
 */
router.post('/', c => controller.matchReferences(c))

export default router
