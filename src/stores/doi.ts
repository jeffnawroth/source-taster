import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import { useDebounceFn } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAiExtraction } from '~/logic'
import { extractDoisUsingRegex } from '~/utils/doiExtractor'
import { useAiStore } from './ai'
import { useAppStore } from './app'
import { useFileStore } from './file'
import { useTextStore } from './text'
import { useWorkStore } from './work'

export const useDoiStore = defineStore('doi', () => {
  const aiStore = useAiStore()
  const { file } = storeToRefs(useFileStore())
  const { text } = storeToRefs(useTextStore())
  const { works } = storeToRefs(useWorkStore())

  // RESET

  function reset() {
    text.value = ''
    file.value = null
    works.value = []
  }

  // DOIS EXTRACTION
  const extractedDois = ref<string[]>([])

  const handleDoisExtraction = useDebounceFn(async (text: string) => {
    // Reset the extracted DOIs and AI usage
    extractedDois.value = []

    // Trim the text
    const trimmedText = text.trim()

    // If the text is empty, reset the extracted DOIs
    if (!trimmedText)
      return

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
    finally {
      if (extractedDois.value.length > 0) {
        checkDoisExists()
      }
    }
  }, 500)

  // DOIS META DATA

  // Resolves the DOI
  const { isLoading } = storeToRefs(useAppStore())

  // Check if the DOI exists
  async function checkDoiExists(doi: string) {
    const url = `https://doi.org/${doi}`

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          Accept: 'application/json',
        },
      })

      if (response) {
        works.value.push({
          ok: response.ok,
          content: {
            message: {
              DOI: doi,
              URL: url,
            },
          } as Item<Work>,
        } as HttpResponse<Item<Work>>)
      }
    }
    catch (error) {
      console.error('Error checking DOI exists:', error)
    }
  }

  // Check if the DOIs exist
  async function checkDoisExists() {
    isLoading.value = true
    works.value = []
    try {
      for (const doi of extractedDois.value) {
        await checkDoiExists(doi)
      }
    }
    catch (error) {
      console.error('Error checking DOIs exist:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  return { extractedDois, checkDoiExists, handleDoisExtraction, reset }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDoiStore, import.meta.hot))
}
