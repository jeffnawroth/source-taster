/**
 * Generate AI instructions from normalization rules and their corresponding rules map
 * @param normalizationRules - Array of normalization rules to generate instructions for
 * @param rulesMap - Rules mapping object
 * @returns Array of instruction strings for AI prompts
 */
export function generateInstructionsFromNormalizationRules<T extends string>(
  normalizationRules: T[],
  rulesMap: Record<T, { prompt: string, example?: string }>,
): string[] {
  return normalizationRules.map((normalizationRule) => {
    const rule = rulesMap[normalizationRule]
    if (!rule) {
      console.warn(`No rule found for normalization rule: ${normalizationRule}`)
      return ''
    }
    return rule.example
      ? `${rule.prompt} Example: ${rule.example}`
      : rule.prompt
  }).filter(instruction => instruction.length > 0)
}

/**
 * Build formatted AI instruction text with header and fallback
 * @param instructionLines - Array of instruction strings
 * @param header - Header text for instructions
 * @param fallback - Fallback text when no instructions
 * @returns Formatted instruction text
 */
export function buildInstructionText(
  instructionLines: string[],
  header: string,
  fallback: string,
): string {
  if (instructionLines.length === 0) {
    return fallback
  }

  const formattedLines = instructionLines.map(line => `• ${line}`)

  return [header, ...formattedLines].join('\n')
}

/**
 * Universal instruction builder - combines normalization rule processing with text formatting
 * @param normalizationRules - Array of normalization rules
 * @param rulesMap - Rules mapping object
 * @param header - Header text for instructions
 * @param fallback - Fallback text when no instructions
 * @returns Complete formatted instruction text
 */
export function buildInstructionsFromNormalizationRules<T extends string>(
  normalizationRules: T[],
  rulesMap: Record<T, { prompt: string, example?: string }>,
  header: string,
  fallback: string,
): string {
  const instructionLines = generateInstructionsFromNormalizationRules(normalizationRules, rulesMap)
  return buildInstructionText(instructionLines, header, fallback)
}
