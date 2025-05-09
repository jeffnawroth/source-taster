import { Hono } from 'hono'
import { verifyMetadataMatchWithModel, verifyPageMatchWithModel } from '../utilts/verifyMetadataMatch'

const verifyMetadataMatch = new Hono()

verifyMetadataMatch.post('', async (c) => {
  const { service, model, referenceMetadata, works, pageText } = await c.req.json()

  if (!service || !model || !referenceMetadata || (typeof works === 'undefined' && typeof pageText === 'undefined')) {
    return c.json({ error: 'Service, model, referenceMetadat, works or pageText are required' }, 400)
  }

  try {
    let response
    if (works) {
      response = await verifyMetadataMatchWithModel(service, model, referenceMetadata, works)
      return c.json(response)
    }
    else if (pageText) {
      response = await verifyPageMatchWithModel(service, model, referenceMetadata, pageText!)
      return c.json(response)
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return c.json({ error: errorMessage }, 500)
  }
})

export default verifyMetadataMatch
