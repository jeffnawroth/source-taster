import { Hono } from 'hono'
import { extractDOIWithModel } from '../utilts/extractDOI'

const extractDOI = new Hono()

extractDOI.post('/', async (c) => {
  const { service, model, input } = await c.req.json()

  if (!service || !model || !input) {
    return c.json({ error: 'Service, model and input are required' }, 400)
  }

  try {
    const { dois } = await extractDOIWithModel(service, model, input)
    return c.json(dois)
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return c.json({ error: errorMessage }, 500)
  }
})

export default extractDOI
