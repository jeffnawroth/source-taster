/* eslint-disable regexp/no-super-linear-backtracking */
import type { Author } from '../interface'

/**
 * Helper function to process comma-separated author names
 * Handles formats like "Smith, T., Williams, B. M."
 */
export function processCommaAuthors(authorText: string): Author[] {
  // Erkennen und korrekt behandeln von Autorennamen im Format: "Nachname, Initial(en)., Nachname, Initial(en)."
  // Verwenden eines Regex-Ansatzes für robustere Analyse

  // Temporär Leerzeichen nach Initialen entfernen, um die Analyse zu erleichtern
  const processedText = authorText.replace(/(\.\s*),\s*/g, '.$COMMA$')

  // Teilen nach unserem speziellen Trennzeichen
  const authorParts = processedText.split('$COMMA$')

  // Ergebnis-Array erstellen
  return authorParts
    .map((part): Author | null => {
      const trimmedPart = part.trim()
      if (trimmedPart === '')
        return null

      // Prüfe auf Rolle in Klammern, z.B. "Smith, J. (Ed.)"
      const roleMatch = trimmedPart.match(/^(.*?)\s+\((.*?)\)$/)
      if (roleMatch) {
        return {
          name: roleMatch[1].trim(),
          role: normalizeRole(roleMatch[2].trim()),
        }
      }

      // Kein Rollenhinweis gefunden
      return { name: trimmedPart, role: null }
    })
    .filter((author): author is Author => author !== null)
}

/**
 * Normalizes role descriptions to a standard format
 */
export function normalizeRole(role: string): string {
  // Einige Standardrollen normalisieren
  switch (role.toLowerCase()) {
    case 'ed.': return 'editor'
    case 'eds.': return 'editor'
    case 'director': return 'director'
    case 'executive producer': return 'executive producer'
    case 'exec. producer': return 'executive producer'
    case 'host': return 'host'
    case 'instructor': return 'instructor'
    case 'artist': return 'artist'
    case 'photographer': return 'photographer'
    case 'trans.': return 'translator'
    case 'narr.': return 'narrator'
    case 'narrs.': return 'narrator'
    case 'prod.': return 'producer'
    default: return role // Unbekannte Rolle unverändert zurückgeben
  }
}

/**
 * Helper function to parse authors from an author string
 * @returns Array of Author objects with name and optional role
 */
export function parseAuthors(authorString: string): Author[] {
  // First, check for usernames
  if (authorString.startsWith('@') && !authorString.includes(',')) {
    // Username only (e.g., "@pewdiepie")
    return [{ name: authorString, role: null }]
  }

  // Check for multiple organization authors (contains & but no commas)
  if (authorString.includes(' & ') && !authorString.includes(',')) {
    // Multiple organizations as authors (e.g., "Microsoft & Apple")
    return authorString.split(' & ')
      .map((org) => {
        const orgTrimmed = org.trim().replace(/\.$/, '')

        // Prüfe auf Rolle in Klammern
        const roleMatch = orgTrimmed.match(/^(.*?)\s+\((.*?)\)$/)
        if (roleMatch) {
          return {
            name: roleMatch[1].trim(),
            role: normalizeRole(roleMatch[2].trim()),
          }
        }

        return { name: orgTrimmed, role: null }
      })
  }

  // Check if it's a single organizational author (no commas or ampersands)
  if (!authorString.includes(',') && !authorString.includes('&')) {
    // Organization as author (e.g., "Deloitte.")
    const orgName = authorString.replace(/\.$/, '') // Remove trailing period if present

    // Prüfe auf Rolle in Klammern
    const roleMatch = orgName.match(/^(.*?)\s+\((.*?)\)$/)
    if (roleMatch) {
      return [{
        name: roleMatch[1].trim(),
        role: normalizeRole(roleMatch[2].trim()),
      }]
    }

    return [{ name: orgName, role: null }]
  }

  // Handle case with many authors and ellipsis
  if (authorString.includes(', . . . ')) {
    const ellipsisPos = authorString.indexOf(', . . . ')
    const beforeEllipsis = authorString.substring(0, ellipsisPos)
    const afterEllipsis = authorString.substring(ellipsisPos + 7) // 7 is length of ', . . . '

    const authors: Author[] = []

    // Process everything before the ellipsis
    if (beforeEllipsis.includes(' & ')) {
      const [mainPart, lastPart] = beforeEllipsis.split(' & ')

      // Process main part (authors separated by commas)
      const mainAuthors = processCommaAuthors(mainPart)
      authors.push(...mainAuthors)

      // Add last author before ellipsis
      if (lastPart) {
        // Prüfe auf Rolle in Klammern
        const lastPartTrimmed = lastPart.trim()
        const roleMatch = lastPartTrimmed.match(/^(.*?)\s+\((.*?)\)$/)
        if (roleMatch) {
          authors.push({
            name: roleMatch[1].trim(),
            role: normalizeRole(roleMatch[2].trim()),
          })
        }
        else {
          authors.push({ name: lastPartTrimmed, role: null })
        }
      }
    }
    else {
      // Just comma-separated authors
      const mainAuthors = processCommaAuthors(beforeEllipsis)
      authors.push(...mainAuthors)
    }

    // Add the author after ellipsis
    const afterEllipsisTrimmed = afterEllipsis.trim()
    const roleMatch = afterEllipsisTrimmed.match(/^(.*?)\s+\((.*?)\)$/)
    if (roleMatch) {
      authors.push({
        name: roleMatch[1].trim(),
        role: normalizeRole(roleMatch[2].trim()),
      })
    }
    else {
      authors.push({ name: afterEllipsisTrimmed, role: null })
    }

    return authors
  }

  // Case for "Author1, A., & Author2, B. M."
  // or "Author1, A., Author2, B. M., & Author3, C. D."
  if (authorString.includes(' & ')) {
    const parts = authorString.split(' & ')
    const result: Author[] = []

    // Process all parts before the last &
    const beforeLastAuthor = parts[0].trim()

    // Extract authors before the last one
    if (beforeLastAuthor.includes(',')) {
      const beforeAuthors = processCommaAuthors(beforeLastAuthor)
      result.push(...beforeAuthors)
    }
    else {
      // Prüfe auf Rolle in Klammern
      const roleMatch = beforeLastAuthor.match(/^(.*?)\s+\((.*?)\)$/)
      if (roleMatch) {
        result.push({
          name: roleMatch[1].trim(),
          role: normalizeRole(roleMatch[2].trim()),
        })
      }
      else {
        result.push({ name: beforeLastAuthor, role: null })
      }
    }

    // Add the last author
    if (parts.length > 1) {
      const lastAuthor = parts[1].trim()
      const roleMatch = lastAuthor.match(/^(.*?)\s+\((.*?)\)$/)
      if (roleMatch) {
        result.push({
          name: roleMatch[1].trim(),
          role: normalizeRole(roleMatch[2].trim()),
        })
      }
      else {
        result.push({ name: lastAuthor, role: null })
      }
    }

    return result
  }

  // Handle a single author with comma (surname, initials)
  if (authorString.includes(',')) {
    // Prüfe auf Rolle in Klammern
    const roleMatch = authorString.match(/^(.*?)\s+\((.*?)\)$/)
    if (roleMatch) {
      return [{
        name: roleMatch[1].trim(),
        role: normalizeRole(roleMatch[2].trim()),
      }]
    }

    // Might be a single author with multiple initials or name parts
    return [{ name: authorString.trim(), role: null }]
  }

  // Default case: simple single author
  const authorTrimmed = authorString.trim()
  const roleMatch = authorTrimmed.match(/^(.*?)\s+\((.*?)\)$/)
  if (roleMatch) {
    return [{
      name: roleMatch[1].trim(),
      role: normalizeRole(roleMatch[2].trim()),
    }]
  }

  return [{ name: authorTrimmed, role: null }]
}
