import type { ExtractedMetadata, IdentifierResult } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAiStore } from './ai'
import { useAppStore } from './app'

export const useMetadataStore = defineStore('metadata', () => {
  const { extractUsingAi } = useAiStore()

  const metadataResults = ref<IdentifierResult[]>([])

  async function searchCrossrefByMetadata(metadata: ExtractedMetadata): Promise<IdentifierResult> {
    const queryParts = [metadata.title, ...(metadata.authors || []), metadata.journal, metadata.year]
    const query = encodeURIComponent(queryParts.join(' '))

    try {
      const res = await fetch(`https://api.crossref.org/works?rows=1&sort=score&query=query.bibliographic=${query}`)
      if (!res.ok)
        throw new Error('Crossref API request failed')

      const json = await res.json()
      const item = json.message.items?.[0]

      if (item) {
        return {
          value: metadata.snippet,
          registered: true,
          crossrefData: item,
          type: 'METADATA',
        }
      }
      else {
        return {
          value: metadata.snippet,
          registered: false,
          type: 'METADATA',
        }
      }
    }
    catch (error) {
      console.error('Fehler bei der Crossref-Suche:', error)
      return {
        value: metadata.snippet,
        registered: false,
        type: 'METADATA',
      }
    }
  }

  const { isLoading } = storeToRefs(useAppStore())
  async function extractAndSearchMetadata(text: string) {
    metadataResults.value = []

    if (!text.length)
      return

    isLoading.value = true

    const metadataList = await extractUsingAi(text, 'metadata')
    if (!metadataList)
      return []

    for (const metadata of metadataList) {
      const match = await searchCrossrefByMetadata(metadata)
      metadataResults.value.push(match)
    }

    isLoading.value = false
  }

  return { extractAndSearchMetadata, metadataResults }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMetadataStore, import.meta.hot))
}
