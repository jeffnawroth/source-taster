import { Hono } from 'hono'
import { VerificationController } from '../../controllers/verificationController'

const router = new Hono()
const controller = new VerificationController()

/**
 * @route POST /api/v1/verify
 * @desc Verify references against academic databases
 * @body {VerificationRequest}
 */
router.post('/', c => controller.verifyReferences(c))

/**
 * @route POST /api/v1/verify/websites
 * @desc Verify website references by scraping content
 * @body {WebsiteVerificationRequest}
 */
router.post('/websites', c => controller.verifyWebsites(c))

export default router
