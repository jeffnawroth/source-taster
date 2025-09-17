import { Hono } from 'hono'
import { MatchingController } from '../controllers/matchingController'
import { decryptApiKeyMiddleware } from '../middleware/decryption'

const router = new Hono()
const controller = new MatchingController()

/**
 * @route POST /api/match
 * @desc Match references - automatically chooses database or website matching based on source type
 */
router.post('/', decryptApiKeyMiddleware, // Decrypt API keys from extension
  c => controller.matchReferences(c))

/**
 * @route POST /api/match/website
 * @desc Match a reference against a website URL
 */
router.post('/website', decryptApiKeyMiddleware, // Decrypt API keys from extension
  c => controller.matchWebsiteReference(c))

export default router
