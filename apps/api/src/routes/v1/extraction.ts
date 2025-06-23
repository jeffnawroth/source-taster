import { Hono } from 'hono'
import { ExtractionController } from '../../controllers/extractionController'

const router = new Hono()
const controller = new ExtractionController()

/**
 * @route POST /api/v1/extract
 * @desc Extract references from text using AI
 * @body {ExtractionRequest}
 */
router.post('/', c => controller.extractReferences(c))

/**
 * @route GET /api/v1/extract/status/:jobId
 * @desc Get extraction job status
 * @param {string} jobId - The job ID
 */
router.get('/status/:jobId', c => controller.getExtractionStatus(c))

export default router
