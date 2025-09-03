import { Hono } from 'hono'
import * as extractionController from '../controllers/extractionController'
import { decryptApiKeyMiddleware } from '../middleware/decryption'

const router = new Hono()

/**
 * @route POST /api/extract
 * @desc Extract references from text using AI
 */
router.post('/', decryptApiKeyMiddleware, extractionController.extractReferences)

export default router
