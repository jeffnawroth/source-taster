import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import extractRoute from './routes/extract'

const app = new Hono()

app.route('/extract-identifier', extractRoute)

const port = Number(process.env.PORT || '') || 8000
// eslint-disable-next-line no-console
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
