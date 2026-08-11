import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteAiSecret, getAiSecretInfo, saveAiSecret } from './aiSecretsService'
import { extractWithAnystyle, parseInputText } from './anystyleService'
import { apiClient } from './apiClient'
import { extractReferences } from './extractionService'
import { matchReference } from './matchingService'
import { searchReferences } from './searchService'

vi.mock('./apiClient', () => ({
  apiClient: vi.fn(),
}))

const mocked = vi.mocked(apiClient)

beforeEach(() => {
  vi.clearAllMocks()
})

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
  it('searches each database and merges candidates per reference', async () => {
    mocked.mockResolvedValue({
      results: [{
        referenceId: '11111111-1111-4111-8111-111111111111',
        candidates: [{ id: '22222222-2222-4222-8222-222222222222', source: 'crossref', metadata: {} }],
      }],
    } as never)
    const result = await searchReferences([{ id: '11111111-1111-4111-8111-111111111111', metadata: {} } as never])

    expect(mocked).toHaveBeenCalledTimes(5)
    expect(mocked).toHaveBeenCalledWith('/api/search/openalex', {
      method: 'POST',
      body: JSON.stringify({ references: [{ id: '11111111-1111-4111-8111-111111111111', metadata: {} }] }),
    })
    expect(mocked).toHaveBeenCalledWith('/api/search/crossref', {
      method: 'POST',
      body: JSON.stringify({ references: [{ id: '11111111-1111-4111-8111-111111111111', metadata: {} }] }),
    })
    expect(result.results).toHaveLength(1)
    expect(result.results[0].candidates).toHaveLength(5)
  })

  it('throws when every database fails', async () => {
    mocked.mockRejectedValue(new Error('network down'))
    await expect(
      searchReferences([{ id: '11111111-1111-4111-8111-111111111111', metadata: {} } as never]),
    ).rejects.toThrow('network down')
  })

  it('returns partial results when some databases fail', async () => {
    mocked
      .mockRejectedValueOnce(new Error('openalex down'))
      .mockResolvedValue({
        results: [{
          referenceId: '11111111-1111-4111-8111-111111111111',
          candidates: [{ id: '22222222-2222-4222-8222-222222222222', source: 'crossref', metadata: {} }],
        }],
      } as never)
    const result = await searchReferences([{ id: '11111111-1111-4111-8111-111111111111', metadata: {} } as never])
    expect(result.results[0].candidates).toHaveLength(4)
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

describe('anystyleService', () => {
  it('splits multiline input into non-empty trimmed lines', () => {
    expect(parseInputText('  Ref A  \n\n  Ref B\n')).toEqual(['Ref A', 'Ref B'])
    expect(parseInputText('   \n \n')).toEqual([])
  })

  it('returns [] for empty input without calling the api', async () => {
    const result = await extractWithAnystyle('   \n \n')
    expect(result).toEqual([])
    expect(mocked).not.toHaveBeenCalled()
  })

  it('parses and converts references, merging csl by index', async () => {
    mocked.mockResolvedValueOnce({
      references: [
        { id: '11111111-1111-4111-8111-111111111111', originalText: 'Ref A', tokens: [['title', 'A']] },
        { id: '22222222-2222-4222-8222-222222222222', originalText: 'Ref B', tokens: [['title', 'B']] },
      ],
    } as never)
    mocked.mockResolvedValueOnce({ csl: [{ title: 'A' }, { title: 'B' }] } as never)

    const result = await extractWithAnystyle('Ref A\nRef B')

    expect(mocked).toHaveBeenNthCalledWith(1, '/api/anystyle/parse', {
      method: 'POST',
      body: JSON.stringify({ input: ['Ref A', 'Ref B'] }),
    })
    expect(mocked).toHaveBeenNthCalledWith(2, '/api/anystyle/convert-to-csl', {
      method: 'POST',
      body: JSON.stringify({
        references: [
          { id: '11111111-1111-4111-8111-111111111111', tokens: [['title', 'A']] },
          { id: '22222222-2222-4222-8222-222222222222', tokens: [['title', 'B']] },
        ],
      }),
    })
    expect(result).toEqual([
      { id: '11111111-1111-4111-8111-111111111111', originalText: 'Ref A', metadata: { id: '11111111-1111-4111-8111-111111111111', title: 'A' } },
      { id: '22222222-2222-4222-8222-222222222222', originalText: 'Ref B', metadata: { id: '22222222-2222-4222-8222-222222222222', title: 'B' } },
    ])
  })

  it('falls back to empty metadata when csl has no entry for a reference', async () => {
    mocked.mockResolvedValueOnce({
      references: [{ id: '11111111-1111-4111-8111-111111111111', originalText: 'Ref A', tokens: [['title', 'A']] }],
    } as never)
    mocked.mockResolvedValueOnce({ csl: [] } as never)

    const result = await extractWithAnystyle('Ref A')
    expect(result).toEqual([
      { id: '11111111-1111-4111-8111-111111111111', originalText: 'Ref A', metadata: { id: '11111111-1111-4111-8111-111111111111' } },
    ])
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
    await expect(getAiSecretInfo('openai')).resolves.toEqual({ hasApiKey: true, provider: 'openai' })
    expect(mocked).toHaveBeenCalledWith('/api/user/ai-secrets?provider=openai')

    mocked.mockResolvedValueOnce({ deleted: true } as never)
    await deleteAiSecret('openai')
    expect(mocked).toHaveBeenCalledWith('/api/user/ai-secrets?provider=openai', { method: 'DELETE' })
  })
})
