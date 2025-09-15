import type { ApiMatchNormalizationRule } from '@source-taster/types'
import levenshtein from 'damerau-levenshtein'
import { NormalizationService } from '../services/matching/normalizationService'
import { dateSimilarity, isCSLNameObject, nameSimilarity } from './similarityHelpers'

const normalizationService = new NormalizationService()

export function similarity(
  a: unknown,
  b: unknown,
  rules: ApiMatchNormalizationRule[],
): number {
  // Date-aware path: compare structured date components first
  const ds = dateSimilarity(a, b)
  if (ds !== null) {
    return ds
  }

  // Name-aware path: compare author/editor names with family+initials logic
  if (isCSLNameObject(a) || isCSLNameObject(b)) {
    const ns = nameSimilarity(
      a,
      b,
      rules,
      (v, r) => normalizationService.normalizeValue(v, r),
    )
    if (ns !== null)
      return ns
  }

  // Convert CSL to strings AND normalize in one step for generic comparison
  const s1 = normalizationService.normalizeValue(a, rules)
  const s2 = normalizationService.normalizeValue(b, rules)

  return levenshtein(s1, s2).similarity
}
