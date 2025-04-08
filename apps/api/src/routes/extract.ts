import { Hono } from 'hono'
import { extractDOIWithModel } from '../utilts/extractDOI'

const extract = new Hono()

extract.post('/', async (c) => {
  const { service, model, text } = await c.req.json()

  if (!service || !model || !text) {
    return c.json({ error: 'Service, model and text are required' }, 400)
  }

  try {
    const dois = await extractDOIWithModel(service, model, text)
    return c.json(dois)
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return c.json({ error: errorMessage }, 500)
  }
})

export default extract
