import process from 'node:process'
import { Hono } from 'hono'
import { metricsHandler } from '../middleware/metrics.js'

export const healthRouter = new Hono()

healthRouter.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

healthRouter.get('/metrics', async (c) => {
  const metrics = await metricsHandler()
  c.header('content-type', 'text/plain; charset=utf-8')
  return c.body(metrics)
})
