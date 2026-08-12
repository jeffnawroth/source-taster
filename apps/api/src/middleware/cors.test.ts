import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { corsMiddleware } from './cors.js'

function buildApp() {
  const app = new Hono()
  app.use('*', corsMiddleware)
  app.get('/test', c => c.json({ ok: true }))
  return app
}

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
})
