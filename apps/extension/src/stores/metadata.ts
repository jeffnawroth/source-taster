import type { PublicationMetadata, ReferenceMetadata, VerificationResult, VerifiedReference } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
// import { extractHtmlTextFromUrl } from '../utils/htmlUtils'
// import { normalizeUrl } from '../utils/normalizeUrl'
// import { extractPdfTextFromUrl } from '../utils/pdfUtils'
import { useAiStore } from './ai'
import { useAppStore } from './app'
import { useCrossrefStore } from './crossref'
import { useEuropePmcStore } from './europe-pmc'
import { useOpenAlexStore } from './openAlex'

export const useMetadataStore = defineStore('metadata', () => {
  const metadataResults = ref<VerifiedReference[]>([])

  const foundReferencesCount = computed(() => metadataResults.value.length)
  const registeredReferencesCount = computed(() => metadataResults.value.filter(ref => ref.verification?.match).length)
  const unregisteredReferencesCount = computed(() => metadataResults.value.filter(ref => !ref.verification || !ref.verification.match).length)

  // Extract metadata from text and search Crossref
  const { extractReferencesMetadata } = useAiStore()
  // const { verifyPageMatchWithAI } = useAiStore()
  const { isLoading } = storeToRefs(useAppStore())

  async function extractAndSearchMetadata(text: string) {
    // Clear previous results
    metadataResults.value = []

    // Check if the text is empty
    if (!text.trim().length)
      return

    // Set loading state
    isLoading.value = true

    // Extract references metadata from the text
    const referencesMetadata = await extractReferencesMetadata(text)

    // Check if references metadata is empty
    if (!referencesMetadata)
      return

    // Search and verify for each reference metadata
    const VerifiedReferences = await Promise.all(referencesMetadata.map(searchAndVerifyWork))

    // Set the metadata results
    metadataResults.value = [...VerifiedReferences]

    isLoading.value = false
  }

  // Search for works using OpenAlex, Europe PMC, and Crossref
  const { searchPublication: SearchOpenAlexPublication } = useOpenAlexStore()
  const { searchArticle: searchEuropePmcWork } = useEuropePmcStore()
  const { searchCrossrefWork } = useCrossrefStore()

  async function searchWork(referenceMetadata: ReferenceMetadata): Promise<PublicationMetadata[] | null> {
    // Check if the reference metadata title is empty
    if (!referenceMetadata.title) {
      return null
    }

    // Search for works using OpenAlex, Europe PMC, and Crossref
    const publications = await Promise.all([
      searchCrossrefWork(referenceMetadata),
      SearchOpenAlexPublication(referenceMetadata),
      searchEuropePmcWork(referenceMetadata),
    ])

    // Filter out null values from the publications array
    const filteredPublications = publications.filter(publication => publication !== null)

    // Check if the filtered publications array is empty
    return filteredPublications.length > 0 ? filteredPublications : null
  }

  // Verify the match with AI
  const { verifyReferenceAgainstPublications } = useAiStore()

  async function verifyMatch(referenceMetadata: ReferenceMetadata, publicationsMetadata: PublicationMetadata[]): Promise<VerificationResult | null> {
    // Check if the publications metadata is empty
    if (!publicationsMetadata.length) {
      return null
    }

    // Verify the reference metadata against the publications metadata using AI
    const verificationResult = await verifyReferenceAgainstPublications(referenceMetadata, publicationsMetadata)

    return verificationResult
  }

  // Search Crossref using the metadata and verify the match with AI
  async function searchAndVerifyWork(referenceMetadata: ReferenceMetadata): Promise<VerifiedReference> {
    try {
      // Search for works using OpenAlex, Europe PMC, and Crossref
      const publicationsMetadata = await searchWork(referenceMetadata)

      let verification: VerificationResult | null = null

      if (publicationsMetadata) {
        // Verify reference metadata against the publications metadata
        verification = await verifyMatch(referenceMetadata, publicationsMetadata)
      }

      return {
        referenceMetadata,
        verification,
      }

      // if (referenceMetadata.url) {
      //   const urlVerification = await verifyUrlContent(referenceMetadata)

      //   return {
      //     referenceMetadata,
      //     verification: {
      //       match: urlVerification.match,
      //       reason: urlVerification.reason ? 'URL reachable' : 'URL not reachable',
      //     },
      //     websiteUrl: normalizeUrl(referenceMetadata.url),
      //   }
      // }

      // return {
      //   referenceMetadata,
      //   verification,
      // }
    }
    catch {
      return {
        referenceMetadata,
        verification: null,
      }
    }
  }

  // async function verifyUrlContent(referenceMetadata: ReferenceMetadata): Promise<VerificationResult> {
  //   const raw = referenceMetadata.url!
  //   const url = normalizeUrl(raw)

  //   let headResp: Response
  //   try {
  //     headResp = await fetch(url, { method: 'HEAD', redirect: 'follow' })
  //   }
  //   catch {
  //     return { match: false, reason: 'URL not reachable' }
  //   }

  //   if (!headResp.ok) {
  //     return { match: false, reason: `HTTP ${headResp.status}` }
  //   }

  //   const ct = (headResp.headers.get('Content-Type') || '').toLowerCase()

  //   let pageText = ''
  //   if (ct.includes('pdf')) {
  //     pageText = await extractPdfTextFromUrl(url)
  //   }
  //   else {
  //     pageText = await extractHtmlTextFromUrl(url)
  //   }

  //   const verification = await verifyPageMatchWithAI(referenceMetadata, pageText)
  //   return verification
  // }

  return { extractAndSearchMetadata, metadataResults, foundReferencesCount, registeredReferencesCount, unregisteredReferencesCount }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMetadataStore, import.meta.hot))
}
