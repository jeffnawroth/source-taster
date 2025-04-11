import type { IdentifierResult } from '../types'
import { CrossrefClient } from '@jamesgopsill/crossref-client'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAiExtraction } from '../logic'
import extractIssns from '../utils/issn-extractor'
import { useAiStore } from './ai'
import { useAppStore } from './app'

export const useIssnStore = defineStore('issn', () => {
  const client = new CrossrefClient()

  const issns = ref<IdentifierResult[]>([])

  // Function to check if the ISSN is registered
  async function checkISSN(issn: string) {
    try {
      // Check if the ISSN is registered with Crossref
      const response = await client.journal(issn)
      if (response.ok) {
        return {
          type: 'ISSN',
          value: issn,
          registered: true,
          crossrefData: response.content.message,
        } as IdentifierResult
      }

      // Fallback to ISSN Portal if Crossref doesn't have the ISSN
      const issnPortalUrl = `https://portal.issn.org/resource/ISSN/${encodeURIComponent(issn)}`
      const issnResponse = await fetch(issnPortalUrl, {
        method: 'HEAD',
        redirect: 'manual',
      })

      if (issnResponse.status === 200) {
        return {
          type: 'ISSN' as const,
          value: issn,
          registered: true,
        } as IdentifierResult
      }

      return {
        type: 'ISSN' as const,
        value: issn,
        registered: false,
      }
    }
    catch (error) {
      console.error('Error getting journal by ISSN:', error)
      return {
        type: 'ISSN',
        value: issn,
        registered: false,
      } as IdentifierResult
    }
  }

  const { isLoading } = storeToRefs(useAppStore())
  const { extractUsingAi } = useAiStore()

  // Function to process the text and extract ISSNs
  async function processIssns(text: string) {
    issns.value = []
    isLoading.value = true

    const extractedIssns = useAiExtraction.value ? await extractAiIssn(text) : extractIssns(text)
    const uniqueIssns = Array.from(new Set(extractedIssns))

    for (const issn of uniqueIssns) {
      const result = await checkISSN(issn)
      issns.value.push(result)
    }

    isLoading.value = false
  }

  // Function to extract ISSNs using AI
  async function extractAiIssn(text: string) {
    try {
      const issns = await extractUsingAi(text, 'issn')
      return issns
    }
    catch (error) {
      console.error('Error extracting ISSNs with AI, Fallback to Regex', error)
      return extractIssns(text)
    }
  }

  return { processIssns, issns }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIssnStore, import.meta.hot))
}
