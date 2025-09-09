// extension/services/http.ts
import type { ApiHttpError } from '@source-taster/types'

interface ApiSuccess<T> { success: true, data: T }
export type ApiResult<T> = ApiSuccess<T> | ApiHttpError

async function safeJson(res: Response) {
  const text = await res.text()
  if (!text)
    return null
  try {
    return JSON.parse(text)
  }
  catch { return text }
}

export async function apiCall<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, init)
    const body = await safeJson(res)

    // JSON-API: hat 'success' Feld
    if (body && typeof body === 'object' && 'success' in body) {
      // Erfolg
      if ((body as any).success) {
        return { success: true, data: (body as any).data as T }
      }
      // Fehler (vom Backend formatiert)
      const err = body as { success: false, error?: string, message?: string }
      return {
        success: false,
        error: (err.error as any) ?? 'http_error',
        message: err.message ?? `HTTP error ${res.status}`,
      } as ApiHttpError
    }

    // Fallbacks (kein API-Format)
    if (!res.ok) {
      return {
        success: false,
        error: 'http_error' as any,
        message: `HTTP error ${res.status}`,
      }
    }

    // Falls Erfolg ohne Standard-Wrapper (sollte bei dir nicht passieren)
    return {
      success: false,
      error: 'server_error',
      message: 'Unerwartetes Antwortformat vom Server',
    }
  }
  catch (e: any) {
    return {
      success: false,
      error: 'server_error',
      message: e?.message || 'Netzwerkfehler',
    }
  }
}
