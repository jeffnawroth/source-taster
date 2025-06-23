import { Hono } from 'hono'
import { VerificationController } from '../controllers/verificationController'

const router = new Hono()
const controller = new VerificationController()

/**
 * @route POST /api/verify
 * @desc Verify references against academic databases
 */
router.post('/', c => controller.verifyReferences(c))

/**
 * @route POST /api/verify/websites
 * @desc Verify website references
 */
router.post('/websites', c => controller.verifyWebsites(c))

export default router
