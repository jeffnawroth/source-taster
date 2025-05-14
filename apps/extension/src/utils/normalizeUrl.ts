export function normalizeUrl(raw: string): string {
  return /^https?:\/\//i.test(raw.trim())
    ? raw.trim()
    : `https://${raw.trim()}`
}
