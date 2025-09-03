import { Hono } from 'hono'
import * as searchController from '../controllers/searchController'

const router = new Hono()

/**
 * @route POST /api/search
 * @desc Search for references in external databases without matching
 */
router.post('/', searchController.searchAllDatabases)

/**
 * @route GET /api/search/databases
 * @desc Get list of available databases
 */
router.get('/databases', searchController.getDatabases)

/**
 * @route POST /api/search/:database
 * @desc Search for a reference in a specific database
 */
router.post('/:database', searchController.searchSingleDatabase)

export default router
