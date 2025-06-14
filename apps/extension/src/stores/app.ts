import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const isLoading = ref(false)
  const file = ref<File | null>(null)
  const text = ref<string>('')

  return { file, isLoading, text }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}
