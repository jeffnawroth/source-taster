import type { APISearchCandidate, CSLItem, CSLName } from '@source-taster/types'
import type { components } from '../../types/crossref'
import process from 'node:process'

// Type aliases for better readability
type CrossrefWork = components['schemas']['Work']
type CrossrefWorksMessage = components['schemas']['WorksMessage']

export class CrossrefService {
  private baseUrl = 'https://api.crossref.org'
  private readonly mailto = process.env.CROSSREF_MAILTO || 'your-email@domain.com' // For the "polite pool" - better performance
  private readonly userAgent = `source-taster/1.0 (https://github.com/your-repo/source-taster; mailto:${this.mailto}) CrossrefService/1.0`

  constructor() {
    // Warn if no proper email is configured for Crossref "polite pool"
    if (!process.env.CROSSREF_MAILTO || this.mailto === 'your-email@domain.com') {
      console.warn('⚠️  Crossref: No CROSSREF_MAILTO environment variable set. Consider setting it for better API performance and access to the "polite pool".')
    }
  }

  async search(metadata: CSLItem): Promise<APISearchCandidate | null> {
    try {
      // If DOI is available, search directly by DOI (most reliable)
      if (metadata.DOI) {
        const directResult = await this.searchByDOI(metadata.DOI)
        if (directResult)
          return directResult
      }

      // Try bibliographic search first (most accurate for citation lookup)
      if (this.hasBibliographicData(metadata)) {
        const bibResult = await this.searchByBibliographic(metadata)
        if (bibResult)
          return bibResult
      }

      // Fallback to query-based search
      return await this.searchByQuery(metadata)
    }
    catch (error) {
      console.error('Crossref search error:', error)
    }

    return null
  }

  private hasBibliographicData(metadata: CSLItem): boolean {
    return !!(metadata.title && metadata.author?.length && metadata.issued && typeof metadata.issued === 'object' && metadata.issued['date-parts'] && metadata.issued['date-parts'][0] && metadata.issued['date-parts'][0][0])
  }

  private async searchByDOI(doi: string): Promise<APISearchCandidate | null> {
    try {
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:/, '')
      const url = `${this.baseUrl}/works/${encodeURIComponent(cleanDoi)}`

      console.warn(`Crossref: Searching by DOI: ${url}`)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
        },
      })

      // Check for rate limiting as recommended by Crossref
      if (response.headers.get('X-Rate-Limit-Limit')) {
        const rateLimit = response.headers.get('X-Rate-Limit-Limit')
        const rateLimitInterval = response.headers.get('X-Rate-Limit-Interval')
        // Only log if rate limit is low to avoid spam
        if (Number.parseInt(rateLimit || '0') < 10) {
          console.warn(`Crossref rate limit low: ${rateLimit}/${rateLimitInterval}`)
        }
      }

      if (!response.ok) {
        return null // DOI not found, try query search
      }

      const data = await response.json() as { message: CrossrefWork }

      if (data.message) {
        const work = data.message
        return {
          id: work.DOI || work.URL || `crossref-${Date.now()}`,
          source: 'crossref',
          metadata: this.parseCrossrefWork(work),
          url: work.URL || `https://doi.org/${work.DOI}`,
        }
      }
    }
    catch (error) {
      console.warn('Crossref DOI search failed:', error)
    }

    return null
  }

  /**
   * Search using bibliographic query - most accurate for citation lookup
   * Uses query.bibliographic which includes titles, authors, ISSNs and publication years
   */
  private async searchByBibliographic(metadata: CSLItem): Promise<APISearchCandidate | null> {
    try {
      const params = new URLSearchParams()

      // Build bibliographic query string
      const bibQuery = this.buildBibliographicQuery(metadata)
      params.append('query.bibliographic', bibQuery)

      // Add filters for better matching
      if (metadata.issued && typeof metadata.issued === 'object' && metadata.issued['date-parts'] && metadata.issued['date-parts'][0] && metadata.issued['date-parts'][0][0]) {
        const year = metadata.issued['date-parts'][0][0]
        params.append('filter', `from-pub-date:${year},until-pub-date:${year}`)
      }

      // Limit results and select relevant fields
      params.append('rows', '1') // Only need the best match
      params.append('sort', 'score')
      params.append('order', 'desc')
      params.append('select', 'title,author,issued,published,published-print,published-online,DOI,container-title,volume,issue,page,URL,type,publisher,abstract')
      params.append('mailto', this.mailto)

      const url = `${this.baseUrl}/works?${params.toString()}`
      console.warn(`Crossref: Bibliographic search: ${url}`)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        throw new Error(`Crossref API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as CrossrefWorksMessage

      if (data.message?.items && data.message.items.length > 0) {
        // Take the first (best) result from Crossref's relevance ranking
        const work = data.message.items[0]
        return {
          id: work.DOI || work.URL || `crossref-${Date.now()}`,
          source: 'crossref',
          metadata: this.parseCrossrefWork(work),
          url: work.URL || `https://doi.org/${work.DOI}`,
        }
      }
    }
    catch (error) {
      console.error('Crossref bibliographic search error:', error)
    }

    return null
  }

  private buildBibliographicQuery(metadata: CSLItem): string {
    const parts: string[] = []

    if (metadata.title) {
      parts.push(metadata.title)
    }

    if (metadata.author?.length) {
      // Add first author's surname for better matching
      const firstAuthor = metadata.author[0]
      let surname: string | undefined

      // CSL author format with family/given names
      if (firstAuthor && typeof firstAuthor === 'object' && 'family' in firstAuthor) {
        surname = firstAuthor.family
      }

      if (surname && surname.length > 1) { // Avoid single letters
        parts.push(surname)
      }

      // Add additional authors for better matching if available
      if (metadata.author.length > 1) {
        const secondAuthor = metadata.author[1]
        let secondSurname: string | undefined

        if (secondAuthor && typeof secondAuthor === 'object' && 'family' in secondAuthor) {
          secondSurname = secondAuthor.family
        }

        if (secondSurname && secondSurname.length > 1) {
          parts.push(secondSurname)
        }
      }
    }

    if (metadata.issued && typeof metadata.issued === 'object' && metadata.issued['date-parts'] && metadata.issued['date-parts'][0] && metadata.issued['date-parts'][0][0]) {
      const year = metadata.issued['date-parts'][0][0]
      parts.push(year.toString())
    }

    if (metadata['container-title']) {
      parts.push(metadata['container-title'])
    }

    // Add volume if available for better matching
    if (metadata.volume) {
      parts.push(`vol ${metadata.volume}`)
    }

    // Add DOI if available (highest confidence)
    if (metadata.DOI) {
      parts.push(metadata.DOI)
    }

    // Add ISBN for books
    if (metadata.ISBN) {
      parts.push(metadata.ISBN)
    }

    // Add publisher for books and reports
    if (metadata.publisher && ['book', 'report', 'thesis'].includes(metadata.type || '')) {
      parts.push(metadata.publisher)
    }

    return parts.join(' ')
  }

  private async searchByQuery(metadata: CSLItem): Promise<APISearchCandidate | null> {
    try {
      // Build search query using field-specific queries for better accuracy
      const params = this.buildAdvancedSearchQuery(metadata)
      const url = `${this.baseUrl}/works?${params}`

      console.warn(`Crossref: Advanced query search: ${url}`)
      console.warn(`Crossref: Query params debug:`, params)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        throw new Error(`Crossref API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as CrossrefWorksMessage

      if (data.message?.items && data.message.items.length > 0) {
        // Take the first (best) result from Crossref's relevance ranking
        const work = data.message.items[0]
        return {
          id: work.DOI || work.URL || `crossref-${Date.now()}`,
          source: 'crossref',
          metadata: this.parseCrossrefWork(work),
          url: work.URL || `https://doi.org/${work.DOI}`,
        }
      }
    }
    catch (error) {
      console.error('Crossref search error:', error)
    }

    return null
  }

  private buildAdvancedSearchQuery(metadata: CSLItem): string {
    const params = new URLSearchParams()

    console.warn('Crossref: Building query for metadata:', JSON.stringify(metadata, null, 2))

    // Use simple query approach - much more reliable
    const queryParts: string[] = []

    if (metadata.title) {
      queryParts.push(metadata.title)
    }

    if (metadata.author?.length) {
      const firstAuthor = metadata.author[0]
      if (typeof firstAuthor === 'string') {
        queryParts.push(firstAuthor)
      }
      else if (firstAuthor && typeof firstAuthor === 'object') {
        if ('family' in firstAuthor && firstAuthor.family) {
          queryParts.push(firstAuthor.family)
        }
        else if ('literal' in firstAuthor && firstAuthor.literal) {
          queryParts.push(firstAuthor.literal)
        }
      }
    }

    if (metadata['container-title']) {
      queryParts.push(metadata['container-title'])
    }

    const queryString = queryParts.join(' ')
    console.warn('Crossref: Simple query string:', queryString)

    if (queryString.trim()) {
      params.append('query', queryString)
    }
    else {
      params.append('query', '*')
    }

    // Keep minimal, reliable parameters only
    params.append('rows', '3') // Get a few results to find the best match
    params.append('sort', 'relevance')
    params.append('order', 'desc')
    params.append('mailto', this.mailto)

    const result = params.toString()
    console.warn('Crossref: Final query string:', result)
    return result
  }

  private parseCrossrefWork(work: CrossrefWork): CSLItem {
    // Parse publication date in CSL format
    const issued = this.parseCrossrefDate(work)

    // Parse authors in CSL format
    const author = this.parseCrossrefAuthors(work.author || [])

    // Parse additional contributors (editors, translators, etc.)
    const editor = this.parseCrossrefContributors(work.editor || [], work.translator || [])

    // Get title from Crossref
    const title = work.title?.[0] || work['short-title']?.[0] || work['original-title']?.[0]

    // Get container title from Crossref
    const containerTitle = work['container-title']?.[0] || work['short-container-title']?.[0]

    // Build the CSL item
    const metadata: CSLItem = {
      id: work.DOI || work.URL || 'unknown',
      type: this.mapCrossrefTypeToCSL(work.type),
      title,
    }

    // Add authors if available
    if (author && author.length > 0) {
      metadata.author = author
    }

    // Add editors if available
    if (editor && editor.length > 0) {
      metadata.editor = editor
    }

    // Add publication date
    if (issued) {
      metadata.issued = issued
    }

    // Add container title (journal, book, etc.)
    if (containerTitle) {
      metadata['container-title'] = containerTitle
    }

    // Add publisher
    if (work.publisher) {
      metadata.publisher = work.publisher
    }

    // Add DOI
    if (work.DOI) {
      metadata.DOI = work.DOI
    }

    // Add URL
    if (work.URL) {
      metadata.URL = work.URL
    }

    // Add volume, issue, page information
    if (work.volume) {
      metadata.volume = work.volume
    }
    if (work.issue) {
      metadata.issue = work.issue
    }
    if (work.page) {
      metadata.page = work.page
    }

    // Add ISSN
    if (work.ISSN && work.ISSN.length > 0) {
      metadata.ISSN = work.ISSN[0]
    }

    // Add ISBN
    if (work.ISBN && work.ISBN.length > 0) {
      metadata.ISBN = work.ISBN[0]
    }

    return metadata
  }

  /**
   * Map Crossref work type to CSL type
   */
  private mapCrossrefTypeToCSL(crossrefType?: string): 'article-journal' | 'book' | 'chapter' | 'paper-conference' | 'thesis' | 'report' | 'article' {
    if (!crossrefType)
      return 'article-journal'

    const typeMapping: Record<string, 'article-journal' | 'book' | 'chapter' | 'paper-conference' | 'thesis' | 'report' | 'article'> = {
      'journal-article': 'article-journal',
      'book': 'book',
      'book-chapter': 'chapter',
      'proceedings-article': 'paper-conference',
      'dissertation': 'thesis',
      'report': 'report',
      'preprint': 'article',
    }

    return typeMapping[crossrefType] || 'article-journal'
  }

  /**
   * Parse date information from Crossref work to CSL issued format
   */
  private parseCrossrefDate(work: CrossrefWork): { 'date-parts': number[][] } | undefined {
    const dateFields = [
      work.issued,
      work.published,
      work['published-print'],
      work['published-online'],
      work['content-created'],
    ]

    // Find the most complete date information
    for (const dateField of dateFields) {
      // The date-parts field exists in the API but the generated types are too restrictive
      // We need to work with the actual structure returned by the API
      if (dateField && typeof dateField === 'object') {
        const dateFieldWithParts = dateField as Record<string, unknown>
        const dateParts = (dateFieldWithParts?.['date-parts'] as number[][] | undefined)?.[0]
        if (dateParts && Array.isArray(dateParts)) {
          // Return in CSL format
          const year = dateParts[0]
          const month = dateParts[1]
          const day = dateParts[2]

          const cslDateParts: number[] = []
          if (typeof year === 'number' && year > 0) {
            cslDateParts.push(year)
          }
          if (typeof month === 'number' && month > 0) {
            cslDateParts.push(month)
          }
          if (typeof day === 'number' && day > 0) {
            cslDateParts.push(day)
          }

          if (cslDateParts.length > 0) {
            return { 'date-parts': [cslDateParts] }
          }
        }
      }
    }

    return undefined
  }

  /**
   * Parse authors from Crossref work to CSL name format
   */
  private parseCrossrefAuthors(authorArray: components['schemas']['Author'][]): CSLName[] {
    return authorArray.map((author) => {
      if (author.given && author.family) {
        // Return as CSLName object with family/given structure
        return {
          family: author.family,
          given: author.given,
        }
      }

      // Handle cases where only family name is available
      if (author.family && !author.given) {
        return {
          family: author.family,
        }
      }

      // Fallback for incomplete data - create CSLName object with parsed name
      const parts: string[] = []
      if (author.given)
        parts.push(author.given)
      if (author.family)
        parts.push(author.family)

      if (parts.length === 0) {
        // Use author.name if available, otherwise unknown
        const fullName = author.name || 'Unknown Author'
        const nameParts = fullName.trim().split(/\s+/)
        return {
          given: nameParts.slice(0, -1).join(' ') || undefined,
          family: nameParts[nameParts.length - 1] || 'Unknown',
        }
      }

      // Parse the joined parts into given/family
      const fullName = parts.join(' ')
      const nameParts = fullName.trim().split(/\s+/)
      return {
        given: nameParts.slice(0, -1).join(' ') || undefined,
        family: nameParts[nameParts.length - 1] || 'Unknown',
      }
    }).filter(Boolean)
  }

  /**
   * Parse contributors (editors, translators, etc.) from Crossref work to CSL format
   */
  private parseCrossrefContributors(
    editors: components['schemas']['Author'][],
    translators: components['schemas']['Author'][],
  ): CSLName[] {
    const contributors: CSLName[] = []

    // Add editors - CSL uses separate editor field, so we just return them as CSLName
    editors.forEach((editor) => {
      if (editor.given && editor.family) {
        contributors.push({
          given: editor.given,
          family: editor.family,
        })
      }
      else if (editor.family) {
        contributors.push({
          family: editor.family,
        })
      }
    })

    // Note: Translators would typically go into a separate 'translator' field in CSL
    // For now, we'll include them in the general contributors array
    translators.forEach((translator) => {
      if (translator.given && translator.family) {
        contributors.push({
          given: translator.given,
          family: translator.family,
        })
      }
      else if (translator.family) {
        contributors.push({
          family: translator.family,
        })
      }
    })

    return contributors
  }
}
