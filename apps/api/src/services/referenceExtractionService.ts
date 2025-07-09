import type {
  Reference,
} from '@source-taster/types'
import crypto from 'node:crypto'
import { AIServiceFactory } from './ai/aiServiceFactory'

export class ReferenceExtractionService {
  async extractReferences(
    text: string,
    model?: string,
  ): Promise<Reference[]> {
    const ai = AIServiceFactory.create(model)

    const prompt = `Extract all academic references from the text below and return them as valid JSON using the exact format specified.

## TASK:
Identify and extract all bibliographic references/citations from the provided text.

## OUTPUT FORMAT:
Return a JSON object with a "references" array. Each reference must follow this exact structure:

\`\`\`json
{
  "references": [
    {
      "originalText": "exact text as it appears",
      "metadata": {
        "title": "work title",
        "authors": ["Author Name"],
        "date": { "year": 2023 },
        "source": { "containerTitle": "journal name", "sourceType": "Journal article" },
        "identifiers": { "doi": "10.1234/example" }
      }
    }
  ]
}
\`\`\`

## EXTRACTION RULES:
1. Extract ONLY actual references/citations, not regular text
2. Include ALL metadata fields that are clearly present
3. OMIT fields that are not found or unclear
4. Use exact hierarchical structure: date, source, identifiers
5. For authors: use string array format ["Last, F."]
6. For dates: always include year; add month/day if present
7. Common source types: "Journal article", "Book", "Book chapter", "Conference paper", "Thesis", "Report", "Webpage"

## EXAMPLES:

**Example 1 - Journal Article:**
Input: "Smith, J. (2023). Machine learning applications. Journal of AI Research, 15(3), 45-67. doi:10.1234/jair.2023.001"

Output:
\`\`\`json
{
  "references": [
    {
      "originalText": "Smith, J. (2023). Machine learning applications. Journal of AI Research, 15(3), 45-67. doi:10.1234/jair.2023.001",
      "metadata": {
        "title": "Machine learning applications",
        "authors": ["Smith, J."],
        "date": { "year": 2023 },
        "source": {
          "containerTitle": "Journal of AI Research",
          "volume": "15",
          "issue": "3", 
          "pages": "45-67",
          "sourceType": "Journal article"
        },
        "identifiers": { "doi": "10.1234/jair.2023.001" }
      }
    }
  ]
}
\`\`\`

**Example 2 - Book:**
Input: "Brown, A., & Davis, C. (2022). Data Science Handbook (2nd ed.). Tech Publications."

Output:
\`\`\`json
{
  "references": [
    {
      "originalText": "Brown, A., & Davis, C. (2022). Data Science Handbook (2nd ed.). Tech Publications.",
      "metadata": {
        "title": "Data Science Handbook", 
        "authors": ["Brown, A.", "Davis, C."],
        "date": { "year": 2022 },
        "source": {
          "publisher": "Tech Publications",
          "edition": "2nd ed.",
          "sourceType": "Book"
        }
      }
    }
  ]
}
\`\`\`

## TEXT TO ANALYZE:
"""
${text}
"""

Return valid JSON only. Begin with:
{
  "references":`

    const response = await ai.generateText(prompt)

    return this.parseAIResponse(response)
  }

  private parseAIResponse(response: string): Reference[] {
    try {
      const parsed = JSON.parse(response)

      // Handle both old format (array) and new format (object with references property)
      const references = Array.isArray(parsed) ? parsed : parsed.references || []

      return references.map((ref: any) => {
        // Map old flat structure to new hierarchical structure if needed
        const metadata = ref.metadata || {}

        // Ensure we have the required hierarchical structure
        const mappedMetadata = {
          title: metadata.title,
          authors: metadata.authors || [],
          date: {
            year: metadata.date?.year || metadata.year,
            month: metadata.date?.month || metadata.month,
            day: metadata.date?.day,
            yearSuffix: metadata.date?.yearSuffix,
            noDate: metadata.date?.noDate,
            inPress: metadata.date?.inPress,
            approximateDate: metadata.date?.approximateDate,
            season: metadata.date?.season,
            dateRange: metadata.date?.dateRange,
            yearEnd: metadata.date?.yearEnd,
          },
          source: {
            containerTitle: metadata.source?.containerTitle || metadata.journal || metadata.containerTitle,
            subtitle: metadata.source?.subtitle,
            volume: metadata.source?.volume || metadata.volume,
            issue: metadata.source?.issue || metadata.issue,
            pages: metadata.source?.pages || metadata.pages,
            publisher: metadata.source?.publisher || metadata.publisher,
            publicationPlace: metadata.source?.publicationPlace,
            url: metadata.source?.url || metadata.url,
            sourceType: metadata.source?.sourceType,
            location: metadata.source?.location,
            retrievalDate: metadata.source?.retrievalDate,
            edition: metadata.source?.edition,
            contributors: metadata.source?.contributors,
            pageType: metadata.source?.pageType,
            paragraphNumber: metadata.source?.paragraphNumber,
            volumePrefix: metadata.source?.volumePrefix,
            issuePrefix: metadata.source?.issuePrefix,
            supplementInfo: metadata.source?.supplementInfo,
            articleNumber: metadata.source?.articleNumber,
            isStandAlone: metadata.source?.isStandAlone,
            conference: metadata.source?.conference,
            institution: metadata.source?.institution,
            series: metadata.source?.series,
            seriesNumber: metadata.source?.seriesNumber,
            chapterTitle: metadata.source?.chapterTitle,
            medium: metadata.source?.medium,
            originalTitle: metadata.source?.originalTitle,
            originalLanguage: metadata.source?.originalLanguage,
            degree: metadata.source?.degree,
            advisor: metadata.source?.advisor,
            department: metadata.source?.department,
          },
          identifiers: {
            doi: metadata.identifiers?.doi || metadata.doi,
            isbn: metadata.identifiers?.isbn || metadata.isbn,
            issn: metadata.identifiers?.issn || metadata.issn,
            pmid: metadata.identifiers?.pmid || metadata.pmid,
            pmcid: metadata.identifiers?.pmcid || metadata.pmcid,
            arxivId: metadata.identifiers?.arxivId || metadata.arxivId,
          },
        }

        return {
          id: crypto.randomUUID(),
          originalText: ref.originalText,
          metadata: mappedMetadata,
        }
      })
    }
    catch (error) {
      console.error('Failed to parse AI response:', error)
      console.error('Raw response:', response)
      return []
    }
  }
}
