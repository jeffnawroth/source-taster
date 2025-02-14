import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAiStore } from './ai'
import { useDoiStore } from './doi'
import { useFileStore } from './file'
import { useWorkStore } from './work'

export const useTextStore = defineStore('text', () => {
  const text = ref<string>('')

  // RESET
  const { extractedDois } = storeToRefs(useDoiStore())
  const { works } = storeToRefs(useWorkStore())
  const { isAiUsed } = storeToRefs(useAiStore())
  const { file } = storeToRefs(useFileStore())

  watch(text, (newText) => {
    if (newText.trim().length === 0) {
      extractedDois.value = []
      works.value = []
      file.value = null
      isAiUsed.value = false
    }
  })

  return { text }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTextStore, import.meta.hot))
}
