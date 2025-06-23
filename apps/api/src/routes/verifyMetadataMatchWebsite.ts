import { Hono } from 'hono'
import { verifyMetadataMatchWebsiteWithModel } from '../utils/verifyMetadataMatchWebsite'

const verifyMetadataMatchWebsiteRoute = new Hono()

verifyMetadataMatchWebsiteRoute.post('/', async (c) => {
  const { service, model, referenceMetadata, pageText } = await c.req.json()

  if (!service || !model || !referenceMetadata || !pageText) {
    return c.json(
      { error: 'Service, model, referenceMetadata and websiteMetadata are required' },
      400,
    )
  }

  try {
    const result = await verifyMetadataMatchWebsiteWithModel(
      service,
      model,
      referenceMetadata,
      pageText,
    )
    return c.json(result)
  }
  catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return c.json({ error: msg }, 500)
  }
})

export default verifyMetadataMatchWebsiteRoute
