import { Hono } from 'hono'
import * as extractionController from '../controllers/extractionController'

const router = new Hono()

/**
 * @route POST /api/extract
 * @desc Extract references from text using AI
 */
router.post('/', extractionController.extractReferences)

export default router
