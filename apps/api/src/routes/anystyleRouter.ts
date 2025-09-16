import { Hono } from 'hono'
import { convertToCSL, parse } from '../controllers/anystyleController'

const anystyleRouter = new Hono()

// Parse references and return tokens with labels
anystyleRouter.post('/parse', parse)

// Convert token arrays to CSL format
anystyleRouter.post('/convert-to-csl', convertToCSL)

export { anystyleRouter }
