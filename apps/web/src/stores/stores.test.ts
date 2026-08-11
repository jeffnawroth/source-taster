import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { classifyScore } from '@/utils/scores'
import { deleteAiSecret, getAiSecretInfo, saveAiSecret } from '../services/aiSecretsService'
import { extractWithAnystyle } from '../services/anystyleService'
import { extractReferences } from '../services/extractionService'
import { matchReference } from '../services/matchingService'

import { searchReferences } from '../services/searchService'
import { useAiSettingsStore } from './aiSettings'
import { useExtractionStore } from './extraction'
import { useVerificationStore } from './verification'

vi.mock('../services/anystyleService', () => ({ extractWithAnystyle: vi.fn() }))
vi.mock('../services/extractionService', () => ({ extractReferences: vi.fn() }))
vi.mock('../services/searchService', () => ({ searchReferences: vi.fn() }))
vi.mock('../services/matchingService', () => ({ matchReference: vi.fn() }))
vi.mock('../services/aiSecretsService', () => ({ deleteAiSecret: vi.fn(), getAiSecretInfo: vi.fn(), saveAiSecret: vi.fn() }))

const U = '11111111-1111-4111-8111-111111111111'
const ref = (id: string) => ({ id, originalText: 'x', metadata: { title: 'T' } })

describe('classifyScore', () => {
  it('classifies thresholds', () => {
    expect(classifyScore(null)).toBe('not-found')
    expect(classifyScore(0)).toBe('not-found')
    expect(classifyScore(60)).toBe('partial')
    expect(classifyScore(85)).toBe('verified')
  })
})

describe('useExtractionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })
  it('extracts via anystyle without aiSettings and stores references', async () => {
    vi.mocked(extractWithAnystyle).mockResolvedValue([ref(U)] as never)
    const store = useExtractionStore()
    await store.extract('text')
    expect(extractWithAnystyle).toHaveBeenCalledWith('text')
    expect(store.references).toHaveLength(1)
    expect(store.loading).toBe(false)
    store.removeReference(U)
    expect(store.references).toHaveLength(0)
  })

  it('extracts via ai path when aiSettings are provided', async () => {
    vi.mocked(extractReferences).mockResolvedValue({ references: [ref(U)] } as never)
    const store = useExtractionStore()
    await store.extract('text', { provider: 'openai', model: 'gpt-5-mini' })
    expect(extractReferences).toHaveBeenCalledWith('text', { provider: 'openai', model: 'gpt-5-mini' })
    expect(extractWithAnystyle).not.toHaveBeenCalled()
    expect(store.references).toHaveLength(1)
    expect(store.loading).toBe(false)
  })
})

describe('useAiSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })
  it('saves an api key', async () => {
    vi.mocked(saveAiSecret).mockResolvedValue({})
    const store = useAiSettingsStore()
    store.provider = 'openai'
    await store.save('sk-test')
    expect(saveAiSecret).toHaveBeenCalledWith('openai', 'sk-test')
    expect(store.hasApiKey).toBe(true)
  })

  it('loads api key info for the current provider', async () => {
    vi.mocked(getAiSecretInfo).mockResolvedValue({ hasApiKey: true, provider: 'openai' })
    const store = useAiSettingsStore()
    store.provider = 'openai'
    await store.loadInfo()
    expect(getAiSecretInfo).toHaveBeenCalledWith('openai')
    expect(store.hasApiKey).toBe(true)
  })

  it('removes the api key', async () => {
    vi.mocked(deleteAiSecret).mockResolvedValue({})
    const store = useAiSettingsStore()
    store.provider = 'openai'
    store.hasApiKey = true
    await store.remove()
    expect(deleteAiSecret).toHaveBeenCalledWith('openai')
    expect(store.hasApiKey).toBe(false)
  })
})

describe('useVerificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })
  it('searches and matches each reference', async () => {
    vi.mocked(searchReferences).mockResolvedValue({
      results: [{ referenceId: U, candidates: [{ id: '22222222-2222-4222-8222-222222222222', source: 'crossref', metadata: {} }] }],
    } as never)
    vi.mocked(matchReference).mockResolvedValue({
      evaluations: [{ candidateId: '22222222-2222-4222-8222-222222222222', matchDetails: { fieldDetails: [], overallScore: 92 } }],
    } as never)

    const store = useVerificationStore()
    await store.verifyAll([ref(U)] as never)
    expect(store.results[U].bestScore).toBe(92)
    expect(store.results[U].status).toBe('verified')
    expect(vi.mocked(matchReference)).toHaveBeenCalledTimes(1)
  })

  it('marks not-found when no candidates', async () => {
    vi.mocked(searchReferences).mockResolvedValue({ results: [{ referenceId: U, candidates: [] }] } as never)
    const store = useVerificationStore()
    await store.verifyAll([ref(U)] as never)
    expect(store.results[U].status).toBe('not-found')
    expect(vi.mocked(matchReference)).not.toHaveBeenCalled()
  })
})
