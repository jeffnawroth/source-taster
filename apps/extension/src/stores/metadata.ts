import type { ReferenceMetadata, VerifiedReference } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAiStore } from './ai'
import { useAppStore } from './app'
import { useCrossrefStore } from './crossref'

export const useMetadataStore = defineStore('metadata', () => {
  const { extractUsingAi } = useAiStore()

  const { getWorks } = useCrossrefStore()
  const { verifyMatchWithAI } = useAiStore()

  // function verifyMatch(referenceMetadata: ReferenceMetadata, crossrefItem: Work): VerificationResult {
  //   const { authors: metadataAuthor, year: metadataYear, title: metadataTitle, journal: metadataJournal, doi: metadataDoi } = referenceMetadata
  //   const { author: crossrefWorkAuthors, title: crossrefWorkTitle, published: crossrefWorkYear, containerTitle: crossrefWorkJournal, dOI: crossrefWorkDoi } = crossrefItem

  //   const isMatch = !!(
  //     (!metadataTitle || (crossrefWorkTitle ?? [])[0].toLowerCase().includes((metadataTitle ?? '').toLowerCase()))
  //     && (crossrefWorkAuthors ?? []).every((author) => {
  //       const authorName = `${author.given} ${author.family}`
  //       return metadataAuthor?.some(name => authorName.toLowerCase().includes(name.toLowerCase())) ?? false
  //     })
  //     && crossrefWorkYear?.dateParts[0][0].toString() === (metadataYear ?? '').toString()
  //     && (!metadataJournal || (crossrefWorkJournal ?? [])[0].toLowerCase().includes((metadataJournal ?? '').toLowerCase()))
  //     && (!metadataDoi || (crossrefWorkDoi ?? '').toLowerCase() === metadataDoi.toLowerCase())
  //   )

  //   const reason = isMatch ? undefined : 'No match found'
  //   return {
  //     match: isMatch,
  //     reason,
  //   }
  // }

  async function searchCrossrefByMetadata(referenceMetadata: ReferenceMetadata): Promise<VerifiedReference> {
    const queryBibliographic = [referenceMetadata.title, ...(referenceMetadata.authors ?? []), referenceMetadata.journal, referenceMetadata.year]
    const query = queryBibliographic.filter(Boolean).join(' ')

    const filter = [
      referenceMetadata.year
        ? `from-pub-date:${referenceMetadata.year},until-pub-date:${referenceMetadata.year}`
        : undefined,
      referenceMetadata.doi
        ? `doi:${referenceMetadata.doi}`
        : undefined,
    ].filter(Boolean).join(',')

    try {
      const queryParam = query ? `query.bibliographic=${query}` : undefined
      const works = await getWorks({
        query: queryParam,
        select: 'title,author,issued,published,published-print,published-online,DOI,container-title,volume,issue,page,URL',
        filter: filter || undefined,
        rows: 1,
        sort: 'score',
      })

      const item = works[0]

      if (item) {
        const aiVerification = await verifyMatchWithAI(referenceMetadata, item)
        // const verificationResult = verifyMatch(referenceMetadata, item)
        return {
          metadata: referenceMetadata,
          verification: aiVerification,
          crossrefData: item,
        }
      }
      else {
        return {
          metadata: referenceMetadata,
          verification: { match: false, reason: 'No matching item found' },
        }
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

  // Extract metadata from text and search Crossref
  const metadataResults = ref<VerifiedReference[]>([])
  const { isLoading } = storeToRefs(useAppStore())

  async function extractAndSearchMetadata(text: string) {
    metadataResults.value = []

    if (!text.length)
      return

    isLoading.value = true

    const metadataList = await extractUsingAi(text)

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
