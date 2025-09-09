// extension/services/http.ts
import type { ApiErrorCode, ApiResult } from '@source-taster/types'

async function safeJson(res: Response) {
  const text = await res.text()
  if (!text)
    return null
  try {
    return JSON.parse(text)
  }
  catch {
    return text // Nicht-JSON (z.B. Text) zurückgeben
  }
}

export async function apiCall<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, init)
    const body = await safeJson(res) as any

    // 1) Standard-API-Format erkannt (hat 'success')
    if (body && typeof body === 'object' && 'success' in body) {
      if (body.success) {
        // => Erfolg: direkt innere Payload als T zurückgeben
        return { success: true, data: body.data as T }
      }

      // => Fehler: vom Backend formatiert
      const errorCode = (body.error as ApiErrorCode) ?? 'internal_error'
      const message = (typeof body.message === 'string' && body.message) || `HTTP ${res.status}`
      return {
        success: false,
        error: errorCode,
        message,
      }
    }

    // 2) Kein API-Wrapper, aber HTTP-Fehler
    if (!res.ok) {
      return {
        success: false,
        error: 'internal_error', // Default, weil kein bekannter Code vorhanden
        message: `HTTP ${res.status}${res.statusText ? ` - ${res.statusText}` : ''}`,
      }
    }

    // 3) Kein API-Wrapper, aber ok -> Unerwartetes Format
    return {
      success: false,
      error: 'server_error',
      message: 'Unerwartetes Antwortformat vom Server',
    }
  }
  catch (e: any) {
    // 4) Netzwerk/Client-Fehler
    return {
      success: false,
      error: 'server_error',
      message: e?.message || 'Netzwerkfehler',
    }
  }
}
