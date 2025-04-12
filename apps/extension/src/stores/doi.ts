import type { IdentifierResult } from '../types'
import { useAiExtraction } from '@/extension/logic'
import { extractDois } from '@/extension/utils/doiExtractor'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAiStore } from './ai'
import { useAppStore } from './app'

export const useDoiStore = defineStore('doi', () => {
  const dois = ref<IdentifierResult[]>([])

  // Returns the number of registered DOIs either from Crossref or DOI Resolver
  const registeredDoisCount = computed(() => {
    return dois.value.filter(doi => doi.registered).length
  })

  // Returns the number of unregistered DOIs
  const unregisteredDoisCount = computed(() => {
    return dois.value.filter(doi => !doi.registered).length
  })

  // Checks if the DOI is exists by using the Crossref API or DOI Resolver
  async function checkDoi(doi: string) {
    const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}`
    try {
      const response = await fetch(crossrefUrl)
      if (response.ok) {
        const data = await response.json()
        return {
          type: 'DOI' as const,
          value: doi,
          registered: true,
          source: 'Crossref',
          crossrefData: data.message,
        }
      }

      // Fallback: DOI Resolver
      const resolverUrl = `https://doi.org/${encodeURIComponent(doi)}`
      const resolverResponse = await fetch(resolverUrl, {
        method: 'HEAD',
        redirect: 'manual',
      })

      if (resolverResponse.status === 200 || resolverResponse.status === 303) {
        return {
          type: 'DOI' as const,
          value: doi,
          registered: true,
          source: 'DOI Resolver',
        }
      }

      return {
        type: 'DOI' as const,
        value: doi,
        registered: false,
        source: 'None',
      }
    }
    catch (error) {
      console.error('DOI Fehler:', error)
      return {
        type: 'DOI' as const,
        value: doi,
        registered: false,
        source: 'None',
      }
    }
  }

  const { isLoading } = storeToRefs(useAppStore())
  const { extractUsingAi } = useAiStore()

  // Function to process the text and extract ISSNs
  async function processDois(text: string) {
    dois.value = []
    isLoading.value = true

    const extractedDois = useAiExtraction.value ? await extractAiDois(text) : extractDois(text)
    const uniqueDois = Array.from(new Set(extractedDois))

    for (const doi of uniqueDois) {
      const result = await checkDoi(doi)
      dois.value.push(result)
    }

    isLoading.value = false
  }

  async function extractAiDois(text: string) {
    try {
      const dois = await extractUsingAi(text, 'doi')
      return dois
    }
    catch (error) {
      console.error('Error extracting DOIs with AI, Fallback to Regex', error)
      return extractDois(text)
    }
  }

  // const handleDoisExtraction = useDebounceFn(async (text: string) => {
  //   // Reset the extracted DOIs and AI usage
  //   works.value = []
  //   extractedDois.value = []
  //   isAiUsed.value = false

  //   // Trim the text
  //   const trimmedText = text.trim()

  //   // If the text is empty, reset the extracted DOIs
  //   if (!trimmedText)
  //     return

  //   try {
  //     // If the AI extraction is enabled, use the AI model to extract DOIs else use regex

  //     if (useAiExtraction.value) {
  //       extractedDois.value = await extractDoisUsingAi(trimmedText)
  //     }
  //     else {
  //       extractedDois.value = extractDoisUsingRegex(trimmedText)
  //     }
  //   }
  //   catch (error) {
  //     // If an error occurs, fallback to regex
  //     console.error('Error extracting Dois using AI :', error)
  //     extractedDois.value = extractDoisUsingRegex(trimmedText)
  //   }
  //   finally {
  //     if (extractedDois.value.length > 0) {
  //       checkDoisExists()
  //     }
  //   }
  // }, 500)

  // DOIS META DATA

  // Resolves the DOI
  // const { isLoading } = storeToRefs(useAppStore())

  // Check if the DOI exists
  // async function checkDoiExists(doi: string) {
  //   const url = `https://doi.org/${doi}`

  //   try {
  //     const response = await fetch(url, {
  //       method: 'HEAD',
  //       headers: {
  //         Accept: 'application/json',
  //       },
  //     })

  //     if (response) {
  //       works.value.push({
  //         ok: response.ok,
  //         content: {
  //           message: {
  //             DOI: doi,
  //             URL: url,
  //           },
  //         } as Item<Work>,
  //       } as HttpResponse<Item<Work>>)
  //     }
  //   }
  //   catch (error) {
  //     console.error('Error checking DOI exists:', error)
  //   }
  // }

  // Check if the DOIs exist
  // async function checkDoisExists() {
  //   works.value = []

  //   if (extractedDois.value.length === 0)
  //     return

  //   isLoading.value = true

  //   try {
  //     for (const doi of extractedDois.value) {
  //       await checkDoiExists(doi)
  //     }
  //   }
  //   catch (error) {
  //     console.error('Error checking DOIs exist:', error)
  //   }
  //   finally {
  //     isLoading.value = false
  //   }
  // }

  return { processDois, dois, registeredDoisCount, unregisteredDoisCount }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDoiStore, import.meta.hot))
}
