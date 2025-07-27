import { zValidator } from '@hono/zod-validator'
import { ValidatedMatchingRequestSchema, WebsiteMatchingRequestSchema } from '@source-taster/types'
import { Hono } from 'hono'
import { MatchingController } from '../controllers/matchingController'

const router = new Hono()
const controller = new MatchingController()

/**
 * @route POST /api/match
 * @desc Match references - automatically chooses database or website matching based on source type
 */
router.post('/', zValidator(
  'json',
  ValidatedMatchingRequestSchema,
), c => controller.matchReferences(c))

/**
 * @route POST /api/match/website
 * @desc Match a reference against a website URL
 */
router.post('/website', zValidator('json', WebsiteMatchingRequestSchema), c => controller.matchWebsiteReference(c))

export default router
