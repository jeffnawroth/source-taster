import type {
  ArchivedVersion,
  FieldWeights,
  Reference,
  WebsiteMetadata,
  WebsiteVerificationResult,
} from '@source-taster/types'
import * as cheerio from 'cheerio'
import { AIServiceFactory } from './ai/aiServiceFactory'

export interface WebsiteVerificationOptions {
  /** Maximum time to wait for website response in milliseconds */
  timeout?: number
  /** Whether to check Wayback Machine if URL is unavailable */
  enableWaybackMachine?: boolean
  /** User agent string for HTTP requests */
  userAgent?: string
}

/**
 * Service for verifying references against website content
 * Handles URL accessibility, metadata extraction, and content matching
 */
export class WebsiteVerificationService {
  private readonly defaultOptions: Required<WebsiteVerificationOptions> = {
    timeout: 10000, // 10 seconds
    enableWaybackMachine: true,
    userAgent: 'Source-Taster-Bot/1.0 (https://source-taster.app)',
  }

  // Default field weights for website verification - adapted for web content
  private readonly defaultFieldWeights: FieldWeights = {
    title: 35, // Most important for websites - 35%
    authors: 20, // Important but less reliable on websites - 20%
    year: 10, // Moderately important - 10%
    doi: 8, // Less common on websites - 8%
    containerTitle: 5, // Less relevant for websites - 5%
    volume: 1, // Rarely on websites - 1%
    issue: 1, // Rarely on websites - 1%
    pages: 1, // Rarely on websites - 1%
    arxivId: 5, // Less common on websites - 5%
    pmid: 3, // Uncommon on websites - 3%
    pmcid: 3, // Uncommon on websites - 3%
    isbn: 3, // Less common on websites - 3%
    issn: 2, // Uncommon on websites - 2%
    url: 15, // Important for website verification - 15%
    description: 8, // Useful for content matching - 8%
  }

  /**
   * Verify a reference against a website URL
   */
  async verifyWebsiteReference(
    reference: Reference,
    url: string,
    aiService: 'openai' | 'gemini',
    options?: WebsiteVerificationOptions,
  ): Promise<WebsiteVerificationResult> {
    const opts = { ...this.defaultOptions, ...options }

    try {
      // First, try to fetch the current website
      const websiteMetadata = await this.extractWebsiteMetadata(url, opts)

      if (websiteMetadata) {
        console.warn(`Extracted metadata for ${url}:`, JSON.stringify(websiteMetadata, null, 2))
        const matchResult = await this.verifyWithAI(reference, websiteMetadata, aiService)
        console.warn(`AI verification result:`, JSON.stringify(matchResult, null, 2))
        return {
          referenceId: reference.id,
          url,
          isAccessible: true,
          websiteMetadata,
          isVerified: matchResult.isMatch,
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
          const matchResult = await this.verifyWithAI(reference, archivedVersion.metadata, aiService)
          return {
            referenceId: reference.id,
            url,
            isAccessible: false,
            websiteMetadata: archivedVersion.metadata,
            isVerified: matchResult.isMatch,
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
      referenceId: reference.id,
      url,
      isAccessible: false,
      websiteMetadata: undefined,
      isVerified: false,
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
    options: Required<WebsiteVerificationOptions>,
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
   * Verify reference against website metadata using AI
   */
  private async verifyWithAI(
    reference: Reference,
    websiteMetadata: WebsiteMetadata,
    aiService: 'openai' | 'gemini',
  ) {
    const aiServiceInstance = AIServiceFactory.create(aiService)

    // Get the fields that should be evaluated and their weights
    const availableFields = this.getAvailableFields(reference, websiteMetadata)
    const fieldWeights = this.getFieldWeightsForAvailableFields(availableFields)

    const prompt = `Compare the following bibliographic reference with the website metadata to determine if they refer to the same work.

REFERENCE:
${reference.originalText}

Parsed Reference Data:
- title: ${reference.metadata.title || 'N/A'}
- authors: ${reference.metadata.authors?.map(a => typeof a === 'string' ? a : `${a.firstName || ''} ${a.lastName}`.trim()).join(', ') || 'N/A'}
- publication-date: ${reference.metadata.date.year || 'N/A'}
- url: ${reference.metadata.source.url || 'N/A'}

WEBSITE METADATA:
- title: ${websiteMetadata.title || 'N/A'}
- authors: ${websiteMetadata.authors?.join(', ') || 'N/A'}
- publication-date: ${websiteMetadata.publishedDate?.toISOString().split('T')[0] || 'N/A'}
- webpage: ${websiteMetadata.siteName || 'N/A'}
- url: ${websiteMetadata.url}
- description: ${websiteMetadata.description || 'N/A'}

IMPORTANT RULES:
- Only evaluate fields that are present in both reference and website metadata
- This prevents unfair penalties when website data is incomplete
- Focus on comparing the available data fairly

Available fields to evaluate: ${availableFields.join(', ')}

Scoring Guidelines for each field (0-100):
• title: 100=identical, 90=very similar, 70=similar core meaning, 50=related, 0=completely different
• authors: 100=all match exactly, 80=most surnames match, 60=some match, 40=few match, 0=none match
• year: 100=exact match, 0=different (no partial scoring for year)
• url: 100=identical, 90=same domain different path, 70=related URLs, 0=different domains
• description: 100=highly relevant, 80=relevant, 60=somewhat relevant, 40=loosely related, 0=unrelated
• doi: 100=identical, 0=different (no partial scoring for DOI)
• containerTitle: 100=identical, 90=same publication different format, 70=abbreviated vs full name, 0=different

For each field, provide:
- reference_value: The value from the reference
- source_value: The value from the website
- match_score: Score from 0-100 (0=no match, 100=perfect match)

Consider partial matches, fuzzy matching, and semantic similarity.
Missing values should be scored appropriately (e.g., 50 if one value is missing but not contradictory).

Return as JSON with fieldDetails array containing objects with: field, reference_value, source_value, match_score.
`

    const response = await aiServiceInstance.verifyMatch(prompt)

    try {
      const parsed = JSON.parse(response)

      // Ensure fieldDetails have weights assigned (from our calculation)
      const fieldDetails = (parsed.fieldDetails || []).map((detail: any) => ({
        ...detail,
        weight: fieldWeights[detail.field] || 0,
      }))

      // Calculate the overall score ourselves using proper weights
      const overallScore = this.calculateOverallScore(fieldDetails)

      // Derive fieldsEvaluated from fieldDetails
      const fieldsEvaluated = fieldDetails.map((detail: any) => detail.field)

      // Create match details from AI response with our calculated score
      const matchDetails = {
        overallScore,
        fieldsEvaluated,
        fieldDetails,
      }

      // Use overall score for determining match (threshold can be adjusted)
      const isMatch = overallScore >= 70 // Default threshold for website verification

      return {
        isMatch,
        details: matchDetails,
      }
    }
    catch (error) {
      console.error('Failed to parse AI response:', error)
      return {
        isMatch: false,
        details: {
          overallScore: 0,
        },
      }
    }
  }

  /**
   * Get the fields that should be evaluated for matching between reference and website
   * Only evaluate fields that are present in both reference and website metadata
   * This prevents unfair penalties when website metadata is incomplete
   */
  private getAvailableFields(reference: Reference, websiteMetadata: WebsiteMetadata): string[] {
    const fields: string[] = []

    // Core fields
    if (reference.metadata.title && websiteMetadata.title) {
      fields.push('title')
    }
    if (reference.metadata.authors && reference.metadata.authors.length > 0
      && websiteMetadata.authors && websiteMetadata.authors.length > 0) {
      fields.push('authors')
    }
    if (reference.metadata.date.year && websiteMetadata.publishedDate) {
      fields.push('year')
    }

    // URL comparison
    if (reference.metadata.source.url && websiteMetadata.url) {
      fields.push('url')
    }

    // Description comparison
    if ((reference.metadata.title || reference.originalText) && websiteMetadata.description) {
      fields.push('description')
    }

    // Identifier fields (less common on websites but possible)
    if (reference.metadata.identifiers?.doi) {
      fields.push('doi')
    }

    // Source fields (uncommon but possible on websites)
    if (reference.metadata.source.containerTitle && websiteMetadata.siteName) {
      fields.push('containerTitle')
    }

    return fields
  }

  /**
   * Get field weights for all fields that should be evaluated
   */
  private getFieldWeightsForAvailableFields(availableFields: string[]): Record<string, number> {
    const weights: Record<string, number> = {}

    for (const field of availableFields) {
      const weight = this.defaultFieldWeights[field as keyof FieldWeights]
      if (typeof weight === 'number') {
        weights[field] = weight
      }
    }

    return weights
  }

  /**
   * Calculate the overall weighted score from field details
   */
  private calculateOverallScore(fieldDetails: Array<{ match_score: number, weight: number }>): number {
    if (fieldDetails.length === 0)
      return 0

    let totalWeightedScore = 0
    let totalWeight = 0

    for (const detail of fieldDetails) {
      totalWeightedScore += detail.match_score * detail.weight
      totalWeight += detail.weight
    }

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
  }
}
