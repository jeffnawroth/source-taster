import type { Span } from '@opentelemetry/api'
import type {
  ApiAnystyleConvertData,
  ApiAnystyleConvertRequest,
  ApiAnystyleParseData,
  ApiAnystyleParseRequest,
} from '@source-taster/types'
import process from 'node:process'
import { trace } from '@opentelemetry/api'
import { httpBadRequest, httpUpstream } from '../errors/http.js'

const tracer = trace.getTracer('source-taster-api', '2.1.3')

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

    return tracer.startActiveSpan(
      `anystyle.${path.replace(/^\//, '').replace(/-/g, '_')}`,
      { attributes: { 'anystyle.url': url } },
      async (span: Span) => {
        let res: Response | undefined
        try {
          res = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          })
        }
        catch (e) {
          span.recordException(e as Error)
          span.setStatus({ code: 2, message: 'AnyStyle unreachable' })
          span.end()
          return httpUpstream('AnyStyle unreachable', 502, e) as never
        }

        if (!res) {
          span.setStatus({ code: 2, message: 'No response from AnyStyle' })
          span.end()
          return httpUpstream('No response from AnyStyle', 502) as never
        }

        span.setAttribute('http.status_code', res.status)

        if (!res.ok) {
          const text = await res.text().catch(() => '')
          span.setAttribute('anystyle.error', text)
          span.setStatus({ code: 2, message: `AnyStyle error ${res.status}` })
          span.end()
          if (res.status >= 400 && res.status < 500) {
            return httpBadRequest(`AnyStyle error ${res.status}: ${text || 'client error'}`) as never
          }
          const status = (res.status === 503 || res.status === 504) ? (res.status as 503 | 504) : 502
          return httpUpstream(`AnyStyle error ${res.status}: ${text || 'server error'}`, status) as never
        }

        try {
          const data = await res.json() as TRes
          span.end()
          return data
        }
        catch (e) {
          span.recordException(e as Error)
          span.setStatus({ code: 2, message: 'AnyStyle returned non-JSON payload' })
          span.end()
          return httpUpstream('AnyStyle returned non-JSON payload', 502, e) as never
        }
      },
    )
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
