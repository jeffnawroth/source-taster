import type { PublicationMetadata, ReferenceMetadata, VerificationResult, VerifiedReference } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { extractWebsiteMetadata, verifyAgainstWebsite, verifyReferenceAgainstPublications } from '../services/aiService'
import { extractHtmlTextFromUrl } from '../utils/htmlUtils'
import { normalizeUrl } from '../utils/normalizeUrl'
import { extractPdfTextFromUrl } from '../utils/pdfUtils'
import { useAiStore } from './aiStore'
import { useAppStore } from './app'
import { useCrossrefStore } from './crossref'
import { useEuropePmcStore } from './europePmcStore'
import { useOpenAlexStore } from './openAlexStore'

export const useMetadataStore = defineStore('metadata', () => {
  const verifiedReferences = ref<VerifiedReference[]>([])
  const extractedReferencesMetadata = ref<ReferenceMetadata[] | null>([])
  const processedCount = ref(0)

  const isSearchingAndVerifying = ref(false)

  const foundReferencesCount = computed(() => extractedReferencesMetadata.value?.length || 0)
  const registeredReferencesCount = computed(() => verifiedReferences.value.filter(ref => ref.verification?.match).length)
  const unregisteredReferencesCount = computed(() => verifiedReferences.value.filter(ref => !ref.verification || !ref.verification.match).length)

  function clear() {
    verifiedReferences.value = []
    extractedReferencesMetadata.value = []
    processedCount.value = 0
  }

  // Extract metadata from text and verify
  const { extractReferences } = useAiStore()

  const { isLoading } = storeToRefs(useAppStore())

  async function extractAndSearchMetadata(text: string) {
    // Clear previous results
    clear()

    // Check if the text is empty
    if (!text.trim().length)
      return

    // Set loading state
    isLoading.value = true

    // Extract references metadata from the text
    extractedReferencesMetadata.value = await extractReferences(text)

    // Check if references metadata is empty
    if (!extractedReferencesMetadata.value)
      return

    isSearchingAndVerifying.value = true

    // Search and verify for each reference metadata
    const promises = extractedReferencesMetadata.value.map(async (referenceMetadata) => {
      const result = await searchAndVerifyWork(referenceMetadata)
      processedCount.value++ // Zähler erhöhen nach jeder Verarbeitung
      return result
    })

    const references = await Promise.all(promises)

    isSearchingAndVerifying.value = false

    // Set the metadata results
    verifiedReferences.value = [...references]

    isLoading.value = false
  }

  // Search for works using OpenAlex, Europe PMC, and Crossref
  const { searchPublication: searchOpenAlexPublication } = useOpenAlexStore()
  const { searchPublication: searchEuropePmcPublication } = useEuropePmcStore()
  const { searchPublication: searchCrossrefPublication } = useCrossrefStore()

  async function searchWork(referenceMetadata: ReferenceMetadata): Promise<PublicationMetadata[] | null> {
    // Check if the reference metadata title is empty
    if (!referenceMetadata.title) {
      return null
    }

    // Search for works using OpenAlex, Europe PMC, and Crossref
    const publications = await Promise.all([
      searchCrossrefPublication(referenceMetadata),
      searchOpenAlexPublication(referenceMetadata),
      searchEuropePmcPublication(referenceMetadata),
    ])

    // Filter out null values from the publications array
    const filteredPublications = publications.filter(publication => publication !== null)

    // Check if the filtered publications array is empty
    return filteredPublications.length > 0 ? filteredPublications : null
  }

  // Verify the match with AI

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

      if (verification?.match) {
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
    catch {
      return {
        referenceMetadata,
        verification: null,
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

    const websiteMetadata = await extractWebsiteMetadata(pageText)
    if (!websiteMetadata) {
      return { match: false, reason: 'Website metadata extraction failed' }
    }

    const websiteResult = await verifyAgainstWebsite(
      referenceMetadata,
      websiteMetadata,
    )
    if (!websiteResult) {
      return { match: false, reason: 'Website metadata verification failed' }
    }

    return {
      match: websiteResult.match,
      reason: websiteResult.reason,
    }
  }

  return { extractAndSearchMetadata, verifiedReferences, foundReferencesCount, registeredReferencesCount, unregisteredReferencesCount, clear, isSearchingAndVerifying, extractedReferencesMetadata, processedCount }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMetadataStore, import.meta.hot))
}
