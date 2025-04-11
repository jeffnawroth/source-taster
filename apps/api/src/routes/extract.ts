import { Hono } from 'hono'
import { extractWithModel } from '../utilts/extractDOI'

const extract = new Hono()

extract.post('/', async (c) => {
  const { service, model, text, type } = await c.req.json()

  if (!service || !model || !text || !type) {
    return c.json({ error: 'Service, model, text and type are required' }, 400)
  }

  try {
    const dois = await extractWithModel(service, model, text, type)
    return c.json(dois)
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return c.json({ error: errorMessage }, 500)
  }
})

export default extract
