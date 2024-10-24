import { CrossrefClient, type HttpResponse, type Item, type Work } from '@jamesgopsill/crossref-client'
import { useDebounceFn } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
// Client
  const client = new CrossrefClient()

  // Data
  const dois = ref<string[]>([])
  const works = ref<HttpResponse<Item<Work>>[]>([])
  const loading = ref(false)
  const loadAborted = ref(false)

  // Computed
  const found = computed(() => works.value.length)

  // Number of DOIs that passed the check
  const passed = computed(() => works.value.filter(work => work.ok && work.status === 200 && work.content).length)

  // Number of DOIs that have a warning
  const warning = computed(() => works.value.filter(work => work.ok && work.status === 200 && !work.content).length)

  // Number of DOIs that failed the check
  const failed = computed(() => works.value.filter(work => !work.ok && work.status === 404).length)

  // Functions
  //  Fetches the DOIs metadata
  const getDOIsMetadata = useDebounceFn(async () => {
    loadAborted.value = false
    works.value = []

    for (const doi of dois.value) {
      if (loadAborted.value) {
        break
      }

      try {
        loading.value = true
        const response = await client.work(doi)

        if (!response.ok) {
          const response2 = await resolveDOI(doi) as HttpResponse<Item<Work>>
          works.value.push(response2)
          continue
        }
        works.value.push(response)
      }
      catch (error) {
        console.error(error)
      }
      finally {
        loading.value = false
      }
    }
  }, 500)

  watch(dois, () => getDOIsMetadata())

  // Aborts fetching the DOIs metadata
  function abortFetching() {
    loadAborted.value = true
    loading.value = false
  }

  // Resolves the DOI
  async function resolveDOI(doi: string) {
    try {
      const response = await fetch(`https://doi.org/${doi}`)
      return response
    }
    catch (error) {
      console.error(error)
    }
  }

  return { dois, works, loading, passed, warning, failed, getDOIsMetadata, loadAborted, abortFetching, resolveDOI, found }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}
