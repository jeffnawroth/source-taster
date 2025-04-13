import { Hono } from 'hono'
import { extractISSNWithModel } from '../utilts/extractISSN'

const extractISSN = new Hono()

extractISSN.post('/', async (c) => {
  const { service, model, text } = await c.req.json()

  if (!service || !model || !text) {
    return c.json({ error: 'Service, model and text are required' }, 400)
  }

  try {
    const issns = await extractISSNWithModel(service, model, text)
    return c.json(issns)
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return c.json({ error: errorMessage }, 500)
  }
})

export default extractISSN
