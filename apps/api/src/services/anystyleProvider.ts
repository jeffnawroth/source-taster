import type {
  ApiAnystyleConvertData,
  ApiAnystyleConvertRequest,
  ApiAnystyleParseData,
  ApiAnystyleParseRequest,
} from '@source-taster/types'
import process from 'node:process'
import { httpBadRequest, httpUpstream } from '../errors/http.js'

const idTokenCache = new Map<string, { token: string, exp: number }>()

/**
 * Fetches a Google-signed identity token scoped to `audience` from the
 * Cloud Run metadata server, for calling a private (IAM-authenticated)
 * sibling service. Returns null outside Cloud Run (e.g. local dev against
 * localhost), where anystyle has no auth in front of it.
 */
async function getIdentityToken(audience: string): Promise<string | null> {
  if (audience.includes('localhost') || audience.includes('127.0.0.1'))
    return null

  const hit = idTokenCache.get(audience)
  if (hit && hit.exp > Date.now())
    return hit.token

  const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(audience)}`
  const res = await fetch(metadataUrl, { headers: { 'Metadata-Flavor': 'Google' } }).catch(() => undefined)
  if (!res?.ok)
    return null

  const token = await res.text()
  idTokenCache.set(audience, { token, exp: Date.now() + 50 * 60 * 1000 }) // tokens are valid ~1h
  return token
}

export class AnystyleProvider {
  private readonly serverUrl: string

  constructor(serverUrl?: string) {
    this.serverUrl = serverUrl ?? process.env.ANYSTYLE_SERVER_URL ?? 'http://localhost:4567'
  }

  /**
   * Generic HTTP POST method for AnyStyle server communication
   */
  private async postJson<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
    const url = `${this.serverUrl}${path}`
    const idToken = await getIdentityToken(this.serverUrl)

    let res: Response | undefined
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(idToken ? { authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify(body),
      })
    }
    catch (e) {
      return httpUpstream('AnyStyle unreachable', 502, e) as never
    }

    if (!res) {
      return httpUpstream('No response from AnyStyle', 502) as never
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      if (res.status >= 400 && res.status < 500) {
        return httpBadRequest(`AnyStyle error ${res.status}: ${text || 'client error'}`) as never
      }
      const status = (res.status === 503 || res.status === 504) ? (res.status as 503 | 504) : 502
      return httpUpstream(`AnyStyle error ${res.status}: ${text || 'server error'}`, status) as never
    }

    try {
      return await res.json() as TRes
    }
    catch (e) {
      return httpUpstream('AnyStyle returned non-JSON payload', 502, e) as never
    }
  }

  /**
   * Parse references from raw text input
   */
  async parseReferences(input: ApiAnystyleParseRequest['input']): Promise<ApiAnystyleParseData> {
    return await this.postJson<ApiAnystyleParseRequest, ApiAnystyleParseData>('/parse', { input })
  }

  /**
   * Convert tokenized references to CSL format
   */
  async convertToCSL(
    references: ApiAnystyleConvertRequest['references'],
  ): Promise<ApiAnystyleConvertData> {
    return await this.postJson<ApiAnystyleConvertRequest, ApiAnystyleConvertData>(
      '/convert-to-csl',
      { references },
    )
  }
}
// Singleton instance for dependency injection
export const anystyleProvider = new AnystyleProvider()
