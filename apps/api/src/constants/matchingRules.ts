import type { MatchingActionType } from '@source-taster/types'

/**
 * AI instruction mapping for matching action types
 * Optimized as object for O(1) lookups instead of array searches
 */
export const MATCHING_RULES_MAP: Record<MatchingActionType, { prompt: string, example?: string }> = {
  'ignore-spelling-variation': {
    prompt: 'Ignore minor spelling variations in the text.',
    example: '"color" = "colour"',
  },
  'ignore-typographic-variation': {
    prompt: 'Ignore typographic variations such as different quotation marks or dashes.',
    example: '"smart quotes" = "straight quotes", "John\'s idea – brilliant!" = "John\'s idea - brilliant!"',
  },
  'ignore-case-format': {
    prompt: 'Ignore case differences in text. Treat capitalized and lowercased words as equivalent.',
    example: '"example" = "Example", "Machine Learning Methods" = "machine learning methods"',
  },
  'ignore-abbreviation-variants': {
    prompt: 'Ignore variations in abbreviations.',
    example: '"Dr." = "Doctor", "Proc." = "Proceedings"',
  },
  'ignore-author-name-format': {
    prompt: 'Ignore variations in author name formatting.',
    example: '"John Smith" = "Smith, John", "Doe, J." = "John Doe"',
  },
  'ignore-date-format': {
    prompt: 'Ignore variations in date formats.',
    example: '"2023-01-01" = "01/01/2023", "January 1, 2023" = "2023-01-01"',
  },
  'ignore-identifier-variation': {
    prompt: 'Ignore variations in identifier formats such as DOIs or ISBNs.',
    example: '"10.1000/xyz123" = "https://doi.org/10.1000/XYZ123"',
  },
  'ignore-character-variation': {
    prompt: 'Ignore variations in characters that do not affect meaning.',
    example: '"café" = "cafe", "fiancé" = "fiance"',
  },
  'ignore-whitespace': {
    prompt: 'Ignore extra whitespace in the text.',
    example: '"Hello   World" = "Hello World", "This is   a test." = "This is a test.", "DeepLearning" = "Deep Learning"',
  },
} as const
