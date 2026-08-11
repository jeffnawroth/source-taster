import type { ApiExtractReference, ApiMatchData } from '@source-taster/types'
import type { VerificationStatus } from '@/utils/scores'
import { defineStore } from 'pinia'
import { matchReference } from '@/services/matchingService'
import { searchReferences } from '@/services/searchService'
import { bestScoreOf, classifyScore } from '@/utils/scores'

export interface ReferenceResult {
  bestScore: number | null
  status: VerificationStatus
}

export const useVerificationStore = defineStore('verification', {
  state: () => ({
    results: {} as Record<string, ReferenceResult>,
    running: false,
    error: null as string | null,
  }),
  actions: {
    async verifyAll(references: ApiExtractReference[]) {
      this.running = true
      this.error = null
      this.results = {}
      try {
        const { results } = await searchReferences(references.map(r => ({ id: r.id, metadata: r.metadata })))
        for (const reference of references) {
          const candidates = results.find(res => res.referenceId === reference.id)?.candidates ?? []
          if (candidates.length === 0) {
            this.results[reference.id] = { bestScore: null, status: 'not-found' }
            continue
          }
          const data: ApiMatchData = await matchReference(
            { id: reference.id, metadata: reference.metadata },
            candidates.map(c => ({ id: c.id, metadata: c.metadata })),
          )
          const bestScore = bestScoreOf(data.evaluations)
          this.results[reference.id] = { bestScore, status: classifyScore(bestScore) }
        }
      }
      catch (e) {
        this.error = e instanceof Error ? e.message : 'Verification failed'
      }
      finally {
        this.running = false
      }
    },
  },
})
