import { Hono } from 'hono'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { rateLimit } from './rateLimit.js'

function buildApp(opts: Parameters<typeof rateLimit>[0]) {
  const app = new Hono<{ Variables: { apiKey: { id: string, keyPrefix: string } | null } }>()
  app.use('*', async (c, next) => {
    // simuliert keyAuth: ein Caller mit Key, einer ohne
    const key = c.req.header('X-API-Key')
    if (key)
      c.set('apiKey', { id: key, keyPrefix: 'srt_live_…' })
    await next()
  })
  app.use('*', rateLimit(opts))
  app.get('/test', c => c.json({ ok: true }))
  return app
}

afterEach(() => {
  vi.useRealTimers()
  delete process.env.RATE_LIMIT_PER_KEY
  delete process.env.RATE_LIMIT_ANONYMOUS_PER_MINUTE
})

describe('rateLimit', () => {
  it('lets requests under the limit pass and sets headers', async () => {
    const app = buildApp({ keys: { ratePerMinute: 10, burst: 10 }, anonymous: { ratePerMinute: 1000, burst: 1000 } })
    const res = await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    expect(res.status).toBe(200)
    expect(Number(res.headers.get('RateLimit-Limit'))).toBe(10)
    expect(Number(res.headers.get('RateLimit-Remaining'))).toBeLessThanOrEqual(10)
    expect(Number(res.headers.get('RateLimit-Reset'))).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })

  it('rejects with 429 when a key exceeds its burst', async () => {
    const app = buildApp({ keys: { ratePerMinute: 60, burst: 2 }, anonymous: { ratePerMinute: 1000, burst: 1000 } })
    await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    const res = await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    expect(res.status).toBe(429)
  })

  it('does not share buckets between different keys', async () => {
    const app = buildApp({ keys: { ratePerMinute: 60, burst: 2 }, anonymous: { ratePerMinute: 1000, burst: 1000 } })
    await app.request('/test', { headers: { 'X-API-Key': 'a' } })
    await app.request('/test', { headers: { 'X-API-Key': 'a' } })
    const res = await app.request('/test', { headers: { 'X-API-Key': 'b' } })
    expect(res.status).toBe(200)
  })

  it('applies a shared bucket to anonymous callers', async () => {
    const app = buildApp({ keys: { ratePerMinute: 1000, burst: 1000 }, anonymous: { ratePerMinute: 60, burst: 2 } })
    await app.request('/test')
    await app.request('/test')
    const res = await app.request('/test')
    expect(res.status).toBe(429)
  })

  it('falls back to defaults when env values are invalid', async () => {
    process.env.RATE_LIMIT_PER_KEY = 'abc'
    process.env.RATE_LIMIT_ANONYMOUS_PER_MINUTE = '-5'
    const app = buildApp({})
    const keyRes = await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    expect(keyRes.status).toBe(200)
    expect(Number(keyRes.headers.get('RateLimit-Limit'))).toBe(120)
    const anonRes = await app.request('/test')
    expect(anonRes.status).toBe(200)
    expect(Number(anonRes.headers.get('RateLimit-Limit'))).toBe(600)
  })

  it('refills tokens after the window has passed and reports a meaningful reset', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const app = buildApp({ keys: { ratePerMinute: 60, burst: 2 }, anonymous: { ratePerMinute: 1000, burst: 1000 } })
    await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    const rejected = await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    expect(rejected.status).toBe(429)
    expect(rejected.headers.get('RateLimit-Remaining')).toBe('0')
    expect(Number(rejected.headers.get('RateLimit-Reset'))).toBeGreaterThan(Math.floor(Date.now() / 1000))
    vi.setSystemTime(new Date('2026-01-01T00:01:00Z'))
    const res = await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    expect(res.status).toBe(200)
  })
})
