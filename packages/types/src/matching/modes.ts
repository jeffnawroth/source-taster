/**
 * Matching mode types for controlling verification strictness
 */
export enum MatchingMode {
  /** Strict mode: Exact matches only - every character, capitalization, and format must match precisely */
  STRICT = 'strict',
  /** Balanced mode: Case-insensitive with minor format differences allowed */
  BALANCED = 'balanced',
  /** Tolerant mode: Semantic matching with significant format/style variations allowed */
  TOLERANT = 'tolerant',
  /** Custom mode: User-defined matching rules and tolerance levels */
  CUSTOM = 'custom',
}

/**
 * Default matching mode
 */
export const DEFAULT_MATCHING_MODE: MatchingMode = MatchingMode.BALANCED

/**
 * Custom matching settings for fine-grained control
 */
export interface CustomMatchingSettings {
  /** Allow case-insensitive matching */
  ignoreCaseForText: boolean
  /** Allow minor punctuation differences (commas, periods, etc.) */
  ignorePunctuation: boolean
  /** Allow author name format variations (First Last vs Last, First) */
  allowAuthorFormatVariations: boolean
  /** Allow journal name abbreviations vs full names */
  allowJournalAbbreviations: boolean
  /** Allow page format variations (123-145 vs 123-45 vs pp. 123-145) */
  allowPageFormatVariations: boolean
  /** Allow minor date format differences */
  allowDateFormatVariations: boolean
  /** Treat whitespace differences as insignificant */
  ignoreWhitespace: boolean
  /** Allow character normalization (umlauts, accents, etc.) */
  normalizeCharacters: boolean
}

// Preset configurations with explicit settings
export const STRICT_MATCHING_SETTINGS: CustomMatchingSettings = {
  ignoreCaseForText: false,
  ignorePunctuation: false,
  allowAuthorFormatVariations: false,
  allowJournalAbbreviations: false,
  allowPageFormatVariations: false,
  allowDateFormatVariations: false,
  ignoreWhitespace: false,
  normalizeCharacters: false,
}

export const BALANCED_MATCHING_SETTINGS: CustomMatchingSettings = {
  ignoreCaseForText: true,
  ignorePunctuation: true,
  allowAuthorFormatVariations: true,
  allowJournalAbbreviations: true,
  allowPageFormatVariations: true,
  allowDateFormatVariations: true,
  ignoreWhitespace: true,
  normalizeCharacters: true,
}

export const TOLERANT_MATCHING_SETTINGS: CustomMatchingSettings = {
  ignoreCaseForText: true,
  ignorePunctuation: true,
  allowAuthorFormatVariations: true,
  allowJournalAbbreviations: true,
  allowPageFormatVariations: true,
  allowDateFormatVariations: true,
  ignoreWhitespace: true,
  normalizeCharacters: true,
}
