import type { Author, DateInfo, ExternalSource, ReferenceMetadata } from '@source-taster/types'

export class ArxivService {
  private baseUrl = 'http://export.arxiv.org/api/query'
  private maxResults = 10 // Limit results to stay within API guidelines
  private lastRequestTime = 0
  private requestDelay = 3000 // 3 second delay as recommended by arXiv

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Implement polite delay between requests
      await this.enforceRateLimit()

      // If arXiv ID is directly available, search by it (most reliable)
      if (metadata.identifiers?.arxivId) {
        const directResult = await this.searchByArxivId(metadata.identifiers.arxivId)
        if (directResult)
          return directResult
      }

      // If DOI is available, search directly by DOI (also reliable)
      if (metadata.identifiers?.doi) {
        const directResult = await this.searchByDOI(metadata.identifiers.doi)
        if (directResult)
          return directResult
      }

      // If we have authors, we can try a more targeted search
      if (metadata.title && metadata.authors && metadata.authors.length > 0) {
        const authorBasedResult = await this.searchByTitleAndAuthor(metadata.title, metadata.authors)
        if (authorBasedResult) {
          return authorBasedResult
        }
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

  private async searchByTitleAndAuthor(title: string, authors: (Author | string)[]): Promise<ExternalSource | null> {
    try {
      // Extract the last name of the first author for search
      const firstAuthor = authors[0]
      let authorLastName = ''

      if (typeof firstAuthor === 'string') {
        // Parse string author
        const authorObj = this.parseAuthorName(firstAuthor)
        authorLastName = authorObj.lastName
      }
      else {
        authorLastName = firstAuthor.lastName
      }

      if (!authorLastName) {
        return null // Can't search without author name
      }

      // Clean the title for search
      const cleanTitle = this.cleanTitleForSearch(title)

      // Create a combined search query with title and author
      const query = `ti:"${cleanTitle.replace(/"/g, '\\"')}" AND au:${authorLastName}`

      await this.enforceRateLimit()

      const url = `${this.baseUrl}?search_query=${encodeURIComponent(query)}&max_results=${this.maxResults}&sortBy=relevance&sortOrder=descending`

      console.warn(`arXiv: Trying title+author search: ${query}`)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'source-taster/1.0 (academic reference verification)',
        },
      })

      if (!response.ok) {
        console.warn(`arXiv: HTTP ${response.status} for title+author query`)
        return null
      }

      const xmlText = await response.text()

      // Check for API errors
      if (this.hasApiError(xmlText)) {
        console.warn(`arXiv: API error for title+author query`)
        return null
      }

      const entries = this.parseAtomFeed(xmlText)

      if (entries.length > 0) {
        // Return the first (most relevant) result
        return this.mapToExternalSource(entries[0])
      }

      return null
    }
    catch (error) {
      console.error('arXiv title+author search error:', error)
      return null
    }
  }

  private async searchByArxivId(arxivId: string): Promise<ExternalSource | null> {
    try {
      // Clean the arXiv ID (remove any prefixes)
      const cleanId = arxivId
        .replace(/^arXiv:/, '') // Remove arXiv: prefix
        .trim()

      // Validate arXiv ID format before making requests
      if (!this.isValidArxivId(cleanId)) {
        console.warn(`arXiv: Invalid arXiv ID format: ${cleanId}`)
        return null
      }

      await this.enforceRateLimit()

      const url = `${this.baseUrl}?id_list=${encodeURIComponent(cleanId)}&max_results=1`

      console.warn(`arXiv: Searching by arXiv ID: ${cleanId}`)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'source-taster/1.0 (academic reference verification)',
        },
      })

      if (!response.ok) {
        console.warn(`arXiv: HTTP ${response.status} for ID: ${cleanId}`)
        return null
      }

      const xmlText = await response.text()

      // Check for API errors in the response
      if (this.hasApiError(xmlText)) {
        console.warn(`arXiv: API error for ID: ${cleanId}`)
        return null
      }

      const entries = this.parseAtomFeed(xmlText)

      if (entries.length > 0) {
        return this.mapToExternalSource(entries[0])
      }

      return null
    }
    catch (error) {
      console.error('arXiv ID search error:', error)
      return null
    }
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

      // Extract published date with more detailed parsing
      const publishedMatch = entryXml.match(/<published[^>]*>(.*?)<\/published>/)
      if (publishedMatch) {
        entry.published = publishedMatch[1].trim()
        // Parse date information more comprehensively
        entry.dateInfo = this.parsePublishedDate(entry.published)
      }

      // Extract authors with better handling and convert to Author objects
      const authors: Author[] = []
      const authorRegex = /<author[^>]*>\s*<name[^>]*>(.*?)<\/name>/g
      let authorMatch = authorRegex.exec(entryXml)
      while (authorMatch !== null) {
        const authorName = this.cleanXmlText(authorMatch[1])
        if (authorName) {
          authors.push(this.parseAuthorName(authorName))
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

      // Extract additional arXiv-specific metadata

      // Extract comments (often contains publication info or notes)
      const commentMatch = entryXml.match(/<arxiv:comment[^>]*>(.*?)<\/arxiv:comment>/)
      if (commentMatch) {
        entry.comment = this.cleanXmlText(commentMatch[1])
      }

      // Extract version information from the ID
      const versionMatch = entry.id?.match(/v(\d+)$/)
      if (versionMatch) {
        entry.version = Number.parseInt(versionMatch[1], 10)
      }

      // Extract updated date (for version history)
      const updatedMatch = entryXml.match(/<updated[^>]*>(.*?)<\/updated>/)
      if (updatedMatch) {
        entry.updated = updatedMatch[1].trim()
      }

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
   * Parse published date string into DateInfo object
   */
  private parsePublishedDate(publishedStr: string): DateInfo {
    const dateInfo: DateInfo = {}

    // Parse ISO 8601 format: 2023-01-25T18:30:45Z
    const isoMatch = publishedStr.match(/^(\d{4})-(\d{2})-(\d{2})T/)
    if (isoMatch) {
      dateInfo.year = Number.parseInt(isoMatch[1], 10)
      const monthNum = Number.parseInt(isoMatch[2], 10)
      dateInfo.month = this.getMonthName(monthNum)
      dateInfo.day = Number.parseInt(isoMatch[3], 10)
      return dateInfo
    }

    // Fallback: extract just the year
    const yearMatch = publishedStr.match(/(\d{4})/)
    if (yearMatch) {
      dateInfo.year = Number.parseInt(yearMatch[1], 10)
    }

    return dateInfo
  }

  /**
   * Convert month number to month name
   */
  private getMonthName(monthNum: number): string {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return monthNames[monthNum - 1] || ''
  }

  /**
   * Parse author name string into Author object
   */
  private parseAuthorName(fullName: string): Author {
    // Handle common formats: "Last, First" or "First Last" or "First Middle Last"
    const trimmedName = fullName.trim()

    if (trimmedName.includes(',')) {
      // "Last, First" format
      const [lastName, firstName] = trimmedName.split(',', 2)
      return {
        firstName: firstName?.trim() || undefined,
        lastName: lastName.trim(),
      }
    }
    else {
      // "First Last" or "First Middle Last" format
      const nameParts = trimmedName.split(/\s+/)
      if (nameParts.length === 1) {
        return {
          lastName: nameParts[0],
        }
      }
      else {
        const lastName = nameParts[nameParts.length - 1]
        const firstName = nameParts.slice(0, -1).join(' ')
        return {
          firstName: firstName || undefined,
          lastName,
        }
      }
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
      date: entry.dateInfo || { year: entry.year },
      source: {
        containerTitle: this.parseContainerTitle(entry),
        sourceType: 'Preprint',
        // Parse additional source info from journal reference
        ...this.parseJournalReference(entry.journalRef),
      },
      identifiers: {
        doi: entry.doi,
        arxivId: entry.arxivId,
      },
    }

    // Add categories as additional metadata if available
    if (entry.categories && entry.categories.length > 0) {
      metadata.source.series = entry.categories.join(', ')
    }

    return {
      id: entry.arxivId || entry.id || '',
      source: 'arxiv',
      metadata,
      url: entry.id || `https://arxiv.org/abs/${entry.arxivId}`,
    }
  }

  /**
   * Parse container title from entry data
   */
  private parseContainerTitle(entry: any): string {
    if (entry.journalRef) {
      // Extract journal name from journal reference
      const journalNameMatch = entry.journalRef.match(/^([^,\d]+)/)
      if (journalNameMatch) {
        return journalNameMatch[1].trim()
      }
    }
    return 'arXiv preprint'
  }

  /**
   * Parse additional source information from journal reference
   */
  private parseJournalReference(journalRef?: string): Partial<ReferenceMetadata['source']> {
    if (!journalRef)
      return {}

    const sourceInfo: Partial<ReferenceMetadata['source']> = {}

    // Try to extract volume, issue, pages from various formats
    // Examples: "Phys. Rev. D 98, 123456 (2018)" or "Nature 586, 378-383 (2020)"

    // Extract year from parentheses
    const yearMatch = journalRef.match(/\((\d{4})\)/)
    if (yearMatch) {
      // Don't override the date if already parsed from published field
    }

    // Extract volume and pages pattern: "Vol Pages" - match volume and page numbers before parentheses
    const volPagesMatch = journalRef.match(/\s(\d{1,4}),\s*(\d{1,10}(?:-\d{1,10})?)\s*\(/)
    if (volPagesMatch) {
      sourceInfo.volume = volPagesMatch[1]
      sourceInfo.pages = volPagesMatch[2]
    }

    // Extract DOI if present in journal ref
    const doiMatch = journalRef.match(/doi[:\s]*([0-9./]+)/i)
    if (doiMatch) {
      // DOI already extracted elsewhere, but could be used for validation
    }

    return sourceInfo
  }
}
