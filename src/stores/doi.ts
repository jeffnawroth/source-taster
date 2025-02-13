import { CrossrefClient, type HttpResponse, type Item, type Work } from '@jamesgopsill/crossref-client'
import { useDebounceFn } from '@vueuse/core'

import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAiExtraction } from '~/logic'
import { extractDoisUsingRegex } from '~/utils/doiExtractor'
import { useAiStore } from './ai'
import { useAppStore } from './app'
import { useFileStore } from './file'
import { useTextStore } from './text'

export const useDoiStore = defineStore('doi', () => {
  const aiStore = useAiStore()
  const { isLoading } = storeToRefs(useAppStore())
  const { file } = storeToRefs(useFileStore())
  const { text } = storeToRefs(useTextStore())

  // Data
  const client = new CrossrefClient()

  const works = ref<HttpResponse<Item<Work>>[]>([])

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
  const extractedDois = ref<string[]>([])

  const handleDoisExtraction = useDebounceFn(async (text: string) => {
    // Trim the text
    const trimmedText = text.trim()

    // If the text is empty, reset the extracted DOIs
    if (!trimmedText) {
      extractedDois.value = []
      return
    }
    // Reset the extracted DOIs and AI usage
    extractedDois.value = []

    try {
      // If the AI extraction is enabled, use the AI model to extract DOIs else use regex
      if (useAiExtraction.value) {
        extractedDois.value = await aiStore.extractDoisUsingAi(trimmedText)
      }
      else {
        extractedDois.value = extractDoisUsingRegex(trimmedText)
      }
    }
    catch (error) {
      // If an error occurs, fallback to regex
      console.error('Error extracting Dois using AI :', error)
      extractedDois.value = extractDoisUsingRegex(trimmedText)
    }
  }, 500)

  // DOIS META DATA

  watch(extractedDois, () => getDOIsMetadata())

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

  return { extractedDois, checkDoiExists, works, found, valid, invalid, getDOIsMetadata, reset, handleDoisExtraction }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDoiStore, import.meta.hot))
}
