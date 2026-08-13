import { Hono } from 'hono'
import { afterEach, describe, expect, it } from 'vitest'
import { corsMiddleware } from './cors.js'

function buildApp() {
  const app = new Hono()
  app.use('*', corsMiddleware)
  app.get('/test', c => c.json({ ok: true }))
  return app
}

afterEach(() => {
  delete process.env.ALLOWED_WEB_ORIGINS
})

describe('corsMiddleware (production path)', () => {
  it('blocks requests without origin and without api key', async () => {
    const res = await buildApp().request('/test')
    expect(res.status).toBe(403)
  })

  it('lets api key callers through without an origin header', async () => {
    const res = await buildApp().request('/test', { headers: { 'X-API-Key': 'srt_live_whatever' } })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('answers preflight with CORS headers for an allowed web origin', async () => {
    process.env.ALLOWED_WEB_ORIGINS = 'https://sourcetaster.com'
    const res = await buildApp().request('/test', {
      method: 'OPTIONS',
      headers: { origin: 'https://sourcetaster.com' },
    })
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://sourcetaster.com')
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('X-Client-Id')
  })
})
