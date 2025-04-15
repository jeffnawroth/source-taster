import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import extractDOIRoute from './routes/extractDOI'
import extractISSNRoute from './routes/extractISSN'
import extractMetadataRoute from './routes/extractMetadata'

const app = new Hono()

app.route('/extract-doi', extractDOIRoute)
app.route('/extract-issn', extractISSNRoute)
app.route('/extract-metadata', extractMetadataRoute)

const port = Number(process.env.PORT || '') || 8000
// eslint-disable-next-line no-console
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
