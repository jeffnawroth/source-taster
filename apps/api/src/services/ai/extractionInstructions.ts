import type { ExtractionMode } from '@source-taster/types'

/**
 * Generate detailed extraction instructions based on mode
 */
export function getExtractionInstructions(mode: ExtractionMode): string {
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

    default:
      return getExtractionInstructions('balanced' as ExtractionMode)
  }
}
