// /extension/stores/verificationProgress.ts
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'

export type VerificationPhase = 'idle' | 'searching' | 'matching' | 'done' | 'error' | 'cancelled'
export interface VerificationState {
  phase: VerificationPhase
  db?: string
  score?: number
  error?: string | null
  updatedAt: number
}

export const useVerificationProgressStore = defineStore('verificationProgress', () => {
  const byRef = ref<Map<string, VerificationState>>(new Map())

  function init(ids: string[]) {
    // Clear existing entries first
    byRef.value.clear()

    // Then add new ones
    const now = Date.now()
    ids.forEach(id => byRef.value.set(id, { phase: 'idle', updatedAt: now }))
  }

  function setPhase(id: string, phase: VerificationPhase, extra: Partial<VerificationState> = {}) {
    const prev = byRef.value.get(id) ?? { phase: 'idle', updatedAt: 0 }
    byRef.value.set(id, { ...prev, ...extra, phase, updatedAt: Date.now() })
  }

  function setSearching(id: string, db: string) {
    setPhase(id, 'searching', { db, error: null })
  }
  function setMatching(id: string) {
    setPhase(id, 'matching', { error: null })
  }
  function setDone(id: string, score?: number) {
    setPhase(id, 'done', { db: undefined, score, error: null })
  }
  function setCancelled(id: string) {
    setPhase(id, 'cancelled', { db: undefined })
  }
  function setError(id: string, message: string) {
    setPhase(id, 'error', { error: message })
  }

  function get(id: string) {
    return byRef.value.get(id)
  }

  function reset(ids?: string[]) {
    if (!ids) {
      byRef.value.clear()
      return
    }
    const now = Date.now()
    ids.forEach(id => byRef.value.set(id, { phase: 'idle', updatedAt: now }))
  }

  const overall = computed(() => {
    const total = byRef.value.size
    if (!total)
      return { total: 0, done: 0, percent: 0 }
    const done = [...byRef.value.values()].filter(s => ['done', 'error', 'cancelled'].includes(s.phase)).length
    return { total, done, percent: Math.round((done / total) * 100) }
  })

  return {
    byRef: readonly(byRef),
    init,
    setPhase,
    setSearching,
    setMatching,
    setDone,
    setCancelled,
    setError,
    get,
    reset,
    overall,
  }
})
