import { Hono } from 'hono'
import { VerificationController } from '../controllers/verificationController'

const router = new Hono()
const controller = new VerificationController()

/**
 * @route POST /api/verify
 * @desc Verify references against academic databases
 */
router.post('/', c => controller.verifyReferences(c))

export default router
