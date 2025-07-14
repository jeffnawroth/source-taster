import type { CustomExtractionSettings, ExtractionMode } from '@source-taster/types'

/**
 * Generate detailed extraction instructions based on mode
 */
export function getExtractionInstructions(mode: ExtractionMode, customSettings?: CustomExtractionSettings): string {
  switch (mode) {
    case 'strict':
      return generateModeInstructions({
        correctTypos: false,
        normalizeCapitalization: false,
        standardizeAbbreviations: false,
        standardizePunctuation: false,
        formatAuthorNames: false,
        removeDuplicateAuthors: false,
        standardizeDateFormatting: false,
        standardizeIdentifiers: false,
        addDerivableFields: false,
        interpretIncompleteInfo: false,
        recognizeSourceTypes: false,
        convertToTitleCase: false,
        fixUnicodeIssues: false,
        handleOcrErrors: false,
        reconstructSeparatedInfo: false,
        completeIncompleteData: false,
        fixFormattingProblems: false,
      }, 'STRICT MODE', 'Exact, character-by-character extraction of source data without any modification.')

    case 'balanced':
      return generateModeInstructions({
        correctTypos: true,
        normalizeCapitalization: true,
        standardizeAbbreviations: true,
        standardizePunctuation: true,
        formatAuthorNames: true,
        removeDuplicateAuthors: true,
        standardizeDateFormatting: true,
        standardizeIdentifiers: true,
        addDerivableFields: false,
        interpretIncompleteInfo: false,
        recognizeSourceTypes: false,
        convertToTitleCase: false,
        fixUnicodeIssues: false,
        handleOcrErrors: false,
        reconstructSeparatedInfo: false,
        completeIncompleteData: false,
        fixFormattingProblems: false,
      }, 'BALANCED MODE', 'Fix minor errors and inconsistencies without changing meaning or content.')

    case 'tolerant':
      return generateModeInstructions({
        correctTypos: true,
        normalizeCapitalization: true,
        standardizeAbbreviations: true,
        standardizePunctuation: true,
        formatAuthorNames: true,
        removeDuplicateAuthors: true,
        standardizeDateFormatting: true,
        standardizeIdentifiers: true,
        addDerivableFields: true,
        interpretIncompleteInfo: true,
        recognizeSourceTypes: true,
        convertToTitleCase: true,
        fixUnicodeIssues: true,
        handleOcrErrors: true,
        reconstructSeparatedInfo: true,
        completeIncompleteData: true,
        fixFormattingProblems: true,
      }, 'TOLERANT MODE', 'Error-tolerant, AI-intelligent extraction for maximum success with problematic sources.')

    case 'custom':
      return generateCustomModeInstructions(customSettings)

    default:
      return getExtractionInstructions('balanced' as ExtractionMode)
  }
}

/**
 * Generate mode instructions using the same logic as custom mode
 */
function generateModeInstructions(settings: CustomExtractionSettings, modeTitle: string, modeGoal: string): string {
  const allowedActions: string[] = []
  const forbiddenActions: string[] = []

  // Text correction and normalization
  if (settings.correctTypos) {
    allowedActions.push('• ALWAYS correct obvious typos and misspellings (e.g., "Jouranl" → "Journal", "artficial" → "artificial", "inteligence" → "intelligence", "medecine" → "medicine")')
    allowedActions.push('• Fix common spelling errors, transposed letters, and missing letters')
    allowedActions.push('• IMPORTANT: This is a high priority - actively look for and fix spelling mistakes')
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

  // Always add whitespace trimming to allowed actions
  allowedActions.unshift('• Trim excessive whitespace at beginning/end')

  return `${modeTitle}
Goal: ${modeGoal}

What you MAY do:
${allowedActions.length > 0 ? allowedActions.join('\n') : '• Extract exactly as written without modifications'}

What you must NOT do:
${forbiddenActions.length > 0 ? forbiddenActions.join('\n') : '• Follow standard extraction guidelines'}
• Never hallucinate or invent completely missing data fields
• Never speculate without clear context

IMPORTANT: ${modeTitle === 'STRICT MODE' ? 'This mode is for scientific accuracy - the original form must be preserved exactly.' : modeTitle === 'BALANCED MODE' ? 'Balance between accuracy and usability.' : 'Maximizes extraction from problematic sources while maintaining reference fidelity.'}`
}

/**
 * Generate custom mode instructions based on user configuration
 */
function generateCustomModeInstructions(settings?: CustomExtractionSettings): string {
  // Debug: Log the custom settings being processed
  console.warn('Backend: generateCustomModeInstructions called with:', settings)

  if (!settings) {
    console.warn('Backend: No custom settings provided, falling back to balanced mode')
    return getExtractionInstructions('balanced' as ExtractionMode)
  }

  const allowedActions: string[] = []
  const forbiddenActions: string[] = []

  // Text correction and normalization
  if (settings.correctTypos) {
    allowedActions.push('• ALWAYS correct obvious typos and misspellings (e.g., "Jouranl" → "Journal", "artficial" → "artificial", "inteligence" → "intelligence", "medecine" → "medicine")')
    allowedActions.push('• Fix common spelling errors, transposed letters, and missing letters')
    allowedActions.push('• IMPORTANT: This is a high priority - actively look for and fix spelling mistakes')
    console.warn('Backend: Added typo correction instruction')
  }
  else {
    forbiddenActions.push('• Do not correct typos or spelling errors')
    console.warn('Backend: Added typo PROHIBITION instruction')
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
