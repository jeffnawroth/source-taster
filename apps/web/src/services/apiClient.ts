import { apiBaseUrl } from '@/env'
import { getClientId } from './clientId'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient(path: string, init: RequestInit = {}): Promise<unknown> {
  const headers = new Headers(init.headers)
  headers.set('X-Client-Id', getClientId())
  if (init.body)
    headers.set('Content-Type', 'application/json')

  const res = await fetch(`${apiBaseUrl}${path}`, { ...init, headers })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { success?: boolean, error?: string }
      if (body?.error)
        message = body.error
    }
    catch {
      // non-JSON error body — statusText behalten
    }
    throw new ApiError(res.status, message)
  }

  const body = (await res.json()) as { success: boolean, data?: unknown }
  return body.data
}
