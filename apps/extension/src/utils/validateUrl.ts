export interface UrlValidationResult {
  reachable: boolean
  status?: number
  contentType?: string
  reason?: string
}

// Checks via a HEAD request whether a URL is reachable and returns an allowed MIME type (default: PDF or HTML).
export async function validateUrl(
  url: string,
  allowedTypes: string[] = ['application/pdf', 'text/html'],
): Promise<UrlValidationResult> {
  try {
    const resp = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    })

    if (!resp.ok) {
      return { reachable: false, status: resp.status, reason: `HTTP ${resp.status}` }
    }

    // Example: "application/pdf; charset=UTF-8"
    const rawCT = resp.headers.get('Content-Type') || ''
    const mime = rawCT.split(';')[0].trim().toLowerCase()

    if (!allowedTypes.includes(mime)) {
      return {
        reachable: false,
        status: resp.status,
        contentType: mime,
        reason: `Ungültiger MIME-Type: ${mime}`,
      }
    }

    return { reachable: true, status: resp.status, contentType: mime }
  }
  catch (e: any) {
    return { reachable: false, reason: e.message }
  }
}
