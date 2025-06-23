import { Hono } from 'hono'
import { verifyMetadataMatchWithModel } from '../utils/verifyMetadataMatch'

const verifyMetadataMatch = new Hono()

verifyMetadataMatch.post('', async (c) => {
  const { service, model, referenceMetadata, publicationsMetadata } = await c.req.json()

  if (!service || !model || !referenceMetadata || !publicationsMetadata || (typeof publicationsMetadata === 'undefined')) {
    return c.json({ error: 'Service, model, referenceMetadat, works or pageText are required' }, 400)
  }

  try {
    let response
    if (publicationsMetadata) {
      response = await verifyMetadataMatchWithModel(service, model, referenceMetadata, publicationsMetadata)
      return c.json(response)
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return c.json({ error: errorMessage }, 500)
  }
})

export default verifyMetadataMatch
