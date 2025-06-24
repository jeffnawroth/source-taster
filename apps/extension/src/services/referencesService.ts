import type { Reference, VerificationResult } from '@source-taster/types'
import { API_CONFIG } from '@/extension/env'
import { selectedAiModel } from '../logic'

export class ReferencesService {
  /**
   * Extract references from text using AI
   */
  static async extractReferences(text: string): Promise<Reference[]> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.extract}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        aiService: selectedAiModel.value.service,
      }),
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
  static async verifyReferences(references: Reference[]): Promise<VerificationResult[]> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.verify}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        references,
        aiService: selectedAiModel.value.service,
      }),
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
   * Extract and verify references in one call
   */
  static async extractAndVerify(text: string): Promise<{
    references: Reference[]
    verificationResults: VerificationResult[]
  }> {
    const references = await this.extractReferences(text)

    if (references.length === 0) {
      return { references: [], verificationResults: [] }
    }

    const verificationResults = await this.verifyReferences(references)

    return { references, verificationResults }
  }
}
