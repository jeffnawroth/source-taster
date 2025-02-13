import { CrossrefClient, type HttpResponse, type Item, type Work } from '@jamesgopsill/crossref-client'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAppStore } from './app'
import { useDoiStore } from './doi'

export const useWorkStore = defineStore('work', () => {
  const { isLoading } = storeToRefs(useAppStore())

  const client = new CrossrefClient()

  const works = ref<HttpResponse<Item<Work>>[]>([])

  // Computed

  // Number of DOIs that passed the check
  const valid = computed(() => works.value.filter(work => work.ok).length)

  // Number of DOIs that failed the check
  const invalid = computed(() => works.value.filter(work => !work.ok).length)

  // Number of DOIs found in the text
  const found = computed(() => works.value.length)

  // Get work by DOI
  async function getWorkByDoi(doi: string) {
    try {
      isLoading.value = true
      const response = await client.work(doi)
      works.value.push(response)
    }
    catch (error) {
      console.error('Error getting work by DOI :', error)
    }
    finally {
      isLoading.value = false
    }
  }

  // Get works by DOIs
  async function getWorksByDois(doisArray: string[]) {
    works.value = []
    isLoading.value = true
    try {
      await Promise.all(doisArray.map(doi => getWorkByDoi(doi)))
    }
    catch (error) {
      console.error('Error getting works by DOIs :', error)
    }
    finally {
      isLoading.value = false
    }
  }

  // GET DOIs METADATA
  const doiStore = useDoiStore()
  const { extractedDois } = storeToRefs(doiStore)
  const { checkDoiExists } = doiStore

  async function getDOIsMetadata() {
    works.value = []

    for (const doi of extractedDois.value) {
      try {
        isLoading.value = true
        const response = await client.work(doi)

        if (!response.ok) {
          const response2 = await checkDoiExists(doi) as HttpResponse<Item<Work>>
          works.value.push(response2)
          continue
        }
        works.value.push(response)
      }
      catch (error) {
        console.error(error)
      }
      finally {
        isLoading.value = false
      }
    }
  }

  return { works, valid, invalid, found, getDOIsMetadata, getWorksByDois }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWorkStore, import.meta.hot))
}
