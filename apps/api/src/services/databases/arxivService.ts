import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'

export class ArxivService {
  private baseUrl = 'http://export.arxiv.org/api/query'
  private maxResults = 10 // Limit results to stay within API guidelines
  private lastRequestTime = 0
  private requestDelay = 3000 // 3 second delay as recommended by arXiv

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Implement polite delay between requests
      await this.enforceRateLimit()

      // If DOI is available, search directly by DOI (most reliable)
      if (metadata.identifiers?.doi) {
        const directResult = await this.searchByDOI(metadata.identifiers.doi)
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

  /**
   * Enforce polite rate limiting as recommended by arXiv API documentation
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.requestDelay) {
      const delayNeeded = this.requestDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delayNeeded))
    }

    this.lastRequestTime = Date.now()
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

      // Validate arXiv ID format before making requests
      if (!this.isValidArxivId(arxivId)) {
        console.warn(`arXiv: Invalid arXiv ID format: ${arxivId}`)
        return null
      }

      // Try different ID formats with proper encoding
      const idFormats = [
        arxivId, // Direct ID like "2501.03862"
        `arXiv:${arxivId}`, // With arXiv prefix
      ]

      for (const id of idFormats) {
        await this.enforceRateLimit()

        const url = `${this.baseUrl}?id_list=${encodeURIComponent(id)}&max_results=1`

        console.warn(`arXiv: Trying DOI/ID format: ${id}`)

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'source-taster/1.0 (academic reference verification)',
          },
        })

        if (!response.ok) {
          console.warn(`arXiv: HTTP ${response.status} for ID: ${id}`)
          continue // Try next format
        }

        const xmlText = await response.text()

        // Check for API errors in the response
        if (this.hasApiError(xmlText)) {
          console.warn(`arXiv: API error for ID: ${id}`)
          continue
        }

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

  /**
   * Validate arXiv ID format according to arXiv identifier scheme
   */
  private isValidArxivId(id: string): boolean {
    // New format: YYMM.NNNNN[vN] (e.g., 2301.12345v1)
    const newFormat = /^\d{4}\.\d{4,5}(?:v\d+)?$/
    // Old format: subject-class/YYMMnnn[vN] (e.g., hep-th/9901001v1)
    const oldFormat = /^[a-z-]+(?:\.[A-Z]{2})?\/\d{7}(?:v\d+)?$/

    return newFormat.test(id) || oldFormat.test(id)
  }

  /**
   * Check if the API response contains an error
   */
  private hasApiError(xmlText: string): boolean {
    // Look for error entries in the feed
    return xmlText.includes('<title>Error</title>')
      || xmlText.includes('incorrect id format')
      || xmlText.includes('malformed id')
  }

  private async searchByTitle(title: string): Promise<ExternalSource | null> {
    try {
      // Clean and prepare the title for search
      const cleanTitle = this.cleanTitleForSearch(title)

      // Try multiple search strategies in order of specificity
      const searchStrategies = [
        // 1. Exact title in quotes with title field
        `ti:"${cleanTitle.replace(/"/g, '\\"')}"`,
        // 2. Clean title without special characters in quotes
        `ti:"${cleanTitle.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()}"`,
        // 3. First part before colon (often the main title)
        `ti:"${cleanTitle.split(':')[0].trim()}"`,
        // 4. Key words from title (AND search)
        this.createKeywordSearch(cleanTitle),
        // 5. Fallback to all fields search
        `all:${cleanTitle.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()}`,
      ].filter(Boolean) // Remove empty strategies

      for (const query of searchStrategies) {
        await this.enforceRateLimit()

        const url = `${this.baseUrl}?search_query=${encodeURIComponent(query)}&max_results=${this.maxResults}&sortBy=relevance&sortOrder=descending`

        console.warn(`arXiv: Trying search strategy: ${query}`)

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'source-taster/1.0 (academic reference verification)',
          },
        })

        if (!response.ok) {
          console.warn(`arXiv: HTTP ${response.status} for query: ${query}`)
          continue // Try next strategy
        }

        const xmlText = await response.text()

        // Check for API errors
        if (this.hasApiError(xmlText)) {
          console.warn(`arXiv: API error for query: ${query}`)
          continue
        }

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

  /**
   * Clean title for more effective searching
   */
  private cleanTitleForSearch(title: string): string {
    return title
      .trim()
      // Remove common LaTeX commands
      .replace(/\\[a-z]+\{[^}]*\}/gi, '')
      .replace(/\$[^$]*\$/g, '') // Remove math expressions
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Create an AND-based keyword search from title
   */
  private createKeywordSearch(title: string): string {
    const words = title
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word =>
        word.length > 3 // Skip short words
        && !this.isStopWord(word.toLowerCase()),
      )
      .slice(0, 5) // Limit to first 5 significant words

    if (words.length === 0)
      return ''

    return words.map(word => `ti:${word}`).join(' AND ')
  }

  /**
   * Check if a word is a stop word (common words to skip)
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'must',
      'can',
      'shall',
      'this',
      'that',
      'these',
      'those',
      'what',
      'which',
      'who',
      'when',
      'where',
      'why',
      'how',
    ])
    return stopWords.has(word)
  }

  private parseAtomFeed(xmlText: string): any[] {
    try {
      // Check for feed-level errors first
      if (this.hasApiError(xmlText)) {
        console.warn('arXiv: API returned error in feed')
        return []
      }

      const entries: any[] = []

      // Extract all <entry> elements using more robust regex
      const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/g
      let match = entryRegex.exec(xmlText)

      while (match !== null) {
        const entryXml = match[1]
        const entry = this.parseEntry(entryXml)
        if (entry && entry.title) { // Only include entries with valid titles
          entries.push(entry)
        }
        match = entryRegex.exec(xmlText)
      }

      console.warn(`arXiv: Parsed ${entries.length} entries from feed`)
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

      // Extract title (handle multiline and HTML entities)
      const titleMatch = entryXml.match(/<title[^>]*>(.*?)<\/title>/s)
      if (titleMatch) {
        entry.title = this.cleanXmlText(titleMatch[1])
      }

      // Extract arXiv ID from the id field
      const idMatch = entryXml.match(/<id[^>]*>(.*?)<\/id>/)
      if (idMatch) {
        entry.id = idMatch[1].trim()
        // Extract arXiv ID (e.g., "2301.12345" from "http://arxiv.org/abs/2301.12345v1")
        const arxivIdMatch = entry.id.match(/arxiv\.org\/abs\/([^v\s]+)/)
        if (arxivIdMatch) {
          entry.arxivId = arxivIdMatch[1]
        }
      }

      // Extract published date
      const publishedMatch = entryXml.match(/<published[^>]*>(.*?)<\/published>/)
      if (publishedMatch) {
        entry.published = publishedMatch[1].trim()
        // Extract year more robustly
        const yearMatch = entry.published.match(/(\d{4})/)
        if (yearMatch) {
          entry.year = Number.parseInt(yearMatch[1], 10)
        }
      }

      // Extract authors with better handling
      const authors: string[] = []
      const authorRegex = /<author[^>]*>\s*<name[^>]*>(.*?)<\/name>/g
      let authorMatch = authorRegex.exec(entryXml)
      while (authorMatch !== null) {
        const authorName = this.cleanXmlText(authorMatch[1])
        if (authorName) {
          authors.push(authorName)
        }
        authorMatch = authorRegex.exec(entryXml)
      }
      entry.authors = authors

      // Extract summary (abstract) with better handling
      const summaryMatch = entryXml.match(/<summary[^>]*>(.*?)<\/summary>/s)
      if (summaryMatch) {
        entry.summary = this.cleanXmlText(summaryMatch[1])
      }

      // Extract DOI if present
      const doiMatch = entryXml.match(/<arxiv:doi[^>]*>(.*?)<\/arxiv:doi>/)
      if (doiMatch) {
        entry.doi = doiMatch[1].trim()
      }

      // Extract journal reference if present
      const journalRefMatch = entryXml.match(/<arxiv:journal_ref[^>]*>(.*?)<\/arxiv:journal_ref>/)
      if (journalRefMatch) {
        entry.journalRef = this.cleanXmlText(journalRefMatch[1])
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

      // Extract PDF link with better regex
      const pdfLinkMatch = entryXml.match(/<link[^>]+title="pdf"[^>]+href="([^"]+)"/i)
        || entryXml.match(/<link[^>]+href="([^"]+)"[^>]+title="pdf"/i)
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

  /**
   * Clean XML text content by removing extra whitespace and decoding entities
   */
  private cleanXmlText(text: string): string {
    return text
      .replace(/\n\s+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, '\'')
      .trim()
  }

  private mapToExternalSource(entry: any): ExternalSource {
    const metadata: ReferenceMetadata = {
      title: entry.title || '',
      authors: entry.authors || [],
      date: {
        year: entry.year,
      },
      source: {
        containerTitle: entry.journalRef || 'arXiv preprint',
      },
      identifiers: {
        doi: entry.doi,
      },
    }

    // Try to extract volume/pages from journal reference if available
    if (entry.journalRef) {
      // Simple extraction - just try to find volume and year in parentheses
      const yearMatch = entry.journalRef.match(/\((\d{4})\)/)
      if (yearMatch && !metadata.date.year) {
        metadata.date.year = Number.parseInt(yearMatch[1], 10)
      }

      // Extract journal name (everything before first number)
      const journalNameMatch = entry.journalRef.match(/^(\D+)/)
      if (journalNameMatch) {
        metadata.source.containerTitle = journalNameMatch[1].trim()
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
