import { Hono } from 'hono'
import { VerificationController } from '../controllers/verificationController'

const router = new Hono()
const controller = new VerificationController()

/**
 * @route POST /api/verify
 * @desc Verify references - automatically chooses database or website verification based on source type
 */
router.post('/', c => controller.verifyReferences(c))

/**
 * @route POST /api/verify/website
 * @desc Verify a reference against a website URL
 */
router.post('/website', c => controller.verifyWebsiteReference(c))

export default router
