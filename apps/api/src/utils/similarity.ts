import type { NormalizationRule } from '@source-taster/types'
import levenshtein from 'damerau-levenshtein'
import { NormalizationService } from '../services/normalizationService'

const normalizationService = new NormalizationService()

export function similarity(
  a: string,
  b: string,
  rules: NormalizationRule[],
): number {
  const s1 = normalizationService.normalize(a, rules)
  const s2 = normalizationService.normalize(b, rules)
  return levenshtein(s1, s2).similarity
}
