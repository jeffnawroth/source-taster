import { Hono } from 'hono'
import { extractMetadataWithModel } from '../utilts/extractMetadata'

const extractMetadata = new Hono()

extractMetadata.post('/', async (c) => {
  const { service, model, input } = await c.req.json()

  if (!service || !model || !input) {
    return c.json({ error: 'Service, model and input are required' }, 400)
  }

  try {
    const { metadata } = await extractMetadataWithModel(service, model, input)
    return c.json(metadata)
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return c.json({ error: errorMessage }, 500)
  }
})

export default extractMetadata
