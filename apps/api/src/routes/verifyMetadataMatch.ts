import { Hono } from 'hono'
import { verifyMetadataMatchWithModel } from '../utilts/verifyMetadataMatch'

const verifyMetadataMatch = new Hono()

verifyMetadataMatch.post('/', async (c) => {
  const { service, model, sourceMetadata, crossrefItem } = await c.req.json()

  if (!service || !model || !sourceMetadata || !crossrefItem) {
    return c.json({ error: 'Service, model, sourceMetadata and crossrefItem are required' }, 400)
  }

  try {
    const response = await verifyMetadataMatchWithModel(service, model, sourceMetadata, crossrefItem)
    return c.json(response)
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return c.json({ error: errorMessage }, 500)
  }
})

export default verifyMetadataMatch
