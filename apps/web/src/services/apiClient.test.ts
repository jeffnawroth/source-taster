// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient, ApiError } from './apiClient'
import { getClientId } from './clientId'

function okResponse(data: unknown) {
  return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
function errorResponse(error: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error }), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('getClientId', () => {
  beforeEach(() => localStorage.clear())
  it('generates a UUIDv4 and persists it', () => {
    const id = getClientId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(localStorage.getItem('source-taster-client-id')).toBe(id)
  })
  it('returns the same id on second call', () => {
    const a = getClientId()
    const b = getClientId()
    expect(a).toBe(b)
  })
})

describe('apiClient', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  it('sends X-Client-Id and returns data envelope', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    const id = getClientId()
    const result = await apiClient('/api/extract', { method: 'POST', body: JSON.stringify({ text: 'x' }) })
    expect(result).toEqual({ ok: true })
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('http://localhost:8000/api/extract')
    expect((init!.headers as Headers).get('X-Client-Id')).toBe(id)
  })

  it('throws ApiError with status and message on error envelope', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse('Invalid reference', 400)))
    await expect(apiClient('/api/match')).rejects.toMatchObject({ status: 400, message: 'Invalid reference' })
  })

  it('falls back to HTTP status text when body is not an envelope', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('oops', { status: 500 })))
    await expect(apiClient('/api/search')).rejects.toBeInstanceOf(ApiError)
  })
})
