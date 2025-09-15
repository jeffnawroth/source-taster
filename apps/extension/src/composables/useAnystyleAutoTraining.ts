// useAnystyleAutoTraining.ts
import type { ApiAnystyleTokenSequence } from '@source-taster/types'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useWebExtensionStorage } from '@/extension/composables/useWebExtensionStorage'
import { settings } from '@/extension/logic'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useMatchingStore } from '@/extension/stores/matching'

function hashSequence(seq: ApiAnystyleTokenSequence): string {
  const s = seq.map(([label, value]) => `${label}::${value}`).join('||')
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0
  return String(h)
}

export function useAnystyleAutoTraining() {
  const anystyleStore = useAnystyleStore()
  const extractionStore = useExtractionStore()
  const matchingStore = useMatchingStore()

  const { parsed, hasParseResults } = storeToRefs(anystyleStore)
  const { extractedReferences } = storeToRefs(extractionStore)

  const seen = useWebExtensionStorage<Set<string>>(
    'anystyle-training-seen',
    new Set<string>(),
    {
      serializer: {
        read: v => new Set<string>(JSON.parse(v || '[]')),
        write: async (v: Set<string>) => JSON.stringify([...v]),
      },
    },
  )

  const strongThreshold = computed(
    () => settings.value.matching.matchingConfig.displayThresholds.strongMatchThreshold,
  )

  function collectEligibleSequences(): ApiAnystyleTokenSequence[] {
    if (!hasParseResults.value)
      return []
    const seqs: ApiAnystyleTokenSequence[] = []
    const minLen = Math.min(parsed.value.length, extractedReferences.value.length)

    for (let i = 0; i < minLen; i++) {
      const ref = extractedReferences.value[i]
      const score = matchingStore.getMatchingScoreByReference(ref.id)
      if (typeof score !== 'number' || score < strongThreshold.value)
        continue

      const seq = parsed.value[i].tokens
      if (!seq?.length)
        continue

      const key = hashSequence(seq)
      if (seen.value.has(key))
        continue

      seqs.push(seq)
    }

    return seqs
  }

  async function trainFromVerified(): Promise<{ trained: number }> {
    const enabled = settings.value.extract?.autoTrainOnVerify ?? true
    if (!enabled)
      return { trained: 0 }

    const payload = collectEligibleSequences()
    if (!payload.length)
      return { trained: 0 }

    const res = await anystyleStore.trainModel(payload)
    if (res.success) {
      for (const seq of payload) seen.value.add(hashSequence(seq))
      return { trained: payload.length }
    }
    return { trained: 0 }
  }

  return {
    trainFromVerified,
    // State direkt vom Store durchreichen
    isTraining: anystyleStore.isTraining,
    trainError: anystyleStore.trainError,
  }
}
