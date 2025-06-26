import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'

export class ArxivService {
  private baseUrl = 'http://export.arxiv.org/api/query'

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // If DOI is available, search directly by DOI (most reliable)
      if (metadata.doi) {
        const directResult = await this.searchByDOI(metadata.doi)
        if (directResult)
          return directResult
      }

      // Fallback to title-based search
      if (metadata.title) {
        return await this.searchByTitle(metadata.title)
      }
    }
    catch (error) {
      console.error('arXiv search error:', error)
    }

    return null
  }

  private async searchByDOI(doi: string): Promise<ExternalSource | null> {
    try {
      // Clean and extract arXiv ID from various DOI formats
      const arxivId = doi
        .replace(/^https?:\/\/doi\.org\//, '')
        .replace(/^doi:/, '')
        .replace(/^10\.48550\/arXiv\./, '') // Remove arXiv DOI prefix
        .replace(/^arXiv:/, '') // Remove arXiv: prefix
        .trim()

      // Try different ID formats
      const idFormats = [
        arxivId, // Direct ID like "2501.03862"
        `arXiv:${arxivId}`, // With arXiv prefix
        doi, // Original DOI as fallback
      ]

      for (const id of idFormats) {
        const url = `${this.baseUrl}?id_list=${encodeURIComponent(id)}&max_results=1`

        console.warn(`arXiv: Trying DOI/ID format: ${id}`)
        console.warn(`arXiv: URL: ${url}`)

        const response = await fetch(url)
        if (!response.ok) {
          continue // Try next format
        }

        const xmlText = await response.text()
        const entries = this.parseAtomFeed(xmlText)

        if (entries.length > 0) {
          return this.mapToExternalSource(entries[0])
        }
      }

      return null
    }
    catch (error) {
      console.error('arXiv DOI search error:', error)
      return null
    }
  }

  private async searchByTitle(title: string): Promise<ExternalSource | null> {
    try {
      // Try multiple search strategies in order of specificity
      const searchStrategies = [
        // 1. Exact title in quotes
        `ti:"${title.replace(/"/g, '\\"')}"`,
        // 2. Title without special characters in quotes
        `ti:"${title.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()}"`,
        // 3. Just the first significant word (before colon if present)
        `ti:"${title.split(':')[0].trim()}"`,
        // 4. All significant words without quotes
        title.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim(),
      ]

      for (const query of searchStrategies) {
        const url = `${this.baseUrl}?search_query=${encodeURIComponent(query)}&max_results=5&sortBy=relevance&sortOrder=descending`

        console.warn(`arXiv: Trying search strategy: ${query}`)
        console.warn(`arXiv: URL: ${url}`)

        const response = await fetch(url)
        if (!response.ok) {
          continue // Try next strategy
        }

        const xmlText = await response.text()
        const entries = this.parseAtomFeed(xmlText)

        if (entries.length > 0) {
          // Return the first (most relevant) result
          return this.mapToExternalSource(entries[0])
        }
      }

      return null
    }
    catch (error) {
      console.error('arXiv title search error:', error)
      return null
    }
  }

  private parseAtomFeed(xmlText: string): any[] {
    try {
      // Simple XML parsing for Atom feed entries
      const entries: any[] = []

      // Extract all <entry> elements
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
      let match = entryRegex.exec(xmlText)

      while (match !== null) {
        const entryXml = match[1]
        const entry = this.parseEntry(entryXml)
        if (entry) {
          entries.push(entry)
        }
        match = entryRegex.exec(xmlText)
      }

      return entries
    }
    catch (error) {
      console.error('arXiv XML parsing error:', error)
      return []
    }
  }

  private parseEntry(entryXml: string): any | null {
    try {
      const entry: any = {}

      // Extract title
      const titleMatch = entryXml.match(/<title>(.*?)<\/title>/s)
      if (titleMatch) {
        entry.title = titleMatch[1].trim().replace(/\n\s+/g, ' ')
      }

      // Extract arXiv ID from the id field
      const idMatch = entryXml.match(/<id>(.*?)<\/id>/)
      if (idMatch) {
        entry.id = idMatch[1].trim()
        // Extract arXiv ID (e.g., "2301.12345" from "http://arxiv.org/abs/2301.12345v1")
        const arxivIdMatch = entry.id.match(/arxiv\.org\/abs\/([^v]+)/)
        if (arxivIdMatch) {
          entry.arxivId = arxivIdMatch[1]
        }
      }

      // Extract published date
      const publishedMatch = entryXml.match(/<published>(.*?)<\/published>/)
      if (publishedMatch) {
        entry.published = publishedMatch[1].trim()
        // Extract year
        const yearMatch = entry.published.match(/(\d{4})/)
        if (yearMatch) {
          entry.year = Number.parseInt(yearMatch[1], 10)
        }
      }

      // Extract authors
      const authors: string[] = []
      const authorRegex = /<author>\s*<name>(.*?)<\/name>/g
      let authorMatch = authorRegex.exec(entryXml)
      while (authorMatch !== null) {
        authors.push(authorMatch[1].trim())
        authorMatch = authorRegex.exec(entryXml)
      }
      entry.authors = authors

      // Extract summary (abstract)
      const summaryMatch = entryXml.match(/<summary>(.*?)<\/summary>/s)
      if (summaryMatch) {
        entry.summary = summaryMatch[1].trim().replace(/\n\s+/g, ' ')
      }

      // Extract DOI if present
      const doiMatch = entryXml.match(/<arxiv:doi[^>]*>(.*?)<\/arxiv:doi>/)
      if (doiMatch) {
        entry.doi = doiMatch[1].trim()
      }

      // Extract journal reference if present
      const journalRefMatch = entryXml.match(/<arxiv:journal_ref[^>]*>(.*?)<\/arxiv:journal_ref>/)
      if (journalRefMatch) {
        entry.journalRef = journalRefMatch[1].trim()
      }

      // Extract categories
      const categories: string[] = []
      const categoryRegex = /<category[^>]+term="([^"]+)"/g
      let categoryMatch = categoryRegex.exec(entryXml)
      while (categoryMatch !== null) {
        categories.push(categoryMatch[1])
        categoryMatch = categoryRegex.exec(entryXml)
      }
      entry.categories = categories

      // Extract PDF link
      const pdfLinkMatch = entryXml.match(/<link[^>]+title="pdf"[^>]+href="([^"]+)"/i)
      if (pdfLinkMatch) {
        entry.pdfUrl = pdfLinkMatch[1]
      }

      return entry
    }
    catch (error) {
      console.error('arXiv entry parsing error:', error)
      return null
    }
  }

  private mapToExternalSource(entry: any): ExternalSource {
    const metadata: ReferenceMetadata = {
      title: entry.title || '',
      authors: entry.authors || [],
      year: entry.year,
      doi: entry.doi,
      journal: entry.journalRef || 'arXiv preprint',
    }

    // Try to extract volume/pages from journal reference if available
    if (entry.journalRef) {
      // Simple extraction - just try to find volume and year in parentheses
      const yearMatch = entry.journalRef.match(/\((\d{4})\)/)
      if (yearMatch && !metadata.year) {
        metadata.year = Number.parseInt(yearMatch[1], 10)
      }

      // Extract journal name (everything before first number)
      const journalNameMatch = entry.journalRef.match(/^(\D+)/)
      if (journalNameMatch) {
        metadata.journal = journalNameMatch[1].trim()
      }
    }

    return {
      id: entry.arxivId || entry.id || '',
      source: 'arxiv',
      metadata,
      url: entry.id || `https://arxiv.org/abs/${entry.arxivId}`,
    }
  }
}
