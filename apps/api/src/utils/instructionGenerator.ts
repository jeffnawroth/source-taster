/**
 * Generate AI instructions from action types and their corresponding rules map
 * @param actionTypes - Array of action types to generate instructions for
 * @param rulesMap - Rules mapping object
 * @returns Array of instruction strings for AI prompts
 */
export function generateInstructionsFromActionTypes<T extends string>(
  actionTypes: T[],
  rulesMap: Record<T, { prompt: string, example?: string }>,
): string[] {
  return actionTypes.map((actionType) => {
    const rule = rulesMap[actionType]
    if (!rule) {
      console.warn(`No rule found for action type: ${actionType}`)
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
 * Universal instruction builder - combines action type processing with text formatting
 * @param actionTypes - Array of action types
 * @param rulesMap - Rules mapping object
 * @param header - Header text for instructions
 * @param fallback - Fallback text when no instructions
 * @returns Complete formatted instruction text
 */
export function buildInstructionsFromActionTypes<T extends string>(
  actionTypes: T[],
  rulesMap: Record<T, { prompt: string, example?: string }>,
  header: string,
  fallback: string,
): string {
  const instructionLines = generateInstructionsFromActionTypes(actionTypes, rulesMap)
  return buildInstructionText(instructionLines, header, fallback)
}
