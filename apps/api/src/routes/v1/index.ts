import { Hono } from 'hono'
import extractionRouter from './extraction'
import verificationRouter from './verification'

const apiRouter = new Hono()

// Mount routers
apiRouter.route('/extract', extractionRouter)
apiRouter.route('/verify', verificationRouter)

// Health check
apiRouter.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

export default apiRouter
