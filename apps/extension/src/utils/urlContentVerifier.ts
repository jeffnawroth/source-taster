import type { ReferenceMetadata, VerificationResult } from '../types'
import { useAiStore } from '../stores/ai'
import { extractHtmlTextFromUrl } from './htmlUtils'
import { extractPdfTextFromUrl } from './pdfUtils'
import { isUrlReachable } from './validateUrl'

export async function verifyUrlContent(
  referenceMetadata: ReferenceMetadata,
): Promise<VerificationResult> {
  const raw = referenceMetadata.url!
  // Reachability
  if (!(await isUrlReachable(raw))) {
    return { match: false, reason: 'URL not reachable' }
  }

  // HEAD Content Type check
  const headResp = await fetch(raw, { method: 'HEAD', redirect: 'follow' })
  const ct = headResp.headers.get('Content-Type')?.toLowerCase() || ''

  // Extract content
  let pageText = ''
  if (ct.includes('pdf')) {
    pageText = await extractPdfTextFromUrl(raw)
  }
  else {
    pageText = await extractHtmlTextFromUrl(raw)
  }

  // AI verification
  const { verifyPageMatchWithAI } = useAiStore()
  return await verifyPageMatchWithAI(referenceMetadata, pageText)
}
