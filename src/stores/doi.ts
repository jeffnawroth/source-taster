import { CrossrefClient, type HttpResponse, type Item, type Work } from '@jamesgopsill/crossref-client'
import { useDebounceFn } from '@vueuse/core'

import { acceptHMRUpdate, defineStore } from 'pinia'
import { extractDOIs } from '~/utils/doiExtractor'

export const useDoiStore = defineStore('doi', () => {
  // Data
  const text = ref<string>('')
  const client = new CrossrefClient()
  const loading = ref(false)
  const loadAborted = ref(false)

  const works = ref<HttpResponse<Item<Work>>[]>([])

  const file = ref<File | null>(null)

  // Computed

  // Number of DOIs found in the text
  const found = computed(() => works.value.length)

  // Number of DOIs that passed the check
  const valid = computed(() => works.value.filter(work => work.ok).length)

  // Number of DOIs that failed the check
  const invalid = computed(() => works.value.filter(work => !work.ok).length)

  function reset() {
    text.value = ''
    file.value = null
    works.value = []
  }

  // DOIS EXTRACTION
  const dois = ref<string[]>([])

  function handleDoisExtraction(text: string) {
    if (text.trim().length === 0)
      return
    dois.value = extractDOIs(text)
  }

  // DOIS META DATA
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
  async function checkDoiExists(doi: string) {
    const url = `https://doi.org/${doi}`
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          Accept: 'application/json',
        },
      })
      return response
    }
    catch (error) {
      console.error(error)
    }
  }

  return { dois, checkDoiExists, text, loading, loadAborted, works, found, valid, invalid, getDOIsMetadata, abortFetching, file, reset, handleDoisExtraction }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDoiStore, import.meta.hot))
}
