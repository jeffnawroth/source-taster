import { Hono } from 'hono'
import { AnystyleController } from '../controllers/anystyleController'

const anystyleRouter = new Hono()

// Parse references and return tokens with labels
anystyleRouter.post('/parse', AnystyleController.parse)

// Convert token arrays to CSL format
anystyleRouter.post('/convert-to-csl', AnystyleController.convertToCSL)

export { anystyleRouter }
