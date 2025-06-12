// src/routes/extractMetadataWebsite.ts
import { Hono } from 'hono'
import { extractWebsiteMetadataWithModel } from '../utilts/extractMetadataWebsite'

const extractMetadataWebsite = new Hono()

extractMetadataWebsite.post('/', async (c) => {
  const { service, model, input } = await c.req.json()

  if (!service || !model || !input) {
    return c.json({ error: 'Service, model and input are required' }, 400)
  }

  try {
    const metadata = await extractWebsiteMetadataWithModel(service, model, input)
    return c.json(metadata)
  }
  catch (error) {
    const msg = error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten'
    return c.json({ error: msg }, 500)
  }
})

export default extractMetadataWebsite
