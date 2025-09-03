import type { APIMatchingSettings, MatchingReference, MatchingResult, Reference, WebsiteMatchingResult } from '@source-taster/types'
import { runtime } from 'webextension-polyfill'
import { API_CONFIG } from '@/extension/env'
import { aiSettings, extractionSettings, matchingSettings } from '@/extension/logic/storage'
import { encryptApiKey } from '@/extension/utils/crypto'

export class ReferencesService {
  /**
   * Extract references from text using AI
   */
  static async extractReferences(text: string, signal?: AbortSignal): Promise<Reference[]> {
    // Encrypt API key for secure transmission
    const encryptedApiKey = encryptApiKey(aiSettings.value.apiKey)

    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.extract}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-ID': runtime.id,
        'X-API-Key': encryptedApiKey,
      },
      body: JSON.stringify({
        text,
        extractionSettings: extractionSettings.value,
        aiSettings: {
          provider: aiSettings.value.provider,
          model: aiSettings.value.model,
        },
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
    const matchingReferences: MatchingReference[] = references.map(ref => ({
      id: ref.id,
      metadata: ref.metadata,
    }))

    const apiMatchingSettings: APIMatchingSettings = {
      matchingStrategy: {
        actionTypes: matchingSettings.value.matchingStrategy.actionTypes,
      },
      matchingConfig: {
        fieldConfigurations: matchingSettings.value.matchingConfig.fieldConfigurations,
        earlyTermination: matchingSettings.value.matchingConfig.earlyTermination,
      },
    }

    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.match}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-ID': runtime.id,
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
  static async matchReferenceToWebsite(
    reference: Reference,
    url: string,
    signal?: AbortSignal,
  ): Promise<WebsiteMatchingResult> {
    const matchingReference: MatchingReference = {
      id: reference.id,
      metadata: reference.metadata,
    }

    const apiMatchingSettings: APIMatchingSettings = {
      matchingStrategy: {
        actionTypes: matchingSettings.value.matchingStrategy.actionTypes,
      },
      matchingConfig: {
        fieldConfigurations: matchingSettings.value.matchingConfig.fieldConfigurations,
        earlyTermination: matchingSettings.value.matchingConfig.earlyTermination,
      },
    }

    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.match}/website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-ID': runtime.id,
      },
      body: JSON.stringify({
        reference: matchingReference,
        url,
        matchingSettings: apiMatchingSettings,
        options: {
          timeout: 10000,
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
