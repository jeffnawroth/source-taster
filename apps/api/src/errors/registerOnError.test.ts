import { Hono } from 'hono'
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
})
