import { Hono } from 'hono'
import * as matchingController from '../controllers/matchingController'

const router = new Hono()

/**
 * @route POST /api/match
 * @desc Pure matching - evaluates provided candidates against references (no AI, no API keys needed)
 */
router.post('/', matchingController.matchReference)

export default router
