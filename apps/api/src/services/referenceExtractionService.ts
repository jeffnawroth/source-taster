import type {
  Reference,
} from '@source-taster/types'
import crypto from 'node:crypto'
import { AIServiceFactory } from './ai/aiServiceFactory'

export class ReferenceExtractionService {
  async extractReferences(
    text: string,
    aiService: 'openai' | 'gemini',
    model?: string,
  ): Promise<Reference[]> {
    const ai = AIServiceFactory.create(aiService, model)

    const prompt = `
Extract all academic references from the following text. Return them as a JSON object with a "references" array containing the following structure:

{
  "references": [
    {
      "originalText": "complete reference as it appears in the text",
      "metadata": {
        "title": "title of the work",
        "authors": ["author1", "author2"],
        "journal": "journal name (if applicable)",
        "year": 2023,
        "doi": "DOI if present",
        "issn": "ISSN if present",
        "isbn": "ISBN if present",
        "url": "URL if present",
        "volume": "volume number",
        "issue": "issue number",
        "pages": "page range",
        "publisher": "publisher name"
      }
    }
  ]
}

Rules:
- Only extract actual references/citations, not regular text
- Classify each reference type accurately
- Extract as much metadata as possible
- Return valid JSON only

Text to analyze:
${text}
    `.trim()

    const response = await ai.generateText(prompt)

    return this.parseAIResponse(response)
  }

  private parseAIResponse(response: string): Reference[] {
    try {
      const parsed = JSON.parse(response)

      // Handle both old format (array) and new format (object with references property)
      const references = Array.isArray(parsed) ? parsed : parsed.references || []

      return references.map((ref: any) => ({
        id: crypto.randomUUID(),
        originalText: ref.originalText,
        metadata: ref.metadata || {},
      }))
    }
    catch (error) {
      console.error('Failed to parse AI response:', error)
      console.error('Raw response:', response)
      return []
    }
  }
}
