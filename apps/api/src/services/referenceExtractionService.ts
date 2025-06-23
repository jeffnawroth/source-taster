import type {
  ProcessingJob,
  Reference,
} from '@source-taster/types'
import { generateId } from '../utils/idGenerator'
import { AIServiceFactory } from './ai/aiServiceFactory'

export class ReferenceExtractionService {
  private jobs = new Map<string, ProcessingJob>()

  async extractReferences(
    text: string,
    aiService: 'openai' | 'gemini',
    model?: string,
    options?: any,
  ): Promise<Reference[]> {
    const ai = AIServiceFactory.create(aiService, model)

    const prompt = this.buildExtractionPrompt(text, options?.language)
    const response = await ai.generateText(prompt)

    return this.parseAIResponse(response)
  }

  private buildExtractionPrompt(text: string, language?: string): string {
    const lang = language || 'en'

    return `
Extract all academic references from the following text. Return them as a JSON array with the following structure:

[
  {
    "originalText": "complete reference as it appears in the text",
    "type": "academic|website|book|unknown",
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

Text to analyze:
${text}

Important: 
- Only extract actual references/citations, not regular text
- Classify each reference type accurately
- Extract as much metadata as possible
- Return valid JSON only
- Language: ${lang}
    `.trim()
  }

  private parseAIResponse(response: string): Reference[] {
    try {
      const parsed = JSON.parse(response)

      return parsed.map((ref: any) => ({
        id: generateId(),
        originalText: ref.originalText,
        type: ref.type || 'unknown',
        metadata: ref.metadata || {},
        extractedAt: new Date(),
      }))
    }
    catch (error) {
      console.error('Failed to parse AI response:', error)
      return []
    }
  }

  async getJobStatus(jobId: string): Promise<ProcessingJob | null> {
    return this.jobs.get(jobId) || null
  }
}
