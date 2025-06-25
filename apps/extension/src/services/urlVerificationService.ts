// import type { ReferenceMetadata, VerificationResult } from '../types'
// import { extractHtmlText } from '../utils/htmlUtils'
// import { normalizeUrl } from '../utils/normalizeUrl'
// import { extractPdfTextFromBuffer } from '../utils/pdfUtils'
// import { verifyAgainstWebsite } from './aiService'

// export async function verifyUrlContent(url: string, referenceMetadata: ReferenceMetadata): Promise<VerificationResult> {
//   let response: Response
//   try {
//     response = await fetch(normalizeUrl(url), { method: 'GET', redirect: 'follow' })
//   }
//   catch {
//     return { match: false, reason: 'URL not reachable' }
//   }

//   if (!response.ok) {
//     return { match: false, reason: `HTTP ${response.status}` }
//   }

//   const ct = (response.headers.get('Content-Type') || '').toLowerCase()
//   let pageText: string

//   if (ct.includes('pdf')) {
//     const buffer = await response.arrayBuffer()
//     pageText = await extractPdfTextFromBuffer(buffer)
//   }
//   else {
//     const html = await response.text()
//     pageText = extractHtmlText(html)
//   }

//   const websiteResult = await verifyAgainstWebsite(referenceMetadata, pageText)
//   if (!websiteResult) {
//     return { match: false, reason: 'Website metadata verification failed' }
//   }

//   return {
//     match: websiteResult.match,
//     reason: websiteResult.reason ?? '',
//   }
// }
