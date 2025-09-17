import type { NormalizationRule } from '@source-taster/types'
import normalizeUrl from 'normalize-url'

/**
 * Service for manual text normalization
 * Replaces AI-based normalization with algorithmic implementations
 */
export class NormalizationService {
  /**
   * Apply selected normalization rules to text in a consistent order
   * Rules that conflict (like umlauts vs accents) are applied in a deterministic sequence
   */
  public normalize(text: string, rules: NormalizationRule[]): string {
    // Define the canonical order for applying rules to avoid conflicts
    // This ensures consistent results regardless of input rule order
    const ruleOrder: NormalizationRule[] = [
      'normalize-typography', // First: Fix encoding issues
      'normalize-characters', // Second: Fix corrupted characters
      'normalize-urls', // Third: Normalize URLs
      'normalize-identifiers', // Fourth: Clean identifiers
      'normalize-umlauts', // Fifth: Umlauts before accents (preserves semantic meaning)
      'normalize-accents', // Sixth: Remove remaining accents
      'normalize-unicode', // Seventh: Unicode normalization
      'normalize-punctuation', // Eighth: Punctuation cleanup
      'normalize-whitespace', // Ninth: Whitespace normalization
      'normalize-lowercase', // Last: Case normalization (affects everything)
    ]

    let normalizedText = text

    // Apply rules in canonical order, but only if they're requested
    for (const rule of ruleOrder) {
      if (rules.includes(rule)) {
        normalizedText = this.applyRule(normalizedText, rule)
      }
    }

    return normalizedText
  }

  /**
   * Apply a single normalization rule
   */
  private applyRule(text: string, rule: NormalizationRule): string {
    switch (rule) {
      case 'normalize-typography':
        return this.normalizeTypography(text)
      case 'normalize-lowercase':
        return this.normalizeLowercase(text)
      case 'normalize-identifiers':
        return this.normalizeIdentifiers(text)
      case 'normalize-characters':
        return this.normalizeCharacters(text)
      case 'normalize-whitespace':
        return this.normalizeWhitespace(text)
      case 'normalize-accents':
        return this.normalizeAccents(text)
      case 'normalize-umlauts':
        return this.normalizeUmlauts(text)
      case 'normalize-punctuation':
        return this.normalizePunctuation(text)
      case 'normalize-unicode':
        return this.normalizeUnicode(text)
      case 'normalize-urls':
        return this.normalizeUrls(text)
      default:
        return text
    }
  }

  /**
   * Fix common encoding issues (smart quotes, em dashes, etc.)
   * Example: ""Smart quotes"" → "Smart quotes", "—em dash" → "-"
   */
  private normalizeTypography(text: string): string {
    let normalizedText = text

    // Apply all typography normalization functions
    normalizedText = this.normalizeQuotesAndApostrophes(normalizedText)
    normalizedText = this.normalizeDashes(normalizedText)
    normalizedText = this.normalizeEllipsis(normalizedText)
    normalizedText = this.normalizeSpaces(normalizedText)
    normalizedText = this.normalizeOtherTypography(normalizedText)

    return normalizedText
  }

  /**
   * Normalize smart quotes, apostrophes, and accent characters to regular ASCII equivalents
   * Combines functionality for all quote-like characters for better maintainability
   * Example: ""Smart quotes"" → "Smart quotes", "´accent" → "'"
   */
  private normalizeQuotesAndApostrophes(text: string): string {
    return text
      // Smart quotes (typographic quotes)
      .replace(/[\u201C\u201D]/g, '"') // left and right double quotes → "
      .replace(/[\u2018\u2019]/g, '\'') // left and right single quotes → '
      // Accent characters often misused as apostrophes
      .replace(/[\u00B4\u0060]/g, '\'') // acute accent (´) and grave accent (`) → '
  }

  /**
   * Normalize em and en dashes to regular dashes
   * Example: "—em dash" → "-", "–en dash" → "-"
   */
  private normalizeDashes(text: string): string {
    return text.replace(/[\u2013\u2014]/g, '-')
  }

  /**
   * Normalize ellipsis to three periods
   * Example: "…ellipsis" → "..."
   */
  private normalizeEllipsis(text: string): string {
    return text.replace(/\u2026/g, '...')
  }

  /**
   * Normalize all Unicode whitespace characters to regular spaces
   */
  private normalizeSpaces(text: string): string {
    return text
      // Common Unicode whitespace characters
      .replace(/\u00A0/g, ' ') // Non-breaking space (NBSP)
      .replace(/\u202F/g, ' ') // Narrow no-break space
      .replace(/\u2007/g, ' ') // Figure space
      .replace(/\u2002/g, ' ') // En quad
      .replace(/\u2003/g, ' ') // Em quad
      .replace(/\u2004/g, ' ') // Three-per-em space
      .replace(/\u2005/g, ' ') // Four-per-em space
      .replace(/\u2006/g, ' ') // Six-per-em space
      .replace(/\u2008/g, ' ') // Punctuation space
      .replace(/\u2009/g, ' ') // Thin space
      .replace(/\u200A/g, ' ') // Hair space
      .replace(/\u3000/g, ' ') // Ideographic space (CJK)
      // Line separators and paragraph separators
      .replace(/\u2028/g, ' ') // Line separator
      .replace(/\u2029/g, ' ') // Paragraph separator
      // Other Unicode spaces
      .replace(/\u180E/g, ' ') // Mongolian vowel separator
      .replace(/\uFEFF/g, '') // Zero-width no-break space (BOM) - remove completely
  }

  /**
   * Normalize other common typography issues
   */
  private normalizeOtherTypography(text: string): string {
    return text
      .replace(/\u201A/g, '\'') // single low-9 quotation mark
      .replace(/\u201E/g, '"') // double low-9 quotation mark
  }

  /**
   * Normalize text to lowercase with proper Unicode case-folding
   * Uses Intl.Collator for robust international case handling
   */
  private normalizeLowercase(text: string): string {
    // Manual handling of special Unicode case mappings that even Intl doesn't handle
    const specialCases = text
      // German Eszett mappings
      .replace(/ß/g, 'ss')
      .replace(/ẞ/g, 'ss')

      // Mathematical symbols that should fold to letters
      .replace(/\u212A/g, 'k') // Kelvin sign → k
      .replace(/\u2126/g, 'ω') // Ohm sign → omega
      .replace(/\u212B/g, 'å') // Angstrom sign → å

      // Use toLocaleLowerCase for proper Unicode case conversion
      .toLocaleLowerCase()

    return specialCases
  }

  /**
   * Standardize external identifiers (DOI, ISBN, ISSN, etc.)
   * Example: "https://doi.org/10.1000/xyz123" → "10.1000/xyz123"
   */
  private normalizeIdentifiers(text: string): string {
    let normalizedText = text

    // Apply all identifier normalization functions
    normalizedText = this.normalizeDOI(normalizedText)
    normalizedText = this.normalizeISBN(normalizedText)
    normalizedText = this.normalizeISSN(normalizedText)
    normalizedText = this.normalizePMID(normalizedText)
    normalizedText = this.normalizePMCID(normalizedText)
    normalizedText = this.normalizeArXiv(normalizedText)

    // Final cleanup
    return normalizedText
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Normalize DOI identifiers with proper extraction and cleaning
   * Handles embedded whitespace and extracts DOIs from mixed text
   */
  private normalizeDOI(text: string): string {
    return text.replace(/(?:https?:\/\/(?:www\.)?doi\.org\/|doi:\s*)(\d{2}\.\d+\/\S+)/gi, (_match, doi) => {
      // Clean the extracted DOI: remove internal whitespace and normalize
      return doi
        .replace(/\s+/g, '') // Remove all whitespace
        .toLowerCase() // Normalize case
        .replace(/[<>{}|\\^`[\]]/g, '') // Remove invalid URL characters
    }).replace(/doi:\s*/gi, '') // Clean any remaining doi: prefixes
  }

  /**
   * Normalize ISBN identifiers with hyphen/space consolidation
   * Extracts and normalizes to clean digit-only format
   */
  private normalizeISBN(text: string): string {
    return text.replace(/ISBN[-:\s]*([\dX\-\s]+)/gi, (_match, isbn) => {
      // Extract only digits and X (for ISBN-10 check digit)
      const cleaned = isbn.replace(/[^\dX]/gi, '').toUpperCase()

      // Validate length (ISBN-10: 10 digits, ISBN-13: 13 digits)
      if (cleaned.length === 10 || cleaned.length === 13) {
        return cleaned
      }
      // If invalid, return original match
      return _match
    })
  }

  /**
   * Normalize ISSN identifiers with proper format validation
   * Standard format: NNNN-NNNN
   */
  private normalizeISSN(text: string): string {
    return text.replace(/ISSN[-:\s]*([\dX\-\s]+)/gi, (_match, issn) => {
      // Extract digits and X
      const digits = issn.replace(/[^\dX]/gi, '').toUpperCase()

      // ISSN should be exactly 8 characters (7 digits + 1 check digit which can be X)
      if (digits.length === 8) {
        // Format as NNNN-NNNN
        return `${digits.slice(0, 4)}-${digits.slice(4)}`
      }
      // If invalid, return original match
      return _match
    })
  }

  /**
   * Normalize PMID identifiers
   * Example: "PMID: 12345678" → "12345678"
   */
  private normalizePMID(text: string): string {
    return text.replace(/PMID[-:\s]*/gi, '')
  }

  /**
   * Normalize PMCID identifiers
   * Example: "PMCID: PMC123456" → "PMC123456"
   */
  private normalizePMCID(text: string): string {
    return text.replace(/PMCID[-:\s]*PMC/gi, 'PMC')
  }

  /**
   * Normalize arXiv identifiers with version handling
   * Extracts clean arXiv ID and removes version numbers for better matching
   * Example: "arXiv:2001.12345v2" → "2001.12345"
   */
  private normalizeArXiv(text: string): string {
    return text.replace(/arXiv[-:\s]*(\d{4}\.\d{4,5})(?:v\d+)?/gi, (_match, arxivId) => {
      // Return just the core arXiv ID without version
      return arxivId
    })
  }

  /**
   * Normalize corrupted or misencoded characters
   * Example: "GrÃ¼n" → "Grün"
   */
  private normalizeCharacters(text: string): string {
    let normalizedText = text

    // Apply all character normalization functions
    normalizedText = this.normalizeUTF8Encoding(normalizedText)
    normalizedText = this.normalizeSmartTypography(normalizedText)

    return normalizedText
  }

  /**
   * Fix common UTF-8 encoding issues
   * Example: "GrÃ¼n" → "Grün", "cafÃ©" → "café"
   */
  private normalizeUTF8Encoding(text: string): string {
    const utf8Fixes: Record<string, string> = {
      'Ã¼': 'ü', // GrÃ¼n → Grün
      'Ã¶': 'ö', // schÃ¶n → schön
      'Ã¤': 'ä', // mÃ¤chtig → mächtig
      'Ã©': 'é', // cafÃ© → café
      'Ã¨': 'è', // crÃ¨me → crème
      'Ã¡': 'á', // María → María
      'Ã ': 'à', // à → à
      'Ã§': 'ç', // français → français
      'Ã±': 'ñ', // España → España
    }

    let fixedText = text
    for (const [corrupted, correct] of Object.entries(utf8Fixes)) {
      fixedText = fixedText.replace(new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correct)
    }

    return fixedText
  }

  /**
   * Fix smart typography encoding artifacts with direct ASCII mappings
   * Avoids ping-pong normalization by mapping directly to final ASCII forms
   * Example: "â€™" → "'", "â€œ" → '"'
   */
  private normalizeSmartTypography(text: string): string {
    const smartTypographyFixes: Record<string, string> = {
      'â€™': '\'', // Corrupted smart quote → ASCII apostrophe (skip Unicode intermediate)
      'â€œ': '"', // Corrupted left double quote → ASCII quote
      'â€\u009D': '"', // Corrupted right double quote → ASCII quote
      'â€"': '-', // Corrupted en dash → ASCII dash (skip Unicode en-dash intermediate)
      'â€¦': '...', // Corrupted ellipsis → ASCII periods
    }

    let fixedText = text
    for (const [corrupted, correct] of Object.entries(smartTypographyFixes)) {
      fixedText = fixedText.replace(new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correct)
    }

    return fixedText
  }

  /**
   * Normalize whitespace (remove duplicated spaces, trim, etc.)
   * Example: "This    is a  test." → "This is a test."
   */
  private normalizeWhitespace(text: string): string {
    let normalizedText = text

    // Apply all whitespace normalization functions
    normalizedText = this.normalizeMultipleSpaces(normalizedText)
    normalizedText = this.normalizeTrimSpaces(normalizedText)
    normalizedText = this.normalizeSoftLineBreaks(normalizedText)
    normalizedText = this.normalizeMultipleLineBreaks(normalizedText)

    return normalizedText
  }

  /**
   * Replace multiple spaces with single space (preserves line breaks)
   * Example: "This    is  a  test" → "This is a test"
   * Note: Uses [ \t]+ instead of \s+ to preserve \n for paragraph handling
   */
  private normalizeMultipleSpaces(text: string): string {
    return text.replace(/[ \t]+/g, ' ')
  }

  /**
   * Remove leading and trailing whitespace
   * Example: "  text  " → "text"
   */
  private normalizeTrimSpaces(text: string): string {
    return text.trim()
  }

  /**
   * Remove soft line breaks within inline text but preserve paragraph breaks
   * Example: "line1\nline2" → "line1 line2"
   */
  private normalizeSoftLineBreaks(text: string): string {
    return text.replace(/([^\n])\n([^\n])/g, '$1 $2')
  }

  /**
   * Clean up multiple line breaks (preserve double line breaks as paragraph separators)
   * Example: "para1\n\n\n\npara2" → "para1\n\npara2"
   */
  private normalizeMultipleLineBreaks(text: string): string {
    return text.replace(/\n{3,}/g, '\n\n')
  }

  /**
   * Remove diacritical marks and accents for better matching
   * Example: "naïve café résumé" → "naive cafe resume"
   */
  private normalizeAccents(text: string): string {
    // Decompose to NFD (separate base chars from combining marks), remove combining marks, recompose to NFC
    return text.normalize('NFD').replace(/[\u0300-\u036F]/g, '').normalize('NFC')
  }

  /**
   * Convert German/European umlauts and special characters to ASCII equivalents
   * Example: "Müller Schrödinger über Björk" → "Mueller Schroedinger ueber Bjoerk"
   */
  private normalizeUmlauts(text: string): string {
    return text
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/Ä/g, 'Ae')
      .replace(/Ö/g, 'Oe')
      .replace(/Ü/g, 'Ue')
      // Nordic characters
      .replace(/å/g, 'aa')
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'oe')
      .replace(/Å/g, 'Aa')
      .replace(/Æ/g, 'Ae')
      .replace(/Ø/g, 'Oe')
  }

  /**
   * Normalize punctuation for better text matching
   * Example: "COVID-19: Study, Results & Analysis!" → "COVID-19 Study Results Analysis"
   */
  private normalizePunctuation(text: string): string {
    return text
      // Remove most punctuation but keep letters, numbers, spaces, dashes, and quotes
      // This matches the behavior of normalize.ts stripPunctuation with keepDigits=true
      .replace(/[^\p{L}\p{N}\s\-"]/gu, ' ')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Apply Unicode normalization for consistent character representation
   * Example: Different Unicode representations of same visual character → consistent form
   */
  private normalizeUnicode(text: string): string {
    return text
      // NFKC: Canonical decomposition, then canonical composition + compatibility equivalence
      .normalize('NFKC')
      // Remove zero-width characters that might interfere with matching
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // ZWSP, ZWNJ, ZWJ, BOM
      // Remove other invisible/formatting characters
      .replace(/[\u00AD\u2060]/g, '') // Soft hyphen, word joiner
  }

  /**
   * Convert CSL values to strings for comparison, handling CSL-specific data types
   * This method handles structure conversion without normalization
   */
  public stringifyValue(value: unknown): string {
    if (value === null || value === undefined) {
      return ''
    }

    if (typeof value === 'string') {
      return value
    }

    if (typeof value === 'number') {
      return value.toString()
    }

    if (Array.isArray(value)) {
      return value.map(item => this.stringifyValue(item)).join(' ')
    }

    if (typeof value === 'object') {
      // For CSL name objects, combine given and family names
      if ('family' in value || 'given' in value) {
        const author = value as { family?: string, given?: string, literal?: string }

        // If there's a literal name, use that
        if (author.literal) {
          return author.literal
        }

        // Otherwise combine given and family names
        return [author.given, author.family].filter(Boolean).join(' ')
      }

      // For CSL date objects
      if ('date-parts' in value) {
        const date = value as { 'date-parts'?: number[][], 'literal'?: string }

        // If there's a literal date, use that
        if (date.literal) {
          return date.literal
        }

        // Otherwise format date-parts
        if (date['date-parts'] && date['date-parts'][0]) {
          return date['date-parts'][0].join('-')
        }
      }

      return JSON.stringify(value)
    }

    return String(value)
  }

  /**
   * Normalize URLs for consistent comparison using normalize-url package
   * Optimized for academic references (DOIs, ArXiv, journals, etc.)
   */
  private normalizeUrls(text: string): string {
    // URL regex pattern - matches http/https URLs
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi

    return text.replace(urlRegex, (url) => {
      try {
        // Use normalize-url with academic-optimized settings
        return normalizeUrl(url, {
          // Remove fragments (like #comments, #section) - not relevant for matching
          stripHash: true,
          // Keep WWW for institutional sites that need it
          stripWWW: false,
          // Remove tracking parameters but keep important ones
          removeQueryParameters: [
            /^utm_/i, // UTM tracking
            /^fbclid/i, // Facebook
            /^gclid/i, // Google
            /^ref/i, // Generic referrer
            /^campaign/i, // Campaign tracking
          ],
          // Sort query parameters for consistency
          sortQueryParameters: true,
        })
      }
      catch {
        // If URL parsing fails, return original URL
        return url
      }
    })
  }

  /**
   * Convert value to string and apply normalization rules in one step
   * This is the main method for normalized value comparison
   */
  public normalizeValue(value: unknown, rules: NormalizationRule[]): string {
    const stringValue = this.stringifyValue(value)
    return this.normalize(stringValue, rules)
  }
}
