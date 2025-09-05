import { Hono } from 'hono'
import * as parsingController from '../controllers/parsingController'

const router = new Hono()

router.post('/', c => parsingController.parseReferences(c))

export default router
