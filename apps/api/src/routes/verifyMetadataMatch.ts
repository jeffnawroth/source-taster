import { Hono } from 'hono'
import { verifyMetadataMatchWithModel } from '../utilts/verifyMetadataMatch'

const verifyMetadataMatch = new Hono()

verifyMetadataMatch.post('/', async (c) => {
  const { service, model, referenceMetadata, works } = await c.req.json()

  if (!service || !model || !referenceMetadata || !works) {
    return c.json({ error: 'Service, model, referenceMetadata and works are required' }, 400)
  }

  try {
    const response = await verifyMetadataMatchWithModel(service, model, referenceMetadata, works)
    return c.json(response)
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return c.json({ error: errorMessage }, 500)
  }
})

export default verifyMetadataMatch
