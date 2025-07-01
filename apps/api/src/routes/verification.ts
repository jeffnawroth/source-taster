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
 * @route POST /api/verify/extended
 * @desc Verify references with extended strategy (database + website fallback)
 */
router.post('/extended', c => controller.verifyReferencesExtended(c))

/**
 * @route POST /api/verify/website
 * @desc Verify a reference against a website URL
 */
router.post('/website', c => controller.verifyWebsiteReference(c))

export default router
