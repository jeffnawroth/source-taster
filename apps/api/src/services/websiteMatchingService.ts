import type {
  APIMatchingSettings,
  ArchivedVersion,
  ExternalSource,
  MatchDetails,
  MatchingReference,
  WebsiteMatchingOptions,
  WebsiteMatchingResult,
  WebsiteMetadata,
} from '@source-taster/types'
import * as cheerio from 'cheerio'
import { DeterministicMatchingService } from './deterministicMatchingService'

/**
 * Service for matching references against website content
 * Handles URL accessibility, metadata extraction, and content matching
 */
// export class WebsiteMatchingService extends BaseMatchingService {
export class WebsiteMatchingService {
  private readonly defaultOptions: Required<WebsiteMatchingOptions> = {
    timeout: 10000, // 10 seconds
    enableWaybackMachine: true,
    userAgent: 'Source-Taster-Bot/1.0 (https://source-taster.app)',
  }

  private readonly deterministicMatchingService = new DeterministicMatchingService()

  constructor() {
    // super()
  }

  /**
   * Match a reference against a website URL
   */
  async matchWebsiteReference(
    reference: MatchingReference,
    url: string,
    matchingSettings: APIMatchingSettings,
    options?: WebsiteMatchingOptions,
  ): Promise<WebsiteMatchingResult> {
    const opts = { ...this.defaultOptions, ...options }

    try {
      // First, try to fetch the current website
      const websiteMetadata = await this.extractWebsiteMetadata(url, opts)

      if (websiteMetadata) {
        console.warn(`Extracted metadata for ${url}:`, JSON.stringify(websiteMetadata, null, 2))

        // Use a specialized website matching method
        const matchResult = await this.matchWebsiteWithAI(reference, websiteMetadata, matchingSettings)

        console.warn(`AI matching result:`, JSON.stringify(matchResult, null, 2))
        return {
          url,
          isAccessible: true,
          websiteMetadata,
          matchDetails: matchResult.details,
          archivedVersion: undefined,
        }
      }
      else {
        console.warn(`No metadata extracted for ${url}`)
      }
    }
    catch (error) {
      console.warn(`Failed to fetch current website ${url}:`, error)
    }

    // If current website is not accessible, try Wayback Machine
    if (opts.enableWaybackMachine) {
      try {
        const archivedVersion = await this.getArchivedVersion(url)
        if (archivedVersion && archivedVersion.metadata) {
          const matchResult = await this.matchWebsiteWithAI(reference, archivedVersion.metadata, matchingSettings)
          return {
            url,
            isAccessible: false,
            websiteMetadata: archivedVersion.metadata,
            matchDetails: matchResult.details,
            archivedVersion,
          }
        }
      }
      catch (error) {
        console.warn(`Failed to fetch archived version of ${url}:`, error)
      }
    }

    // If both current and archived versions fail
    return {
      url,
      isAccessible: false,
      websiteMetadata: undefined,
      matchDetails: {
        overallScore: 0,
      },
      archivedVersion: undefined,
    }
  }

  /**
   * Extract metadata from a website URL
   */
  private async extractWebsiteMetadata(
    url: string,
    options: Required<WebsiteMatchingOptions>,
  ): Promise<WebsiteMetadata | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), options.timeout)

      const response = await fetch(url, {
        headers: {
          'User-Agent': options.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      return this.parseHTMLMetadata(html, url)
    }
    catch (error) {
      console.warn(`Failed to extract metadata from ${url}:`, error)
      return null
    }
  }

  /**
   * Parse HTML content to extract metadata using Cheerio for robust parsing
   */
  private parseHTMLMetadata(html: string, url: string): WebsiteMetadata {
    const $ = cheerio.load(html)

    const metadata: WebsiteMetadata = {
      url,
      title: this.extractTitle($),
      description: this.extractDescription($),
      authors: this.extractAuthors($),
      publishedDate: this.extractPublishedDate($),
      siteName: this.extractSiteName($),
      articleType: this.extractArticleType($),
    }

    return metadata
  }

  /**
   * Extract title from HTML using multiple strategies
   */
  private extractTitle($: cheerio.CheerioAPI): string | undefined {
    // Priority order: OpenGraph > Twitter > JSON-LD > HTML title

    // 1. OpenGraph title
    const ogTitle = $('meta[property="og:title"]').attr('content')
    if (ogTitle?.trim()) {
      return ogTitle.trim()
    }

    // 2. Twitter title
    const twitterTitle = $('meta[name="twitter:title"]').attr('content')
    if (twitterTitle?.trim()) {
      return twitterTitle.trim()
    }

    // 3. JSON-LD structured data
    const jsonLdTitle = this.extractFromJsonLd($, 'headline') || this.extractFromJsonLd($, 'name')
    if (jsonLdTitle) {
      return jsonLdTitle
    }

    // 4. HTML title tag
    const htmlTitle = $('title').text().trim()
    if (htmlTitle) {
      return htmlTitle
    }

    // 5. h1 as fallback
    const h1Title = $('h1').first().text().trim()
    if (h1Title) {
      return h1Title
    }

    return undefined
  }

  /**
   * Extract description from HTML
   */
  private extractDescription($: cheerio.CheerioAPI): string | undefined {
    // Priority order: OpenGraph > Twitter > meta description > JSON-LD

    // 1. OpenGraph description
    const ogDescription = $('meta[property="og:description"]').attr('content')
    if (ogDescription?.trim()) {
      return ogDescription.trim()
    }

    // 2. Twitter description
    const twitterDescription = $('meta[name="twitter:description"]').attr('content')
    if (twitterDescription?.trim()) {
      return twitterDescription.trim()
    }

    // 3. Standard meta description
    const metaDescription = $('meta[name="description"]').attr('content')
    if (metaDescription?.trim()) {
      return metaDescription.trim()
    }

    // 4. JSON-LD description
    const jsonLdDescription = this.extractFromJsonLd($, 'description')
    if (jsonLdDescription) {
      return jsonLdDescription
    }

    return undefined
  }

  /**
   * Extract authors from HTML using multiple strategies
   */
  private extractAuthors($: cheerio.CheerioAPI): string[] {
    const authors: Set<string> = new Set()

    // 1. JSON-LD structured data (most reliable)
    const jsonLdAuthors = this.extractAuthorsFromJsonLd($)
    jsonLdAuthors.forEach(author => authors.add(author))

    // 2. Standard meta author tag
    const metaAuthor = $('meta[name="author"]').attr('content')
    if (metaAuthor?.trim()) {
      // Split by common separators
      metaAuthor.split(/[,;&]/).forEach((author) => {
        const trimmed = author.trim()
        if (trimmed)
          authors.add(trimmed)
      })
    }

    // 3. Article author meta tags
    $('meta[property="article:author"]').each((_, el) => {
      const author = $(el).attr('content')
      if (author?.trim()) {
        authors.add(author.trim())
      }
    })

    // 4. Byline patterns (common in news sites)
    const bylineSelectors = [
      '.byline',
      '.author',
      '.author-name',
      '.writer',
      '.contributor',
      '[class*="author"]',
      '[class*="byline"]',
      '[rel="author"]',
    ]

    bylineSelectors.forEach((selector) => {
      $(selector).each((_, el) => {
        const text = $(el).text().trim()
        if (text && text.length < 100) { // Reasonable author name length
          // Clean up common byline patterns
          const cleanedAuthor = text
            .replace(/^(By:?\s*|Author:?\s*|Written by:?\s*)/i, '')
            .replace(/\s+/g, ' ')
            .trim()

          if (cleanedAuthor && cleanedAuthor.length > 1) {
            authors.add(cleanedAuthor)
          }
        }
      })
    })

    // 5. Schema.org microdata
    $('[itemtype*="Person"]').each((_, el) => {
      const name = $(el).find('[itemprop="name"]').text().trim()
      if (name) {
        authors.add(name)
      }
    })

    return Array.from(authors)
  }

  /**
   * Extract published date from HTML
   */
  private extractPublishedDate($: cheerio.CheerioAPI): Date | undefined {
    // Priority order: article:published_time > JSON-LD > time elements > meta tags

    // 1. OpenGraph article published time
    const articlePublishedTime = $('meta[property="article:published_time"]').attr('content')
    if (articlePublishedTime) {
      const date = new Date(articlePublishedTime)
      if (!Number.isNaN(date.getTime())) {
        return date
      }
    }

    // 2. JSON-LD structured data
    const jsonLdDate = this.extractFromJsonLd($, 'datePublished') || this.extractFromJsonLd($, 'dateCreated')
    if (jsonLdDate) {
      const date = new Date(jsonLdDate)
      if (!Number.isNaN(date.getTime())) {
        return date
      }
    }

    // 3. HTML5 time elements
    const timeElements = $('time[datetime], time[pubdate]')
    for (let i = 0; i < timeElements.length; i++) {
      const timeEl = timeElements.eq(i)
      const datetime = timeEl.attr('datetime') || timeEl.attr('pubdate')
      if (datetime) {
        const date = new Date(datetime)
        if (!Number.isNaN(date.getTime())) {
          return date
        }
      }
    }

    // 4. Other common meta tags
    const dateMetaTags = [
      'meta[name="pubdate"]',
      'meta[name="publishdate"]',
      'meta[name="date"]',
      'meta[property="article:published"]',
    ]

    for (const selector of dateMetaTags) {
      const content = $(selector).attr('content')
      if (content) {
        const date = new Date(content)
        if (!Number.isNaN(date.getTime())) {
          return date
        }
      }
    }

    // 5. Schema.org microdata
    const schemaDate = $('[itemprop="datePublished"]').attr('content') || $('[itemprop="datePublished"]').text()
    if (schemaDate) {
      const date = new Date(schemaDate)
      if (!Number.isNaN(date.getTime())) {
        return date
      }
    }

    return undefined
  }

  /**
   * Extract site name from HTML
   */
  private extractSiteName($: cheerio.CheerioAPI): string | undefined {
    // 1. OpenGraph site name
    const ogSiteName = $('meta[property="og:site_name"]').attr('content')
    if (ogSiteName?.trim()) {
      return ogSiteName.trim()
    }

    // 2. Twitter site
    const twitterSite = $('meta[name="twitter:site"]').attr('content')
    if (twitterSite?.trim()) {
      // Remove @ symbol if present
      return twitterSite.replace(/^@/, '').trim()
    }

    // 3. JSON-LD publisher name
    const publisherName = this.extractPublisherFromJsonLd($)
    if (publisherName) {
      return publisherName
    }

    // 4. Schema.org microdata
    const schemaPublisher = $('[itemtype*="Organization"] [itemprop="name"]').first().text().trim()
    if (schemaPublisher) {
      return schemaPublisher
    }

    return undefined
  }

  /**
   * Extract article type from HTML
   */
  private extractArticleType($: cheerio.CheerioAPI): string | undefined {
    // 1. OpenGraph type
    const ogType = $('meta[property="og:type"]').attr('content')
    if (ogType?.trim()) {
      return ogType.trim()
    }

    // 2. JSON-LD @type
    const jsonLdType = this.extractFromJsonLd($, '@type')
    if (jsonLdType) {
      return jsonLdType
    }

    // 3. Schema.org microdata
    const itemType = $('[itemtype]').first().attr('itemtype')
    if (itemType) {
      // Extract the type name from the schema.org URL
      const match = itemType.match(/schema\.org\/(.+)$/)
      if (match) {
        return match[1]
      }
    }

    return undefined
  }

  /**
   * Extract data from JSON-LD structured data
   */
  private extractFromJsonLd($: cheerio.CheerioAPI, property: string): string | undefined {
    const jsonLdScripts = $('script[type="application/ld+json"]')

    for (let i = 0; i < jsonLdScripts.length; i++) {
      try {
        const jsonContent = jsonLdScripts.eq(i).html()
        if (!jsonContent)
          continue

        const data = JSON.parse(jsonContent)
        const value = this.getNestedProperty(data, property)

        if (typeof value === 'string' && value.trim()) {
          return value.trim()
        }
      }
      catch {
        // Ignore JSON parsing errors
      }
    }

    return undefined
  }

  /**
   * Extract authors from JSON-LD structured data
   */
  private extractAuthorsFromJsonLd($: cheerio.CheerioAPI): string[] {
    const authors: string[] = []
    const jsonLdScripts = $('script[type="application/ld+json"]')

    for (let i = 0; i < jsonLdScripts.length; i++) {
      try {
        const jsonContent = jsonLdScripts.eq(i).html()
        if (!jsonContent)
          continue

        const data = JSON.parse(jsonContent)
        const extractedAuthors = this.extractAuthorsFromData(data)
        authors.push(...extractedAuthors)
      }
      catch {
        // Ignore JSON parsing errors
      }
    }

    return authors
  }

  /**
   * Extract publisher name from JSON-LD
   */
  private extractPublisherFromJsonLd($: cheerio.CheerioAPI): string | undefined {
    const jsonLdScripts = $('script[type="application/ld+json"]')

    for (let i = 0; i < jsonLdScripts.length; i++) {
      try {
        const jsonContent = jsonLdScripts.eq(i).html()
        if (!jsonContent)
          continue

        const data = JSON.parse(jsonContent)

        // Try different publisher property paths
        const publisher = data.publisher
        if (publisher) {
          if (typeof publisher === 'string') {
            return publisher
          }
          if (publisher.name) {
            return publisher.name
          }
        }

        // Try sourceOrganization for news articles
        const sourceOrg = data.sourceOrganization
        if (sourceOrg?.name) {
          return sourceOrg.name
        }
      }
      catch {
        // Ignore JSON parsing errors
      }
    }

    return undefined
  }

  /**
   * Recursively extract authors from JSON-LD data
   */
  private extractAuthorsFromData(data: any): string[] {
    const authors: string[] = []

    if (!data)
      return authors

    // Handle arrays (e.g., multiple JSON-LD objects)
    if (Array.isArray(data)) {
      data.forEach((item) => {
        authors.push(...this.extractAuthorsFromData(item))
      })
      return authors
    }

    // Handle author property
    if (data.author) {
      const authorData = data.author

      if (Array.isArray(authorData)) {
        authorData.forEach((author) => {
          const name = this.getPersonName(author)
          if (name)
            authors.push(name)
        })
      }
      else {
        const name = this.getPersonName(authorData)
        if (name)
          authors.push(name)
      }
    }

    // Handle creator property (alternative to author)
    if (data.creator) {
      const creatorData = data.creator

      if (Array.isArray(creatorData)) {
        creatorData.forEach((creator) => {
          const name = this.getPersonName(creator)
          if (name)
            authors.push(name)
        })
      }
      else {
        const name = this.getPersonName(creatorData)
        if (name)
          authors.push(name)
      }
    }

    return authors
  }

  /**
   * Extract person name from JSON-LD person object
   */
  private getPersonName(person: any): string | undefined {
    if (typeof person === 'string') {
      return person
    }

    if (person && typeof person === 'object') {
      // Try different name properties
      return person.name || (person.givenName && person.familyName
        ? `${person.givenName} ${person.familyName}`.trim()
        : undefined)
    }

    return undefined
  }

  /**
   * Get nested property from object using dot notation or direct access
   */
  private getNestedProperty(obj: any, path: string): any {
    if (!obj)
      return undefined

    // Direct property access
    if (obj[path] !== undefined) {
      return obj[path]
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = this.getNestedProperty(item, path)
        if (result !== undefined) {
          return result
        }
      }
    }

    return undefined
  }

  /**
   * Get archived version from Wayback Machine
   */
  private async getArchivedVersion(url: string): Promise<ArchivedVersion | null> {
    try {
      // Query Wayback Machine CDX API for available snapshots
      const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=1&sort=timestamp&order=desc`

      const response = await fetch(cdxUrl)
      if (!response.ok) {
        throw new Error(`Wayback Machine API error: ${response.status}`)
      }

      const data = await response.json()
      if (!Array.isArray(data) || data.length < 2) {
        return null // No snapshots found
      }

      // CDX format: [urlkey, timestamp, original, mimetype, statuscode, digest, length]
      const snapshot = data[1] // First result after header
      const timestamp = snapshot[1]
      const archivedUrl = `https://web.archive.org/web/${timestamp}/${url}`

      // Fetch the archived content
      const archivedMetadata = await this.extractWebsiteMetadata(archivedUrl, this.defaultOptions)

      if (!archivedMetadata) {
        return null
      }

      return {
        url: archivedUrl,
        originalUrl: url,
        timestamp: new Date(`${timestamp.substring(0, 4)}-${timestamp.substring(4, 6)}-${timestamp.substring(6, 8)}T${timestamp.substring(8, 10)}:${timestamp.substring(10, 12)}:${timestamp.substring(12, 14)}Z`),
        metadata: archivedMetadata,
      }
    }
    catch (error) {
      console.warn(`Failed to get archived version of ${url}:`, error)
      return null
    }
  }

  /**
   * Convert WebsiteMetadata to ExternalSource format so we can use the base matching logic
   */
  private convertWebsiteMetadataToExternalSource(websiteMetadata: WebsiteMetadata): ExternalSource {
    return {
      id: websiteMetadata.url,
      source: 'website',
      url: websiteMetadata.url,
      metadata: {
        'id': websiteMetadata.url,
        'type': 'webpage',
        'title': websiteMetadata.title,
        'author': websiteMetadata.authors?.map(author => ({
          family: author,
        })),
        'issued': websiteMetadata.publishedDate
          ? {
              'date-parts': [[
                websiteMetadata.publishedDate.getFullYear(),
                websiteMetadata.publishedDate.getMonth() + 1,
                websiteMetadata.publishedDate.getDate(),
              ]],
            }
          : undefined,
        'container-title': websiteMetadata.siteName,
        'URL': websiteMetadata.url,
      },
    }
  }

  /**
   * Match reference against website metadata using the base AI matching logic
   */
  private async matchWebsiteWithAI(
    reference: MatchingReference,
    websiteMetadata: WebsiteMetadata,
    matchingSettings: APIMatchingSettings,
  ): Promise<{ details: MatchDetails }> {
    // Convert WebsiteMetadata to ExternalSource format
    const externalSource = this.convertWebsiteMetadataToExternalSource(websiteMetadata)

    const matchDetails = await this.deterministicMatchingService.matchReference(reference, externalSource, matchingSettings)

    return {
      details: matchDetails,
    }
  }
}
