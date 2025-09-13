import { Hono } from 'hono'
import * as searchController from '../controllers/searchController'

const router = new Hono()

/**
 * @route POST /api/search
 * @desc Search for references in external databases without matching
 */
router.post('/', searchController.searchAllDatabases)

/**
 * @route POST /api/search/:database
 * @desc Search for a reference in a specific database
 */
router.post('/:database', searchController.searchSingleDatabase)

export default router
