import { extractText, getDocumentProxy } from 'unpdf'

export async function extractTextFromPdfFile(file: File): Promise<string> {
  if (!file || file.type !== 'application/pdf') {
    console.warn('Invalid file type. Expected PDF, got:', file?.type)
    return ''
  }
  try {
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
