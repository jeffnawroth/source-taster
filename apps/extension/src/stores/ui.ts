/**
 * Pinia store for managing UI state and display data
 */
import type { CSLItem, MatchingResult } from '@source-taster/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Type for displayed references (different from extracted references)
export interface DisplayReference {
  id: string
  originalText: string
  status: 'pending' | 'matched' | 'not-matched' | 'error'
  error?: string
  matchingResult?: MatchingResult // MatchingResult from matching store
  metadata: CSLItem // Reference metadata for display
}

export const useUIStore = defineStore('ui', () => {
  // Input State
  const inputText = ref('')
  const file = ref<File | null>(null)

  // Display State - these are references shown in the UI (search results, matches, etc.)
  // NOT the same as extracted references (those are in extractionStore)
  const displayReferences = ref<DisplayReference[]>([])

  // Clear all UI state
  function clearAll() {
    inputText.value = ''
    file.value = null
    displayReferences.value = []
  }

  // Clear just the display references
  function clearDisplayReferences() {
    displayReferences.value = []
  }

  // Update a specific display reference
  function updateDisplayReference(id: string, updates: Partial<DisplayReference>) {
    const index = displayReferences.value.findIndex(ref => ref.id === id)
    if (index !== -1) {
      displayReferences.value[index] = { ...displayReferences.value[index], ...updates }
    }
  }

  return {
    // State
    inputText,
    file,
    displayReferences,

    // Actions
    clearAll,
    clearDisplayReferences,
    updateDisplayReference,
  }
})
