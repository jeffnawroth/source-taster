import { Hono } from 'hono'
import { SearchController } from '../controllers/searchController'

const router = new Hono()
const controller = new SearchController()

/**
 * @route POST /api/search
 * @desc Search for references in external databases without matching
 */
router.post('/', c => controller.searchDatabases(c))

export default router
