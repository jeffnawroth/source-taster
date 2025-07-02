import type { Reference, VerificationResult, WebsiteVerificationResult } from '@source-taster/types'
import { API_CONFIG } from '@/extension/env'
import { selectedAiModel } from '../logic'

export class ReferencesService {
  /**
   * Extract references from text using AI
   */
  static async extractReferences(text: string, signal?: AbortSignal): Promise<Reference[]> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.extract}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        aiService: selectedAiModel.value.service,
        model: selectedAiModel.value.model,
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Extraction failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Extraction failed')
    }

    return data.data.references || []
  }

  /**
   * Verify references against databases
   */
  static async verifyReferences(references: Reference[], signal?: AbortSignal): Promise<VerificationResult[]> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.verify}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        references,
        aiService: selectedAiModel.value.service,
        model: selectedAiModel.value.model,
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Verification failed')
    }

    return data.data.results || []
  }

  /**
   * Verify a reference against a website URL
   */
  static async verifyWebsiteReference(
    reference: Reference,
    url: string,
    signal?: AbortSignal,
  ): Promise<WebsiteVerificationResult> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.verify}/website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference,
        url,
        aiService: selectedAiModel.value.service,
        options: {
          timeout: 10000,
          enableWaybackMachine: true,
        },
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Website verification failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Website verification failed')
    }

    return data.data
  }

  /**
   * Extract and verify references in one call
   */
  static async extractAndVerify(text: string, signal?: AbortSignal): Promise<{
    references: Reference[]
    verificationResults: VerificationResult[]
  }> {
    const references = await this.extractReferences(text, signal)

    if (references.length === 0) {
      return { references: [], verificationResults: [] }
    }

    const verificationResults = await this.verifyReferences(references, signal)

    return { references, verificationResults }
  }
}
