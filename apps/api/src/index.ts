import process from 'node:process'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import extractDOIRoute from './routes/extractDOI'
import extractISSNRoute from './routes/extractISSN'
import extractMetadataRoute from './routes/extractMetadata'
import extractMetadataWebsite from './routes/extractMetadataWebsite'
import verifyMetadataMatchRoute from './routes/verifyMetadataMatch'
import verifyMetadataMatchWebsiteRoute from './routes/verifyMetadataMatchWebsite'

const app = new Hono()

app.route('/extract-doi', extractDOIRoute)
app.route('/extract-issn', extractISSNRoute)
app.route('/extract-metadata', extractMetadataRoute)
app.route('/extract-metadata-website', extractMetadataWebsite)
app.route('/verify-metadata-match-website', verifyMetadataMatchWebsiteRoute)
app.route('/verify-metadata-match', verifyMetadataMatchRoute)

const port = Number(process.env.PORT || '') || 8000
// eslint-disable-next-line no-console
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
