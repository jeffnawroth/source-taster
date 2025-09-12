/**
 * CSL formatting utilities for consistent display across components
 */

/**
 * Format a CSL Date object to display string with all date parts
 * Matches the backend normalization logic for consistency
 */
export function formatCSLDate(dateValue: any): string | null {
  if (!dateValue) {
    return null
  }

  // Handle string dates (EDTF format)
  if (typeof dateValue === 'string') {
    return dateValue
  }

  // Handle CSL date structure
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

    // Add month if available (convert number to name if needed)
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

  // Handle raw dates (unparsed date strings)
  if (dateValue.raw) {
    return dateValue.raw
  }

  // Handle literal dates
  if (dateValue.literal) {
    return dateValue.literal
  }

  // Handle season
  if (dateValue.season) {
    const seasonString = dateValue.season.toString()
    // Handle circa with season
    if (dateValue.circa) {
      const circaPrefix = dateValue.circa === true ? 'ca. ' : `${dateValue.circa.toString()} `
      return circaPrefix + seasonString
    }
    return seasonString
  }

  // Handle circa alone
  if (dateValue.circa) {
    const circaPrefix = dateValue.circa === true ? 'ca. ' : `${dateValue.circa.toString()} `
    return circaPrefix.trim()
  }

  return null
}

/**
 * Format a CSL Name object to display string with all name parts
 * Matches the backend normalization logic for consistency
 */
export function formatCSLName(author: any): string {
  if (typeof author === 'string') {
    return author
  }

  // If there's a literal name, use that first (highest priority)
  if (author.literal) {
    return author.literal
  }

  // Build name parts in order
  const nameParts: string[] = []

  // Add given name
  if (author.given) {
    nameParts.push(author.given)
  }

  // Add non-dropping particle (stays with family name)
  if (author['non-dropping-particle']) {
    nameParts.push(author['non-dropping-particle'])
  }

  // Add family name
  if (author.family) {
    nameParts.push(author.family)
  }

  // Add dropping particle (usually "de", "van", etc.)
  if (author['dropping-particle']) {
    nameParts.push(author['dropping-particle'])
  }

  // Add suffix
  if (author.suffix) {
    nameParts.push(author.suffix)
  }

  return nameParts.filter(Boolean).join(' ')
}

/**
 * Extract year from CSL date for compact display (used in subtitles)
 */
export function extractYear(dateValue: any): string | null {
  if (!dateValue)
    return null

  // Handle string dates
  if (typeof dateValue === 'string') {
    const yearMatch = dateValue.match(/\d{4}/)
    return yearMatch ? yearMatch[0] : dateValue
  }

  // Handle CSL date structure - extract year only
  if (dateValue['date-parts']?.[0]?.[0]) {
    return dateValue['date-parts'][0][0].toString()
  }

  // Handle literal dates
  if (dateValue.literal) {
    const yearMatch = dateValue.literal.match(/\d{4}/)
    return yearMatch ? yearMatch[0] : dateValue.literal
  }

  return null
}

/**
 * Format authors for compact display (used in subtitles)
 * Shows first 2 authors + "et al." if more than 2
 */
export function formatAuthorsCompact(authors: any[]): string | null {
  if (!authors || authors.length === 0)
    return null

  if (authors.length > 2) {
    const first2Authors = authors.slice(0, 2).map(author => formatCSLName(author))
    return `${first2Authors.join(', ')} et al.`
  }

  return authors.map(author => formatCSLName(author)).join(', ')
}
