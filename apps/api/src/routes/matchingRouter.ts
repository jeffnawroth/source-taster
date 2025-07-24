import { Hono } from 'hono'
import { MatchingController } from '../controllers/matchingController'

const router = new Hono()
const controller = new MatchingController()

/**
 * @route POST /api/match
 * @desc Match references - automatically chooses database or website matching based on source type
 */
router.post('/', c => controller.matchReferences(c))

/**
 * @route POST /api/match/website
 * @desc Match a reference against a website URL
 */
router.post('/website', c => controller.matchWebsiteReference(c))

export default router
