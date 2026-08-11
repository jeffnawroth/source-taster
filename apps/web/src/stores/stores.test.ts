import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { classifyScore } from '@/utils/scores'
import { extractReferences } from '../services/extractionService'
import { matchReference } from '../services/matchingService'

import { searchReferences } from '../services/searchService'
import { useExtractionStore } from './extraction'
import { useVerificationStore } from './verification'

vi.mock('../services/extractionService', () => ({ extractReferences: vi.fn() }))
vi.mock('../services/searchService', () => ({ searchReferences: vi.fn() }))
vi.mock('../services/matchingService', () => ({ matchReference: vi.fn() }))
vi.mock('../services/aiSecretsService', () => ({ getAiSecretInfo: vi.fn() }))

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
  beforeEach(() => setActivePinia(createPinia()))
  it('extracts and stores references', async () => {
    vi.mocked(extractReferences).mockResolvedValue({ references: [ref(U)] } as never)
    const store = useExtractionStore()
    await store.extract('text')
    expect(store.references).toHaveLength(1)
    expect(store.loading).toBe(false)
    store.removeReference(U)
    expect(store.references).toHaveLength(0)
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
