export function normalizeUrl(raw: string): string {
  return /^https?:\/\//i.test(raw.trim())
    ? raw.trim()
    : `https://${raw.trim()}`
}

// Checks via a HEAD request if a URL is reachable
export async function isUrlReachable(rawUrl: string): Promise<boolean> {
  const url = normalizeUrl(rawUrl)
  try {
    const resp = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    })
    return resp.ok
  }
  catch {
    return false
  }
}
