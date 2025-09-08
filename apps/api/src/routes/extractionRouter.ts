import { Hono } from 'hono'
import * as extractionController from '../controllers/extractionController'
import { withClientId } from '../middleware/clientId'

const router = new Hono()

router.use('*', withClientId) // 👈 auch hier

/**
 * @route POST /api/extract
 * @desc Extract references from text using AI
 */
router.post('/', extractionController.extractReferences)

export default router
