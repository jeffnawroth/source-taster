import { Hono } from 'hono'
import * as searchAndMatchController from '../controllers/searchAndMatchController'

const router = new Hono()

/**
 * @route POST /api/search-and-match
 * @desc Search for candidates in databases and match them against references
 */
router.post('/', searchAndMatchController.searchAndMatch)

export default router
