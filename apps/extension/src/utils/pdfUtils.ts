import { extractText, getDocumentProxy } from 'unpdf'

/**
 * Extract text content from a PDF file
 * @param file - PDF file to extract text from
 * @returns Promise<string> - Extracted text content or empty string if failed
 */
export async function extractTextFromPdfFile(file: File): Promise<string> {
  // Validate file type
  if (!file || file.type !== 'application/pdf') {
    console.warn('Invalid file type. Expected PDF, got:', file?.type)
    return ''
  }

  try {
    // Convert file to buffer and extract text
    const buffer = await file.arrayBuffer()
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true })

    return text.trim() || ''
  }
  catch (error) {
    console.error('Error extracting text from PDF:', error)
    return ''
  }
}
