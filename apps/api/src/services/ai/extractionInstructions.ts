import type { CustomExtractionSettings, ExtractionMode } from '@source-taster/types'

/**
 * Generate detailed extraction instructions based on mode
 */
export function getExtractionInstructions(mode: ExtractionMode, customSettings?: CustomExtractionSettings): string {
  switch (mode) {
    case 'strict':
      return `STRICT MODE
Goal: Exact, character-by-character extraction of source data without any modification.

What you MUST do:
• Extract metadata exactly as it appears in the text, character for character
• Preserve all spellings, formatting, and structures exactly

What you must NEVER do:
• Do not correct typos or spelling errors
• Do not normalize capitalization or punctuation  
• Do not clean up whitespace or formatting
• Do not interpret abbreviations (e.g., "et a." remains "et a.")
• Do not add missing information (e.g., missing month)
• Do not automatically detect source types
• Do not normalize fields (e.g., "Vol." remains "Vol.")
• Do not change the original structure in any way

IMPORTANT: This mode is for scientific accuracy - the original form must be preserved exactly.`

    case 'balanced':
      return `BALANCED MODE
Goal: Fix minor errors and inconsistencies without changing meaning or content.

What you MAY do:
• Trim excessive whitespace at beginning/end
• Correct obvious typos (e.g., "Jouranl" → "Journal")
• Normalize capitalization for standards
• Standardize common abbreviations (e.g., "J." → "Journal", "Vol." → "Volume")
• Clean up and standardize punctuation
• Validate and standardize DOI/ISSN/PMID/ISBN formats
• Format author names consistently (e.g., "smith j" → "Smith, J.")
• Remove duplicate authors
• Standardize date formatting
• Use standard separators (e.g., hyphens in page ranges)

What you must NOT do:
• No content interpretation or meaning changes
• No addition of missing fields through guessing
• No speculation when information is unclear
• No aggressive reformatting (e.g., no forced Title Case)
• No modification of technical terms or specialized expressions

IMPORTANT: Balance between accuracy and usability.`

    case 'tolerant':
      return `TOLERANT MODE
Goal: Error-tolerant, AI-intelligent extraction for maximum success with problematic sources.

What you MAY do (in addition to Balanced Mode):
• Add missing, clearly derivable fields (e.g., date from context)
• Correct severe formatting errors (e.g., "COVID 19" → "COVID-19")
• Interpret incomplete or heavily abbreviated information
• Recognize and standardize source types (Journal, Book, etc.)
• Convert titles to appropriate Title Case
• Unicode cleanup (e.g., "–" → "-", normalize strange characters)
• Comprehensive field normalization (e.g., "Vol." → volume, "pp." → pages)
• Intelligent handling of OCR errors or copy-paste artifacts
• Reconstruct information separated by line breaks
• Complete obviously incomplete data
• Fix common formatting problems (e.g., missing spaces)

What you still must NOT do:
• Do not hallucinate or invent completely missing data fields
• Do not intentionally "beautify" content - maintain reference fidelity
• No speculative additions without clear context
• Do not arbitrarily change technical terminology

IMPORTANT: Maximizes extraction from problematic sources while maintaining reference fidelity.`

    case 'custom':
      return generateCustomModeInstructions(customSettings)

    default:
      return getExtractionInstructions('balanced' as ExtractionMode)
  }
}

/**
 * Generate custom mode instructions based on user configuration
 */
function generateCustomModeInstructions(settings?: CustomExtractionSettings): string {
  if (!settings) {
    return getExtractionInstructions('balanced' as ExtractionMode)
  }

  const allowedActions: string[] = []
  const forbiddenActions: string[] = []

  // Text correction and normalization
  if (settings.correctTypos) {
    allowedActions.push('• Correct obvious typos (e.g., "Jouranl" → "Journal")')
  }
  else {
    forbiddenActions.push('• Do not correct typos or spelling errors')
  }

  if (settings.normalizeCapitalization) {
    allowedActions.push('• Normalize capitalization for standards')
  }
  else {
    forbiddenActions.push('• Do not normalize capitalization')
  }

  if (settings.standardizeAbbreviations) {
    allowedActions.push('• Standardize common abbreviations (e.g., "J." → "Journal", "Vol." → "Volume")')
  }
  else {
    forbiddenActions.push('• Do not interpret abbreviations - preserve as-is')
  }

  if (settings.standardizePunctuation) {
    allowedActions.push('• Clean up and standardize punctuation')
  }
  else {
    forbiddenActions.push('• Do not modify punctuation')
  }

  // Author and formatting
  if (settings.formatAuthorNames) {
    allowedActions.push('• Format author names consistently (e.g., "smith j" → "Smith, J.")')
  }
  else {
    forbiddenActions.push('• Do not reformat author names')
  }

  if (settings.removeDuplicateAuthors) {
    allowedActions.push('• Remove duplicate authors')
  }
  else {
    forbiddenActions.push('• Do not remove any authors, even duplicates')
  }

  if (settings.standardizeDateFormatting) {
    allowedActions.push('• Standardize date formatting')
  }
  else {
    forbiddenActions.push('• Do not modify date formats')
  }

  if (settings.standardizeIdentifiers) {
    allowedActions.push('• Validate and standardize DOI/ISSN/PMID/ISBN formats')
  }
  else {
    forbiddenActions.push('• Do not modify identifier formats')
  }

  // Advanced interpretation
  if (settings.addDerivableFields) {
    allowedActions.push('• Add missing, clearly derivable fields (e.g., date from context)')
  }
  else {
    forbiddenActions.push('• Do not add missing information')
  }

  if (settings.interpretIncompleteInfo) {
    allowedActions.push('• Interpret incomplete or heavily abbreviated information')
  }
  else {
    forbiddenActions.push('• Do not interpret unclear or abbreviated information')
  }

  if (settings.recognizeSourceTypes) {
    allowedActions.push('• Recognize and standardize source types (Journal, Book, etc.)')
  }
  else {
    forbiddenActions.push('• Do not automatically detect source types')
  }

  if (settings.convertToTitleCase) {
    allowedActions.push('• Convert titles to appropriate Title Case')
  }
  else {
    forbiddenActions.push('• Do not change title capitalization')
  }

  // Technical fixes
  if (settings.fixUnicodeIssues) {
    allowedActions.push('• Unicode cleanup (e.g., "–" → "-", normalize strange characters)')
  }
  else {
    forbiddenActions.push('• Do not modify Unicode characters')
  }

  if (settings.handleOcrErrors) {
    allowedActions.push('• Intelligent handling of OCR errors or copy-paste artifacts')
  }
  else {
    forbiddenActions.push('• Do not attempt to fix OCR or copy-paste errors')
  }

  if (settings.reconstructSeparatedInfo) {
    allowedActions.push('• Reconstruct information separated by line breaks')
  }
  else {
    forbiddenActions.push('• Do not reconstruct separated information')
  }

  if (settings.completeIncompleteData) {
    allowedActions.push('• Complete obviously incomplete data')
  }
  else {
    forbiddenActions.push('• Do not complete incomplete data')
  }

  if (settings.fixFormattingProblems) {
    allowedActions.push('• Fix common formatting problems (e.g., missing spaces)')
  }
  else {
    forbiddenActions.push('• Do not fix formatting issues')
  }

  return `CUSTOM MODE
Goal: User-configured extraction with personalized rules and preferences.

What you MAY do:
${allowedActions.length > 0 ? allowedActions.join('\n') : '• Extract exactly as written without modifications'}

What you must NOT do:
${forbiddenActions.length > 0 ? forbiddenActions.join('\n') : '• Follow standard extraction guidelines'}
• Never hallucinate or invent completely missing data fields
• Never speculate without clear context

IMPORTANT: Follow the user's custom configuration exactly as specified.`
}
