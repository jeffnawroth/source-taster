/* eslint-disable regexp/optimal-quantifier-concatenation */
/* eslint-disable regexp/no-misleading-capturing-group */
/* eslint-disable regexp/no-super-linear-backtracking */
import type { ReferenceMetadata } from '../interface'
import { parseAuthors } from '../helpers/authorParser'

/**
 * Extracts metadata from APA 7 dictionary entries
 * Example: Brown, J. (n.d.). Perseverance. In Merriam-Webster's Collegiate Dictionary (p. 278).
 * Example: Brown, J. (2020). Perseverance. In E. M. Sanchez (Ed.), Merriam-Webster's Collegiate Dictionary (p. 278).
 * Example: Brown, J. (2020). Perseverance. In E. M. Sanchez (Ed.), Merriam-Webster's Collegiate Dictionary (Rev. ed., p. 278).
 * Example: Brown, J. (2020). Perseverance. In E. M. Sanchez (Ed.), Merriam-Webster. https://www.merriam-webster.com/dictionary/perseverance
 * Example: Brown, J. (n.d.). Perseverance. In E. M. Sanchez (Ed.), Merriam-Webster. Retrieved May 18, 2025, from https://www.merriam-webster.com/dictionary/perseverance
 */
export function extractApaDictionaryEntryReference(reference: string): ReferenceMetadata[] | null {
  // Pattern für gedruckte Wörterbucheinträge ohne URL
  // Unterstützt nun auch "Rev. ed." als Edition
  const apaDictionaryPrintPattern = /^([^(]+)\s+\((n\.d\.|\d{4}[a-z]?)\)\.\s+([^.]+)\.\s+In\s+(?:([^(,]+)\s+\((?:Ed|Eds)\.\),\s+)?([^(]+)(?:\s+\((?:(\d+(?:st|nd|rd|th))\s+ed\.|Rev\.\s+ed\.)(?:,\s+)?(p|pp)?\.\s+([^)]+)\))?\.$/

  // Pattern für Wörterbucheinträge mit direkter URL
  // Unterstützt nun auch "Rev. ed." als Edition
  const apaDictionaryDirectUrlPattern = /^([^(]+)\s+\((n\.d\.|\d{4}[a-z]?)\)\.\s+([^.]+)\.\s+In\s+(?:([^(,]+)\s+\((?:Ed|Eds)\.\),\s+)?([^(.]+)(?:\s+\((?:(\d+(?:st|nd|rd|th))\s+ed\.|Rev\.\s+ed\.)\))?\.\s+(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?)$/

  // Pattern für Wörterbucheinträge mit Retrieved-Datum
  // Unterstützt nun auch "Rev. ed." als Edition
  const apaDictionaryRetrievalPattern = /^([^(]+)\s+\((n\.d\.|\d{4}[a-z]?)\)\.\s+([^.]+)\.\s+In\s+(?:([^(,]+)\s+\((?:Ed|Eds)\.\),\s+)?([^(.]+)(?:\s+\((?:(\d+(?:st|nd|rd|th))\s+ed\.|Rev\.\s+ed\.)\))?\.\s+Retrieved\s+([^,]+,\s+\d{4}),\s+from\s+(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?)$/

  // Prüfe zuerst auf gedruckte Einträge
  let match = reference.match(apaDictionaryPrintPattern)
  let patternType = 'print'

  if (!match) {
    // Prüfe dann auf Retrieval-Pattern
    match = reference.match(apaDictionaryRetrievalPattern)
    if (match) {
      patternType = 'retrieval'
    }
    else {
      // Wenn nicht gefunden, prüfe auf direktes URL-Pattern
      match = reference.match(apaDictionaryDirectUrlPattern)
      if (match) {
        patternType = 'directUrl'
      }
    }
  }

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const authors = parseAuthors(authorString)

  // Extract date components - check if it's "n.d." or a year
  const dateString = match[2].trim()
  let year: number | null = null
  let yearSuffix: string | null = null
  let noDate = false

  if (dateString === 'n.d.') {
    noDate = true
  }
  else {
    // Extract year and possible suffix
    const yearMatch = dateString.match(/^(\d{4})([a-z])?$/)
    if (yearMatch) {
      year = Number.parseInt(yearMatch[1], 10)
      yearSuffix = yearMatch[2] ? yearMatch[2] : null
    }
  }

  // Entry term is match[3]
  const title = match[3].trim()

  // Editor information is in match[4] if present
  const editorString = match[4] ? match[4].trim() : null
  let contributors = null
  if (editorString) {
    const editors = parseAuthors(editorString)
    contributors = editors.map(editor => ({ name: editor, role: 'editor' }))
  }

  // Dictionary title is match[5]
  const rawDictionaryTitle = match[5].trim()

  // Entferne "In " vom Anfang des Dictionary-Titels, wenn vorhanden
  const dictionaryTitle = rawDictionaryTitle.startsWith('In ')
    ? rawDictionaryTitle.substring(3).trim()
    : rawDictionaryTitle

  // Variablen für die verschiedenen Pattern-Varianten
  let edition = null
  let pageType = null
  let pages = null
  let retrievalDate = null
  let url = null

  if (patternType === 'print') {
    // Für Edition prüfen wir, ob match[6] existiert und bestimmen den Typ
    if (match[6]) {
      // Numerische Edition (5th ed. usw.)
      edition = `${match[6]} ed.`
    }
    else if (reference.includes('(Rev. ed.')) {
      // Revised Edition speziell behandeln
      edition = 'Rev. ed.'
    }

    // Page information
    pageType = match[7] ? match[7].trim() : null
    pages = match[8] ? match[8].trim() : null
  }
  else if (patternType === 'directUrl') {
    // Für Edition prüfen wir, ob match[6] existiert und bestimmen den Typ
    if (match[6]) {
      // Numerische Edition (5th ed. usw.)
      edition = `${match[6]} ed.`
    }
    else if (reference.includes('(Rev. ed.)')) {
      // Revised Edition speziell behandeln
      edition = 'Rev. ed.'
    }

    // URL ist match[7]
    url = match[7].trim()
  }
  else if (patternType === 'retrieval') {
    // Für Edition prüfen wir, ob match[6] existiert und bestimmen den Typ
    if (match[6]) {
      // Numerische Edition (5th ed. usw.)
      edition = `${match[6]} ed.`
    }
    else if (reference.includes('(Rev. ed.)')) {
      // Revised Edition speziell behandeln
      edition = 'Rev. ed.'
    }

    // Retrieval date ist match[7]
    retrievalDate = match[7].trim()
    // URL ist match[8]
    url = match[8].trim()
  }

  return [{
    originalEntry: reference,
    authors,
    year,
    month: null,
    day: null,
    dateRange: false,
    yearEnd: null,
    yearSuffix,
    noDate,
    title,
    containerTitle: dictionaryTitle,
    volume: null,
    issue: null,
    pages,
    doi: null,
    publisher: null,
    url,
    sourceType: 'Dictionary entry',
    location: null,
    retrievalDate,
    edition,
    contributors,
    pageType,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
  }]
}
