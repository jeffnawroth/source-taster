import { describe, expect, it, vi } from 'vitest'
import { deleteAiSecret, getAiSecretInfo, saveAiSecret } from './aiSecretsService'
import { apiClient } from './apiClient'
import { extractReferences } from './extractionService'
import { matchReference } from './matchingService'
import { searchReferences } from './searchService'

vi.mock('./apiClient', () => ({
  apiClient: vi.fn(),
}))

const mocked = vi.mocked(apiClient)

describe('extractionService', () => {
  it('posts text and returns data', async () => {
    const data = { references: [] }
    mocked.mockResolvedValue(data as never)
    const result = await extractReferences('Some ref text', { provider: 'openai', model: 'gpt-5-mini' })
    expect(mocked).toHaveBeenCalledWith('/api/extract', {
      method: 'POST',
      body: JSON.stringify({ text: 'Some ref text', aiSettings: { provider: 'openai', model: 'gpt-5-mini' } }),
    })
    expect(result).toEqual(data)
  })
  it('works without aiSettings', async () => {
    mocked.mockResolvedValue({ references: [] } as never)
    await extractReferences('text')
    expect(mocked).toHaveBeenCalledWith('/api/extract', { method: 'POST', body: JSON.stringify({ text: 'text' }) })
  })
})

describe('searchService', () => {
  it('posts references array', async () => {
    mocked.mockResolvedValue({ results: [] } as never)
    await searchReferences([{ id: '11111111-1111-4111-8111-111111111111', metadata: {} } as never])
    expect(mocked).toHaveBeenCalledWith('/api/search', {
      method: 'POST',
      body: JSON.stringify({ references: [{ id: '11111111-1111-4111-8111-111111111111', metadata: {} }] }),
    })
  })
})

describe('matchingService', () => {
  it('posts reference and candidates', async () => {
    mocked.mockResolvedValue({ evaluations: [] } as never)
    await matchReference({ id: '11111111-1111-4111-8111-111111111111', metadata: {} } as never, [])
    expect(mocked).toHaveBeenCalledWith('/api/match', {
      method: 'POST',
      body: JSON.stringify({
        reference: { id: '11111111-1111-4111-8111-111111111111', metadata: {} },
        candidates: [],
      }),
    })
  })
})

describe('aiSecretsService', () => {
  it('saves, fetches info and deletes', async () => {
    mocked.mockResolvedValueOnce({ saved: true } as never)
    await saveAiSecret('openai', 'sk-test')
    expect(mocked).toHaveBeenCalledWith('/api/user/ai-secrets', {
      method: 'POST',
      body: JSON.stringify({ provider: 'openai', apiKey: 'sk-test' }),
    })

    mocked.mockResolvedValueOnce({ hasApiKey: true, provider: 'openai' } as never)
    await expect(getAiSecretInfo()).resolves.toEqual({ hasApiKey: true, provider: 'openai' })

    mocked.mockResolvedValueOnce({ deleted: true } as never)
    await deleteAiSecret()
    expect(mocked).toHaveBeenCalledWith('/api/user/ai-secrets', { method: 'DELETE' })
  })
})
