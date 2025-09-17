import levenshtein from 'damerau-levenshtein'
import { normalizeText } from './normalize'

export function similarity(a: string, b: string): number {
  const s1 = normalizeText(a)
  const s2 = normalizeText(b)
  return levenshtein(s1, s2).similarity
}
