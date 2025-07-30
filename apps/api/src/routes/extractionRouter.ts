import { Hono } from 'hono'
import { ExtractionController } from '../controllers/extractionController'
import { decryptApiKeyMiddleware } from '../middleware/decryption'

const router = new Hono()
const controller = new ExtractionController()

/**
 * @route POST /api/extract
 * @desc Extract references from text using AI
 */
router.post('/', decryptApiKeyMiddleware, c => controller.extractReferences(c))

export default router
