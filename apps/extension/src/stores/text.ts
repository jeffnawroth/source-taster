import { acceptHMRUpdate, defineStore } from 'pinia'

export const useTextStore = defineStore('text', () => {
  const text = ref<string>('')

  return { text }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTextStore, import.meta.hot))
}
