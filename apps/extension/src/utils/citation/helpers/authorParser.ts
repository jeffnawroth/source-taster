/**
 * Helper function to process comma-separated author names
 * Handles formats like "Smith, T., Williams, B. M."
 */
export function processCommaAuthors(authorText: string): string[] {
  // Erkennen und korrekt behandeln von Autorennamen im Format: "Nachname, Initial(en)., Nachname, Initial(en)."
  // Verwenden eines Regex-Ansatzes für robustere Analyse

  // Temporär Leerzeichen nach Initialen entfernen, um die Analyse zu erleichtern
  const processedText = authorText.replace(/(\.\s*),\s*/g, '.$COMMA$')

  // Teilen nach unserem speziellen Trennzeichen
  const authorParts = processedText.split('$COMMA$')

  // Ergebnis-Array erstellen
  return authorParts.map(part => part.trim()).filter(part => part !== '')
}

/**
 * Helper function to parse authors from an author string
 */
export function parseAuthors(authorString: string): string[] {
  // First, check for usernames
  if (authorString.startsWith('@') && !authorString.includes(',')) {
    // Username only (e.g., "@pewdiepie")
    return [authorString]
  }

  // Check for multiple organization authors (contains & but no commas)
  if (authorString.includes(' & ') && !authorString.includes(',')) {
    // Multiple organizations as authors (e.g., "Microsoft & Apple")
    return authorString.split(' & ').map(org => org.trim().replace(/\.$/, ''))
  }

  // Check if it's a single organizational author (no commas or ampersands)
  if (!authorString.includes(',') && !authorString.includes('&')) {
    // Organization as author (e.g., "Deloitte.")
    return [authorString.replace(/\.$/, '')] // Remove trailing period if present
  }

  // Handle case with many authors and ellipsis
  if (authorString.includes(', . . . ')) {
    const ellipsisPos = authorString.indexOf(', . . . ')
    const beforeEllipsis = authorString.substring(0, ellipsisPos)
    const afterEllipsis = authorString.substring(ellipsisPos + 7) // 7 is length of ', . . . '

    const authors = []

    // Process everything before the ellipsis
    if (beforeEllipsis.includes(' & ')) {
      const [mainPart, lastPart] = beforeEllipsis.split(' & ')

      // Process main part (authors separated by commas)
      const mainAuthors = processCommaAuthors(mainPart)
      authors.push(...mainAuthors)

      // Add last author before ellipsis
      if (lastPart) {
        authors.push(lastPart.trim())
      }
    }
    else {
      // Just comma-separated authors
      const mainAuthors = processCommaAuthors(beforeEllipsis)
      authors.push(...mainAuthors)
    }

    // Add the author after ellipsis
    authors.push(afterEllipsis.trim())

    return authors
  }

  // Case for "Author1, A., & Author2, B. M."
  // or "Author1, A., Author2, B. M., & Author3, C. D."
  if (authorString.includes(' & ')) {
    const parts = authorString.split(' & ')
    const result = []

    // Process all parts before the last &
    const beforeLastAuthor = parts[0].trim()

    // Extract authors before the last one
    if (beforeLastAuthor.includes(',')) {
      const beforeAuthors = processCommaAuthors(beforeLastAuthor)
      result.push(...beforeAuthors)
    }
    else {
      result.push(beforeLastAuthor)
    }

    // Add the last author
    if (parts.length > 1) {
      result.push(parts[1].trim())
    }

    return result.filter(author => author !== '')
  }

  // Handle a single author with comma (surname, initials)
  if (authorString.includes(',')) {
    // Might be a single author with multiple initials or name parts
    return [authorString.trim()]
  }

  // Default case: simple single author
  return [authorString.trim()]
}
