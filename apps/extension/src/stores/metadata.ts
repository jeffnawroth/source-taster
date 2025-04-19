import type { Work } from '../crossref-client'
import type { ReferenceMetadata, VerifiedReference } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAiExtraction } from '../logic'
import { extractDois } from '../utils/doiExtractor'
import { useAiStore } from './ai'
import { useAppStore } from './app'
import { useCrossrefStore } from './crossref'

export const useMetadataStore = defineStore('metadata', () => {
  const metadataResults = ref<VerifiedReference[]>([])

  const foundReferencesCount = computed(() => metadataResults.value.length)
  const registeredReferencesCount = computed(() => metadataResults.value.filter(ref => ref.verification.match).length)
  const unregisteredReferencesCount = computed(() => metadataResults.value.filter(ref => !ref.verification.match).length)

  // Extract metadata from text and search Crossref
  const { extractUsingAi } = useAiStore()
  const { isLoading } = storeToRefs(useAppStore())

  async function extractAndSearchMetadata(text: string) {
    metadataResults.value = []

    if (!text.length)
      return

    isLoading.value = true

    const metadataList = useAiExtraction.value ? await extractUsingAi(text) : extractDois(text)

    for (const metadata of metadataList) {
      const match = await searchAndVerifyWork(metadata)
      metadataResults.value.push(match)
    }

    isLoading.value = false
  }

  const { verifyMatchWithAI } = useAiStore()
  // Search Crossref using the metadata and verify the match with AI
  async function searchAndVerifyWork(referenceMetadata: ReferenceMetadata): Promise<VerifiedReference> {
    try {
      const work = await searchCrossrefWork(referenceMetadata)

      if (!work) {
        return {
          metadata: referenceMetadata,
          verification: { match: false, reason: 'No matching item found' },
        }
      }

      const verification = useAiExtraction ? await verifyMatchWithAI(referenceMetadata, work) : { match: true }

      return {
        metadata: referenceMetadata,
        verification,
        crossrefData: work,
      }
    }
    catch (error) {
      console.error('Error using crossref search', error)
      return {
        metadata: referenceMetadata,
        verification: { match: false, reason: 'Error using crossref search' },
      }
    }
  }

  const { getWorks, getWorkByDOI } = useCrossrefStore()

  async function searchCrossrefWork(meta: ReferenceMetadata): Promise<Work | null> {
    // Check if DOI is present in the metadata. If so, use it to get the work directly.
    if (meta.doi) {
      const work = await getWorkByDOI(meta.doi)
      if (work)
        return work
    }

    // If DOI is not present, construct a query using the metadata fields.
    if (!meta.title && !meta.journal && !meta.authors?.length && !meta.year)
      return null

    // The query is constructed by concatenating the title, authors, journal, and year.
    const params = [meta.title, ...(meta.authors ?? []), meta.journal, meta.year]
    const queryBibliographic = params.filter(Boolean).join(' ')
    const query = params ? `query.bibliographic=${queryBibliographic}` : undefined

    // The filter is constructed by checking if the year is present in the metadata.
    const filterParams = [
      meta.year ? `from-pub-date:${meta.year}-01-01,until-pub-date:${meta.year}-12-31` : undefined,
    ]
    const filter = filterParams.filter(Boolean).join(',')

    const select = [
      'title',
      'author',
      'issued',
      'published',
      'published-print',
      'published-online',
      'DOI',
      'container-title',
      'volume',
      'issue',
      'page',
      'URL',
    ].join(',')

    const rows = 1

    const sort = 'score'

    const works = await getWorks({ query, filter, select, rows, sort })
    return works[0] || null
  }

  return { extractAndSearchMetadata, metadataResults, foundReferencesCount, registeredReferencesCount, unregisteredReferencesCount }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMetadataStore, import.meta.hot))
}
