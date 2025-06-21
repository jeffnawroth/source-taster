export function extractHtmlText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.innerHTML || ''
}
