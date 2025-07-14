import type { ExtractionMode } from '@source-taster/types'

/**
 * Generate extraction instructions based on mode
 */
export function getExtractionInstructions(mode: ExtractionMode): string {
  switch (mode) {
    case 'strict':
      return `STRICT MODE: Extract metadata exactly as it appears in the source text. Do NOT:
- Correct typos or spelling errors
- Standardize formatting
- Infer missing information
- Make any interpretations
This mode is for scientific accuracy where the original form must be preserved exactly.`

    case 'balanced':
      return `BALANCED MODE: Extract metadata with reasonable corrections. You MAY:
- Fix obvious typos and formatting inconsistencies
- Standardize common abbreviations (e.g., "J." to "Journal")
- Normalize spacing and capitalization
You must NOT:
- Change the meaning or content
- Add information not present in the source
This mode balances accuracy with usability.`

    case 'tolerant':
      return `TOLERANT MODE: Extract metadata with intelligent inference. You MAY:
- Fix errors and inconsistencies
- Infer missing standard information when context is clear
- Complete partial data using domain knowledge
- Handle OCR errors and formatting issues
This mode maximizes extraction success from problematic sources.`

    default:
      return getExtractionInstructions('balanced' as ExtractionMode)
  }
}
