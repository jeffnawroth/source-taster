import type { NormalizationRule } from '@source-taster/types'
import levenshtein from 'damerau-levenshtein'
import { NormalizationService } from '../services/normalizationService'

const normalizationService = new NormalizationService()

export function similarity(
  a: unknown, // Changed: now accepts CSL objects too!
  b: unknown, // Changed: now accepts CSL objects too!
  rules: NormalizationRule[],
): number {
  // Convert CSL to strings AND normalize in one step
  const s1 = normalizationService.normalizeValue(a, rules)
  const s2 = normalizationService.normalizeValue(b, rules)

  return levenshtein(s1, s2).similarity
}
