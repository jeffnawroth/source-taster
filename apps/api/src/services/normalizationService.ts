import type { NormalizationRule } from '@source-taster/types'

/**
 * Service for manual text normalization
 * Replaces AI-based normalization with algorithmic implementations
 */
export class NormalizationService {
  /**
   * Apply selected normalization rules to text
   */
  public normalize(text: string, rules: NormalizationRule[]): string {
    let normalizedText = text

    for (const rule of rules) {
      normalizedText = this.applyRule(normalizedText, rule)
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
      case 'normalize-title-case':
        return this.normalizeCase(text)
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
    normalizedText = this.normalizeSmartQuotes(normalizedText)
    normalizedText = this.normalizeDashes(normalizedText)
    normalizedText = this.normalizeEllipsis(normalizedText)
    normalizedText = this.normalizeApostrophes(normalizedText)
    normalizedText = this.normalizeSpaces(normalizedText)
    normalizedText = this.normalizeOtherTypography(normalizedText)

    return normalizedText
  }

  /**
   * Normalize smart quotes to regular quotes
   * Example: ""Smart quotes"" → "Smart quotes"
   */
  private normalizeSmartQuotes(text: string): string {
    return text
      .replace(/[\u201C\u201D]/g, '"') // left and right double quotes
      .replace(/[\u2018\u2019]/g, '\'') // left and right single quotes
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
   * Normalize various apostrophes to regular apostrophes
   * Example: "´accent" → "'", "`grave" → "'"
   */
  private normalizeApostrophes(text: string): string {
    return text.replace(/[\u00B4\u0060]/g, '\'')
  }

  /**
   * Normalize non-breaking spaces to regular spaces
   */
  private normalizeSpaces(text: string): string {
    return text.replace(/\u00A0/g, ' ')
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
   * Normalize text to lowercase for case-insensitive matching
   * Example: "The Impact Of AI" → "the impact of ai"
   */
  private normalizeCase(text: string): string {
    return text.toLowerCase()
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
   * Normalize DOI identifiers
   * Example: "https://doi.org/10.1000/xyz123" → "10.1000/xyz123"
   */
  private normalizeDOI(text: string): string {
    return text
      .replace(/https?:\/\/(www\.)?doi\.org\//gi, '')
      .replace(/doi:\s*/gi, '')
  }

  /**
   * Normalize ISBN identifiers
   * Example: "ISBN: 978-0-123456-78-9" → "978-0-123456-78-9"
   */
  private normalizeISBN(text: string): string {
    return text.replace(/ISBN[-:\s]*/gi, '')
  }

  /**
   * Normalize ISSN identifiers
   * Example: "ISSN: 1234-5678" → "1234-5678"
   */
  private normalizeISSN(text: string): string {
    return text.replace(/ISSN[-:\s]*/gi, '')
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
   * Normalize arXiv identifiers
   * Example: "arXiv: 2001.12345" → "2001.12345"
   */
  private normalizeArXiv(text: string): string {
    return text.replace(/arXiv[-:\s]*/gi, '')
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
   * Fix smart typography encoding artifacts
   * Example: "â€™" → "'", "â€œ" → '"'
   */
  private normalizeSmartTypography(text: string): string {
    const smartTypographyFixes: Record<string, string> = {
      'â€™': '\'', // smart quote
      'â€œ': '"', // left double quote
      'â€\u009D': '"', // right double quote
      'â€"': '–', // en dash
      'â€¦': '...', // ellipsis
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
   * Replace multiple spaces with single space
   * Example: "This    is  a  test" → "This is a test"
   */
  private normalizeMultipleSpaces(text: string): string {
    return text.replace(/\s+/g, ' ')
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
      .replace(/ß/g, 'ss')
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
   * Convert value to string and apply normalization rules in one step
   * This is the main method for normalized value comparison
   */
  public normalizeValue(value: unknown, rules: NormalizationRule[]): string {
    const stringValue = this.stringifyValue(value)
    return this.normalize(stringValue, rules)
  }
}
