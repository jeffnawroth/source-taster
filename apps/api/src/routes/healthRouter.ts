import process from 'node:process'
import { Hono } from 'hono'

export const healthRouter = new Hono()

healthRouter.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})
