import type { PublicationMetadata, ReferenceMetadata, VerificationResult, WebsiteMetadata, WebsiteVerificationResult } from '../types'
import { selectedAiModel } from '../logic'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

/**
 * Extracts reference metadata from the given prompt using the AI service.
 * @param prompt The input prompt containing the references.
 * @returns A promise that resolves to an array of ReferenceMetadata or null if an error occurs.
 */
export async function extractReferencesMetadata(prompt: string): Promise<ReferenceMetadata[] | null> {
  try {
    const response = await fetch(`${baseUrl}/extract-metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: selectedAiModel.value.service,
        model: selectedAiModel.value.value,
        input: prompt,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json() as ReferenceMetadata[]
  }
  catch (error) {
    console.error('Failed to extract references metadata:', error)
    return null
  }
}

/**
 * Verifies the reference metadata against the publications metadata using the AI service.
 * @param referenceMetadata The reference metadata to verify.
 * @param publicationsMetadata The publications metadata to verify against.
 * @returns A promise that resolves to a VerificationResult or null if an error occurs.
 */

export async function verifyReferenceAgainstPublications(
  referenceMetadata: ReferenceMetadata,
  publicationsMetadata: PublicationMetadata[],
): Promise<VerificationResult | null> {
  try {
    const response = await fetch(`${baseUrl}/verify-metadata-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: selectedAiModel.value.service,
        model: selectedAiModel.value.value,
        referenceMetadata,
        publicationsMetadata,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json() as VerificationResult
  }
  catch (error) {
    console.error('Failed to verify reference against publications:', error)
    return null
  }
}

/**
 * Extracts website metadata from the given input using the AI service.
 * @param input The input string containing the website information.
 * @returns A promise that resolves to the extracted WebsiteMetadata or null if an error occurs.
 */
export async function extractWebsiteMetadata(input: string): Promise<WebsiteMetadata | null> {
  try {
    const res = await fetch(`${baseUrl}/extract-metadata-website`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: selectedAiModel.value.service,
        model: selectedAiModel.value.value,
        input,
      }),
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return await res.json() as WebsiteMetadata
  }
  catch (error) {
    console.error('Failed to extract website metadata:', error)
    return null
  }
}

/**
 * Verifies the reference metadata against the website metadata using the AI service.
 * @param referenceMetadata The reference metadata to verify.
 * @param websiteMetadata The website metadata to verify against.
 * @returns A promise that resolves to a WebsiteVerificationResult or null if an error occurs.
 */
export async function verifyAgainstWebsite(referenceMetadata: ReferenceMetadata, websiteMetadata: WebsiteMetadata): Promise<WebsiteVerificationResult | null> {
  try {
    const res = await fetch(
      `${baseUrl}/verify-metadata-match-website`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedAiModel.value.service,
          model: selectedAiModel.value.value,
          referenceMetadata,
          websiteMetadata,
        }),
      },
    )

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return await res.json() as WebsiteVerificationResult
  }
  catch (error) {
    console.error('Failed to verify against website:', error)
    return null
  }
}
