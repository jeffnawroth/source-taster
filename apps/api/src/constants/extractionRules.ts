import type { NormalizationRule } from '@source-taster/types'

/**
 * Backend-only extraction rules mapping for AI prompt generation
 * Maps each extraction action type to its corresponding AI instructions
 */
export const EXTRACTION_RULES_MAP: Record<NormalizationRule, { prompt: string, example?: string }> = {
  'normalize-spelling': {
    prompt: 'Correct obvious typos and misspellings, including common spelling errors, transposed letters, and missing letters.',
    example: '"Jouranl" → "Journal", "artficial" → "artificial", "inteligence" → "intelligence", "medecine" → "medicine"',
  },
  'normalize-typography': {
    prompt: 'Fix common encoding issues such as smart quotes, em dashes, and other non-standard characters.',
    example: '""Smart quotes"" → "Smart quotes", "—em dash" → "-", "…ellipsis" → "...", "â€" → "–"',
  },
  'normalize-title-case': {
    prompt: 'Normalize capitalization of titles, names, and other text to standard formats (Title Case).',
    example: '"the quick brown fox" → "The Quick Brown Fox", "john smith" → "John Smith", "a study on AI" → "A Study on AI"',
  },
  // 'normalize-abbreviations': {
  //   prompt: 'Expand common abbreviations.',
  //   example: '"J." → "Journal", "Vol." → "Volume"',
  // },
  // 'normalize-author-names': {
  //   prompt: 'Format author names to a consistent style',
  //   example: '"John Smith" → "Smith, John", "Mary Jane Doe" → "Doe, Mary Jane"',
  // },
  // 'normalize-date-format': {
  //   prompt: 'Standardize date formats to ISO 8601 (YYYY-MM-DD) or similar formats',
  //   example: '"January 1, 2020" → "2020-01-01", "2020/01/01" → "2020-01-01", "1st Jan 2020" → "2020-01-01"',
  // },
  'normalize-identifiers': {
    prompt: 'Standardize external identifiers (DOI, ISBN, ISSN, PMID, PMCID, ARXIV) to a consistent format',
    example: '"https://doi.org/10.1000/xyz123" → "10.1000/xyz123"',
  },
  'normalize-characters': {
    prompt: 'Normalize corrupted or misencoded characters caused by encoding issues (e.g., UTF-8 artifacts). Replace them with their intended character equivalents.',
    example: '"GrÃ¼n" → "Grün"',
  },
  'normalize-whitespace': {
    prompt: 'Normalize whitespace by removing duplicated spaces, leading/trailing spaces, unnecessary tabs, and soft line breaks within inline text. Preserve paragraph breaks',
    example: '"This is a line.\n\nThis is another line." → "This is a line. This is another line.", "This    is a  test." → "This is a test."',
  },
}
