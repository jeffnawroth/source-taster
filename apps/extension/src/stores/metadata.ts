import type { Work } from '../clients/crossref-client'
import type { FullPaper } from '../clients/semanticscholar-client'
import type { ReferenceMetadata, VerifiedReference } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAiExtraction } from '../logic'
import { extractDois } from '../utils/doiExtractor'
import { useAiStore } from './ai'
import { useAppStore } from './app'
import { useCrossrefStore } from './crossref'
import { useSemanticScholarStore } from './semantic-scholar'

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

    const referencesMetadata = useAiExtraction.value ? await extractUsingAi(text) : extractDois(text)

    for (const referenceMetadata of referencesMetadata) {
      const match = await searchAndVerifyWork(referenceMetadata)
      metadataResults.value.push(match)
    }

    isLoading.value = false
  }

  const { searchCrossrefWork } = useCrossrefStore()
  const { searchSemanticScholarWork } = useSemanticScholarStore()

  async function searchWork(referenceMetadata: ReferenceMetadata) {
    const [crossrefWork, semanticScholarWork] = await Promise.all([
      searchCrossrefWork(referenceMetadata),
      searchSemanticScholarWork(referenceMetadata),
    ])
    return { crossrefWork, semanticScholarWork }
  }

  const { verifyMatchWithAI } = useAiStore()
  async function verifyMatch(referenceMetadata: ReferenceMetadata, works: { crossrefWork: Work | null, semanticScholarWork: FullPaper | null }) {
    if (works.crossrefWork && !works.semanticScholarWork)
      return { match: false, reason: 'No data for CrossRef and Semantic Scholar' }

    const verificationResult = await verifyMatchWithAI(referenceMetadata, works)
    return verificationResult
  }

  // Search Crossref using the metadata and verify the match with AI
  async function searchAndVerifyWork(referenceMetadata: ReferenceMetadata): Promise<VerifiedReference> {
    try {
      const works = await searchWork(referenceMetadata)
      const verificationResult = await verifyMatch(referenceMetadata, works)

      return {
        metadata: referenceMetadata,
        verification: verificationResult,
        crossrefData: works.crossrefWork || undefined,
        semanticScholarData: works.semanticScholarWork || undefined,
      }

      // if (work) {
      //   const verification = useAiExtraction
      //     ? await verifyMatchWithAI(referenceMetadata, work)
      //     : { match: true }

      //   if (verification.match) {
      //     return {
      //       metadata: referenceMetadata,
      //       crossrefData: work,
      //       verification,
      //     }
      //   }
      // }
      // // Check if URL is valid and reachable
      // if (referenceMetadata.url) {
      //   const urlRes = await validateUrl(referenceMetadata.url)
      //   return {
      //     metadata: referenceMetadata,
      //     websiteUrl: referenceMetadata.url,
      //     verification: {
      //       match: urlRes.reachable,
      //       reason: urlRes.reachable
      //         ? 'URL not valid'
      //         : `URL-Validation failed: ${urlRes.reason}`,
      //     },
      //   }
      // }

      // return {
      //   metadata: referenceMetadata,
      //   verification: {
      //     match: false,
      //     reason: 'No data for CrossRef and URL',
      //   },
      // }
    }
    catch (error) {
      return {
        metadata: referenceMetadata,
        verification: { match: false, reason: `Error verifying reference: ${error}` },
      }
    }
  }

  return { extractAndSearchMetadata, metadataResults, foundReferencesCount, registeredReferencesCount, unregisteredReferencesCount }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMetadataStore, import.meta.hot))
}
