export async function extractHtmlTextFromUrl(url: string): Promise<string> {
  try {
    const resp = await fetch(url, { method: 'GET', redirect: 'follow' })
    if (!resp.ok) {
      console.warn(`HTML-Extraction: HTTP ${resp.status} bei ${url}`)
      return ''
    }
    const html = await resp.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    return doc.body.innerHTML || ''
  }
  catch (e) {
    console.error('Error extracting HTML text:', e)
    return ''
  }
}
