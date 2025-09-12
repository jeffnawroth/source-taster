/**
 * Pinia store for managing UI state and display data
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Input State
  const inputText = ref('')
  const file = ref<File | null>(null)

  // Clear all UI state
  function clearAll() {
    inputText.value = ''
    file.value = null
  }

  return {
    // State
    inputText,
    file,

    // Actions
    clearAll,
  }
})
