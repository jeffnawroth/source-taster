/**
 * Pinia store for managing AnyStyle functionality and results
 */
import type { AnystyleTokenSequence } from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AnystyleService } from '@/extension/services/anystyleService'

export const useAnystyleStore = defineStore('anystyle', () => {
  // State
  const parsedTokens = ref<AnystyleTokenSequence[]>([])
  const showTokenEditor = ref(false)
  const isParsing = ref(false)
  const isConverting = ref(false)
  const isTraining = ref(false)
  const parseError = ref<string | null>(null)
  const convertError = ref<string | null>(null)
  const trainError = ref<string | null>(null)

  // Computed
  const totalParsedReferences = computed(() => parsedTokens.value.length)

  const hasParseResults = computed(() => parsedTokens.value.length > 0)

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
    isParsing.value || isConverting.value || isTraining.value,
  )

  // Actions
  async function parseReferences(references: string[]) {
    isParsing.value = true
    parseError.value = null

    try {
      const response = await AnystyleService.parseReferences(references)

      if (response.success && response.data) {
        parsedTokens.value = response.data.tokens
        showTokenEditor.value = true // Automatically show editor after parsing
      }

      return response
    }
    catch (error) {
      parseError.value = error instanceof Error ? error.message : 'Parsing failed'
      throw error
    }
    finally {
      isParsing.value = false
    }
  }

  async function convertToCSL(tokens: AnystyleTokenSequence[]) {
    isConverting.value = true
    convertError.value = null

    try {
      const response = await AnystyleService.convertToCSL(tokens)
      return response
    }
    catch (error) {
      convertError.value = error instanceof Error ? error.message : 'CSL conversion failed'
      throw error
    }
    finally {
      isConverting.value = false
    }
  }

  async function trainModel(trainingData: AnystyleTokenSequence[]) {
    isTraining.value = true
    trainError.value = null

    try {
      const response = await AnystyleService.trainModel(trainingData)
      return response
    }
    catch (error) {
      trainError.value = error instanceof Error ? error.message : 'Model training failed'
      throw error
    }
    finally {
      isTraining.value = false
    }
  }

  function updateParsedTokens(newTokens: AnystyleTokenSequence[]) {
    parsedTokens.value = newTokens
  }

  function clearParseResults() {
    parsedTokens.value = []
    showTokenEditor.value = false
    parseError.value = null
  }

  function clearConvertError() {
    convertError.value = null
  }

  function clearTrainError() {
    trainError.value = null
  }

  function clearAllErrors() {
    parseError.value = null
    convertError.value = null
    trainError.value = null
  }

  function setShowTokenEditor(show: boolean) {
    showTokenEditor.value = show
  }

  return {
    // State
    parsedTokens: readonly(parsedTokens),
    showTokenEditor: readonly(showTokenEditor),
    isParsing: readonly(isParsing),
    isConverting: readonly(isConverting),
    isTraining: readonly(isTraining),
    parseError: readonly(parseError),
    convertError: readonly(convertError),
    trainError: readonly(trainError),

    // Computed
    totalParsedReferences,
    hasParseResults,
    getParseStatus,
    isAnyProcessing,

    // Actions
    parseReferences,
    convertToCSL,
    trainModel,
    updateParsedTokens,
    clearParseResults,
    clearConvertError,
    clearTrainError,
    clearAllErrors,
    setShowTokenEditor,
  }
})
