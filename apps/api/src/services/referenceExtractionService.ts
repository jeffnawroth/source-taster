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
Extract all academic references from the following text. Return them as a JSON object with a "references" array containing the following hierarchical structure:

{
  "references": [
    {
      "originalText": "complete reference as it appears in the text",
      "metadata": {
        "title": "title of the work",
        "authors": ["author1", "author2"],
        "date": {
          "year": 2023,
          "month": "June",
          "day": 15,
          "yearSuffix": "a",
          "noDate": false,
          "inPress": false,
          "approximateDate": false,
          "season": "Spring",
          "dateRange": false,
          "yearEnd": 2024
        },
        "source": {
          "containerTitle": "journal/book name",
          "subtitle": "subtitle if present",
          "volume": "volume number",
          "issue": "issue number", 
          "pages": "page range",
          "publisher": "publisher name",
          "publicationPlace": "city of publication",
          "url": "URL if present",
          "sourceType": "Journal article",
          "location": "physical location if applicable",
          "retrievalDate": "date accessed for online sources",
          "edition": "2nd ed.",
          "pageType": "pp.",
          "paragraphNumber": "para. 3",
          "volumePrefix": "Vol.",
          "issuePrefix": "No.",
          "supplementInfo": "Suppl. 2",
          "articleNumber": "e12345",
          "isStandAlone": false,
          "conference": "conference name for proceedings",
          "institution": "institution for theses/reports",
          "series": "series name",
          "seriesNumber": "series number",
          "chapterTitle": "chapter title for book chapters",
          "medium": "print/web/CD-ROM",
          "originalTitle": "original title for translations",
          "originalLanguage": "original language",
          "degree": "PhD/Master's",
          "advisor": "thesis advisor",
          "department": "academic department"
        },
        "identifiers": {
          "doi": "DOI if present",
          "isbn": "ISBN if present",
          "issn": "ISSN if present",
          "pmid": "PubMed ID if present",
          "pmcid": "PMC ID if present",
          "arxivId": "arXiv ID if present"
        }
      }
    }
  ]
}

Rules:
- Only extract actual references/citations, not regular text
- Use the hierarchical structure: date, source, identifiers
- Extract as much metadata as possible into the correct categories
- Include only fields that are actually present in the reference - omit fields that are not found
- For authors, use simple string format unless structured data is clearly available
- For dates: extract year (required), month, day, and special indicators like "in press", "no date"
- For sources: containerTitle is the journal/book name, pages should include full range
- For identifiers: extract DOI, ISBN, ISSN, PMID, PMCID, arXiv ID when present
- Common source types: "Journal article", "Book", "Book chapter", "Conference paper", "Thesis", "Report", "Webpage"
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
