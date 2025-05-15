import type { PublicationMetadata, ReferenceMetadata, VerificationResult, VerifiedReference } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { extractHtmlTextFromUrl } from '../utils/htmlUtils'
import { normalizeUrl } from '../utils/normalizeUrl'
import { extractPdfTextFromUrl } from '../utils/pdfUtils'
import { useAiStore } from './ai'
import { useAppStore } from './app'
import { useCrossrefStore } from './crossref'
import { useEuropePmcStore } from './europe-pmc'
import { useOpenAlexStore } from './openAlex'
import { useSemanticScholarStore } from './semantic-scholar'

export const useMetadataStore = defineStore('metadata', () => {
  const metadataResults = ref<VerifiedReference[]>([])

  const foundReferencesCount = computed(() => metadataResults.value.length)
  const registeredReferencesCount = computed(() => metadataResults.value.filter(ref => ref.verification.match).length)
  const unregisteredReferencesCount = computed(() => metadataResults.value.filter(ref => !ref.verification.match).length)

  // Extract metadata from text and search Crossref
  const { extractUsingAi } = useAiStore()
  const { verifyPageMatchWithAI } = useAiStore()
  const { isLoading } = storeToRefs(useAppStore())

  async function extractAndSearchMetadata(text: string) {
    metadataResults.value = []

    if (!text.length)
      return

    isLoading.value = true

    const referencesMetadata = await extractUsingAi(text)

    for (const referenceMetadata of referencesMetadata) {
      const match = await searchAndVerifyWork(referenceMetadata)
      metadataResults.value.push(match)
    }

    isLoading.value = false
  }

  const { searchWork: searchOpenAlexWork } = useOpenAlexStore()
  const { searchArticle: searchEuropePmcWork } = useEuropePmcStore()
  const { searchCrossrefWork } = useCrossrefStore()
  const { searchSemanticScholarWork } = useSemanticScholarStore()

  async function searchWork(referenceMetadata: ReferenceMetadata) {
    const publications = await Promise.all([
      searchCrossrefWork(referenceMetadata),
      searchSemanticScholarWork(referenceMetadata),
      searchOpenAlexWork(referenceMetadata),
      searchEuropePmcWork(referenceMetadata),
    ])

    return publications.filter(Boolean) as PublicationMetadata[]
  }

  // Verify the match with AI
  const { verifyMatchWithAI } = useAiStore()

  async function verifyMatch(referenceMetadata: ReferenceMetadata, publicationsMetadata: PublicationMetadata[]) {
    const verificationResult = await verifyMatchWithAI(referenceMetadata, publicationsMetadata)

    return verificationResult
  }

  // Search Crossref using the metadata and verify the match with AI
  async function searchAndVerifyWork(referenceMetadata: ReferenceMetadata): Promise<VerifiedReference> {
    try {
      const publicationsMetadata = await searchWork(referenceMetadata)
      const verification = await verifyMatch(referenceMetadata, publicationsMetadata)

      if (verification.match) {
        return {
          referenceMetadata,
          verification,
        }
      }
      if (referenceMetadata.url) {
        const urlVerification = await verifyUrlContent(referenceMetadata)

        return {
          referenceMetadata,
          verification: {
            match: urlVerification.match,
            reason: urlVerification.reason ? 'URL reachable' : 'URL not reachable',
          },
          websiteUrl: normalizeUrl(referenceMetadata.url),
        }
      }

      return {
        referenceMetadata,
        verification,
      }
    }
    catch (error) {
      return {
        referenceMetadata,
        verification: { match: false, reason: `Error verifying reference: ${error}` },
      }
    }
  }

  async function verifyUrlContent(referenceMetadata: ReferenceMetadata): Promise<VerificationResult> {
    const raw = referenceMetadata.url!
    const url = normalizeUrl(raw)

    let headResp: Response
    try {
      headResp = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    }
    catch {
      return { match: false, reason: 'URL not reachable' }
    }

    if (!headResp.ok) {
      return { match: false, reason: `HTTP ${headResp.status}` }
    }

    const ct = (headResp.headers.get('Content-Type') || '').toLowerCase()

    let pageText = ''
    if (ct.includes('pdf')) {
      pageText = await extractPdfTextFromUrl(url)
    }
    else {
      pageText = await extractHtmlTextFromUrl(url)
    }

    const verification = await verifyPageMatchWithAI(referenceMetadata, pageText)
    return verification
  }

  return { extractAndSearchMetadata, metadataResults, foundReferencesCount, registeredReferencesCount, unregisteredReferencesCount }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMetadataStore, import.meta.hot))
}
