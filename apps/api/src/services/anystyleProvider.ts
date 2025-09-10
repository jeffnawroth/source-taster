import type {
  ApiAnystyleConvertData,
  ApiAnystyleConvertRequest,
  ApiAnystyleParseData,
  ApiAnystyleParseRequest,
  ApiAnystyleTrainData,
  ApiAnystyleTrainRequest,
} from '@source-taster/types'
import process from 'node:process'
import { httpBadRequest, httpUpstream } from '../errors/http'

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

    let res: Response | undefined
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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
  async convertToCSL(tokens: ApiAnystyleConvertRequest['tokens']): Promise<ApiAnystyleConvertData> {
    return await this.postJson<ApiAnystyleConvertRequest, ApiAnystyleConvertData>(
      '/convert-to-csl',
      { tokens },
    )
  }

  /**
   * Train the AnyStyle model with new data
   */
  async trainModel(tokens: ApiAnystyleTrainRequest['tokens']): Promise<ApiAnystyleTrainData> {
    return await this.postJson<ApiAnystyleTrainRequest, ApiAnystyleTrainData>(
      '/train-model',
      { tokens },
    )
  }
}
// Singleton instance for dependency injection
export const anystyleProvider = new AnystyleProvider()
