import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { HTTPException } from 'hono/http-exception'
import { describe, expect, it } from 'vitest'
import { registerOnError } from '../errors/registerOnError.js'
import { securityHeaders } from './security.js'

function buildApp() {
  const app = new Hono()
  registerOnError(app)
  app.use('*', securityHeaders())
  app.use('*', bodyLimit({
    maxSize: 1024,
    onError: () => {
      throw new HTTPException(413, { message: 'Payload too large' })
    },
  }))
  app.get('/', c => c.json({ ok: true }))
  app.get('/v1/test', c => c.json({ ok: true }))
  app.post('/v1/test', c => c.json({ ok: true }))
  return app
}

describe('securityHeaders', () => {
  it('sets security headers on /v1 responses', async () => {
    const res = await buildApp().request('/v1/test')
    expect(res.status).toBe(200)
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(res.headers.get('X-Frame-Options')).toBe('DENY')
    expect(res.headers.get('Referrer-Policy')).toBe('no-referrer')
    expect(res.headers.get('Permissions-Policy')).toBe('geolocation=(), microphone=(), camera=()')
  })

  it('sets security headers on root responses', async () => {
    const res = await buildApp().request('/')
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(res.headers.get('X-Frame-Options')).toBe('DENY')
    expect(res.headers.get('Permissions-Policy')).toBe('geolocation=(), microphone=(), camera=()')
  })

  it('does not send HSTS without x-forwarded-proto https', async () => {
    const res = await buildApp().request('/v1/test')
    expect(res.headers.get('Strict-Transport-Security')).toBeNull()
  })

  it('sends HSTS with the correct value when x-forwarded-proto is https', async () => {
    const res = await buildApp().request('/v1/test', { headers: { 'x-forwarded-proto': 'https' } })
    expect(res.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains')
  })
})

describe('bodyLimit', () => {
  it('rejects POST bodies above the limit with 413 and JSON error body', async () => {
    const res = await buildApp().request('/v1/test', {
      method: 'POST',
      body: 'x'.repeat(2000),
    })
    expect(res.status).toBe(413)
    expect(await res.json()).toEqual({ success: false, error: 'payload_too_large', message: 'Payload too large' })
  })

  it('lets POST bodies under the limit pass', async () => {
    const res = await buildApp().request('/v1/test', {
      method: 'POST',
      body: 'small',
    })
    expect(res.status).toBe(200)
  })

  it('rejects on the content-length fast path when the declared length exceeds the limit', async () => {
    const res = await buildApp().request('/v1/test', {
      method: 'POST',
      body: 'x'.repeat(10),
      headers: { 'content-length': '2000' },
    })
    expect(res.status).toBe(413)
    expect(await res.json()).toEqual({ success: false, error: 'payload_too_large', message: 'Payload too large' })
  })

  it('lets GET requests without a body pass', async () => {
    const res = await buildApp().request('/v1/test')
    expect(res.status).toBe(200)
  })
})

describe('cache-control', () => {
  it('sets Cache-Control: no-store on /v1 responses', async () => {
    const res = await buildApp().request('/v1/test')
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('does not set Cache-Control on the root response', async () => {
    const res = await buildApp().request('/')
    expect(res.headers.get('Cache-Control')).toBeNull()
  })
})
