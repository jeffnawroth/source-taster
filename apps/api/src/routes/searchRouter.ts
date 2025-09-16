import { Hono } from 'hono'
import * as searchController from '../controllers/searchController.js'

const router = new Hono()

/**
 * @route POST /api/search/:database
 * @desc Search for a reference in a specific database
 */
router.post('/:database', searchController.searchSingleDatabase)

export default router
