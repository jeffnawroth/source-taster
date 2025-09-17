// extension/stores/anystyle.ts
import type {
  ApiAnystyleConvertData,
  ApiAnystyleParseData,
  ApiAnystyleParsedReference,
  ApiAnystyleTokenSequence,
  ApiHttpError,
  ApiResult,
} from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { AnystyleService } from '@/extension/services/anystyleService'
import { mapApiError } from '@/extension/utils/mapApiError'

export const useAnystyleStore = defineStore('anystyle', () => {
  // --- State ---
  const parsed = ref<ApiAnystyleParsedReference[]>([])
  const showTokenEditor = ref(false)

  const isParsing = ref(false)
  const isConverting = ref(false)

  const parseError = ref<string | null>(null)
  const convertError = ref<string | null>(null)

  // --- Computed ---
  const totalParsedReferences = computed(() => parsed.value.length)
  const hasParseResults = computed(() => parsed.value.length > 0)

  const getParseStatus = computed(() => {
    if (isParsing.value)
      return 'parsing'
    if (parseError.value)
      return 'error'
    if (hasParseResults.value)
      return 'completed'
    return 'idle'
  })

  const isAnyProcessing = computed(() =>
    isParsing.value || isConverting.value,
  )

  // --- Actions ---
  async function parseReferences(references: string[]): Promise<ApiResult<ApiAnystyleParseData>> {
    isParsing.value = true
    parseError.value = null

    const res = await AnystyleService.parseReferences(references)

    if (!res.success) {
      parseError.value = mapApiError(res as ApiHttpError)
      isParsing.value = false
      return res
    }

    parsed.value = res.data?.references ?? []

    showTokenEditor.value = true
    isParsing.value = false
    return res
  }

  function updateTokens(index: number, tokens: ApiAnystyleTokenSequence) {
    if (!parsed.value[index])
      return
    const next = parsed.value.slice()
    next[index] = { ...next[index], tokens }
    parsed.value = next
  }

  // extension/stores/anystyle.ts
  async function convertToCSL(): Promise<ApiResult<ApiAnystyleConvertData>> {
    isConverting.value = true
    convertError.value = null

    const references = parsed.value.map(ref => ({
      id: ref.id,
      tokens: ref.tokens,
    }))

    const res = await AnystyleService.convertToCSL(references)

    if (!res.success) {
      convertError.value = mapApiError(res as ApiHttpError)
      isConverting.value = false
      return res
    }

    isConverting.value = false
    return res
  }

  // Bulk-Update, falls Editor viele Sequenzen zurückgibt
  function updateParsedTokens(newTokens: ApiAnystyleTokenSequence[]) {
    const next = parsed.value.slice()
    for (let i = 0; i < Math.min(next.length, newTokens.length); i++)
      next[i] = { ...next[i], tokens: newTokens[i] }
    parsed.value = next
  }

  function clearParseResults() {
    parsed.value = []
    showTokenEditor.value = false
    parseError.value = null
  }

  function clearConvertError() {
    convertError.value = null
  }

  function clearAllErrors() {
    parseError.value = null
    convertError.value = null
  }

  function setShowTokenEditor(show: boolean) {
    showTokenEditor.value = show
  }

  // --- Expose ---
  return {
    // State (readonly)
    parsed: readonly(parsed),
    showTokenEditor: readonly(showTokenEditor),
    isParsing: readonly(isParsing),
    isConverting: readonly(isConverting),
    parseError: readonly(parseError),
    convertError: readonly(convertError),

    // Computed
    totalParsedReferences,
    hasParseResults,
    getParseStatus,
    isAnyProcessing,

    // Actions
    parseReferences,
    updateTokens,
    convertToCSL,
    updateParsedTokens,
    clearParseResults,
    clearConvertError,
    clearAllErrors,
    setShowTokenEditor,
  }
})
