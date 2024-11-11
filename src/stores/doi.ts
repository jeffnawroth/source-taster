import { CrossrefClient, type HttpResponse, type Item, type Work } from '@jamesgopsill/crossref-client'
import { useDebounceFn } from '@vueuse/core'

import { acceptHMRUpdate, defineStore } from 'pinia'
import { autoImportOption } from '~/logic'
import { extractDOIs } from '~/utils/doiExtractor'

export const useDoiStore = defineStore('doi', () => {
  // Data
  const bibliography = ref<string>('')
  const client = new CrossrefClient()
  const loading = ref(false)
  const loadAborted = ref(false)

  const works = ref<HttpResponse<Item<Work>>[]>([])

  const url = ref('')
  const file = ref<File | null>(null)

  // Computed

  // Extracts DOIs from the bibliography
  const dois = computed(() => extractDOIs(bibliography.value))

  // Number of DOIs found in the bibliography
  const found = computed(() => works.value.length)

  // Number of DOIs that passed the check
  const valid = computed(() => works.value.filter(work => work.ok && work.status === 200 && work.content).length)

  // Number of DOIs that passed the check but have no content
  const incomplete = computed(() => works.value.filter(work => work.ok && work.status === 200 && !work.content).length)

  // Number of DOIs that failed the check
  const failed = computed(() => works.value.filter(work => !work.ok && work.status === 404).length)

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

  // Watchers
  watch(dois, () => getDOIsMetadata())

  watch(autoImportOption, (newValue) => {
    if (!newValue)
      reset()
  })

  watch(bibliography, (newValue) => {
    if (!newValue)
      reset()
  })

  function reset() {
    bibliography.value = ''
    url.value = ''
    file.value = null
    works.value = []
  }

  // Aborts fetching the DOIs metadata
  function abortFetching() {
    loadAborted.value = true
    loading.value = false
  }

  return { dois, resolveDOI, bibliography, loading, loadAborted, works, found, valid, incomplete, failed, getDOIsMetadata, abortFetching, url, file }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDoiStore, import.meta.hot))
}
