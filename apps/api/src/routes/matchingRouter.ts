import { Hono } from 'hono'
import * as matchingController from '../controllers/matchingController.js'

const router = new Hono()

/**
 * @route POST /v1/match
 * @desc Pure matching - evaluates provided candidates against references (no AI, no API keys needed)
 */
router.post('/', matchingController.matchReference)

export default router
