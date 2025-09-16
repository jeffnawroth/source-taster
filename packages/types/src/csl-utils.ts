/**
 * Shared CSL (Citation Style Language) utilities
 * Used by both frontend (display formatting) and backend (normalization/matching)
 */

import type { CSLDate, CSLName } from './index.js'

/**
 * Core CSL name stringification - combines all name parts in correct order
 * Used as base for both display formatting and comparison/matching
 */
export function stringifyCSLName(author: CSLName | string): string {
  // Handle string inputs (fallback for malformed data)
  if (typeof author === 'string') {
    return author
  }

  // If there's a literal name, use that first (highest priority)
  if (author.literal) {
    return author.literal
  }

  // Build name parts in standardized order according to CSL specification
  const nameParts: string[] = []

  // Add given name (first name)
  if (author.given) {
    nameParts.push(author.given)
  }

  // Add non-dropping particle (stays with family name, e.g., "van" in "van der Berg")
  if (author['non-dropping-particle']) {
    nameParts.push(author['non-dropping-particle'])
  }

  // Add family name (last name)
  if (author.family) {
    nameParts.push(author.family)
  }

  // Add dropping particle (usually "de", "van", etc. - can be dropped in abbreviated forms)
  if (author['dropping-particle']) {
    nameParts.push(author['dropping-particle'])
  }

  // Add suffix (Jr., Sr., III, etc.)
  if (author.suffix) {
    nameParts.push(author.suffix)
  }

  return nameParts.filter(Boolean).join(' ')
}

/**
 * Core CSL date stringification - handles all CSL date formats
 * Used as base for both display formatting and comparison/matching
 *
 * Priority order (based on CSL specification and practical usage):
 * 1. raw (unparsed date string) - highest priority
 * 2. literal (explicitly formatted date string)
 * 3. season (seasonal dating)
 * 4. circa (approximate dating) with date-parts if available
 * 5. date-parts (structured date: year, month, day)
 */
export function stringifyCSLDate(date: CSLDate | string): string {
  // Handle string inputs (EDTF format or plain strings)
  if (typeof date === 'string') {
    return date
  }

  // Priority 1: Raw date (unparsed date string)
  if (date.raw) {
    return date.raw
  }

  // Priority 2: Literal date (explicitly formatted)
  if (date.literal) {
    return date.literal
  }

  // Priority 3: Season
  if (date.season) {
    const seasonString = String(date.season)
    // Handle circa with season
    if (date.circa) {
      const circaPrefix = date.circa === true ? 'ca. ' : `${String(date.circa)} `
      return circaPrefix + seasonString
    }
    return seasonString
  }

  // Priority 4: Circa with date-parts
  if (date.circa) {
    const circaPrefix = date.circa === true ? 'ca. ' : `${String(date.circa)} `
    // If we have date-parts, combine with circa
    if (date['date-parts'] && date['date-parts'][0]) {
      return circaPrefix + date['date-parts'][0].join('-')
    }
    return circaPrefix.trim()
  }

  // Priority 5: Date-parts (structured date)
  if (date['date-parts'] && date['date-parts'][0]) {
    return date['date-parts'][0].join('-')
  }

  // No valid date information found
  return ''
}

/**
 * Generic CSL value stringification - handles any CSL data structure
 * Used by backend for normalization and comparison
 */
export function stringifyCSLValue(value: unknown): string {
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
    return value.map(item => stringifyCSLValue(item)).join(' ')
  }

  if (typeof value === 'object') {
    // Handle CSL name objects
    if ('family' in value || 'given' in value) {
      return stringifyCSLName(value as CSLName)
    }

    // Handle CSL date objects
    // Recognize any CSL date shape: date-parts, raw, literal, season, circa
    if (
      'date-parts' in value
      || 'raw' in value
      || 'literal' in value
      || 'season' in value
      || 'circa' in value
    ) {
      return stringifyCSLDate(value as CSLDate)
    }

    // Fallback for other objects
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * Extract year from CSL date for compact display
 * Used by frontend for subtitle/compact views
 */
export function extractYearFromCSLDate(date: CSLDate | string | undefined): string | null {
  if (!date) {
    return null
  }

  // Handle string dates
  if (typeof date === 'string') {
    const yearMatch = date.match(/\d{4}/)
    return yearMatch ? yearMatch[0] : date
  }

  // Handle CSL date structure - extract year only from date-parts
  if (date['date-parts']?.[0]?.[0]) {
    return date['date-parts'][0][0].toString()
  }

  // Handle literal dates - try to extract year
  if (date.literal) {
    const yearMatch = date.literal.match(/\d{4}/)
    return yearMatch ? yearMatch[0] : date.literal
  }

  // Handle raw dates - try to extract year
  if (date.raw) {
    const yearMatch = date.raw.match(/\d{4}/)
    return yearMatch ? yearMatch[0] : date.raw
  }

  return null
}

/**
 * Format CSL Date with user-friendly display formatting (UI version)
 * Converts month numbers to names and provides better formatting for display
 */
export function formatCSLDateForDisplay(dateValue: CSLDate | string | any): string | null {
  if (!dateValue) {
    return null
  }

  // Handle string dates (EDTF format)
  if (typeof dateValue === 'string') {
    return dateValue
  }

  // Handle CSL date structure with UI-friendly formatting
  if (dateValue['date-parts'] && dateValue['date-parts'][0]) {
    const dateParts = dateValue['date-parts'][0]
    const year = dateParts[0]
    const month = dateParts[1]
    const day = dateParts[2]

    const parts: string[] = []

    // Add day if available
    if (day) {
      parts.push(day.toString())
    }

    // Add month if available (convert number to name for better UX)
    if (month) {
      if (typeof month === 'number') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        parts.push(monthNames[month - 1] || month.toString())
      }
      else {
        parts.push(month.toString())
      }
    }

    // Add year if available
    if (year) {
      parts.push(year.toString())
    }

    const dateString = parts.join(' ') || ''

    // Handle circa prefix if present
    if (dateValue.circa) {
      const circaPrefix = dateValue.circa === true ? 'ca. ' : `${dateValue.circa.toString()} `
      return circaPrefix + dateString
    }

    return dateString || null
  }

  // For all other cases (raw, literal, season, circa-only), use base stringification
  const result = stringifyCSLDate(dateValue)
  return result || null
}

/**
 * Format authors for compact display (used in subtitles and lists)
 * Shows first 2 authors + "et al." if more than 2
 */
export function formatAuthorsCompact(authors: (CSLName | string)[]): string | null {
  if (!authors || authors.length === 0) {
    return null
  }

  if (authors.length > 2) {
    const first2Authors = authors.slice(0, 2).map(author => stringifyCSLName(author))
    return `${first2Authors.join(', ')} et al.`
  }

  return authors.map(author => stringifyCSLName(author)).join(', ')
}
