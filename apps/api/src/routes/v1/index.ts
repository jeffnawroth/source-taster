import { Hono } from 'hono'
import extractionRouter from './extraction'
import verificationRouter from './verification'

const v1Router = new Hono()

// Mount sub-routers
v1Router.route('/extract', extractionRouter)
v1Router.route('/verify', verificationRouter)

// Health check endpoint
v1Router.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'v1',
  })
})

export default v1Router
