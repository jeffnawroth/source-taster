// import type { APIMatchingSettings, MatchingReference, MatchingResult, Reference, WebsiteMatchingResult } from '@source-taster/types'
// import { runtime } from 'webextension-polyfill'
// import { API_CONFIG } from '@/extension/env'
// import { aiSettings, extractionSettings, matchingSettings } from '@/extension/logic/storage'
// import { encryptApiKey } from '../utils/crypto'

// // Types for parsing with tokens
// interface ParseWithTokensResponse {
//   references: Reference[]
//   tokens: Array<Array<[string, string]>>
// }

// export class ReferencesService {
//   /**
//    * Extract references from text using AI
//    */
//   static async extractReferences(text: string, signal?: AbortSignal): Promise<Reference[]> {
//     // Encrypt API key for secure transmission
//     const encryptedApiKey = encryptApiKey(aiSettings.value.apiKey)

//     const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.extract}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Extension-ID': runtime.id,
//         'X-API-Key': encryptedApiKey,
//       },
//       body: JSON.stringify({
//         text,
//         extractionSettings: extractionSettings.value,
//         aiSettings: {
//           provider: aiSettings.value.provider,
//           model: aiSettings.value.model,
//         },
//       }),
//       signal,
//     })

//     if (!response.ok) {
//       throw new Error(`Extraction failed: ${response.statusText}`)
//     }

//     const data = await response.json()

//     if (!data.success) {
//       throw new Error(data.error || 'Extraction failed')
//     }

//     return data.data.references || []
//   }

//   /**
//    * Extract references with token data for relabeling
//    */
//   static async extractReferencesWithTokens(text: string, signal?: AbortSignal): Promise<ParseWithTokensResponse> {
//     const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.parse}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Extension-ID': runtime.id,
//       },
//       body: JSON.stringify({
//         references: [text],
//         includeTokens: true,
//       }),
//       signal,
//     })

//     if (!response.ok) {
//       throw new Error(`Extraction failed: ${response.statusText}`)
//     }

//     const data = await response.json()

//     return {
//       references: data.references || [],
//       tokens: data.tokens || [],
//     }
//   }

//   /**
//    * Match references against databases
//    */
//   static async matchReferences(references: Reference[], signal?: AbortSignal): Promise<MatchingResult[]> {
//     const matchingReferences: MatchingReference[] = references.map(ref => ({
//       id: ref.id,
//       metadata: ref.metadata,
//     }))

//     const apiMatchingSettings: APIMatchingSettings = {
//       matchingStrategy: {
//         normalizationRules: matchingSettings.value.matchingStrategy.normalizationRules,
//       },
//       matchingConfig: {
//         fieldConfigurations: matchingSettings.value.matchingConfig.fieldConfigurations,
//         earlyTermination: matchingSettings.value.matchingConfig.earlyTermination,
//       },
//     }

//     const response = await fetch(`${API_CONFIG.baseUrl}/api/search-and-match`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Extension-ID': runtime.id,
//       },
//       body: JSON.stringify({
//         references: matchingReferences,
//         matchingSettings: apiMatchingSettings,
//       }),
//       signal,
//     })

//     if (!response.ok) {
//       throw new Error(`Matching failed: ${response.statusText}`)
//     }

//     const data = await response.json()

//     if (!data.success) {
//       throw new Error(data.error || 'Matching failed')
//     }

//     return data.data.results || []
//   }

//   /**
//    * Extract and match references in one call
//    */
//   static async extractAndMatch(text: string, signal?: AbortSignal): Promise<{
//     references: Reference[]
//     matchingResults: MatchingResult[]
//   }> {
//     const references = await this.extractReferences(text, signal)

//     if (references.length === 0) {
//       return { references: [], matchingResults: [] }
//     }

//     const matchingResults = await this.matchReferences(references, signal)

//     return { references, matchingResults }
//   }
// }
