import type { ProcessingStrategy } from '@source-taster/types'
import { PROCESSING_RULES } from '@source-taster/types'

/**
 * Generate extraction instructions based on processing strategy
 */
export function getExtractionInstructions(processingStrategy: ProcessingStrategy): string {
  // Get rules that are supported by the current mode
  const activeRules = PROCESSING_RULES.filter(rule =>
    rule.supportedModes.includes(processingStrategy.mode),
  )

  // If no rules are active, return empty instructions (AI should do nothing)
  if (activeRules.length === 0) {
    return 'Extract exactly as written in the source without any modifications.'
  }

  // Build instructions from active rules
  const instructions: string[] = []

  for (const rule of activeRules) {
    instructions.push(`• ${rule.aiInstruction.prompt}`)
    if (rule.aiInstruction.example) {
      instructions.push(`  Example: ${rule.aiInstruction.example}`)
    }
  }

  return instructions.join('\n')
}
