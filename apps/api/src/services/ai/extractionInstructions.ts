import type { ProcessingStrategy } from '@source-taster/types'

/**
 * Generate extraction instructions based on processing strategy
 */
export function getExtractionInstructions(processingStrategy: ProcessingStrategy): string {
  // Use the rules that are already filtered by the frontend
  const activeRules = processingStrategy.rules

  // If no rules are active, return empty instructions (AI should do nothing)
  if (activeRules.length === 0) {
    return 'Extract exactly as written in the source without any modifications.'
  }

  // Build instructions from active rules
  const instructions: string[] = [
    'IMPORTANT: Only perform the following specific modifications. Do NOT make any other changes beyond what is explicitly listed below:',
  ]

  for (const rule of activeRules) {
    instructions.push(`• ${rule.aiInstruction.prompt}`)
    if (rule.aiInstruction.example) {
      instructions.push(`  Example: ${rule.aiInstruction.example}`)
    }
  }
  return instructions.join('\n')
}
