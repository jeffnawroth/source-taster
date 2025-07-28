import type { APIMatchingSettings, MatchingReference, MatchingResult, Reference, WebsiteMatchingResult } from '@source-taster/types'
import { API_CONFIG } from '@/extension/env'
import { extractionSettings, matchingSettings } from '@/extension/logic/storage'

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
        extractionSettings: extractionSettings.value,
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
   * Match references against databases
   */
  static async matchReferences(references: Reference[], signal?: AbortSignal): Promise<MatchingResult[]> {
    // Convert to optimized MatchingReference format (only id + metadata)
    const matchingReferences: MatchingReference[] = references.map(ref => ({
      id: ref.id,
      metadata: ref.metadata,
    }))

    // Convert to optimized API settings (exclude frontend-only matchThresholds)
    const apiMatchingSettings: APIMatchingSettings = {
      matchingStrategy: matchingSettings.value.matchingStrategy,
      matchingConfig: {
        fieldConfigurations: matchingSettings.value.matchingConfig.fieldConfigurations,
        earlyTermination: matchingSettings.value.matchingConfig.earlyTermination,
      },
    }

    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.match}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        references: matchingReferences,
        matchingSettings: apiMatchingSettings,
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Matching failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Matching failed')
    }

    return data.data.results || []
  }

  /**
   * Match a reference against a website URL
   */
  static async matchWebsiteReference(
    reference: Reference,
    url: string,
    signal?: AbortSignal,
  ): Promise<WebsiteMatchingResult> {
    // Convert to optimized MatchingReference format (only id + metadata)
    const matchingReference: MatchingReference = {
      id: reference.id,
      metadata: reference.metadata,
    }

    // Convert to optimized API settings (exclude frontend-only matchThresholds)
    const apiMatchingSettings: APIMatchingSettings = {
      matchingStrategy: matchingSettings.value.matchingStrategy,
      matchingConfig: {
        fieldConfigurations: matchingSettings.value.matchingConfig.fieldConfigurations,
        earlyTermination: matchingSettings.value.matchingConfig.earlyTermination,
      },
    }

    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.match}/website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference: matchingReference,
        url,
        matchingSettings: apiMatchingSettings,
        options: {
          timeout: 10000,
          enableWaybackMachine: true,
        },
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Website matching failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Website matching failed')
    }

    return data.data
  }

  /**
   * Extract and match references in one call
   */
  static async extractAndMatch(text: string, signal?: AbortSignal): Promise<{
    references: Reference[]
    matchingResults: MatchingResult[]
  }> {
    const references = await this.extractReferences(text, signal)

    if (references.length === 0) {
      return { references: [], matchingResults: [] }
    }

    const matchingResults = await this.matchReferences(references, signal)

    return { references, matchingResults }
  }
}
