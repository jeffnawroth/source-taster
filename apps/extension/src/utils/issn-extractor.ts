/**
 * Extracts all ISSNs from the provided text.
 * @param {string} text - The text from which to extract ISSNs.
 * @returns {string[]} An array of ISSN strings found in the text.
 */
export default function extractIssns(text: string) {
  // Regular expression to match the ISSN pattern:
  // \b      - word boundary ensures that we don't match extra characters
  // \d{4}   - exactly four digits
  // -       - a hyphen
  // \d{3}   - exactly three digits
  // [\dX]   - one digit or an "X"
  // \b      - word boundary to finish the match cleanly
  const regex = /\b\d{4}-\d{3}[\dX]\b/g
  const matches = text.match(regex)
  return matches || []
}
