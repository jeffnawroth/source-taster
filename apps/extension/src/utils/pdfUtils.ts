import { extractText, getDocumentProxy } from 'unpdf'

// Extract text from a PDF buffer
async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true })
    return text
  }
  catch (error) {
    console.error('Error extracting text from PDF:', error)
    return ''
  }
}

// Extract text from a PDF file
export async function extractTextFromPdfFile(file: File): Promise<string> {
  if (!file || file.type !== 'application/pdf')
    return ''
  try {
    const buffer = await file.arrayBuffer()
    return await extractPDFText(buffer)
  }
  catch (error) {
    console.error('Error extracting text:', error)
    return ''
  }
}
