import type { ApiKeyRow } from '../db/schema.js'
import type { ApiKeyContext } from './auth.js'
import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { keyAuth } from './auth.js'

async function fakeLookup(rows: Array<Pick<ApiKeyRow, 'id' | 'keyPrefix' | 'status'>>): Promise<Pick<ApiKeyRow, 'id' | 'keyPrefix' | 'status'> | null> {
  return rows[0] ?? null
}

function buildApp(rows: Array<Pick<ApiKeyRow, 'id' | 'keyPrefix' | 'status'>>) {
  const app = new Hono<{ Variables: ApiKeyContext }>()
  app.use('*', keyAuth(fakeLookup.bind(null, rows)))
  app.get('/test', c => c.json({ ok: true, apiKey: c.get('apiKey') ?? null }))
  return app
}

describe('keyAuth', () => {
  it('lets requests without X-API-Key pass (browser path)', async () => {
    const res = await buildApp([]).request('/test')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, apiKey: null })
  })

  it('rejects invalid keys with 401', async () => {
    const res = await buildApp([]).request('/test', { headers: { 'X-API-Key': 'srt_live_nope' } })
    expect(res.status).toBe(401)
  })

  it('rejects revoked keys with 401', async () => {
    const res = await buildApp([
      { id: 'revoked-id', keyPrefix: 'srt_live_…0000', status: 'revoked' },
    ]).request('/test', { headers: { 'X-API-Key': 'srt_live_whatever' } })
    expect(res.status).toBe(401)
  })

  it('accepts valid active keys and exposes key context', async () => {
    const res = await buildApp([
      { id: 'key-1', keyPrefix: 'srt_live_…0000', status: 'active' },
    ]).request('/test', { headers: { 'X-API-Key': 'srt_live_whatever' } })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, apiKey: { id: 'key-1', keyPrefix: 'srt_live_…0000' } })
  })
})
