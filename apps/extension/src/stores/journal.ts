import { CrossrefClient } from '@jamesgopsill/crossref-client'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useJournalStore = defineStore('journal', () => {
  const client = new CrossrefClient()

  const issn = ref('')

  function getJournal(issn: string) {
    try {
      const response = client.journal(issn)
      return response
    }
    catch (error) {
      console.error('Error getting journal by ISSN:', error)
    }
  }
  return { getJournal, issn }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useJournalStore, import.meta.hot))
}
