import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { describe, expect, it } from 'vitest'
import { InvalidApiKeyError } from '../middleware/auth.js'
import { registerOnError } from './registerOnError.js'

describe('registerOnError', () => {
  it('maps InvalidApiKeyError to invalid_api_key with 401', async () => {
    const app = new Hono()
    registerOnError(app)
    app.get('/test', () => {
      throw new InvalidApiKeyError()
    })
    const res = await app.request('/test')
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ success: false, error: 'invalid_api_key', message: 'Invalid API key' })
  })

  it('maps HTTPException 413 to payload_too_large', async () => {
    const app = new Hono()
    registerOnError(app)
    app.post('/test', () => {
      throw new HTTPException(413, { message: 'Payload too large' })
    })
    const res = await app.request('/test', { method: 'POST' })
    expect(res.status).toBe(413)
    expect(await res.json()).toEqual({ success: false, error: 'payload_too_large', message: 'Payload too large' })
  })
})
